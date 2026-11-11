"use strict";

/* ===================== 3. WAREHOUSE / LAKEHOUSE ===================== */
SEC(3, [
 { k:'cards', cols:3, t:'Warehouse and lakehouse: where the data lives',
   lead:'The storage and compute choice sets your cost curve, your performance ceiling and how hard it is to leave later.',
   cards:[
    {h:'Cloud warehouse', tag:'must', p:'Managed SQL engine with its own storage: Snowflake, BigQuery, Redshift. Easiest path to production.'},
    {h:'Lakehouse', tag:'must', p:'Open table formats on object storage, queried by one or more engines: Delta, Iceberg, Hudi.'},
    {h:'Storage formats', tag:'must', p:'Parquet and ORC are columnar and good for analytics. Avro is row-based and suits streaming and schemas.'},
    {h:'Real-time OLAP', tag:'nice', p:'ClickHouse, Druid, Pinot and StarRocks serve low-latency, high-concurrency queries.'},
    {h:'Local and embedded', tag:'nice', p:'DuckDB and MotherDuck for small and medium data, prototyping and cheap workloads.'},
    {h:'Why it matters', tag:'senior', p:'Separating storage from compute lets you scale each independently, and open formats reduce lock-in.'}
   ],
   n:'Introduce the two big architectural camps and the third category of specialized engines. The unifying idea is separation of storage and compute, and the rise of open table formats that let several engines share one copy of data.' },

 { k:'table', t:'Tool landscape: warehouses and lakehouse platforms', head:TH, rows:[
   ['Snowflake','Cloud data warehouse / platform','Governed SQL analytics with minimal tuning','Separate storage and compute; easy scaling; broad ecosystem','Credit costs can surprise; closed engine unless using open tables','Consumption (credits) plus storage'],
   ['BigQuery','Serverless warehouse','Spiky workloads; GCP-centric stacks','No cluster management; strong for large scans','Cost model needs care (bytes scanned or reserved capacity)','On-demand per bytes processed, or capacity-based'],
   ['Amazon Redshift','Warehouse (provisioned and serverless)','AWS-centric stacks with tight AWS integration','Deep AWS integration; mature','More tuning than serverless peers on provisioned clusters','Instance-hours or serverless compute units'],
   ['Databricks','Lakehouse platform','Mixed SQL, ML and streaming on one platform','Delta Lake, Unity Catalog, Spark and SQL warehouses','Learning curve; costs need governance','Consumption (DBUs) plus cloud infrastructure'],
   ['Synapse / Fabric','Microsoft analytics platform','Microsoft-centric organizations (Power BI, Azure)','Tight Power BI and OneLake integration','Product direction has been shifting toward Fabric; check roadmap','Capacity-based'],
   ['MotherDuck / DuckDB','Embedded and serverless DuckDB','Small to medium data; cheap analytics; local dev','Very fast on a single node; simple','Not built for very large scale or heavy concurrent writes','DuckDB is open source; MotherDuck is usage/plan-based']
  ], cap:'Pricing models differ in kind, not just in level: compare cost per realistic workload, not list prices.',
   n:'Resist ranking these. Each fits a context: BigQuery for serverless GCP, Snowflake for governed multi-cloud SQL, Databricks for mixed ML and SQL, Fabric for Microsoft shops, DuckDB for small and local.' },

 { k:'table', t:'Tool landscape: table formats and real-time OLAP', head:TH, rows:[
   ['Delta Lake','Open table format','Lakehouse on Spark and Databricks','ACID transactions, time travel, mature tooling','Best experience in the Databricks ecosystem','Open source'],
   ['Apache Iceberg','Open table format','Multi-engine lakehouse and avoiding lock-in','Broad engine support; hidden partitioning; schema evolution','Catalog and maintenance choices add complexity','Open source'],
   ['Apache Hudi','Open table format','Upserts and incremental pulls on a lake','Strong record-level updates and streaming ingestion','Smaller community than Delta and Iceberg','Open source'],
   ['ClickHouse','Columnar OLAP database','Fast aggregations on event and log data','Very fast scans; high compression','Joins and updates need design care; different mental model','Open source plus managed cloud'],
   ['Druid / Pinot','Real-time OLAP','User-facing analytics with low latency and high concurrency','Sub-second queries on streaming data','Operationally heavier; narrower SQL support','Open source plus managed offerings'],
   ['StarRocks','MPP OLAP database','Fast SQL on lakehouse data and real-time workloads','Vectorized engine; can query Iceberg and Delta tables','Younger ecosystem','Open source plus managed offerings']
  ], cap:'Storage formats: Parquet and ORC (columnar, analytics), Avro (row-based, streaming). Object stores: S3, GCS, ADLS.',
   n:'Table formats are metadata layers on top of Parquet files. They add transactions, schema evolution and time travel. The real-time OLAP engines solve a different problem: serving many fast queries to applications and customers.' },

 { k:'table', t:'Comparison matrix: choosing a platform', head:['Need','Snowflake','BigQuery','Databricks','Redshift','Fabric','DuckDB'], rows:[
   ['Minimal operations','High','Highest','Medium to high','Medium','Medium to high','Highest (single node)'],
   ['Open table formats','Growing support','Supported (Iceberg, BigLake)','Delta native; Iceberg supported','Supported via Spectrum and lake formats','OneLake uses Delta','Reads Parquet; extensions for Iceberg and Delta'],
   ['ML and data science','Growing','Growing','Strongest','Via AWS services','Via Fabric services','Local experimentation'],
   ['Spiky, unpredictable load','Good (auto-suspend)','Strong (serverless)','Good (serverless SQL)','Serverless option','Capacity based','Not applicable'],
   ['Microsoft / Power BI shop','Good','Good','Good','Good','Best fit','Not applicable'],
   ['Lock-in risk','Medium','Medium','Lower with open formats','Medium','Medium','Low']
  ], cap:'These are qualitative generalizations. Features change quickly: verify against current documentation and benchmark your own workloads.',
   n:'Stress the caption. This matrix is a starting point for a conversation, not a verdict. Vendors converge on features constantly, so rely on a proof of concept with your own queries.' },

 { k:'cards', cols:3, t:'Cost and performance: the trade-offs',
   lead:'No platform is cheap by default. Cost follows design decisions.',
   cards:[
    {h:'Compute model', p:'Per-second warehouses, per-bytes-scanned queries or reserved capacity reward different habits. Match the model to your load shape.', tag:'must'},
    {h:'Storage layout', p:'Partitioning and clustering reduce data scanned. Over-partitioning creates small files and slow metadata operations.', tag:'must'},
    {h:'Materialize wisely', p:'Precompute expensive, widely used models; leave rarely used ones as views.', tag:'must'},
    {h:'Concurrency', p:'Separate warehouses or queues for ELT, BI and ad hoc work prevent noisy neighbours.', tag:'senior'},
    {h:'Guardrails', p:'Resource monitors, query timeouts, budgets and per-team cost attribution stop runaway spend.', tag:'senior'},
    {h:'Benchmark honestly', p:'Use your own data and queries, include warm and cold runs, and compare cost per outcome, not only speed.', tag:'senior'}
   ],
   n:'The senior move is to talk about cost per business outcome. Fast and expensive can be fine; slow and cheap can be fine; unexamined is never fine.' },

 { k:'code', t:'Deep dive: layout that saves money',
   lead:'Partitioning and clustering decide how much data a filter has to touch. Syntax differs by platform; the idea does not.',
   blocks:[
    {lang:'sql', title:'BigQuery: partitioned and clustered table', code:`
create table analytics.fct_events
partition by date(event_ts)
cluster by customer_id, event_name
options (
    partition_expiration_days = 730,
    require_partition_filter = true
) as
select * from staging.stg_events;`},
    {lang:'sql', title:'Snowflake: clustering key and cost guardrail', code:`
create or replace table analytics.fct_events
    cluster by (to_date(event_ts), customer_id)
as select * from staging.stg_events;

create resource monitor elt_monitor with
    credit_quota = 100
    triggers on 90 percent do notify
             on 100 percent do suspend;

alter warehouse elt_wh set resource_monitor = elt_monitor;`}
   ],
   points:[
    {h:'Force partition filters', p:'`require_partition_filter` makes accidental full scans an error, not an invoice.'},
    {h:'Cluster on common filters', p:'Pick columns used in `where` and `join`, with lower cardinality first as a starting heuristic.'},
    {h:'Cap spend', tag:'senior', p:'Resource monitors suspend or notify before a bad query or loop burns the budget.'},
    {h:'Re-clustering has a cost', p:'On Snowflake, automatic clustering consumes credits. Cluster only large, frequently filtered tables.'}
   ],
   n:'Both examples encode a cost decision in the table definition. The BigQuery option makes unfiltered scans fail; the Snowflake monitor makes runaway spend stop. Numbers in the examples are placeholders: size them from your own budget.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Choosing a platform from a benchmark blog.', why:'Vendor benchmarks rarely match your data or concurrency.', fix:'Run a proof of concept with your own queries and measure cost per outcome.'},
   {bad:'One giant warehouse for everything.', why:'ELT, BI and ad hoc users fight over capacity.', fix:'Isolate workloads and attribute cost per team.'},
   {bad:'Partitioning by a high-cardinality column.', why:'Creates many tiny partitions and slow metadata.', fix:'Partition by date; cluster on the high-cardinality columns.'},
   {bad:'Materializing everything as tables.', why:'Storage and refresh cost for models nobody queries.', fix:'Views by default; materialize on measured demand.'},
   {bad:'Ignoring small files in a lakehouse.', why:'Slow reads and heavy metadata overhead.', fix:'Schedule compaction and file-size tuning.'},
   {bad:'Moving to open formats “for freedom” with no plan.', why:'Catalogs, maintenance and permissions still need an owner.', fix:'Decide who runs compaction, catalogs and access control first.'}
  ], n:'The common thread is deciding by hype or by default instead of by measured workload. Ask for numbers every time.' },

 { k:'cards', cols:3, t:'What senior looks like: platform choices',
   cards:[
    {h:'Decisions', tag:'senior', list:['Warehouse, lakehouse or both','Which open table format, if any','How workloads are isolated and priced']},
    {h:'Trade-offs', tag:'senior', list:['Managed simplicity versus control','Lock-in versus operational burden','Performance tuning effort versus raw compute spend']},
    {h:'Responsibilities', tag:'senior', list:['Own the cost model and forecasts','Set guardrails and budgets','Run platform migrations deliberately','Keep documented exit options']}
   ],
   n:'A senior engineer can explain the bill. They can also say what it would take to move off the platform, even if they never do.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['I can explain how my platform bills compute and storage','Large tables are partitioned and clustered on real filters','Workloads are isolated with budgets or monitors','I know the trade-offs of Delta versus Iceberg','I can read the query profile to find the expensive step','I have compared platforms using my own workload']},
   right:{h:'Interview-style questions', items:['Warehouse or lakehouse for a 50-person company? What changes at 5,000?','Why can partitioning make queries slower?','How would you cut a warehouse bill by 30% without hurting users?','What does an open table format give you that Parquet files alone do not?','How do you decide whether to materialize a model?']},
   n:'The first question is a good conversation starter: the answer should change with team size, skills and workload, not with brand preference.' }
]);

/* ===================== 4. TRANSFORMATION ===================== */
SEC(4, [
 { k:'cards', cols:3, t:'Transformation: turning raw data into trusted models',
   lead:'This is where analytics engineering lives: SQL in version control, tested, documented and deployed like software.',
   cards:[
    {h:'Layered models', tag:'must', p:'Staging cleans and renames, intermediate combines, marts serve business entities.'},
    {h:'Tests and docs', tag:'must', p:'Assertions about the data and descriptions live next to the code.'},
    {h:'Incremental processing', tag:'must', p:'Only process new or changed rows so large models stay cheap and fast.'},
    {h:'Snapshots', tag:'nice', p:'Capture how mutable source rows change over time (type 2 history).'},
    {h:'Contracts and versions', tag:'senior', p:'Enforce column names and types on public models, and version breaking changes.'},
    {h:'Slim CI', tag:'senior', p:'Build and test only what a pull request changed, compared with production state.'}
   ],
   n:'The shift from “SQL scripts” to “software engineering for SQL” is the story of this layer: modularity, review, tests, environments and deployments.' },

 { k:'table', t:'Tool landscape: transformation frameworks', head:TH, rows:[
   ['dbt (Core and Cloud)','SQL transformation framework','SQL-centric analytics engineering teams','Large ecosystem; tests, docs, lineage; packages; wide adapter support','Python models are limited; DAG-level state handling is basic','Core is open source; Cloud is seat- and plan-based'],
   ['SQLMesh','SQL transformation framework','Teams wanting virtual environments and state-aware planning','Plans show impact before applying; cheaper dev environments','Smaller ecosystem and community than dbt','Open source, with a commercial offering'],
   ['Dataform','SQL workflow tool in BigQuery','BigQuery-only teams that want a native tool','Native to Google Cloud; SQLX with assertions','Tied to BigQuery; smaller ecosystem','No separate fee; you pay for BigQuery and related usage'],
   ['Apache Spark','Distributed processing engine','Very large data, complex or non-SQL logic, ML pipelines','Scales out; SQL, Python, Scala; streaming','Cluster tuning; heavier operations; harder to review','Open source engine; pay for compute'],
   ['Stored procedures / raw SQL','Imperative SQL in the warehouse','Legacy or very simple pipelines','No extra tooling','Hard to test, review and lineage-track','Included in warehouse']
  ], cap:'dbt is the common default for SQL transformation; evaluate alternatives when you need virtual environments, a native BigQuery tool or large-scale non-SQL logic. Check current dbt engine and licensing announcements before deciding.',
   n:'Do not turn this into a tool war. State the default (dbt), then name the conditions under which each alternative wins.' },

 { k:'code', t:'Deep dive: a dbt model, its tests and a source',
   lead:'A staging model, the YAML that describes and tests it, and the macro that keeps repeated logic in one place.',
   blocks:[
    {lang:'sql', title:'models/staging/shop/stg_shop__orders.sql', code:`
with source as (
    select * from {{ source('shop', 'orders') }}
),

renamed as (
    select
        id                                   as order_id,
        customer_id,
        lower(status)                        as order_status,
        {{ cents_to_dollars('amount_cents') }} as order_amount,
        created_at::timestamp                as ordered_at,
        updated_at::timestamp                as updated_at
    from source
)

select * from renamed`},
    {lang:'yaml', title:'models/staging/shop/_shop__models.yml', code:`
version: 2

sources:
  - name: shop
    database: raw
    schema: raw_shop
    tables:
      - name: orders
        loaded_at_field: _loaded_at
        freshness:
          warn_after: {count: 12, period: hour}
          error_after: {count: 24, period: hour}

models:
  - name: stg_shop__orders
    description: "One row per order, cleaned and renamed from the shop source."
    columns:
      - name: order_id
        description: "Primary key."
        data_tests:
          - unique
          - not_null
      - name: customer_id
        data_tests:
          - not_null
          - relationships:
              to: ref('stg_shop__customers')
              field: customer_id
      - name: order_status
        data_tests:
          - accepted_values:
              values: ['placed', 'shipped', 'returned', 'cancelled']`},
    {lang:'sql', title:'macros/cents_to_dollars.sql', code:`
{% macro cents_to_dollars(column_name, scale=2) %}
    round({{ column_name }} / 100.0, {{ scale }})
{% endmacro %}`}
   ],
   n:'Three files, one workflow: the model renames and casts, the YAML declares freshness, tests and descriptions, the macro removes duplicated arithmetic. Note the key naming: data_tests is the current key in recent dbt versions; older versions use tests. Check your version.' },

 { k:'code', t:'Deep dive: incremental models, snapshots and contracts',
   lead:'Three features that move a project from “works on my laptop” to “works at scale”.',
   blocks:[
    {lang:'sql', title:'models/marts/fct_orders.sql (incremental)', code:`
{{
    config(
        materialized='incremental',
        unique_key='order_id',
        incremental_strategy='merge',
        on_schema_change='append_new_columns'
    )
}}

select
    order_id,
    customer_id,
    order_status,
    order_amount,
    ordered_at,
    updated_at
from {{ ref('stg_shop__orders') }}

{% if is_incremental() %}
where updated_at > (select max(updated_at) from {{ this }})
{% endif %}`},
    {lang:'yaml', title:'snapshots/customers_snapshot.yml and a contract', code:`
snapshots:
  - name: customers_snapshot
    relation: source('shop', 'customers')
    config:
      schema: snapshots
      unique_key: customer_id
      strategy: timestamp
      updated_at: updated_at

models:
  - name: fct_orders
    config:
      contract:
        enforced: true
    columns:
      - name: order_id
        data_type: bigint
        constraints:
          - type: not_null
          - type: primary_key
      - name: order_amount
        data_type: numeric(18, 2)`}
   ],
   points:[
    {h:'Choose the strategy', p:'`merge` and `delete+insert` handle updates; `append` is for immutable events; `insert_overwrite` replaces partitions. Newer dbt versions also offer a microbatch strategy.'},
    {h:'Incremental needs a safety net', p:'Run periodic full refreshes or reconcile counts. Late data and logic changes make drift likely.'},
    {h:'Contracts protect consumers', tag:'senior', p:'An enforced contract fails the build if names or types change, so downstream users are not surprised.'},
    {h:'Slim CI', tag:'senior', p:'`dbt build --select state:modified+ --defer --state prod-artifacts` runs only what a PR affects.'}
   ],
   n:'Incremental logic is where most subtle bugs live: the where-clause assumes updated_at is reliable. The snapshot YAML uses the newer YAML-based syntax; older projects define snapshots in SQL blocks. Contracts and Slim CI are what make dbt safe for many contributors.' },

 { k:'cards', cols:3, t:'Design patterns and best practices',
   cards:[
    {h:'Staging, intermediate, marts', p:'One staging model per source table; business logic after, never before. Keeps lineage readable.'},
    {h:'`ref` and `source` only', p:'Never hard-code table names. It keeps lineage, environments and state selection working.'},
    {h:'Test at the right level', p:'Primary keys and relationships everywhere; business rules where they have caught real bugs.'},
    {h:'Unit-test tricky logic', p:'Use dbt unit tests on small mocked inputs for complex case statements and window logic.'},
    {h:'Modular macros and packages', p:'Share logic through macros and vetted packages, and pin package versions.'},
    {h:'Environments per developer', p:'Each branch builds into its own schema, defers to production for unchanged models.'}
   ],
   n:'Most of these patterns exist to keep the DAG understandable and to catch problems in a pull request instead of in a dashboard.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Business logic in staging models.', why:'Mixes cleaning with meaning; hard to reuse.', fix:'Keep staging mechanical; put logic in intermediate and marts.'},
   {bad:'Everything is a table.', why:'Slow, costly builds for little value.', fix:'Views for light models, incremental for big ones, tables for heavy reuse.'},
   {bad:'Incremental models with no full-refresh plan.', why:'Silent drift after logic changes or late data.', fix:'Schedule reconciliation and document when to full-refresh.'},
   {bad:'Tests only on primary keys.', why:'Misses referential and business-rule failures.', fix:'Add relationships, accepted values and a few high-value rules.'},
   {bad:'Giant models with 800 lines of SQL.', why:'Impossible to test or review.', fix:'Split into named CTEs, then into models.'},
   {bad:'Unpinned packages and no CI.', why:'Upgrades and merges break production.', fix:'Pin versions; run build and tests on every pull request.'}
  ], n:'These pitfalls all trace to missing feedback loops. CI plus tests turn most of them into failed pull requests.' },

 { k:'cards', cols:3, t:'What senior looks like: transformation',
   cards:[
    {h:'Decisions', tag:'senior', list:['Project structure and naming conventions','Materialization strategy per model','Which models are public, with contracts and versions']},
    {h:'Trade-offs', tag:'senior', list:['Freshness versus build cost','Strict contracts versus development speed','Framework features versus tool lock-in']},
    {h:'Responsibilities', tag:'senior', list:['Own CI and deployment of the project','Keep build time and cost under control','Review for grain, tests and documentation','Manage deprecations of public models']}
   ],
   n:'A senior owns the project’s health: build time, test coverage, naming, and the process for changing models other teams rely on.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Models follow a layered structure','Primary keys have unique and not-null tests','Large models are incremental, with a reconciliation plan','Public models have contracts and descriptions','CI runs only what changed (Slim CI)','Packages are pinned']},
   right:{h:'Interview-style questions', items:['How does an incremental model handle late-arriving data?','When would you use a snapshot instead of an incremental model?','What does an enforced contract protect against?','How would you reduce a 3-hour dbt run to 30 minutes?','When would you choose Spark over dbt?']},
   n:'Look for answers that discuss failure modes: late data, schema change, cost. A pure feature list is a mid-level answer.' }
]);
