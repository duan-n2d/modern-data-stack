"use strict";

/* ===================== 5. ORCHESTRATION ===================== */
SEC(5, [
 { k:'cards', cols:3, t:'Orchestration: running the right work in the right order',
   lead:'An orchestrator schedules work, tracks dependencies, retries failures and tells humans when something needs them.',
   cards:[
    {h:'DAG design', tag:'must', p:'Small, idempotent tasks with explicit dependencies. A failed task can be re-run alone.'},
    {h:'Retries and timeouts', tag:'must', p:'Retry transient failures with backoff; time-box everything; fail loudly on real errors.'},
    {h:'Scheduling and sensors', tag:'must', p:'Time-based schedules are simple. Sensors and event triggers wait for upstream data instead of guessing.'},
    {h:'Task-based versus asset-based', tag:'senior', p:'Task-based tools model “what runs”. Asset-based tools model “what data should exist and how fresh it is”.'},
    {h:'SLAs and alerting', tag:'senior', p:'Define what “late” means in business terms, then alert on that rather than on every task failure.'},
    {h:'Backfills', tag:'must', p:'Re-running history by date range, safely, without duplicating data.'}
   ],
   n:'The one conceptual fork in this layer is task-based versus asset-based orchestration. Everything else (retries, sensors, backfills) is shared.' },

 { k:'table', t:'Tool landscape: orchestrators', head:TH, rows:[
   ['Apache Airflow','Task-based orchestrator','Broad, general-purpose pipelines; large teams','Huge ecosystem and provider library; mature; widely known','Operational overhead; local development friction; scheduler-centric model','Open source; managed by several vendors'],
   ['Dagster','Asset-based orchestrator','Data-asset-centric teams; strong dbt integration','Assets, checks and lineage built in; good local dev','Different mental model; smaller hiring pool than Airflow','Open source plus managed cloud (usage/plan based)'],
   ['Prefect','Python workflow orchestrator','Python-first teams wanting dynamic flows','Pythonic API; dynamic workflows; easy start','Smaller ecosystem than Airflow; fewer enterprise integrations','Open source plus managed cloud'],
   ['Mage','Notebook-style pipeline tool','Small teams wanting a visual, quick-start tool','Fast to prototype; integrated editor','Less proven at large scale; smaller community','Open source plus managed offering'],
   ['Kestra','Declarative YAML orchestrator','Teams that want flows defined as YAML with event triggers and a UI','Declarative flows; event-driven triggers; many plugins; language-agnostic tasks','Younger ecosystem than Airflow; fewer in-house skills available','Open source plus enterprise edition'],
   ['dbt Cloud jobs','Scheduler inside dbt platform','Teams that only need to run dbt on a schedule','Zero extra infrastructure; knows dbt state','Only orchestrates dbt; limited cross-tool logic','Plan/seat-based'],
   ['Databricks Workflows','Platform-native jobs','Teams already on Databricks','Tight integration with notebooks, Delta and clusters','Tied to Databricks','Included with Databricks compute (DBUs)'],
   ['Cloud Composer','Managed Airflow on GCP','GCP teams that want Airflow without running it','Managed environment; GCP integration','Environment cost even when idle; Airflow constraints remain','Environment and resource-based']
  ], cap:'The orchestrator is the hardest tool to change later. Pick for your team’s skills and the scale you will reach in two years.',
   n:'Airflow is the incumbent; Dagster and Prefect are modern challengers; dbt Cloud jobs and Databricks Workflows are “good enough” if you live inside one platform.' },

 { k:'code', t:'Deep dive: a production-minded Airflow DAG',
   lead:'Retries with backoff, a single active run, an idempotent extract keyed by the logical date, and a data check before the dbt build.',
   blocks:[
    {lang:'python', title:'dags/daily_shop_pipeline.py (Airflow 2.x import paths)', code:`
from datetime import timedelta

import pendulum
from airflow.decorators import dag, task
from airflow.operators.bash import BashOperator


def notify_failure(context):
    ti = context["task_instance"]
    # Replace with a Slack or PagerDuty call
    print(f"FAILED {ti.dag_id}.{ti.task_id} run_id={context['run_id']}")


default_args = {
    "owner": "analytics-eng",
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
    "on_failure_callback": notify_failure,
}


@dag(
    dag_id="daily_shop_pipeline",
    schedule="0 3 * * *",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    catchup=False,
    max_active_runs=1,
    default_args=default_args,
    tags=["shop", "daily"],
)
def daily_shop_pipeline():
    @task
    def extract(ds=None) -> str:
        # Idempotent: the output location is keyed by the logical date
        path = f"s3://lake/raw/shop/orders/dt={ds}/"
        # ... call the extractor and overwrite this partition ...
        return path

    @task
    def check_row_count(path: str) -> None:
        rows = 1234  # replace with a real count of the landed partition
        if rows == 0:
            raise ValueError(f"No rows landed at {path}")

    dbt_build = BashOperator(
        task_id="dbt_build",
        bash_command="cd /opt/dbt/shop && dbt build --target prod --select tag:daily",
        execution_timeout=timedelta(hours=1),
    )

    check_row_count(extract()) >> dbt_build


daily_shop_pipeline()`}
   ],
   points:[
    {h:'Idempotent tasks', p:'Output keyed by the logical date means a retry or backfill overwrites rather than duplicates.'},
    {h:'`catchup=False`', p:'Decide backfills deliberately. Automatic catch-up on a new DAG can launch hundreds of runs.'},
    {h:'Gate on data, not just on exit codes', p:'A cheap row-count check prevents building models on an empty load.'},
    {h:'SLAs', tag:'senior', p:'Airflow’s task SLA feature changed across major versions. Check your version, and consider monitoring freshness on the data itself.'}
   ],
   n:'Walk the file top to bottom: default retries and a failure callback, a DAG with one active run, and three tasks. Emphasize that the extract path includes the logical date, which is what makes re-runs safe. Airflow 3 moves some imports to airflow.sdk and a standard provider; the structure is unchanged.' },

 { k:'code', t:'Deep dive: asset-based orchestration in Dagster',
   lead:'Instead of “run task A then task B”, you declare the data assets, their dependencies and the checks on them.',
   blocks:[
    {lang:'python', title:'definitions.py', code:`
import dagster as dg


@dg.asset(group_name="raw", description="Orders landed from the shop API")
def raw_orders() -> dg.MaterializeResult:
    rows_loaded = 1234  # replace with a real load
    return dg.MaterializeResult(metadata={"rows_loaded": rows_loaded})


@dg.asset(deps=[raw_orders], group_name="marts")
def fct_orders() -> None:
    ...  # run the dbt model or SQL transformation here


@dg.asset_check(asset=fct_orders)
def orders_not_empty() -> dg.AssetCheckResult:
    row_count = 42  # replace with: select count(*) from fct_orders
    return dg.AssetCheckResult(passed=row_count > 0, metadata={"row_count": row_count})


daily_job = dg.define_asset_job("daily_assets", selection=[raw_orders, fct_orders])
daily_schedule = dg.ScheduleDefinition(job=daily_job, cron_schedule="0 3 * * *")

defs = dg.Definitions(
    assets=[raw_orders, fct_orders],
    asset_checks=[orders_not_empty],
    jobs=[daily_job],
    schedules=[daily_schedule],
)`}
   ],
   points:[
    {h:'Task-based', p:'Model the steps. Strong for arbitrary workflows, mixed systems and existing Airflow estates.'},
    {h:'Asset-based', p:'Model the outputs. Strong for lineage, partial re-materialization and freshness-driven runs.'},
    {h:'Choose by the question you ask most', tag:'senior', p:'“Did the job run?” fits tasks. “Is this table fresh and correct?” fits assets.'}
   ],
   n:'The point is the mental model. In the asset model, lineage and checks are first-class, so the tool can answer which tables are stale. In a task model you reconstruct that from DAG structure.' },

 { k:'cards', cols:3, t:'Design patterns and best practices',
   cards:[
    {h:'Small, idempotent tasks', p:'One responsibility per task, with outputs keyed by logical date or partition.'},
    {h:'Retries with backoff', p:'Retry only transient failures. Cap attempts, add timeouts, and surface the final error.'},
    {h:'Event-driven where it matters', p:'Sensors or triggers on upstream completion beat fixed schedules that race the data.'},
    {h:'Separate orchestration from logic', p:'The orchestrator calls code; it does not contain business logic. Test the code independently.'},
    {h:'Alert on outcomes', p:'Page on missed freshness targets, not on every retry.'},
    {h:'Runbooks and backfill tooling', p:'A documented, rehearsed way to re-run a date range, with limits on concurrency.'}
   ],
   n:'Every pattern keeps the orchestrator boring. The best DAGs are thin: they schedule, order and retry, while real logic lives in versioned code.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Business logic inside DAG files.', why:'Hard to test and slows scheduler parsing.', fix:'Keep DAG files thin; put logic in packages or dbt.'},
   {bad:'Non-idempotent tasks with retries.', why:'A retry after partial success creates duplicates.', fix:'Overwrite by partition or merge by key.'},
   {bad:'`depends_on_past` and wide fan-outs everywhere.', why:'One failure blocks or floods the system.', fix:'Use them sparingly; cap concurrency with pools.'},
   {bad:'Fixed 3 a.m. schedule “because ingestion finishes by 2:30”.', why:'The day it finishes at 3:10, you build on stale data.', fix:'Trigger on completion or check freshness first.'},
   {bad:'Alert on every task failure.', why:'Alert fatigue; real incidents get ignored.', fix:'Tiered alerts tied to SLAs and ownership.'},
   {bad:'Heavy work in the scheduler or webserver process.', why:'Platform instability for everyone.', fix:'Run heavy work in workers, containers or the warehouse.'}
  ], n:'The most common production incident in this layer is the race between ingestion and transformation. Event-driven triggers or freshness checks remove it.' },

 { k:'cards', cols:3, t:'What senior looks like: orchestration',
   cards:[
    {h:'Decisions', tag:'senior', list:['Task-based or asset-based','Managed or self-hosted','How teams share one orchestrator safely']},
    {h:'Trade-offs', tag:'senior', list:['Flexibility versus standardization','Ecosystem breadth versus developer experience','Operating cost versus vendor cost']},
    {h:'Responsibilities', tag:'senior', list:['Define SLAs and on-call expectations','Own the backfill and recovery playbooks','Standardize templates and conventions','Keep scheduler health and cost visible']}
   ],
   n:'The senior question is not “which tool?” but “what is the recovery story when this fails at 3 a.m. and the on-call engineer is new?”' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Every task is idempotent','Retries have backoff and timeouts','I can backfill a date range safely','Alerts map to business impact','DAG files contain orchestration, not logic','I know when assets beat tasks']},
   right:{h:'Interview-style questions', items:['Design the orchestration for a daily pipeline that ends in a finance report.','What is the difference between task-based and asset-based orchestration?','How do you prevent a downstream job from running on stale upstream data?','A DAG partially succeeded and was retried. What could go wrong?','How would you migrate off Airflow with minimal risk?']},
   n:'Strong answers to the second question mention lineage, partial re-runs and freshness as the practical differences.' }
]);

/* ===================== 6. SEMANTIC / METRICS LAYER ===================== */
SEC(6, [
 { k:'cards', cols:3, t:'Semantic and metrics layer: one definition per metric',
   lead:'Without it, “revenue” has five definitions and meetings turn into arguments about numbers instead of decisions.',
   cards:[
    {h:'Single source of truth', tag:'must', p:'Define a metric once, in code, with an owner. Every tool consumes that definition.'},
    {h:'Entities, dimensions, measures', tag:'must', p:'Model the business as entities joined by keys, sliced by dimensions, aggregated by measures.'},
    {h:'Where it lives', tag:'senior', p:'Inside the BI tool, in a transformation framework, or in a standalone headless layer queried by many tools.'},
    {h:'Governed self-service', tag:'senior', p:'Users explore freely, but only within vetted definitions and join paths.'},
    {h:'Caching and performance', tag:'nice', p:'Semantic layers can pre-aggregate and cache common queries.'},
    {h:'Trade-off', tag:'senior', p:'More indirection: another layer to learn, version and test.'}
   ],
   n:'The business problem comes first: inconsistent numbers erode trust faster than any outage. The semantic layer is the technical fix and the organizational forcing function for agreeing on definitions.' },

 { k:'table', t:'Tool landscape: semantic and metrics layers', head:TH, rows:[
   ['dbt Semantic Layer (MetricFlow)','Metrics defined in dbt','Teams already on dbt that want shared metrics','Definitions live next to models; versioned; API for integrations','Tool integrations vary; feature availability depends on dbt plan','Part of paid dbt platform plans (check current packaging)'],
   ['Cube','Headless semantic layer','Many consumers: BI, apps, embedded analytics, AI agents','Open source core; caching and pre-aggregations; APIs (SQL, REST, GraphQL)','Another service to run and model; modeling language to learn','Open source plus managed cloud'],
   ['LookML (Looker)','BI-native modeling layer','Organizations committed to Looker','Mature, Git-based modeling; strong governance in Looker','Mostly consumable inside Google Cloud Looker; proprietary language','Part of Looker licensing'],
   ['AtScale','Universal semantic layer','Enterprises with many BI tools and OLAP-style users','Works with multiple BI tools; strong enterprise features','Enterprise complexity and cost','Enterprise license'],
   ['Power BI semantic models','BI-native (DAX)','Microsoft-centric organizations','Deep Power BI integration; widely known','Logic can get trapped in the BI tool and DAX','Included in Power BI/Fabric licensing'],
   ['Tableau data sources','BI-native published sources','Tableau-centric organizations','Governed, reusable published data sources','Definitions live inside Tableau; harder to reuse elsewhere','Part of Tableau licensing']
  ], cap:'Key question: should metric logic be portable across tools, or is one BI tool the center of your world?',
   n:'The split is portable (dbt, Cube, AtScale) versus BI-native (LookML, DAX, Tableau). Portable layers cost more to run but reduce lock-in and serve non-BI consumers such as applications and AI agents.' },

 { k:'code', t:'Deep dive: defining metrics once with MetricFlow',
   lead:'A semantic model describes the grain and the columns; metrics build on its measures.',
   blocks:[
    {lang:'yaml', title:'models/marts/_orders__semantic.yml', code:`
semantic_models:
  - name: orders
    description: Order fact table at order grain.
    model: ref('fct_orders')
    defaults:
      agg_time_dimension: ordered_at
    entities:
      - name: order_id
        type: primary
      - name: customer
        type: foreign
        expr: customer_id
    dimensions:
      - name: ordered_at
        type: time
        type_params:
          time_granularity: day
      - name: order_status
        type: categorical
    measures:
      - name: order_total
        description: Sum of order amounts.
        agg: sum
        expr: order_amount
      - name: order_count
        agg: count
        expr: order_id

metrics:
  - name: revenue
    label: Revenue
    description: Gross revenue from shipped orders. Owner is Finance.
    type: simple
    type_params:
      measure: order_total
    filter: |
      {{ Dimension('order_id__order_status') }} = 'shipped'

  - name: orders
    label: Orders
    type: simple
    type_params:
      measure: order_count

  - name: average_order_value
    label: Average order value
    type: ratio
    type_params:
      numerator: revenue
      denominator: orders`}
   ],
   points:[
    {h:'Grain first', p:'State the grain (one row per order) and keep entities and keys consistent so joins are safe.'},
    {h:'Metric types', p:'Simple, ratio, cumulative and derived metrics cover most needs without custom SQL.'},
    {h:'Owner in the description', tag:'senior', p:'A metric with no owner has no one to resolve disputes.'},
    {h:'Spec is evolving', tag:'senior', p:'The configuration format has been changing between releases. Check the docs for your version.'}
   ],
   n:'Read it as a contract: the semantic model says what the table is; the metrics say what the business means. The filter on revenue is the kind of rule that otherwise gets re-implemented in ten dashboards.' },

 { k:'code', t:'The same idea in Cube and LookML',
   lead:'Different syntax, same discipline: measures and dimensions defined once, near the data.',
   blocks:[
    {lang:'yaml', title:'model/cubes/orders.yml (Cube)', code:`
cubes:
  - name: orders
    sql_table: analytics.marts.fct_orders

    measures:
      - name: count
        type: count
      - name: revenue
        sql: order_amount
        type: sum
        filters:
          - sql: "{CUBE}.order_status = 'shipped'"

    dimensions:
      - name: order_id
        sql: order_id
        type: number
        primary_key: true
      - name: ordered_at
        sql: ordered_at
        type: time`},
    {lang:'lookml', title:'orders.view.lkml (LookML)', code:`
view: orders {
  sql_table_name: analytics.marts.fct_orders ;;

  dimension: order_id {
    primary_key: yes
    type: number
    sql: \${TABLE}.order_id ;;
  }

  dimension_group: ordered {
    type: time
    timeframes: [date, week, month]
    sql: \${TABLE}.ordered_at ;;
  }

  measure: revenue {
    type: sum
    sql: \${TABLE}.order_amount ;;
    filters: [order_status: "shipped"]
  }
}`}
   ],
   cap:'LookML measure filters refer to an order_status dimension that would also be defined in the view; omitted here for brevity.',
   n:'Use this slide to show that the concept transfers between tools. The skill is semantic modeling, not any one syntax. Mention the caption: a real view would also define order_status.' },

 { k:'cards', cols:3, t:'Design patterns and best practices',
   cards:[
    {h:'Start with the 10 metrics that matter', p:'Agree on definitions for the executive metrics first; expand with demand.'},
    {h:'Metrics are code', p:'Version, review and test them like any model. Changes get changelogs and owners.'},
    {h:'Build on marts, not raw', p:'The semantic layer sits on top of clean, tested models with a clear grain.'},
    {h:'Naming conventions', p:'Business names for metrics, consistent entity names for joins, descriptions for every public object.'},
    {h:'Certify and deprecate', p:'Mark certified metrics; retire duplicates instead of letting them accumulate.'},
    {h:'Serve many consumers', p:'Dashboards, notebooks, apps and AI assistants should all call the same definitions.'}
   ],
   n:'Most of the work is organizational: choosing owners, resolving conflicting definitions, deprecating duplicates. The tool just makes the decision enforceable.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Metric logic copy-pasted into each dashboard.', why:'Numbers diverge and nobody knows which is right.', fix:'Define once in the semantic layer; dashboards reference it.'},
   {bad:'Modeling everything on day one.', why:'Big-bang projects stall and lose sponsors.', fix:'Start with a few high-value metrics; expand.'},
   {bad:'Semantic layer on top of untested data.', why:'It spreads bad data faster and more consistently.', fix:'Fix quality in marts first.'},
   {bad:'Ignoring grain and fan-out.', why:'Joins inflate sums silently.', fix:'Declare grains and test uniqueness of keys.'},
   {bad:'No owner for a metric.', why:'Disputes are never resolved.', fix:'Name an owner and a review process.'},
   {bad:'Choosing a layer for the logo.', why:'It may not integrate with your BI and apps.', fix:'Prototype with your real tools and queries.'}
  ], n:'The fan-out pitfall deserves attention: it is the most common way a correct-looking metric is wrong.' },

 { k:'cards', cols:3, t:'What senior looks like: semantic layer',
   cards:[
    {h:'Decisions', tag:'senior', list:['Portable layer or BI-native','Which metrics are certified','Who owns each definition']},
    {h:'Trade-offs', tag:'senior', list:['Governance versus self-service speed','Portability versus integration depth','Central team versus domain ownership']},
    {h:'Responsibilities', tag:'senior', list:['Run the definition-alignment process','Maintain the metric catalog','Manage breaking changes to metrics','Measure adoption and drift']}
   ],
   n:'The senior contribution is facilitation: getting finance, product and sales to agree, then encoding it. See section 14.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Each executive metric has one definition and an owner','Metric logic is version-controlled and reviewed','Grain and keys are explicit for each semantic model','Dashboards use certified metrics where possible','I can explain portable versus BI-native layers','Marts under it are tested']},
   right:{h:'Interview-style questions', items:['Two dashboards show different revenue. How do you resolve it?','When would you choose Cube or dbt Semantic Layer over LookML or DAX?','How do you introduce a semantic layer without a big-bang project?','What goes wrong if a semantic model has the wrong grain?','How do you version a change to a metric’s definition?']},
   n:'For the first question, listen for “find the definitions, pick an owner, record the decision”, not “pick the number that looks right”.' }
]);
