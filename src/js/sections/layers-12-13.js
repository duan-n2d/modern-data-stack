"use strict";

/* ===================== 12. MODELING AND DESIGN ===================== */
function starSVG(){
  var s = '';
  var dim = function(x, y, t, sub, c){ return bx(x, y, 210, 96, t, sub, c); };
  // connectors first (behind boxes)
  s += '<path class="ln" d="M220 108 L360 180" marker-end="url(#arr)"/>';
  s += '<path class="ln" d="M680 108 L540 180" marker-end="url(#arr)"/>';
  s += '<path class="ln" d="M220 312 L360 250" marker-end="url(#arr)"/>';
  s += '<path class="ln" d="M680 312 L540 250" marker-end="url(#arr)"/>';
  s += bx(340, 130, 220, 170, 'fct_order_lines', 'grain: one row per order line|order_line_id (PK)|order_date_key (FK)|customer_key (FK)|product_key (FK)|store_key (FK)|quantity, net_amount', '#4D7C0F');
  s += dim(10, 40, 'dim_date', 'date_key (PK)|date, week, month|quarter, year, is_holiday', '#2563EB');
  s += dim(680, 40, 'dim_customer', 'customer_key (PK)|customer_id (natural key)|segment, region, valid_from|valid_to, is_current', '#7C3AED');
  s += dim(10, 250, 'dim_product', 'product_key (PK)|sku, name, category|brand', '#EA580C');
  s += dim(680, 250, 'dim_store', 'store_key (PK)|store_id, city, country|channel', '#0891B2');
  s += txt(450, 22, 'Fact table in the middle, descriptive dimensions around it', 'lg', 'middle');
  s += txt(450, 358, 'Dimensions are conformed: the same dim_date and dim_customer are reused by every fact table.', 'sm', 'middle');
  return svg(900, 372, s, 'Star schema with a central order-line fact table and four dimension tables');
}

function medallionSVG(){
  var s = '', Y = 40, H = 150;
  s += txt(10, 24, 'Layers of increasing quality and business meaning', 'lg');
  s += bx(10, Y, 140, H, 'Sources', 'apps, databases|events, files', '#7A869F');
  s += bx(200, Y, 190, H, 'Bronze', 'raw, as landed|append-only|keeps full history|audit and replay', '#B45309');
  s += bx(440, Y, 190, H, 'Silver', 'cleaned, typed|deduplicated|conformed keys|joined entities', '#64748B');
  s += bx(680, Y, 190, H, 'Gold', 'business-ready marts|dimensional models|metrics, aggregates|serves BI and ML', '#CA8A04');
  s += bx(920, Y, 170, H, 'Consumers', 'BI, apps, ML|reverse ETL|AI assistants', '#475569');
  [[152, 198], [392, 438], [632, 678], [872, 918]].forEach(function(a){ s += arrow(a[0], Y + H / 2, a[1], Y + H / 2); });
  s += txt(295, Y + H + 28, 'schema on read,', 'sm', 'middle') + txt(295, Y + H + 43, 'cheap to reprocess from here', 'sm', 'middle');
  s += txt(535, Y + H + 28, 'tests: keys, types,', 'sm', 'middle') + txt(535, Y + H + 43, 'nulls, relationships', 'sm', 'middle');
  s += txt(775, Y + H + 28, 'tests: business rules,', 'sm', 'middle') + txt(775, Y + H + 43, 'reconciliation, contracts', 'sm', 'middle');
  s += '<rect class="bx2" x="10" y="266" width="1080" height="44" rx="8"/>';
  s += txt(26, 285, 'Medallion is a layering pattern, not a modeling method.', 'b') + txt(26, 302, 'Gold layers still need a modeling choice, such as Kimball dimensional models, Data Vault feeding marts, or wide tables.', 'sm');
  return svg(1100, 322, s, 'Medallion architecture: sources to bronze to silver to gold to consumers');
}

SEC(12, [
 { k:'cards', cols:3, t:'Modeling and design: shaping data so questions are easy',
   lead:'Tools change every few years; modeling choices outlive them. Good models make correct answers the easy ones.',
   cards:[
    {h:'Kimball dimensional modeling', tag:'must', p:'Facts and dimensions in star schemas, designed around business processes and a declared grain.'},
    {h:'Slowly changing dimensions', tag:'must', p:'Rules for how attribute changes are recorded: overwrite, add a row, or keep the previous value.'},
    {h:'Medallion architecture', tag:'must', p:'Bronze, silver and gold layers that raise quality step by step.'},
    {h:'Data Vault', tag:'nice', p:'Hubs, links and satellites for integration and auditability across many changing sources.'},
    {h:'One Big Table', tag:'nice', p:'A wide denormalized table. Simple for consumers, hard to keep consistent as use cases grow.'},
    {h:'Data mesh and data products', tag:'senior', p:'Domain teams own data as products with contracts. Mainly an organizational model.'}
   ],
   n:'The unifying idea is grain: what does one row represent? Every approach here is a different way to keep grain and meaning explicit as the system grows.' },

 { k:'table', t:'Modeling approaches compared', head:['Approach','Type','Best for','Strengths','Limitations','Effort and cost'], rows:[
   ['Kimball dimensional','Presentation-layer modeling','Business-facing analytics and BI','Understandable; fast joins; BI-tool friendly','Needs upfront grain and conformed dimension work','Moderate design effort; low run cost'],
   ['Data Vault','Integration-layer modeling','Many changing sources, audit and history needs','Flexible; auditable; supports parallel loading','More tables and joins; needs a presentation layer on top','High design and tooling effort'],
   ['One Big Table','Denormalized wide table','Single, well-defined use case; small teams','Simple to query; fast scans on columnar engines','Redundancy; fragile when requirements grow; grain confusion','Low upfront; rises as it grows'],
   ['Medallion','Layering pattern','Lakehouse pipelines with clear quality stages','Reprocessing from bronze; clear contracts per layer','A pattern, not a model: gold still needs modeling','Low to moderate'],
   ['Data mesh / data products','Organizational model','Large organizations with many domains','Scales ownership; aligns data with domains','Needs platform maturity and cultural change; can fragment definitions','High organizational effort']
  ], cap:'These are not mutually exclusive. A common combination is medallion layers with dimensional models in the gold layer.',
   n:'Stress the last point: people often pose these as rivals, but they work at different levels. Medallion describes stages; Kimball and Data Vault describe shape; mesh describes ownership.' },

 { k:'svg', t:'Star schema: facts in the middle, dimensions around',
   lead:'Declare the grain, put measurements in the fact table, put descriptions in dimensions, and join on surrogate keys.',
   svg: starSVG(),
   cap:'Fact tables hold numeric measurements and keys. Dimensions hold the attributes people filter and group by.',
   n:'Walk through the grain statement first: one row per order line. Every measure and every foreign key must be true at that grain. Dimensions use surrogate keys so that slowly changing attributes can be tracked without breaking history.' },

 { k:'svg', t:'Medallion architecture: bronze, silver and gold',
   lead:'Each layer has a job and a test strategy. Problems are fixed at the earliest layer where they can be fixed.',
   svg: medallionSVG(),
   cap:'Name layers in your project structure and permissions so that consumers read only from gold.',
   n:'The medallion naming comes from lakehouse platforms, but the same idea appears as staging, intermediate and marts in dbt projects. The value is the shared vocabulary and the rule that consumers only touch the top layer.' },

 { k:'code', t:'Slowly changing dimensions and incremental strategies',
   lead:'Type 2 keeps full history with validity ranges, so facts can join to the attribute value that was true at the time.',
   blocks:[
    {lang:'sql', title:'scd2_customer.sql (two-step Type 2 pattern)', code:`
-- Step 1: close the current row when a tracked attribute changed
update dim_customer d
set valid_to = s.updated_at,
    is_current = false
from stg_customers s
where d.customer_id = s.customer_id
  and d.is_current
  and (d.city is distinct from s.city
       or d.segment is distinct from s.segment);

-- Step 2: insert a new current row for new and changed customers
insert into dim_customer
    (customer_id, city, segment, valid_from, valid_to, is_current)
select s.customer_id, s.city, s.segment, s.updated_at, null, true
from stg_customers s
left join dim_customer d
    on d.customer_id = s.customer_id and d.is_current
where d.customer_id is null;`}
   ],
   points:[
    {h:'Type 1: overwrite', p:'Simplest. History is lost. Fine for corrections such as typos.'},
    {h:'Type 2: add a row', tag:'must', p:'Full history with `valid_from`, `valid_to` and `is_current`. The usual choice when history matters. dbt snapshots automate it.'},
    {h:'Type 3: keep previous', tag:'nice', p:'Adds a “previous value” column. Limited history, rarely used.'},
    {h:'Incremental strategies', tag:'senior', p:'Append for immutable events, merge for updates, partition overwrite for large time-sliced facts. Pick by how data changes and how late it arrives.'}
   ],
   n:'The two statements are standard Type 2 logic: first expire the old row, then insert the new current one. The same pattern appears inside dbt snapshots. Note the null-safe comparison, which is a common bug source. Syntax varies slightly between warehouses.' },

 { k:'table', t:'Decision guide: which approach when?', head:['Situation','Prefer','Why','Watch out for'], rows:[
   ['Stable business questions, BI-heavy consumption','Kimball star schemas in gold','Easy to understand, fast, BI-friendly','Conformed dimensions across teams; grain discipline'],
   ['Many source systems, frequent change, strict audit and history','Data Vault in the integration layer, with marts on top','Absorbs change; auditable; parallel loads','Added complexity; you still need a consumable layer'],
   ['Small team, one use case, columnar warehouse, need speed','One Big Table (or a few wide tables)','Simple to build and use','Redundancy and consistency as questions multiply'],
   ['Lakehouse with raw and messy data','Medallion layering','Clear stages; replay from bronze','Do not mistake layers for a design; model gold deliberately'],
   ['Large organization with many data-owning domains','Data products with contracts (mesh principles)','Scales ownership and accountability','Needs platform support; risk of inconsistent metrics without a semantic layer']
  ], cap:'Default for most analytics teams: medallion-style layers with Kimball-style marts. Reach for Data Vault or mesh when scale and organization demand it.',
   n:'Give the default first, then the conditions that change it. A senior engineer can justify a deviation from the default in terms of source volatility, audit needs and team size.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Modeling without declaring the grain.', why:'Facts double-count and joins misbehave.', fix:'Write the grain sentence first and test uniqueness.'},
   {bad:'Natural keys as dimension keys.', why:'Breaks when keys change or history is needed.', fix:'Surrogate keys, with natural keys kept as attributes.'},
   {bad:'Snowflaking every dimension.', why:'More joins and little benefit on modern engines.', fix:'Denormalize dimensions for usability.'},
   {bad:'Adopting Data Vault “because enterprise”.', why:'Heavy overhead for a small team.', fix:'Use it when volatility and audit needs justify it.'},
   {bad:'Calling a layer name a model.', why:'Bronze, silver and gold with no design inside.', fix:'Decide the modeling approach per layer.'},
   {bad:'Mesh as a reorg with no platform.', why:'Duplicated effort and inconsistent metrics.', fix:'Invest in platform, contracts and a shared semantic layer first.'}
  ], n:'Most modeling failures are failures to be explicit about grain and keys.' },

 { k:'cards', cols:3, t:'What senior looks like: modeling',
   cards:[
    {h:'Decisions', tag:'senior', list:['Modeling approach per layer','Grain and key strategy for core entities','How history is tracked']},
    {h:'Trade-offs', tag:'senior', list:['Normalization versus usability','Flexibility versus complexity','Central models versus domain ownership']},
    {h:'Responsibilities', tag:'senior', list:['Own the conformed dimensions','Review models for grain and fan-out','Document modeling conventions','Guide teams through model changes']}
   ],
   n:'Seniors also know when not to model: a quick wide table is a perfectly good answer for a throwaway analysis, provided nobody mistakes it for the foundation.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['I can state the grain of every fact table','Dimensions use surrogate keys','I know when to use SCD Type 2','I can explain medallion versus Kimball','I can justify a modeling approach for my context','My conformed dimensions are shared across facts']},
   right:{h:'Interview-style questions', items:['Design a star schema for an e-commerce business.','How do you handle a customer who changes region over time?','Kimball or Data Vault for a company that acquires others often?','What does medallion architecture give you that staging and marts do not?','How would you introduce data products to a 500-person company?']},
   n:'For the second question, listen for Type 2 history and the point-in-time join from facts.' }
]);

/* ===================== 13. ADVANCED ANALYTICS AND AI ===================== */
SEC(13, [
 { k:'cards', cols:3, t:'Advanced analytics and AI: from reporting to decisions',
   lead:'Seniors are expected to design experiments, reason about causality, and use machine learning and LLMs responsibly.',
   cards:[
    {h:'Experimentation', tag:'must', p:'A/B tests with sound design: power, randomization, guardrail metrics and pre-defined stopping rules.'},
    {h:'Causal inference', tag:'senior', p:'When you cannot randomize: difference-in-differences, matching, regression discontinuity, synthetic control.'},
    {h:'Core statistics', tag:'must', p:'Distributions, confidence intervals, what a p-value does and does not mean, and variance.'},
    {h:'ML basics and MLOps', tag:'nice', p:'scikit-learn models, experiment tracking, feature stores and basic deployment.'},
    {h:'LLMs in analytics', tag:'senior', p:'Text-to-SQL, copilots and agents grounded in governed definitions, with guardrails.'},
    {h:'Embeddings and vector search', tag:'nice', p:'Semantic search over documents and tickets with pgvector or a dedicated vector database.'}
   ],
   n:'This layer is broad on purpose. The expectation for a senior analytics engineer is not to be a research scientist, but to enable good experiments, avoid statistical traps and set safe patterns for AI.' },

 { k:'table', t:'Tool landscape: analytics, ML and AI', head:TH, rows:[
   ['Jupyter / Hex / Deepnote','Notebooks and collaborative workspaces','Exploration, analysis and sharing','Interactive; SQL and Python; easy sharing','Reproducibility and production readiness need discipline','Jupyter is open source; Hex and Deepnote are plan-based'],
   ['scikit-learn','Machine-learning library','Classical ML: regression, trees, clustering','Consistent API; reliable; well documented','Not for deep learning or very large data','Open source'],
   ['MLflow','Experiment tracking and model registry','Tracking runs, parameters and models','Open source; widely supported','Needs hosting and conventions to be useful at scale','Open source; managed options exist'],
   ['Feature stores (Feast, platform-native)','Feature management','Consistent features for training and serving','Point-in-time correctness; reuse','Operational overhead; often unneeded for small teams','Open source or platform-included'],
   ['Snowflake Cortex / Databricks Genie','In-platform AI and natural-language analytics','AI features close to governed warehouse data','Data stays in the platform; governance integration','Platform lock-in; quality depends on semantic modeling','Consumption-based'],
   ['Claude / GitHub Copilot','LLM assistants','SQL, code and documentation assistance; analysis help','Speeds drafting and exploration','Needs review and grounding; can be confidently wrong','Subscription or usage-based'],
   ['pgvector / vector databases','Embedding storage and search','Semantic search and retrieval for AI apps','pgvector keeps vectors beside relational data','Dedicated databases add systems; scale and recall need testing','Open source; managed options vary']
  ], cap:'The model matters less than the data and definitions it is grounded in.',
   n:'The pattern with LLM tools is the same as for BI: they are only as good as your semantic layer and governance. Treat them as another consumer of your data products.' },

 { k:'code', t:'Deep dive: planning and analysing an A/B test',
   lead:'Decide how many users you need before the test, then analyse once.',
   blocks:[
    {lang:'python', title:'ab_test.py', code:`
import numpy as np
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize, proportions_ztest

# 1) Plan: users needed per variant to detect 10.0% -> 11.0% conversion
effect = proportion_effectsize(0.11, 0.10)
n_per_arm = NormalIndPower().solve_power(
    effect_size=effect, alpha=0.05, power=0.8, ratio=1.0, alternative="two-sided"
)
print(f"Need about {int(np.ceil(n_per_arm)):,} users per variant")

# 2) Analyse: two-proportion z-test
conversions = np.array([1120, 1010])   # treatment, control
exposures = np.array([10000, 10000])
stat, p_value = proportions_ztest(conversions, exposures)
lift = conversions[0] / exposures[0] - conversions[1] / exposures[1]
print(f"absolute lift={lift:.4f}, z={stat:.2f}, p={p_value:.3f}")`}
   ],
   points:[
    {h:'Pre-register', p:'Fix the primary metric, minimum detectable effect, duration and stopping rule before launch.'},
    {h:'Do not peek', p:'Checking repeatedly and stopping at the first significant result inflates false positives. Use sequential methods if you must monitor.'},
    {h:'Check sample ratio', tag:'senior', p:'If the 50/50 split is not near 50/50, assignment is broken and results are unreliable.'},
    {h:'Statistical is not practical', tag:'senior', p:'Report effect size and uncertainty, and ask whether the lift is worth the cost.'}
   ],
   n:'The sample-size calculation is the part most teams skip. The analysis step is short; the discipline is in the design. Mention variance reduction methods such as CUPED as a later optimization.' },

 { k:'cards', cols:3, t:'Design patterns: causal inference and statistical judgment',
   cards:[
    {h:'Randomize when you can', p:'It is the cleanest way to establish cause. Invest in assignment and logging quality.'},
    {h:'Difference-in-differences', p:'Compare the change in a treated group to the change in a comparable untreated group. Needs parallel trends.'},
    {h:'Matching and regression adjustment', p:'Control for observed confounders. Cannot fix unobserved ones.'},
    {h:'Regression discontinuity', p:'Exploits a sharp eligibility threshold to estimate local effects.'},
    {h:'Beware Simpson’s paradox', p:'Aggregates can reverse the story told by subgroups. Always slice by the main confounders.'},
    {h:'Quantify uncertainty', p:'Report intervals, not only point estimates. Bootstrap when formulas are awkward.'}
   ],
   n:'Keep this slide conceptual. The point is to recognize when an observational analysis cannot support a causal claim, and to say so clearly.' },

 { k:'code', t:'Deep dive: tracking models and searching by meaning',
   lead:'Track every experiment so results are reproducible, and keep embeddings next to the relational data they describe.',
   blocks:[
    {lang:'python', title:'train_churn.py (MLflow + scikit-learn; X and y come from your feature table)', code:`
import mlflow
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

mlflow.set_experiment("churn-model")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

with mlflow.start_run():
    params = {"n_estimators": 200, "max_depth": 3, "learning_rate": 0.05}
    model = GradientBoostingClassifier(**params).fit(X_train, y_train)
    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])

    mlflow.log_params(params)
    mlflow.log_metric("auc", auc)
    # Newer MLflow versions prefer name="model" over artifact_path
    mlflow.sklearn.log_model(model, artifact_path="model")`},
    {lang:'sql', title:'pgvector: semantic search (PostgreSQL)', code:`
create extension if not exists vector;

create table doc_chunks (
    id         bigserial primary key,
    doc_id     text not null,
    content    text not null,
    embedding  vector(1536)      -- dimension must match your embedding model
);

create index on doc_chunks using hnsw (embedding vector_cosine_ops);

-- $1 is the query embedding, supplied by your application
select id, doc_id, content
from doc_chunks
order by embedding <=> $1
limit 5;`}
   ],
   points:[
    {h:'Track everything', p:'Parameters, metrics, data version and code version. “Which model is in production?” should have an answer.'},
    {h:'Point-in-time features', tag:'senior', p:'Training features must be computed as of the prediction time, or you leak the future into the model.'},
    {h:'Match embedding dimensions', p:'The vector column must match the embedding model. Changing models means re-embedding.'},
    {h:'Test retrieval quality', tag:'senior', p:'Evaluate recall on real questions before trusting similarity search.'}
   ],
   n:'The MLflow snippet is intentionally small: it demonstrates the habit rather than a full pipeline. The pgvector example shows that for many teams, vector search can live in the database they already run. Verify extension and index options on your platform.' },

 { k:'code', t:'Guardrails for AI-generated SQL',
   lead:'Never run model-written SQL as-is. Validate it, constrain it, and ground it in governed definitions.',
   blocks:[
    {lang:'python', title:'sql_guard.py (validate before execution)', code:`
import sqlglot
from sqlglot import exp

ALLOWED_TABLES = {
    "analytics.marts.fct_orders",
    "analytics.marts.dim_customers",
}


def validate(sql: str, dialect: str = "snowflake", max_rows: int = 10_000) -> str:
    tree = sqlglot.parse_one(sql, read=dialect)

    if not isinstance(tree, (exp.Select, exp.Union)):
        raise ValueError("Only read-only SELECT queries are allowed")

    cte_names = {c.alias_or_name.lower() for c in tree.find_all(exp.CTE)}
    for table in tree.find_all(exp.Table):
        if table.name.lower() in cte_names and not table.db:
            continue  # reference to a CTE defined in this query
        full = f"{table.catalog}.{table.db}.{table.name}".lower()
        if full not in ALLOWED_TABLES:
            raise ValueError(f"Table not allowed: {full}")

    if not tree.args.get("limit"):
        tree = tree.limit(max_rows)

    return tree.sql(dialect=dialect)`}
   ],
   points:[
    {h:'Read-only role', tag:'senior', p:'Run generated SQL with credentials that can only read approved marts. Code checks are a second line of defense, not the first.'},
    {h:'Ground in the semantic layer', p:'Let the model choose governed metrics and dimensions rather than invent joins and formulas.'},
    {h:'Constrain cost', p:'Dry-run or explain before executing, set row limits, timeouts and per-user budgets.'},
    {h:'Evaluate and log', tag:'senior', p:'Keep a test set of questions with known answers, log every generated query, and review failures.'},
    {h:'Show your work', p:'Display the SQL and the metric definitions used, so users can check the answer.'}
   ],
   n:'The code shows one layer of defense: parse, allowlist tables, enforce a limit. It is a sketch. Real systems also enforce permissions in the database, and treat prompts and retrieved context as untrusted input. The safest design avoids free-form SQL where a governed metric query would do.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Stopping an A/B test when p dips below 0.05.', why:'Inflates false positives.', fix:'Fixed duration or sequential testing.'},
   {bad:'Claiming causation from correlation.', why:'Confounders explain the effect.', fix:'Design an experiment or use a causal method, and state assumptions.'},
   {bad:'Training on features unavailable at prediction time.', why:'Leakage; great offline, poor in production.', fix:'Point-in-time feature computation.'},
   {bad:'Letting an LLM write unrestricted SQL for everyone.', why:'Wrong answers, data exposure and cost spikes.', fix:'Read-only roles, allowlists, semantic grounding and review.'},
   {bad:'Notebook-only models.', why:'Not reproducible or deployable.', fix:'Version code, track runs, package inference.'},
   {bad:'Reporting the p-value without the effect size.', why:'Tiny effects can be significant at scale.', fix:'Report effect, interval and practical impact.'}
  ], n:'These pitfalls share one root: results that look rigorous but are not. Seniors are the ones who ask “how could this be wrong?”' },

 { k:'cards', cols:3, t:'What senior looks like: advanced analytics and AI',
   cards:[
    {h:'Decisions', tag:'senior', list:['When an experiment is needed versus observational analysis','Where AI is safe to use, and where it is not','Which AI features to build, buy or enable in-platform']},
    {h:'Trade-offs', tag:'senior', list:['Speed of insight versus rigor','Convenience of AI versus governance risk','Platform-native versus best-of-breed AI tools']},
    {h:'Responsibilities', tag:'senior', list:['Provide trusted, governed data for experiments and models','Set guardrails for AI access to data','Educate stakeholders on uncertainty','Evaluate AI tools with real questions, not demos']}
   ],
   n:'The senior role in AI is infrastructure and judgment: governed data, grounded definitions, guardrails and honest evaluation.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['I can size an A/B test before running it','I can explain a confidence interval and a p-value correctly','I know when difference-in-differences is appropriate','Experiments and models are tracked and reproducible','AI access to data uses read-only, scoped roles','I evaluate LLM answers against known questions']},
   right:{h:'Interview-style questions', items:['A test shows +2% conversion, p=0.04, after peeking daily. What do you say?','How would you estimate the effect of a feature that was not randomized?','What is data leakage, and how do you prevent it?','Design a safe natural-language analytics assistant for the finance team.','When is a vector database unnecessary?']},
   n:'For the assistant question, a strong answer covers the semantic layer, permissions, validation, evaluation and logging.' }
]);
