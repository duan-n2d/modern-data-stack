"use strict";
function SEC(n, slides){ DATA[n - 1] = { slides: slides }; }
var TH = ['Tool','Type','Best for','Strengths','Limitations','Pricing model'];

/* ===================== 1. CORE LANGUAGES ===================== */
SEC(1, [
 { k:'cards', cols:3, t:'Core languages: the tools you think in',
   lead:'Everything else in the stack is configuration around a handful of languages. Seniors write SQL that stays fast and readable at 100x the data, and reach for Python only where SQL stops being the right tool.',
   cards:[
    {h:'SQL', tag:'must', p:'The main interface to the warehouse: window functions, CTEs, recursive queries, reading query plans.'},
    {h:'Python', tag:'must', p:'Glue, ingestion, tests and anything procedural: pandas, polars, DuckDB, PySpark, pytest.'},
    {h:'Jinja', tag:'must', p:'Templating in dbt and Airflow. Turns repeated SQL into macros, and can also make code unreadable.'},
    {h:'YAML', tag:'must', p:'Configuration for dbt, CI and orchestrators. Indentation is meaning, so lint it.'},
    {h:'Bash', tag:'nice', p:'Glue for CI jobs, containers and local tooling. Keep scripts short and fail fast with `set -euo pipefail`.'},
    {h:'Why it matters', tag:'senior', p:'Language choice decides who can maintain the code. Prefer the simplest tool the whole team can read.'}
   ],
   n:'Frame the layer: these are the languages every other layer is written in. The senior signal is not knowing more syntax, it is choosing the simplest tool that the whole team can maintain, and keeping SQL performant as data grows.' },

 { k:'table', t:'Language and library landscape', head:TH, rows:[
   ['SQL','Query language','Set-based transforms in the warehouse','Declarative, optimizer does the work, universal skill','Dialect differences; awkward for procedural logic','Free; you pay for compute'],
   ['pandas','Python dataframe library','Small to medium in-memory analysis','Huge ecosystem, familiar API','Memory-bound, mostly single-threaded','Open source'],
   ['polars','Python/Rust dataframe library','Fast single-machine ETL with lazy evaluation','Multi-threaded, query optimizer, low memory use','Younger ecosystem; API still evolving','Open source'],
   ['DuckDB','In-process OLAP engine','Local analytics on Parquet/CSV; testing SQL','Fast columnar SQL, no server, reads files directly','Single node; limited concurrent writers','Open source'],
   ['PySpark','Distributed dataframe API','Data too large for one machine','Scales out, mature ecosystem','Cluster overhead; tuning skills needed','Pay for cluster (open-source engine)'],
   ['pytest','Test framework','Unit tests for Python and SQL logic','Fixtures, parametrization, plugins','Does not test production data by itself','Open source'],
   ['Jinja','Templating language','Macros in dbt; Airflow templates','Reuse, conditionals, loops','Overuse hurts readability; errors appear at compile time','Open source'],
   ['YAML and Bash','Config and shell','CI pipelines, dbt config, glue','Available everywhere','Whitespace bugs; Bash portability','Free']
  ], cap:'Rule of thumb: SQL first, DuckDB or polars for local and medium data, PySpark only when one machine is genuinely not enough.',
   n:'Do not read the table row by row. Make one point: most analytics engineering work should be SQL; the Python options differ mainly by data size and by how much infrastructure they need.' },

 { k:'code', t:'Deep dive: window functions, CTEs and recursion',
   lead:'The three SQL features that separate mid-level from senior query writing.',
   blocks:[
    {lang:'sql', title:'latest_order_per_customer.sql', code:`
with orders_ranked as (
    select
        customer_id,
        order_id,
        order_date,
        row_number() over (
            partition by customer_id
            order by order_date desc, order_id desc   -- deterministic tiebreaker
        ) as rn,
        sum(amount) over (
            partition by customer_id
            order by order_date, order_id
            rows between unbounded preceding and current row
        ) as running_amount
    from analytics.marts.fct_orders
)
select customer_id, order_id, order_date, running_amount
from orders_ranked
where rn = 1;`},
    {lang:'sql', title:'org_hierarchy.sql (recursive CTE)', code:`
with recursive org as (
    select employee_id, manager_id, name, 1 as depth
    from hr.employees
    where manager_id is null
    union all
    select e.employee_id, e.manager_id, e.name, o.depth + 1
    from hr.employees e
    join org o on e.manager_id = o.employee_id
    where o.depth < 20                              -- guard against cycles
)
select * from org order by depth, name;`}
   ],
   points:[
    {h:'Pick the right ranking function', p:'`row_number` never ties, `rank` leaves gaps, `dense_rank` does not. Decide by how ties should behave.'},
    {h:'Frame clauses matter', p:'`rows between` is physical; `range between` groups ties. Default frames surprise people.'},
    {h:'QUALIFY', tag:'nice', p:'Several warehouses let you filter on window results directly, removing the wrapper CTE.'},
    {h:'Recursion needs a stop', p:'Bound depth or detect cycles, or one bad row burns your compute budget.'}
   ],
   n:'Walk through the first query: the CTE computes two window functions in one pass, and the outer query filters to rn = 1. Highlight the tiebreaker in order by: without it the result is non-deterministic. For recursion, stress the depth guard.' },

 { k:'code', t:'Deep dive: optimized versus unoptimized query',
   lead:'Same result, very different cost. Both queries return events that happened after the user’s latest order, on one day.',
   blocks:[
    {lang:'sql', title:'unoptimized.sql', code:`
-- Slow: SELECT *, function wraps the partition column,
-- correlated subquery re-evaluated per event row
select *
from events e
where date(e.event_ts) = '2026-03-01'
  and e.event_ts > (
        select max(o.created_at)
        from orders o
        where o.user_id = e.user_id
  );`},
    {lang:'sql', title:'optimized.sql', code:`
-- Faster: prune partitions, project columns, aggregate once
with last_order as (
    select user_id, max(created_at) as last_order_at
    from orders
    group by user_id
)
select e.user_id, e.event_name, e.event_ts
from events e
join last_order lo on lo.user_id = e.user_id
where e.event_ts >= '2026-03-01'     -- sargable range on the
  and e.event_ts <  '2026-03-02'     -- partition / cluster column
  and e.event_ts > lo.last_order_at;`}
   ],
   after:'<div class="grid c3" style="margin-top:12px">' +
     cardHTML({h:'1. Project columns', p:'Columnar engines read only the columns you name. `select *` reads everything.'}, true) +
     cardHTML({h:'2. Make filters sargable', p:'Compare the raw column to a range. Wrapping it in a function can disable partition pruning.'}, true) +
     cardHTML({h:'3. Decorrelate, then verify', p:'Aggregate once and join. Confirm with the query plan: bytes scanned, partitions pruned, spills.'}, true),
   n:'Make the point that the optimized version is not clever, it is simply honest about what the engine can optimize. Then show where to look to confirm: the query profile or EXPLAIN output. Never claim an optimization without measuring bytes scanned or runtime before and after.' },

 { k:'code', t:'Deep dive: Python for analytics engineers',
   lead:'DuckDB for SQL over files, polars for dataframe work, pytest to keep transformations honest.',
   blocks:[
    {lang:'python', title:'daily_events.py', code:`
import duckdb
import polars as pl

con = duckdb.connect()  # in-memory database
daily = con.sql("""
    select date_trunc('day', event_ts) as day, count(*) as events
    from read_parquet('events/*.parquet')
    group by 1
    order by 1
""").pl()  # DuckDB relation -> polars DataFrame

smoothed = daily.with_columns(
    pl.col("events").rolling_mean(window_size=7).alias("events_7d_avg")
)
print(smoothed.tail(3))`},
    {lang:'python', title:'test_transforms.py', code:`
import polars as pl
import pytest


def dedupe_latest(df: pl.DataFrame) -> pl.DataFrame:
    return df.sort("updated_at").unique(
        subset="id", keep="last", maintain_order=True
    )


def test_keeps_most_recent_row():
    df = pl.DataFrame(
        {"id": [1, 1, 2], "updated_at": [1, 2, 1], "v": ["old", "new", "x"]}
    )
    out = dedupe_latest(df)
    assert out.filter(pl.col("id") == 1)["v"].to_list() == ["new"]
    assert out.height == 2


@pytest.mark.parametrize("n", [1, 2, 5])
def test_unique_input_is_unchanged(n):
    df = pl.DataFrame(
        {"id": list(range(n)), "updated_at": list(range(n)), "v": ["a"] * n}
    )
    assert dedupe_latest(df).height == n`}
   ],
   points:[
    {h:'Scale ladder', p:'pandas for convenience, polars or DuckDB when data stops fitting comfortably, PySpark only when one machine is truly not enough.'},
    {h:'Test pure functions', p:'pytest for transformation logic and edge cases; dbt tests for properties of the data itself.'},
    {h:'Local-first loop', tag:'senior', p:'DuckDB on a sample of Parquet gives a seconds-long feedback loop before touching the warehouse.'}
   ],
   n:'The left example shows the modern local stack: DuckDB reads Parquet directly, and the result drops into polars. The right shows that transformation logic is just functions, so it is unit testable. Contrast with dbt tests, which test the data, not the logic.' },

 { k:'cards', cols:3, t:'Design patterns and best practices',
   cards:[
    {h:'Readable first', p:'CTEs named by intent, one transformation per CTE, explicit column lists at layer boundaries.'},
    {h:'Set-based over row-based', p:'Avoid loops and per-row UDFs. Let the optimizer see the whole problem.'},
    {h:'Filter early, join late', p:'Reduce rows and columns before expensive joins and aggregations.'},
    {h:'Sargable predicates', p:'Compare raw columns to ranges so partition pruning and clustering can work.'},
    {h:'Deterministic by default', p:'Tiebreakers in windows, explicit casts and explicit time zones. Same input, same output.'},
    {h:'Read the plan', p:'Use EXPLAIN or the query profile. Check bytes scanned, join order, skew and spills before tuning.'}
   ],
   n:'These six habits cover most day-to-day SQL quality. The last one is the senior habit: measure before and after, using the engine’s own tools.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'`select *` in models and views.', why:'Breaks on schema drift and reads every column.', fix:'List columns explicitly at staging and mart boundaries.'},
   {bad:'Functions on filter columns, like `date(ts) = ...`.', why:'Can defeat partition pruning.', fix:'Use half-open range predicates on the raw column.'},
   {bad:'`distinct` to hide duplicate rows.', why:'Masks join fan-out and adds a sort.', fix:'Fix the grain of the join and test uniqueness.'},
   {bad:'Implicit casts and local time zones.', why:'Silently wrong when data or locale changes.', fix:'Cast explicitly and store timestamps in UTC.'},
   {bad:'Jinja everywhere.', why:'Nobody can read or debug the compiled result.', fix:'Macros only for real repetition; review compiled SQL.'},
   {bad:'pandas for every job.', why:'Memory blow-ups and slow loops.', fix:'Push work into SQL, DuckDB or polars.'}
  ], n:'Pick two that the audience has probably seen in their own code. The common thread: each trades a little convenience now for cost, ambiguity or fragility later.' },

 { k:'cards', cols:3, t:'What senior looks like: core languages',
   cards:[
    {h:'Decisions', tag:'senior', list:['SQL or Python for each task','Where logic lives: warehouse, dbt or application','Which dialect-specific features to rely on']},
    {h:'Trade-offs', tag:'senior', list:['Clever versus readable','Portable SQL versus warehouse-specific speed','Local iteration speed versus production parity']},
    {h:'Responsibilities', tag:'senior', list:['Own the SQL style guide and linting','Review for correctness and performance','Teach query-plan reading','Own the cost of the heaviest queries']}
   ],
   n:'Seniority here is judgment, not syntax. The question is always “what will the next engineer, or the next ten times of data, do to this code?”' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['I can read a query plan and spot a full scan','I use window functions and recursive CTEs fluently','My SQL is linted (for example with SQLFluff) and reviewed','I can write a pytest for a transformation','I know when DuckDB or polars beats pandas','I can use Jinja without hurting readability']},
   right:{h:'Interview-style questions', items:['What is the difference between `rank`, `dense_rank` and `row_number`, and when does each bite?','A query became 10x slower as data grew. How do you diagnose it?','Why can `where date(ts) = x` be slower than a range filter?','When would you choose polars or DuckDB over PySpark?','How do you test a SQL transformation?']},
   n:'Use the right-hand questions as a mock interview. Good answers name a measurement (bytes scanned, runtime) rather than a hunch.' }
]);

/* ===================== 2. INGESTION / ELT ===================== */
SEC(2, [
 { k:'cards', cols:3, t:'Ingestion and ELT: getting data in, reliably',
   lead:'Everything downstream trusts what lands here. Raw data should be replayable, auditable and safe to load twice.',
   cards:[
    {h:'Batch versus streaming', tag:'must', p:'Batch is simple and cheap, with minutes to hours of latency. Streaming and CDC give seconds, with many more moving parts.'},
    {h:'Full versus incremental', tag:'must', p:'Full reloads are safe for small tables. Incremental needs a trustworthy cursor or a change log.'},
    {h:'Schema drift', tag:'must', p:'Sources add, rename and retype columns without warning. Decide in advance: evolve, quarantine or fail.'},
    {h:'Backfills', tag:'must', p:'Reloading history after a bug or a new field must not create duplicates.'},
    {h:'Idempotency', tag:'must', p:'Running a load twice gives the same result. This is what makes retries safe.'},
    {h:'ELT, not ETL', tag:'senior', p:'Land raw data first, transform in the warehouse. You can reprocess without re-extracting.'}
   ],
   n:'Five concepts carry this whole layer. If the audience remembers only idempotency, they will already avoid most duplicate-data incidents.' },

 { k:'table', t:'Tool landscape: ELT and ingestion platforms', head:TH, rows:[
   ['Fivetran','Managed ELT','Teams that want low-maintenance connectors','Large connector catalog; automatic schema handling','Cost grows with volume; limited custom logic','Usage-based (monthly active rows)'],
   ['Airbyte','Open-source and managed ELT','Long-tail connectors; self-hosting; control','Open-source core; connector builder; broad catalog','Connector quality varies; self-hosting needs operations','Open source is free; cloud is usage-based (check current plans)'],
   ['Stitch','Managed ELT (Singer-based)','Small teams with common sources','Simple setup; predictable tiers','Smaller feature set; less control','Row-volume tiers'],
   ['Hevo','Managed data pipelines','Mid-size teams wanting a UI-driven managed service','Easy setup; light in-flight transforms','Smaller community; fewer custom hooks','Event-volume plans'],
   ['dlt','Python library (open source)','Custom APIs and code-first teams','Schema inference and evolution; runs anywhere Python runs','You own scheduling, monitoring and operations','Open source'],
   ['Meltano / Singer','Open-source framework / spec','Teams standardizing on Singer taps and targets','Composable; config in version control','Tap quality is uneven; operational overhead','Open source']
  ], cap:'Choosing between them is mostly a buy-versus-build question; see section 14.',
   n:'Group the tools: Fivetran, Stitch and Hevo are managed; Airbyte is both; dlt and Meltano are code-first. The decision is about who operates the connectors and how the cost scales.' },

 { k:'table', t:'Tool landscape: streaming and change data capture', head:TH, rows:[
   ['Apache Kafka','Distributed event log','Durable, high-throughput event backbone','Replayable log; large ecosystem (Connect, Streams)','Operationally heavy when self-managed; partition design matters','Open source; managed offerings are usage or capacity based'],
   ['Debezium','Open-source CDC connectors','Streaming row-level changes from database logs','Captures deletes; reads the log, so low load on the source','Needs Kafka Connect or Debezium Server; snapshots and schema changes need care','Open source'],
   ['Redpanda','Kafka-API-compatible platform','Kafka protocol with simpler operations','Single binary; Kafka client compatibility','Smaller ecosystem; core is source-available, not fully open source','Source-available plus managed cloud'],
   ['Amazon Kinesis','AWS managed stream','AWS-native pipelines (Lambda, Firehose)','Fully managed; scales with shards or on-demand','AWS lock-in; limits differ from Kafka','Per shard-hour or per throughput'],
   ['Google Pub/Sub','GCP managed messaging','GCP-native ingestion into BigQuery and Dataflow','Serverless; simple to operate','Semantics differ from a Kafka log; GCP lock-in','Per data volume']
  ], cap:'Most analytics teams need CDC for a few operational databases, not a company-wide streaming platform.',
   n:'Be clear that these are different categories: Kafka, Redpanda, Kinesis and Pub/Sub transport events; Debezium produces change events from databases. A common design is Debezium into Kafka into the warehouse.' },

 { k:'code', t:'Deep dive: incremental, idempotent loading',
   lead:'A cursor plus a primary key gives you incremental loads that are safe to retry.',
   blocks:[
    {lang:'python', title:'shop_orders.py (dlt)', code:`
import dlt
from dlt.sources.helpers import requests


@dlt.resource(name="orders", primary_key="id", write_disposition="merge")
def orders(
    updated_at=dlt.sources.incremental(
        "updated_at", initial_value="2026-01-01T00:00:00Z"
    ),
):
    page = 1
    while True:
        resp = requests.get(
            "https://api.example.com/v1/orders",
            params={
                "updated_since": updated_at.last_value,
                "page": page,
                "per_page": 500,
            },
            timeout=30,
        )
        resp.raise_for_status()
        rows = resp.json()["data"]
        if not rows:
            break
        yield rows
        page += 1


pipeline = dlt.pipeline(
    pipeline_name="shop",
    destination="snowflake",
    dataset_name="raw_shop",
)

if __name__ == "__main__":
    print(pipeline.run(orders()))`},
    {lang:'sql', title:'merge_orders.sql (batch-to-raw upsert)', code:`
merge into raw.orders as t
using (
    select *
    from landing.orders_batch
    qualify row_number() over (partition by id order by updated_at desc) = 1
) as s
on t.id = s.id
when matched and s.updated_at > t.updated_at then update set
    status = s.status, amount = s.amount, updated_at = s.updated_at
when not matched then insert (id, status, amount, updated_at)
    values (s.id, s.status, s.amount, s.updated_at);`}
   ],
   points:[
    {h:'Cursor plus key', p:'The cursor limits what you read; the key lets the write replace instead of duplicate.'},
    {h:'Overlap the window', p:'Re-read a little history (for example the last hour) and dedupe. It tolerates late-arriving updates.'},
    {h:'Deletes are invisible', p:'Cursor loads cannot see hard deletes. Use CDC, soft-delete flags or a periodic key comparison.'},
    {h:'Never edit raw by hand', tag:'senior', p:'Fix problems in transformation, or re-load from the source. Raw stays an audit trail.'}
   ],
   n:'The dlt resource declares a primary key and merge disposition, so re-running the pipeline updates rows rather than duplicating them. The SQL on the right is the same idea expressed manually. The senior point is about deletes: any design that ignores them drifts from the source.' },

 { k:'cards', cols:3, t:'Design patterns and best practices',
   cards:[
    {h:'Land raw, transform later', p:'Keep an untouched copy so you can reprocess without calling the source again.'},
    {h:'Incremental by default', p:'Support a full refresh and ranged backfills as explicit, parameterized operations.'},
    {h:'Idempotent writes', p:'Merge by key or replace a partition, so retries and reruns are harmless.'},
    {h:'Schema-drift policy', p:'Evolve additive changes, alert on type changes and removals, quarantine breaking batches.'},
    {h:'Load metadata', p:'Add `_loaded_at`, `_batch_id` and source name. They make audits and dedupes possible.'},
    {h:'Log-based CDC for databases', p:'Captures deletes with low source impact. Plan for the initial snapshot and ordering.'}
   ],
   n:'Each pattern removes one failure class: reprocessing, duplicate loads, silent drift, untraceable rows. CDC is the one with real operational cost, so reserve it for sources that need it.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Cursor on `created_at` only.', why:'Misses updates to existing rows.', fix:'Use `updated_at` with an overlap window, or use CDC.'},
   {bad:'Trusting local-time source timestamps.', why:'Causes silent gaps and duplicates around time changes.', fix:'Store UTC and record the source time zone.'},
   {bad:'Full-refreshing huge tables nightly.', why:'High cost and long load windows.', fix:'Load incrementally and reconcile periodically.'},
   {bad:'Pipelines that cannot backfill.', why:'Every bug becomes a manual repair.', fix:'Parameterize by date range with idempotent writes.'},
   {bad:'Ignoring deletes.', why:'The warehouse slowly diverges from the source.', fix:'CDC, soft deletes or a periodic key diff.'},
   {bad:'Alerting only on failure.', why:'An empty “successful” load looks healthy.', fix:'Add freshness and row-count anomaly checks.'}
  ], n:'The last row connects to section 8: green pipelines can still deliver wrong data. Silence is a failure mode.' },

 { k:'cards', cols:3, t:'What senior looks like: ingestion',
   cards:[
    {h:'Decisions', tag:'senior', list:['Buy a connector or build one','Batch or streaming, justified by business value','CDC or API polling per source']},
    {h:'Trade-offs', tag:'senior', list:['Managed convenience versus usage-based cost growth','Low latency versus complexity','Auto schema evolution versus stable contracts']},
    {h:'Responsibilities', tag:'senior', list:['Set and monitor freshness SLAs','Own ingestion cost','Write replay and backfill runbooks','Agree source-change expectations with application teams']}
   ],
   n:'The key senior question is “what latency does the business actually pay for?” Most “real-time” requests dissolve when the cost is explained.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Every load is idempotent','I can backfill a date range without duplicates','I have a written policy for schema drift','Deletes are handled, not ignored','Raw data is append-only or merge-by-key','Freshness is monitored, not just job success']},
   right:{h:'Interview-style questions', items:['Design ingestion for a table with hard deletes and no `updated_at`.','How do you make a load idempotent?','When is streaming not worth it?','A source adds a column and changes another’s type. What happens in your stack?','How would you backfill 90 days without double counting?']},
   n:'Good answers to the first question mention log-based CDC or periodic key comparison, and name the trade-off of each.' }
]);
