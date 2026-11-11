"use strict";

/* ===================== 14. SENIOR SOFT SKILLS ===================== */
SEC(14, [
 { k:'cards', cols:3, t:'Senior-level soft skills: multiplying your impact',
   lead:'Beyond a point, technical depth is table stakes. What separates senior engineers is judgment, communication and the ability to make a team better.',
   cards:[
    {h:'Stakeholder management', tag:'must', p:'Understand the decision behind the request, set expectations, and say no with alternatives.'},
    {h:'Metric definition and alignment', tag:'senior', p:'Get finance, product and sales to agree on one definition, and record who owns it.'},
    {h:'Build versus buy', tag:'senior', p:'Evaluate total cost, differentiation, skills, lock-in and exit, not just license price.'},
    {h:'Cost and performance', tag:'senior', p:'Measure, fix the biggest costs first, and put guardrails in place.'},
    {h:'Mentoring and documentation', tag:'must', p:'Teach through review and pairing. Write docs that people actually use.'},
    {h:'Decisions and prioritization', tag:'senior', p:'Write down decisions (ADRs) and prioritize by impact, effort and risk.'}
   ],
   n:'This is the layer people skip because it has no tool names, and it is the one that most determines promotion. Every item here can be practised on your current job.' },

 { k:'table', t:'Frameworks that make judgment visible', head:['Framework','Type','Best for','Strengths','Limitations','Effort'], rows:[
   ['Architecture Decision Record (ADR)','Decision log','Recording significant technical decisions','Preserves context; reviewable; lightweight','Becomes bureaucracy if used for trivial choices','Low (an hour or less each)'],
   ['RACI / DACI','Responsibility matrix','Clarifying who decides and who is consulted','Removes ambiguity about ownership','Ignored unless leaders enforce it','Low'],
   ['RICE or impact-effort scoring','Prioritization','Ranking a backlog of requests','Makes assumptions explicit','Scores are estimates and can be gamed','Low to moderate'],
   ['Build-versus-buy scorecard','Decision framework','Tool and platform selection','Makes criteria comparable','Weights are subjective','Moderate'],
   ['Metric tree','Metric alignment','Linking top-level KPIs to their drivers','Shows relationships and exposes conflicting definitions','Needs cross-team input','Moderate'],
   ['Blameless postmortem','Learning process','Learning from incidents','Turns failures into improvements','Needs psychological safety','Low per incident'],
   ['Docs-as-code and runbooks','Documentation','Onboarding and incident response','Versioned with the code; searchable','Rots without owners and review','Ongoing']
  ], cap:'Frameworks are scaffolding for conversation. Use the lightest one that gets the decision made.',
   n:'The common thread: each framework makes a hidden thing visible, whether that is the decision, the owner, the assumption or the trade-off.' },

 { k:'code', t:'Deep dive: an architecture decision record template',
   lead:'One page, written before or during the decision, stored in the repository next to the code it affects.',
   blocks:[
    {lang:'md', title:'docs/adr/0007-adopt-dagster-for-orchestration.md', code:`
# ADR-0007: Adopt Dagster for orchestration

- Status: Proposed | Accepted | Superseded by ADR-00xx
- Date: 2026-11-10
- Deciders: Analytics Engineering, Data Platform
- Consulted: Finance Data, Security
- Informed: All analytics stakeholders

## Context
What problem are we solving? Constraints, scale, team skills, deadlines.

## Decision drivers
- Must support asset lineage and dbt integration
- Team of six with one on-call rotation
- Annual budget ceiling

## Options considered
1. Airflow (managed): familiar to the team, task-based model
2. Dagster: asset-based model, strong dbt integration
3. Keep cron and scripts: no cost, no visibility

## Decision
We will adopt ... because ...

## Consequences
- Positive: ...
- Negative and risks: ...
- Follow-ups: migration plan, training, review date`}
   ],
   points:[
    {h:'Capture the options you rejected', p:'The reasoning for “no” is the most valuable part when someone revisits the decision in a year.'},
    {h:'Write it for the future reader', p:'Assume a new teammate with no context. Short, plain and dated.'},
    {h:'Supersede, never delete', tag:'senior', p:'When a decision changes, add a new ADR and mark the old one superseded. The history is the point.'},
    {h:'Use it for real decisions', p:'Tools, platforms, modeling approaches, major conventions. Not every pull request.'}
   ],
   n:'The example is a plausible ADR for the orchestration choice from section 5. The placeholders in the Decision and Consequences sections are intentional: they are the template fields to fill in. Keep ADRs to one page.' },

 { k:'table', t:'Build versus buy: a decision framework', head:['Criterion','Question to ask','Leans toward buy when','Leans toward build when'], rows:[
   ['Differentiation','Does this give us a competitive advantage?','It is a commodity, like standard SaaS connectors','It encodes unique logic or proprietary data'],
   ['Total cost of ownership','What are license, people, on-call and upgrade costs over three years?','Vendor cost is below the engineering time it saves','Usage-based pricing will far exceed a simple in-house version'],
   ['Time to value','How soon do we need it?','The need is common and urgent','Tight integration will pay off over a long horizon'],
   ['Team skills and capacity','Who maintains it at 3 a.m.?','The team is small or lacks depth in this area','The team has depth and real spare capacity'],
   ['Lock-in and exit','How hard is it to leave?','Standard formats and export paths exist','Vendor formats are proprietary and migration would be painful'],
   ['Security and compliance','Does it meet our requirements?','The vendor holds the certifications you need','Data cannot leave your environment']
  ], cap:'Score each criterion, weight them with stakeholders, and record the outcome in an ADR. Revisit when usage or pricing changes.',
   n:'The honest middle path is often “buy and wrap”: buy the commodity, build the thin layer that keeps you portable. Revisit decisions as pricing and team size change.' },

 { k:'cards', cols:3, t:'Stakeholders and metric alignment',
   lead:'Most data disputes are definition disputes. Facilitate the conversation rather than picking a number.',
   cards:[
    {h:'Ask for the decision, not the dashboard', p:'“What will you do differently if this number goes up?” often changes the request.', tag:'senior'},
    {h:'Set expectations early', p:'Agree on scope, freshness, accuracy and delivery date. Say what you are not doing.', tag:'must'},
    {h:'Say no with options', p:'Offer a smaller version, a later date or a different approach, with the trade-off stated.', tag:'senior'},
    {h:'Collect existing definitions', p:'Find every current version of the metric and where it is used. Show the differences with real examples.', tag:'senior'},
    {h:'Decide with owners', p:'Convene the owners, agree on one definition and a name, and record the decision.', tag:'senior'},
    {h:'Encode, announce, deprecate', p:'Put the definition in the semantic layer, tell users what changed, and retire the old versions.', tag:'senior'}
   ],
   n:'The first three are about requests; the last three form a repeatable process for metric alignment. Emphasize recording the decision so the argument does not restart in six months.' },

 { k:'cards', cols:2, t:'Operating habits: cost, mentoring, documentation, priorities',
   cards:[
    {h:'Cost and performance optimization', tag:'senior', list:['Measure first: rank queries and pipelines by cost','Fix the top few items, not everything','Add guardrails: budgets, timeouts, monitors','Review monthly and report savings in business terms']},
    {h:'Mentoring', tag:'senior', list:['Review code to teach, not just to approve','Pair on hard problems, then step back','Delegate with context and room to fail safely','Give specific, timely feedback']},
    {h:'Documentation', tag:'must', list:['Docs live with the code and have owners','Write for onboarding and incident response first','Prefer examples and runbooks to prose','Delete stale docs']},
    {h:'Prioritization', tag:'senior', list:['Rank by impact, effort and risk with stakeholders','Protect time for reliability and debt','Make trade-offs visible in a shared backlog','Say what is deliberately not being done']}
   ],
   n:'Each habit is small. The compounding effect comes from doing them consistently, in public, so the team copies them.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Being the hero who fixes everything.', why:'Creates a bottleneck and a single point of failure.', fix:'Teach, document and delegate.'},
   {bad:'Saying yes to every request.', why:'Quality and reliability suffer.', fix:'Prioritize openly; offer alternatives.'},
   {bad:'Choosing tools by enthusiasm.', why:'Hidden costs and maintenance burden.', fix:'Scorecard, proof of concept and an ADR.'},
   {bad:'Settling metric disputes by seniority.', why:'Resentment and re-opened arguments.', fix:'Convene owners and record the decision.'},
   {bad:'Documentation as a one-off project.', why:'Rots within months.', fix:'Docs-as-code with owners and review.'},
   {bad:'Optimizing cost without measuring.', why:'Effort goes to the wrong places.', fix:'Rank by actual spend first.'}
  ], n:'The hero pattern is the most common in strong mid-level engineers, and the hardest to see in yourself.' },

 { k:'cards', cols:3, t:'What senior looks like: the whole role',
   cards:[
    {h:'Decisions', tag:'senior', list:['What to build, buy or leave alone','What to prioritize and what to drop','Where the team needs standards']},
    {h:'Trade-offs', tag:'senior', list:['Speed versus reliability','Local optimization versus team health','Perfect versus shipped','Autonomy versus consistency']},
    {h:'Responsibilities', tag:'senior', list:['Make others more effective','Communicate risk and uncertainty clearly','Own outcomes, not just tasks','Leave decisions, docs and systems better than you found them']}
   ],
   n:'Summarize the deck here: across every layer the senior pattern is the same. Own outcomes, make trade-offs explicit, write decisions down, and raise the level of the people around you.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['I write ADRs for significant decisions','I can facilitate a metric-definition alignment','I use a scorecard for build-versus-buy','I know my team’s top cost drivers','I mentor at least one person deliberately','I can say no with an alternative']},
   right:{h:'Interview-style questions', items:['Two executives disagree on the definition of “active user”. What do you do?','A stakeholder demands a real-time dashboard. How do you respond?','Tell me about a technical decision you reversed.','How do you decide whether to build or buy an ingestion tool?','How do you get a junior engineer to own a system?']},
   n:'Good answers are specific: a real situation, the options, the trade-off, the outcome and what was learned.' }
]);

/* ===================== CLOSING ===================== */
function archSVG(cols, bars, label){
  var heads = ['Sources','Ingest','Store','Transform','Serve','Consume'];
  var colors = ['#7A869F','#0891B2','#7C3AED','#EA580C','#DB2777','#B45309'];
  var W = 160, G = 28, Y = 34, H = 150, s = txt(10, 22, 'Data flow, left to right', 'lg');
  for(var i = 0; i < 6; i++){
    var x = 10 + i * (W + G);
    s += bx(x, Y, W, H, heads[i], cols[i], colors[i]);
    if(i < 5) s += arrow(x + W + 2, Y + H / 2, x + W + G - 3, Y + H / 2);
  }
  var by = Y + H + 22;
  s += txt(10, by, 'Cross-cutting', 'lg');
  var bc = ['#16A34A','#DC2626','#0F766E','#475569'];
  bars.forEach(function(b, i){
    var y = by + 12 + i * 46;
    s += '<rect class="bx" x="10" y="' + y + '" width="1080" height="38" rx="8"/><rect x="10" y="' + y + '" width="8" height="38" rx="4" fill="' + bc[i] + '"/>';
    s += txt(30, y + 16, b[0], 'b') + txt(30, y + 31, b[1], 'sm');
  });
  return svg(1100, by + 12 + bars.length * 46 + 4, s, label);
}

CLOSING.push(
 { k:'svg', t:'Reference architecture 1: startup (1 to 3 data people)',
   lead:'Goal: answers this quarter with minimal operations.',
   svg: archSVG(
     ['SaaS apps|Postgres|product events','Airbyte Cloud or|Fivetran, or|small dlt scripts','BigQuery, Snowflake|or MotherDuck','dbt Core|staging and marts|SQLFluff, tests','Metrics in dbt YAML|(Lightdash can|read them)','Metabase or|Lightdash|Streamlit apps'],
     [['Orchestration','GitHub Actions cron or the dbt Cloud scheduler'],['Quality','dbt tests plus freshness checks, alerts to a Slack channel'],['Governance','Roles by schema, README per mart, owners in YAML, no PII in raw sandboxes'],['DevOps','One repository, pull-request review, Slim CI, Terraform for warehouse basics']],
     'Startup stack: managed ingestion, one warehouse, dbt, a simple BI tool'),
   cap:'Defer streaming, a catalog and a separate semantic layer until a measured need appears. Spend on reliability basics first.',
   n:'The startup stack is deliberately boring: fewer moving parts than you think you need. The skills that matter are SQL, dbt discipline and cost awareness.' },

 { k:'svg', t:'Reference architecture 2: mid-size company (10 to 40 data people)',
   lead:'Goal: reliable, governed self-service across several teams.',
   svg: archSVG(
     ['SaaS apps|Operational DBs|Product events','Fivetran or Airbyte|Debezium CDC for|core databases','Snowflake, BigQuery|or Databricks|Open table formats|where shared','dbt with contracts|Slim CI, unit tests|shared packages','dbt Semantic Layer|or Cube for|certified metrics','Looker, Power BI|or Tableau|Hightouch or Census|ML notebooks'],
     [['Orchestration','Dagster or managed Airflow; asset checks and freshness SLAs on key tables'],['Quality','dbt tests plus an observability tool (Elementary or a commercial platform); data diff in CI'],['Governance','DataHub, OpenMetadata or Atlan; masking policies; role-based access through groups'],['DevOps','Terraform, OIDC for CI, per-PR schemas, budgets and team-level cost attribution']],
     'Mid-size stack with orchestrator, semantic layer, observability and catalog'),
   cap:'New concerns appear at this size: ownership, contracts between teams, cost attribution and incident response.',
   n:'This is the stage where seniors matter most: you add process and tools only when coordination costs justify them. The mid-size stack adds a semantic layer, observability and a catalog.' },

 { k:'svg', t:'Reference architecture 3: enterprise (many domains)',
   lead:'Goal: scale ownership, security and compliance without a central bottleneck.',
   svg: archSVG(
     ['Hundreds of sources|ERP, SaaS, IoT|Multiple clouds','Kafka and Debezium|Managed ELT for SaaS|Landing zones|per domain','Lakehouse (Iceberg|or Delta) plus|warehouses|Domain-owned zones','Domain dbt projects|Shared conventions|Spark for heavy jobs','Enterprise semantic|layer (AtScale, Cube|or platform native)','Power BI, Tableau|Embedded analytics|Reverse ETL|Guarded AI assistants'],
     [['Orchestration','Airflow, Composer or Dagster operated by a platform team; isolation between domains'],['Quality','Observability platform; SLAs per data product; formal incident process'],['Governance','Collibra, Alation or Unity Catalog; OpenLineage; contracts, audit trails, residency rules'],['DevOps','Terraform and Kubernetes; FinOps; security reviews; ADRs for platform choices']],
     'Enterprise stack with domain ownership, platform team and automated governance'),
   cap:'The platform team provides paved roads; domains build data products on them. Governance is automated, not manual.',
   n:'At enterprise scale the hard problems are organizational. The architecture is mostly the same building blocks as mid-size, with stronger isolation, governance and platform ownership.' },

 { k:'table', t:'Senior-level skills matrix (1 of 2)', lead:'Mark yourself honestly for each layer: Learning, Working or Leading.',
   head:['Layer','Mid-level: you can…','Senior: you also…','Self-assess'], rows:[
   ['1. Core languages','Write correct joins, windows and aggregates; basic Python','Read query plans, optimize costly queries, set style standards, choose SQL versus Python deliberately','☐ Learning ☐ Working ☐ Leading'],
   ['2. Ingestion','Configure managed connectors; fix failed loads','Design idempotent, replayable loads; handle drift, deletes and backfills; choose batch versus streaming on value','☐ Learning ☐ Working ☐ Leading'],
   ['3. Warehouse','Query and load tables on one platform','Model cost, isolate workloads, choose formats and platforms, plan migrations','☐ Learning ☐ Working ☐ Leading'],
   ['4. Transformation','Build and test dbt models','Define structure, contracts and Slim CI; control build cost; manage breaking changes','☐ Learning ☐ Working ☐ Leading'],
   ['5. Orchestration','Schedule and monitor jobs','Design retry, SLA and backfill strategy; choose tasks or assets; own recovery runbooks','☐ Learning ☐ Working ☐ Leading'],
   ['6. Semantic layer','Use existing metrics','Define and govern metrics; manage versioning and deprecation; resolve definition conflicts','☐ Learning ☐ Working ☐ Leading'],
   ['7. BI','Build dashboards','Govern self-service; manage performance; own the data layer under dashboards','☐ Learning ☐ Working ☐ Leading']
  ], n:'Use this as a one-on-one tool with your manager. Seniors are expected to be Leading in several rows and at least Working in all of them.' },

 { k:'table', t:'Senior-level skills matrix (2 of 2)', lead:'Pick two rows to turn from Working to Leading in the next six months.',
   head:['Layer','Mid-level: you can…','Senior: you also…','Self-assess'], rows:[
   ['8. Quality','Add basic tests','Define SLAs, tune monitors, run incident response and cut alert noise','☐ Learning ☐ Working ☐ Leading'],
   ['9. Governance','Follow access rules','Design roles, masking and contracts; partner with security and legal','☐ Learning ☐ Working ☐ Leading'],
   ['10. Reverse ETL','Configure a sync','Build safe activation: consent, thresholds, diff-based syncs and failure handling','☐ Learning ☐ Working ☐ Leading'],
   ['11. DevOps','Use Git and pull requests','Own CI/CD, infrastructure as code, IAM and cost hygiene','☐ Learning ☐ Working ☐ Leading'],
   ['12. Modeling','Build marts from a specification','Choose and defend modeling approaches; own conformed dimensions and history','☐ Learning ☐ Working ☐ Leading'],
   ['13. Analytics and AI','Run basic analyses','Design experiments, reason causally, set AI guardrails and evaluate tools honestly','☐ Learning ☐ Working ☐ Leading'],
   ['14. Soft skills','Deliver assigned tasks','Lead alignment, write ADRs, mentor, prioritize and communicate trade-offs','☐ Learning ☐ Working ☐ Leading'],
   ['15. AI engineering','Call an LLM API and use a prompt template','Design agent loops, harnesses, RAG and MCP integrations with evals, limits and security','☐ Learning ☐ Working ☐ Leading'],
   ['16. ML and DL models','Train a scikit-learn model','Explain how each model works, choose by data and cost, and prevent leakage and drift','☐ Learning ☐ Working ☐ Leading'],
   ['17. Security and networking','Follow access and secrets rules','Design least-privilege identity, private networking, encryption and audit; threat-model a pipeline','☐ Learning ☐ Working ☐ Leading'],
   ['18. Distributed systems and reliability','Retry a failed job','Reason about consistency, delivery semantics and idempotency; design HA and DR with RPO and RTO','☐ Learning ☐ Working ☐ Leading'],
   ['19. FinOps and performance','Check the bill','Model unit costs, attribute spend, tune queries, shuffles and consumer lag, and plan capacity','☐ Learning ☐ Working ☐ Leading'],
   ['20. Engineering foundations','Use Git, SSH and a database','Diagnose network, OS and transaction problems; run release and rollback safely','☐ Learning ☐ Working ☐ Leading'],
   ['21. Concepts and modeling theory','Build tables from a spec','Choose between normalized, dimensional and entity-centric models; define data products and golden records','☐ Learning ☐ Working ☐ Leading'],
   ['22. Formats and engines','Read and write Parquet','Explain file layout, push-downs and engine choice; tune layout for scan cost','☐ Learning ☐ Working ☐ Leading'],
   ['23. Processing paradigms','Write an ETL script','Design functional, idempotent, declarative pipelines; choose batch, streaming or hybrid; serve data through APIs','☐ Learning ☐ Working ☐ Leading']
  ], n:'Encourage depth over breadth: it is better to be genuinely strong in a handful of layers and competent in the rest than superficial everywhere.' },

 { k:'cards', cols:2, t:'A six-month learning roadmap',
   lead:'One real project per phase beats reading about ten tools. Apply each step to your current work.',
   cards:[
    {h:'Days 1 to 30: foundations', tag:'must', list:['Read five query plans and fix the worst query','Add SQLFluff and pre-commit to a repository','Write unique, not-null and relationship tests for your top 10 models','Start an ADR log with one retrospective ADR']},
    {h:'Days 31 to 60: reliability', tag:'must', list:['Add Slim CI with a per-PR schema','Make one pipeline idempotent and backfillable','Add freshness and volume monitoring on three critical tables','Write a runbook and rehearse an incident']},
    {h:'Days 61 to 90: design and governance', tag:'senior', list:['Write grain statements and a star schema for one domain','Define five core metrics with owners in a semantic layer','Mask one PII column and run an access review','Present a cost review of your top queries']},
    {h:'Months 4 to 6: leadership', tag:'senior', list:['Lead a build-versus-buy decision with a scorecard and an ADR','Run a metric-alignment workshop','Mentor one engineer through a full review cycle','Run an experiment end to end: design, power, analysis, write-up']}
   ],
   n:'The roadmap moves from personal craft (days 1 to 30), to team reliability (31 to 60), to design and governance (61 to 90), to leadership (months 4 to 6). Adjust the order to your biggest gaps.' },

 { k:'cards', cols:2, t:'Final summary: eight ideas to keep',
   plain:true,
   cards:[
    {h:'Grain, keys and definitions outlive tools', p:'Invest where change is slowest.'},
    {h:'Make everything idempotent and replayable', p:'Safe retries and backfills prevent most data incidents.'},
    {h:'Test where it is cheapest, monitor the unknown', p:'Layer checks; tune alerts; assign owners.'},
    {h:'Logic belongs in reviewed code', p:'Not in consoles, spreadsheets or BI tools.'},
    {h:'Treat cost as a design constraint', p:'Measure, attribute and put guardrails in place.'},
    {h:'One answer for every consumer', p:'Dashboards, apps and AI assistants share governed definitions.'},
    {h:'Decide in writing', p:'ADRs, scorecards and explicit trade-offs.'},
    {h:'Grow the people around you', p:'Seniority is measured by what the team can do without you.'}
   ],
   n:'If the audience remembers only one thing: seniority is mostly about judgment, communication and leverage, applied on top of solid fundamentals.' },

 { k:'cards', cols:3, t:'Recommended resources',
   lead:'Prefer primary documentation and a few durable books over a long tool-by-tool reading list.',
   cards:[
    {h:'Books', tag:'must', list:['The Data Warehouse Toolkit (Kimball and Ross)','Fundamentals of Data Engineering (Reis and Housley)','Designing Data-Intensive Applications (Kleppmann)','Trustworthy Online Controlled Experiments (Kohavi, Tang and Xu)','The Staff Engineer’s Path (Reilly)']},
    {h:'Reference sites', tag:'must', list:['Use The Index, Luke (use-the-index-luke.com) for SQL performance','Modern SQL (modern-sql.com) for standard SQL features','The documentation of the tools you actually use: dbt, your warehouse, your orchestrator','Dagster University and the Airflow documentation tutorials']},
    {h:'Practice', tag:'nice', list:['Build a small end-to-end stack locally with DuckDB, dbt and an orchestrator','Contribute to an open-source package or fix docs','Do a postmortem on a past incident','Mentor someone and write down what you learned']}
   ],
   n:'Resources change; fundamentals do not. Check current editions and documentation versions. The best learning is deliberate practice on a real system with real stakes.' }
);
