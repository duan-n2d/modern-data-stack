"use strict";

/* ===================== 9. GOVERNANCE AND CATALOG ===================== */
SEC(9, [
 { k:'cards', cols:3, t:'Governance and catalog: who can use what, and what it means',
   lead:'Governance is not paperwork. It is making data findable, understandable, safe and accountable, with as little friction as possible.',
   cards:[
    {h:'Catalog and discovery', tag:'must', p:'A searchable inventory of datasets, owners, descriptions and usage.'},
    {h:'Lineage', tag:'must', p:'Where data came from and what depends on it. Essential for impact analysis and debugging.'},
    {h:'Access control', tag:'must', p:'Role-based access, least privilege, plus column masking and row-level security for sensitive data.'},
    {h:'Data contracts', tag:'senior', p:'An explicit agreement between producer and consumer about schema, quality and change policy.'},
    {h:'PII handling', tag:'must', p:'Classify, minimize, mask and retain data deliberately, with an audit trail.'},
    {h:'Compliance basics', tag:'senior', p:'Know the rules that apply to your data (privacy, financial, health) and how the stack evidences them.'}
   ],
   n:'Position governance as an enabler. Without a catalog and lineage, nobody finds or trusts data; without access control, nobody dares to share it.' },

 { k:'table', t:'Tool landscape: catalogs, lineage and governance', head:TH, rows:[
   ['DataHub','Open-source metadata platform','Teams wanting a flexible, open catalog with lineage','Active community; extensible; good integrations','Needs engineering effort to deploy and curate','Open source plus managed offering'],
   ['OpenMetadata','Open-source metadata platform','Teams wanting catalog, lineage and quality in one open tool','Unified UI; broad connectors; built-in quality features','Younger than some alternatives; operational effort','Open source plus managed offering'],
   ['Atlan','Commercial active-metadata catalog','Modern data teams wanting collaboration and automation','Strong UX and integrations; embeds in daily tools','Subscription cost','Subscription'],
   ['Collibra','Enterprise data governance','Large regulated enterprises with formal stewardship','Mature workflows, policy and stewardship features','Heavy implementation; high cost','Enterprise license'],
   ['Alation','Enterprise data catalog','Large organizations focused on data search and trust','Mature catalog and behavioural insights','Cost and rollout effort','Enterprise license'],
   ['Unity Catalog','Platform-native governance (Databricks)','Databricks-centered lakehouses','Unified access control, lineage and auditing for lakehouse assets','Best inside Databricks; open-source version has a narrower scope','Part of Databricks platform'],
   ['OpenLineage / Marquez','Lineage standard and reference service','Collecting lineage from many tools in one open format','Vendor-neutral spec; integrations with orchestrators and engines','A standard, not a full catalog; Marquez is a reference backend','Open source']
  ], cap:'Native tools (Unity Catalog, warehouse-native governance) often cover access control, while catalogs cover discovery and stewardship.',
   n:'Separate the concerns: a catalog for discovery and stewardship, lineage for impact, and access control for security. Some tools do all three well enough; most stacks combine a few.' },

 { k:'code', t:'Deep dive: contracts, RBAC, masking and row-level security',
   lead:'The goal is to move rules out of wiki pages and into code that is reviewed and enforced.',
   blocks:[
    {lang:'yaml', title:'contracts/orders.contract.yml (illustrative format)', code:`
contract:
  name: shop.orders
  version: 1.2.0
  owner: team-checkout@example.com
  description: One row per customer order.
  schema:
    - name: order_id
      type: bigint
      required: true
      unique: true
    - name: customer_email
      type: varchar
      pii: true
      classification: confidential
    - name: order_amount
      type: numeric(18,2)
      checks: ["value >= 0"]
  sla:
    freshness: 6h
  change_policy:
    breaking_changes: "30 days notice and a new major version"
    additive_changes: "allowed with a changelog entry"`},
    {lang:'sql', title:'governance.sql (Snowflake syntax)', code:`
-- Least-privilege role for analysts
create role if not exists analyst_marts_read;
grant usage on database analytics to role analyst_marts_read;
grant usage on schema analytics.marts to role analyst_marts_read;
grant select on all tables in schema analytics.marts to role analyst_marts_read;
grant select on future tables in schema analytics.marts to role analyst_marts_read;

-- Column masking for PII
create or replace masking policy governance.pii_email_mask as (val string)
returns string ->
    case
        when current_role() in ('PII_READER', 'DATA_ENGINEER') then val
        else regexp_replace(val, '.+@', '*****@')
    end;

alter table analytics.marts.dim_customers
    modify column email set masking policy governance.pii_email_mask;

-- Row-level security by region
create or replace row access policy governance.region_policy as (region string)
returns boolean ->
    current_role() = 'GLOBAL_ANALYST'
    or exists (
        select 1
        from governance.role_region_map m
        where m.role_name = current_role() and m.region = region
    );

alter table analytics.marts.fct_orders
    add row access policy governance.region_policy on (region);`}
   ],
   points:[
    {h:'Contract, not wishful thinking', p:'The contract names the owner, the schema, the SLA and the change policy. Producers can be held to it in CI.'},
    {h:'Roles, not people', p:'Grant privileges to roles and assign roles to people or groups. Audit roles, not individuals.'},
    {h:'Mask at the source', tag:'senior', p:'Policies attached to columns apply in every tool, so you do not rely on each dashboard to hide data.'},
    {h:'Adapt to your platform', p:'Every warehouse has its own policy syntax and limits. The pattern carries over; the SQL does not.'}
   ],
   n:'The contract format here is illustrative; real standards exist, such as the Open Data Contract Standard, and dbt model contracts cover schema enforcement. The SQL is Snowflake syntax; equivalents exist in BigQuery (policy tags, row access policies), Databricks (Unity Catalog) and others.' },

 { k:'cards', cols:3, t:'Design patterns and best practices',
   cards:[
    {h:'Classify at ingestion', p:'Tag PII and sensitive columns as soon as data lands, so downstream models inherit the tags.'},
    {h:'Contracts at team boundaries', p:'Put contracts where one team’s output is another team’s input: source databases and public marts.'},
    {h:'Automated lineage', p:'Collect lineage from the orchestrator, transformation and BI tools. Manual lineage rots.'},
    {h:'Owners and descriptions', p:'No public dataset without an owner and a description. Make it a CI check.'},
    {h:'Access by role and purpose', p:'Roles map to jobs. Time-bound elevated access, with audit logs.'},
    {h:'Minimize and expire', p:'Keep only the data and fields you need, for as long as you need them. Retention policies are code.'}
   ],
   n:'Governance programs fail when they depend on people filling in forms. These patterns automate the boring parts and enforce them in CI.' },

 { k:'cards', cols:3, t:'Compliance basics every analytics engineer should know',
   lead:'This is orientation, not legal advice. Work with your legal and security teams for specifics.',
   cards:[
    {h:'Know your data classes', tag:'must', p:'Personal data, financial data, health data and credentials each have different rules.'},
    {h:'Data subject requests', tag:'must', p:'Privacy laws such as GDPR and CCPA can require access and deletion. Plan how you find and delete a person across the stack, including backups.'},
    {h:'Purpose and minimization', tag:'must', p:'Collect and use data for a stated purpose, and avoid copying sensitive fields into new places.'},
    {h:'Auditability', tag:'senior', p:'Be able to show who accessed what, and when. Query history and access logs are evidence.'},
    {h:'Pseudonymization', tag:'senior', p:'Hashing or tokenizing identifiers reduces exposure, though it does not always make data anonymous.'},
    {h:'Region and residency', tag:'senior', p:'Some data must stay in a region. Choose warehouse regions and replication deliberately.'}
   ],
   n:'The point is awareness: engineers decide where data is copied and who can see it, which are exactly the things regulators ask about. Encourage involving legal early.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'A catalog nobody curates.', why:'It fills with stale, undocumented assets.', fix:'Owners, certification and automated sync from your tools.'},
   {bad:'Granting access to individuals.', why:'Impossible to audit and revoke.', fix:'Role-based access via groups.'},
   {bad:'Copying PII into every sandbox.', why:'Larger attack surface and compliance exposure.', fix:'Masked or synthetic data for development.'},
   {bad:'Governance as a gate at the end.', why:'Teams route around it.', fix:'Embed policies in CI and defaults.'},
   {bad:'Manual lineage diagrams.', why:'Out of date within weeks.', fix:'Collect lineage automatically (for example with OpenLineage).'},
   {bad:'No deletion path.', why:'Cannot honour deletion requests.', fix:'Design for keyed deletion and retention from the start.'}
  ], n:'Every pitfall here comes from governance being separate from the engineering workflow. Embed it and it mostly takes care of itself.' },

 { k:'cards', cols:3, t:'What senior looks like: governance',
   cards:[
    {h:'Decisions', tag:'senior', list:['Which data is sensitive, and how it is protected','Where contracts are required','Catalog: build, adopt open source or buy']},
    {h:'Trade-offs', tag:'senior', list:['Safety versus speed of access','Central control versus domain ownership','Tool breadth versus adoption']},
    {h:'Responsibilities', tag:'senior', list:['Partner with security and legal','Make secure defaults the easy path','Keep audit evidence available','Run access reviews on a schedule']}
   ],
   n:'Seniors make the secure path the easy path. If governance slows people down, they will bypass it.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Every public dataset has an owner and description','PII columns are classified and masked by policy','Access is granted to roles, not individuals','Lineage is collected automatically','Contracts exist at key team boundaries','I know how a deletion request would work']},
   right:{h:'Interview-style questions', items:['How would you protect email addresses in a warehouse shared by 200 analysts?','What is a data contract and when is it worth the effort?','How do you handle a right-to-erasure request?','Catalog: build, open source or buy?','How do you give developers realistic data without exposing PII?']},
   n:'Strong answers combine masking, role design and process, and acknowledge that backups and copies need handling.' }
]);

/* ===================== 10. REVERSE ETL AND ACTIVATION ===================== */
SEC(10, [
 { k:'cards', cols:3, t:'Reverse ETL and activation: putting warehouse data to work',
   lead:'Reverse ETL syncs modeled warehouse data back into the tools where people act: CRM, ads, support and marketing platforms.',
   cards:[
    {h:'Sales and CRM', tag:'must', p:'Push product usage and health scores into the CRM so account teams see them where they work.'},
    {h:'Marketing audiences', tag:'must', p:'Sync segments to email and ad platforms from one governed definition.'},
    {h:'Support and success', tag:'nice', p:'Surface customer value and recent issues in the support tool.'},
    {h:'Product personalization', tag:'nice', p:'Feed traits to in-app messaging and experimentation tools.'},
    {h:'Event collection (CDP)', tag:'nice', p:'Segment and RudderStack collect events from apps and route them to many destinations.'},
    {h:'Why warehouse-first', tag:'senior', p:'One tested source of truth feeding every tool, rather than each tool computing its own version.'}
   ],
   n:'Activation closes the loop: analytics stops being a report and becomes an operational input. It also raises the stakes, because a bad sync can email the wrong customers.' },

 { k:'table', t:'Tool landscape: reverse ETL and customer data platforms', head:TH, rows:[
   ['Hightouch','Reverse ETL / composable CDP','Warehouse-first activation with audience building','Many destinations; audience and sync tooling; observability','Cost scales with usage; another system to govern','Subscription (plan and usage based)'],
   ['Census','Reverse ETL','Syncing modeled data to operational tools','Mature syncs; dbt-friendly modeling; good diffing','Overlap with other tools; cost at scale','Subscription (plan and usage based)'],
   ['RudderStack','Customer data pipeline (event collection and reverse ETL)','Warehouse-centric event collection plus routing','Open-source roots; warehouse-first; event routing','Self-hosted option adds operations; fewer packaged audience features','Open source plus managed plans'],
   ['Segment','Customer data platform','Event collection and routing to many tools','Large integration catalog; mature SDKs','Costs rise with volume; less warehouse-first by default','Subscription (volume based)']
  ], cap:'Alternative: a small custom job. Reasonable for one or two destinations; poor value as destinations and rules multiply.',
   n:'Two categories again: reverse ETL tools read from the warehouse; CDPs collect events from products. Many teams use one of each, with the warehouse as the shared source.' },

 { k:'code', t:'Deep dive: an activation model and a resilient sync',
   lead:'The model decides who and what to sync. The sync code handles retries and idempotency.',
   blocks:[
    {lang:'sql', title:'models/activation/act_customer_health.sql', code:`
select
    c.customer_id,
    c.email,
    c.lifetime_value,
    case when c.days_since_last_order > 90 then 'at_risk' else 'active' end as lifecycle_stage,
    c.updated_at
from {{ ref('dim_customers') }} c
where c.email is not null
  and c.marketing_opt_in = true     -- consent is part of the model, not an afterthought`},
    {lang:'python', title:'sync_contacts.py (custom sync, for illustration)', code:`
import time

import requests

API = "https://api.crm.example.com/v1/contacts"
RETRYABLE = {429, 500, 502, 503, 504}


def upsert_contact(row: dict, token: str, max_attempts: int = 5) -> None:
    for attempt in range(1, max_attempts + 1):
        resp = requests.put(
            f"{API}/{row['customer_id']}",  # idempotent: keyed by external id
            json={"email": row["email"], "lifecycle_stage": row["lifecycle_stage"]},
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        if resp.status_code < 300:
            return
        if resp.status_code not in RETRYABLE or attempt == max_attempts:
            raise RuntimeError(
                f"CRM rejected {row['customer_id']}: {resp.status_code} {resp.text[:200]}"
            )
        time.sleep(float(resp.headers.get("Retry-After", 2 ** attempt)))`}
   ],
   points:[
    {h:'Consent in the model', p:'Filter on opt-in and region in SQL so no sync can bypass it.'},
    {h:'Sync only changes', p:'Compare to the last synced snapshot (or a row hash) to avoid re-sending everything and hitting API limits.'},
    {h:'Idempotent upserts', p:'Keying writes by an external id means retries are safe.'},
    {h:'Respect rate limits', tag:'senior', p:'Back off on 429s and honour `Retry-After` when the API provides it.'}
   ],
   n:'The first file is about governance: consent filtering lives in the model. The second shows the mechanics a reverse ETL tool hides for you: retries with backoff and idempotent writes. Know them even if you buy the tool.' },

 { k:'cards', cols:3, t:'Design patterns: sync modes and failure handling',
   cards:[
    {h:'Upsert', p:'Create or update by key. The default for most contact and account objects.'},
    {h:'Mirror', p:'Make the destination match the model exactly, including removals. Powerful, and dangerous without safeguards.'},
    {h:'Insert-only and update-only', p:'Use when the destination owns some records, or for append-only event data.'},
    {h:'Diff-based syncs', p:'Send only added, changed and removed rows. Cheaper, faster and kinder to API limits.'},
    {h:'Dead-letter and retry queues', p:'Failed rows go to a queue with the reason, instead of failing the whole sync.'},
    {h:'Kill switch and thresholds', p:'Abort when a sync would delete or change an unusual share of records.'}
   ],
   n:'Reverse ETL failures hit real customers, so thresholds and kill switches matter more than in analytics pipelines. A mirror sync with an empty model will delete everything.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Syncing from untested models.', why:'Bad data reaches customers, not just dashboards.', fix:'Tests and contracts on every activation model.'},
   {bad:'Mirror sync with no safeguards.', why:'An empty table can delete the destination.', fix:'Row-count and change-rate thresholds.'},
   {bad:'Ignoring consent and region rules.', why:'Compliance and trust risk.', fix:'Encode consent in the model.'},
   {bad:'Full resyncs every run.', why:'Hits API limits and cost.', fix:'Diff-based syncs.'},
   {bad:'Business logic in the sync tool.', why:'Hidden, untested logic.', fix:'Keep logic in dbt models; the tool just transports.'},
   {bad:'No monitoring of destination health.', why:'Failures go unnoticed for days.', fix:'Alert on failed rows, sync latency and volume change.'}
  ], n:'The safest rule: the activation tool transports data, it does not decide anything.' },

 { k:'cards', cols:3, t:'What senior looks like: activation',
   cards:[
    {h:'Decisions', tag:'senior', list:['Buy a reverse ETL tool or build','Which objects the warehouse owns versus the destination','Which syncs are allowed to delete']},
    {h:'Trade-offs', tag:'senior', list:['Speed to value versus another vendor to govern','Freshness versus API limits','Central activation versus team-owned syncs']},
    {h:'Responsibilities', tag:'senior', list:['Treat activation models as products with tests','Own failure handling and alerts','Coordinate with marketing and sales operations','Review privacy implications']}
   ],
   n:'A senior engineer treats an outbound sync like a production API: it has contracts, tests, limits and an owner.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Activation models are tested and have contracts','Consent filters live in the model','Syncs are diff-based and idempotent','Destructive syncs have thresholds and alerts','Failures go to a queue with reasons','Owners exist on both the data and the destination side']},
   right:{h:'Interview-style questions', items:['Design a sync of churn-risk scores into a CRM.','How do you prevent a bad model from wiping a destination?','Buy a reverse ETL tool or build one? What changes your answer?','How do you handle API rate limits?','Who should own the activation model: data or marketing?']},
   n:'Listen for safeguards (thresholds, dry runs) in answers to the second question.' }
]);

/* ===================== 11. DEVOPS AND ENGINEERING PRACTICES ===================== */
SEC(11, [
 { k:'cards', cols:3, t:'DevOps and engineering practices: treat data work like software',
   lead:'Version control, review, automated tests and reproducible environments are what let a team scale beyond one person.',
   cards:[
    {h:'Git workflow', tag:'must', p:'Short-lived branches, pull requests, code review and a protected main branch.'},
    {h:'CI/CD', tag:'must', p:'Lint, test and build on every pull request; deploy from main by automation.'},
    {h:'Infrastructure as code', tag:'must', p:'Warehouses, roles, buckets and networks defined in Terraform or Pulumi, reviewed like code.'},
    {h:'Containers', tag:'must', p:'Docker for reproducible environments. Kubernetes only when you need to run long-lived services.'},
    {h:'Cloud fundamentals', tag:'senior', p:'IAM, networking and cost control on AWS, GCP or Azure.'},
    {h:'Local quality gates', tag:'nice', p:'pre-commit hooks and SQLFluff give fast feedback before a push.'}
   ],
   n:'This layer is where analytics engineering inherits decades of software practice. The senior contribution is picking the minimum process that gives safety without slowing people down.' },

 { k:'table', t:'Tool landscape: engineering practices', head:TH, rows:[
   ['Git (GitHub Flow or trunk-based)','Version-control practice','Every project','Review, history, rollback','Long-lived branches and big PRs hurt','Git is free; hosting is plan-based'],
   ['GitHub Actions / GitLab CI','CI/CD','Automated tests and deploys next to the code','Tight pull-request integration; large action ecosystem','Vendor-specific YAML; secrets and minutes need care','Free tiers plus usage-based minutes'],
   ['Terraform / OpenTofu / Pulumi','Infrastructure as code','Reproducible warehouses, roles, storage and networks','Declarative, reviewable; Pulumi uses general-purpose languages','State management; drift; learning curve','Terraform is source-available; OpenTofu is open source; Pulumi has open source plus paid cloud'],
   ['Docker','Containers','Same environment locally, in CI and in production','Reproducible; portable','Image hygiene, build times and secrets handling','Open-source engine; desktop tooling has paid tiers for larger organizations'],
   ['Kubernetes (basics)','Container orchestration','Long-lived services such as orchestrators and apps','Scalable and portable','High operational complexity; often unnecessary for small teams','Open source; managed control planes billed by the cloud'],
   ['AWS / GCP / Azure','Cloud platforms','All underlying infrastructure','Managed services; IAM; global reach','Cost sprawl and complexity','Pay as you go'],
   ['pre-commit + SQLFluff','Local quality gates','Style and basic checks before commit','Fast feedback; consistent style','Template-aware linting with dbt can be slow; rules need tuning','Open source']
  ], cap:'Prefer managed services over running Kubernetes yourself, until a concrete need says otherwise.',
   n:'Most of these are not data-specific, which is the point. Borrow mature software practice instead of inventing data-only versions.' },

 { k:'code', t:'Deep dive: a CI pipeline for a dbt project',
   lead:'Lint, build only what changed (Slim CI), run in an isolated schema, and clean up after.',
   blocks:[
    {lang:'yaml', title:'.github/workflows/dbt-ci.yml', code:`
name: dbt-ci

on:
  pull_request:
    paths:
      - "dbt/**"
      - ".github/workflows/dbt-ci.yml"

concurrency:
  group: dbt-ci-\${{ github.head_ref }}
  cancel-in-progress: true

permissions:
  contents: read
  id-token: write   # for OIDC to AWS

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      DBT_PROFILES_DIR: ./dbt
      DBT_SCHEMA: ci_pr_\${{ github.event.number }}
      SNOWFLAKE_ACCOUNT: \${{ secrets.SNOWFLAKE_ACCOUNT }}
      SNOWFLAKE_USER: \${{ secrets.SNOWFLAKE_CI_USER }}
      SNOWFLAKE_PASSWORD: \${{ secrets.SNOWFLAKE_CI_PASSWORD }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Lint SQL
        run: sqlfluff lint dbt/models --dialect snowflake

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_CI_ROLE_ARN }}
          aws-region: ap-southeast-1

      - name: Fetch production manifest
        run: aws s3 cp s3://example-dbt-artifacts/prod/manifest.json ./prod-artifacts/manifest.json

      - name: Install dbt packages
        run: dbt deps --project-dir dbt

      - name: Build modified models and their children
        run: >
          dbt build --project-dir dbt
          --select state:modified+
          --defer --state ./prod-artifacts

      - name: Drop CI schema
        if: always()
        run: dbt run-operation drop_ci_schema --project-dir dbt`}
   ],
   points:[
    {h:'Isolated schema per PR', p:'Each pull request builds into its own schema, so reviewers can inspect results and runs never collide.'},
    {h:'Slim CI', tag:'senior', p:'`state:modified+` with `--defer` builds only changed models and their children, reading unchanged parents from production.'},
    {h:'No long-lived keys', tag:'senior', p:'OIDC lets the workflow assume a cloud role without stored cloud credentials. Warehouse credentials should be scoped to a CI role.'},
    {h:'Cleanup always runs', p:'`if: always()` drops the schema even when the build fails. `drop_ci_schema` is a macro in your project.'}
   ],
   n:'Walk through in order: trigger and concurrency, permissions, lint, fetch production state, Slim CI build, cleanup. The secret names and bucket are placeholders. The same structure works in GitLab CI.' },

 { k:'code', t:'Deep dive: infrastructure as code and local quality gates',
   lead:'Define the platform in code, and catch style problems before they reach review.',
   blocks:[
    {lang:'hcl', title:'main.tf (GCP example)', code:`
terraform {
  required_version = ">= 1.6"
  required_providers {
    google = { source = "hashicorp/google", version = "~> 6.0" }
  }
}

variable "project_id" { type = string }

provider "google" {
  project = var.project_id
  region  = "asia-southeast1"
}

resource "google_bigquery_dataset" "marts" {
  dataset_id                 = "marts"
  location                   = "asia-southeast1"
  delete_contents_on_destroy = false
  labels = {
    env   = "prod"
    owner = "analytics-eng"
  }
}

resource "google_service_account" "dbt_runner" {
  account_id   = "dbt-runner"
  display_name = "dbt production runner"
}

resource "google_bigquery_dataset_iam_member" "dbt_editor" {
  dataset_id = google_bigquery_dataset.marts.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:\${google_service_account.dbt_runner.email}"
}`},
    {lang:'yaml', title:'.pre-commit-config.yaml', code:`
repos:
  - repo: https://github.com/sqlfluff/sqlfluff
    rev: 3.2.5            # pin a release you have tested
    hooks:
      - id: sqlfluff-lint
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-yaml`},
    {lang:'ini', title:'.sqlfluff', code:`
[sqlfluff]
dialect = snowflake
max_line_length = 120
exclude_rules = ambiguous.column_count

[sqlfluff:rules:capitalisation.keywords]
capitalisation_policy = lower`}
   ],
   points:[
    {h:'Least-privilege IAM', tag:'senior', p:'Grant the runner only the dataset-level role it needs, not project-wide editor.'},
    {h:'Protect data on destroy', p:'`delete_contents_on_destroy = false` turns an accidental destroy into an error.'},
    {h:'Remote state', p:'Use a remote, locked state backend for teams. It is omitted here for brevity.'},
    {h:'Cost control', tag:'senior', p:'Use budgets and alerts, labels for cost attribution, and expiry on scratch resources.'}
   ],
   n:'Infrastructure as code gives you review, history and repeatability for things that used to be console clicks. The pre-commit and SQLFluff files give a fast local loop. Provider and hook versions are examples: pin whatever you have tested.' },

 { k:'cards', cols:3, t:'Design patterns and best practices',
   cards:[
    {h:'Trunk-based, small PRs', p:'Merge small changes often. Large, long-lived branches create merge pain and risky releases.'},
    {h:'Environments', p:'Dev, CI and prod with the same code and different configuration. Developers never write to prod by hand.'},
    {h:'Everything as code', p:'Infrastructure, roles, jobs and dashboards-as-code where possible, so change is reviewable.'},
    {h:'Secrets management', p:'Secrets live in a vault or CI secret store, never in the repository. Prefer short-lived credentials.'},
    {h:'Least privilege IAM', p:'Separate roles for humans, CI and production runners, each with minimum access.'},
    {h:'Cost hygiene', p:'Budgets, alerts, labels, scratch-data expiry and regular review of the top spenders.'}
   ],
   n:'These are the safety rails that let a team move quickly. Cost hygiene belongs here because cloud bills are an engineering output, not just a finance topic.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Editing production in the console.', why:'Changes are untracked and unrepeatable.', fix:'Infrastructure as code and reviewed pull requests.'},
   {bad:'Secrets in the repo or a shared password.', why:'Leaks and no accountability.', fix:'Secret manager, OIDC and per-purpose accounts.'},
   {bad:'CI that rebuilds the whole project.', why:'Slow feedback and high cost.', fix:'Slim CI with deferral to production state.'},
   {bad:'Kubernetes by default.', why:'High operational cost for small teams.', fix:'Use managed services until a clear need appears.'},
   {bad:'Shared dev environment.', why:'Developers overwrite each other’s work.', fix:'Per-developer or per-PR schemas.'},
   {bad:'No cost visibility.', why:'Surprise bills and no accountability.', fix:'Budgets, labels and team-level cost reports.'}
  ], n:'The most frequent real-world incident in this area is a credential or an unreviewed console change. Both are cheap to prevent.' },

 { k:'cards', cols:3, t:'What senior looks like: engineering practices',
   cards:[
    {h:'Decisions', tag:'senior', list:['Branching and release strategy','Which environments exist and who deploys','Managed service or self-hosted']},
    {h:'Trade-offs', tag:'senior', list:['Process safety versus delivery speed','Standardization versus team autonomy','Build time and cost versus test coverage']},
    {h:'Responsibilities', tag:'senior', list:['Own CI health and deploy reliability','Set IAM and secrets standards','Run cost reviews','Onboard others to the workflow']}
   ],
   n:'Seniors keep the pipeline fast. A slow CI process gets bypassed, and a bypassed process gives no protection.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Main is protected; changes arrive through reviewed PRs','CI lints and builds only what changed','Infrastructure is defined in code','No secrets in the repository','Each developer or PR has an isolated environment','There are budgets and alerts on spend']},
   right:{h:'Interview-style questions', items:['Design CI/CD for a dbt project with 15 contributors.','How would you roll back a bad production deployment?','How do you manage secrets for CI and production?','When is Kubernetes justified for a data team?','How do you stop a developer from running a $5,000 query?']},
   n:'For the last question, look for guardrails (budgets, query limits, roles) rather than “tell them to be careful”.' }
]);
