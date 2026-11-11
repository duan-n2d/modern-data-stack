"use strict";

/* ===================== 7. BI AND VISUALIZATION ===================== */
SEC(7, [
 { k:'cards', cols:3, t:'BI and visualization: where the work meets decisions',
   lead:'A dashboard nobody trusts or uses is a cost, not an asset. This layer is about clarity, speed and governed self-service.',
   cards:[
    {h:'Dashboard design', tag:'must', p:'Start from the decision the viewer must make. Show few metrics, with context and comparisons.'},
    {h:'Self-service governance', tag:'senior', p:'Let people explore, within certified datasets, clear ownership and a way to retire clutter.'},
    {h:'Performance', tag:'must', p:'Slow dashboards are abandoned dashboards. Aggregate upstream, limit queries, and cache.'},
    {h:'Data apps', tag:'nice', p:'Streamlit, Evidence and Observable build custom, code-first interactive experiences.'},
    {h:'Notebooks and collaboration', tag:'nice', p:'Hex and Mode blend SQL, Python and sharing for analyst workflows.'},
    {h:'Choose by audience', tag:'senior', p:'Executives, analysts and customers need different tools and different levels of freedom.'}
   ],
   n:'Start with the audience and the decision, not the tool. A senior engineer owns the data foundation under the dashboards, and increasingly the governance around who can build what.' },

 { k:'table', t:'Tool landscape: BI platforms', head:TH, rows:[
   ['Power BI','Enterprise BI','Microsoft-centric organizations','Low entry cost; deep Microsoft integration; large community','DAX learning curve; logic can get trapped in the tool','Per-user licensing plus capacity options'],
   ['Tableau','Visual analytics','Rich visual exploration; analyst-led teams','Powerful visual grammar; mature community','Governance needs discipline; licensing cost','Per-user (role-based)'],
   ['Looker','Governed BI on LookML','Governed metrics and embedded analytics','Strong modeling layer; Git workflow','Requires LookML skills; less ad hoc freedom','Platform licensing'],
   ['Sigma','Spreadsheet-style cloud BI','Business users who think in spreadsheets, on a cloud warehouse','Familiar interface; live queries on the warehouse','Warehouse compute cost; newer ecosystem','Per-user or platform-based'],
   ['Mode','SQL-first analytics and reporting','Analyst teams that live in SQL and Python','SQL, Python and visualization in one place','Less suited to broad business self-service','Plan-based'],
   ['Hex','Collaborative notebooks and apps','Data teams building analyses and shareable apps','SQL and Python in one notebook; app publishing','Not a classic enterprise dashboarding tool','Seat-based plans']
  ], cap:'Many companies run two: a governed standard for broad reporting and a flexible tool for analysts.',
   n:'The fastest way to choose a BI tool is to ask who builds and who consumes. Spreadsheet users, analysts and executives want different things.' },

 { k:'table', t:'Tool landscape: open-source BI and data apps', head:TH, rows:[
   ['Metabase','Open-source BI','Small teams wanting quick self-service','Very easy to start; question builder for non-SQL users','Governance and advanced modeling are lighter','Open source plus paid and cloud plans'],
   ['Apache Superset','Open-source BI','Teams comfortable running and customizing infrastructure','Many chart types; extensible; SQL Lab','Operationally heavier; UX less polished','Open source; managed offerings exist'],
   ['Lightdash','dbt-native open-source BI','dbt-centric teams that want metrics defined in dbt','Reads dbt YAML as the semantic layer','Smaller ecosystem; tied to dbt workflow','Open source plus cloud plans'],
   ['Streamlit','Python data-app framework','Custom internal tools and prototypes','Pure Python; rapid to build','Not a BI tool; you own hosting, auth and performance','Open source; hosting options vary'],
   ['Evidence','Code-first BI (SQL and Markdown)','Analytics-as-code reports in Git','Version-controlled reports; clean output','Smaller ecosystem; less interactive than classic BI','Open source plus managed hosting'],
   ['Observable','Data visualization and notebooks','Custom, highly interactive visualizations','Powerful JavaScript visualization stack','Higher skill bar; less business self-service','Free and paid plans']
  ], cap:'Open-source tools reduce license cost but shift cost to operations, upgrades and support.',
   n:'The tradeoff pattern: lower license cost, higher operational and training cost. Data apps (Streamlit, Evidence, Observable) are for custom experiences, not replacements for a governed BI standard.' },

 { k:'code', t:'Deep dive: a governed data app in Streamlit',
   lead:'Parameterized SQL, a cache, and a defensive input check. About 25 lines, and it already avoids common dashboard problems.',
   blocks:[
    {lang:'python', title:'revenue_app.py', code:`
from datetime import date

import duckdb
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Revenue explorer", layout="wide")


@st.cache_data(ttl=600)
def load_revenue(start: date, end: date) -> pd.DataFrame:
    con = duckdb.connect("warehouse.duckdb", read_only=True)
    return con.execute(
        """
        select date_trunc('month', ordered_at) as month,
               sum(order_amount) as revenue
        from fct_orders
        where ordered_at >= ? and ordered_at < ?
        group by 1
        order by 1
        """,
        [start, end],
    ).df()


dates = st.date_input("Date range", value=(date(2026, 1, 1), date(2026, 6, 30)))
if len(dates) != 2:
    st.stop()  # the user is mid-selection

df = load_revenue(*dates)
st.metric("Total revenue", f"{df['revenue'].sum():,.0f}")
st.line_chart(df, x="month", y="revenue")`}
   ],
   points:[
    {h:'Bind parameters', p:'Never format user input into SQL strings. Use placeholders.'},
    {h:'Cache with a time limit', p:'A short TTL cuts warehouse load while keeping data reasonably fresh.'},
    {h:'Read-only credentials', tag:'senior', p:'Apps should connect with a least-privilege role scoped to the marts they need.'},
    {h:'End bound is exclusive here', p:'The `<` end filter excludes the end day. Adjust if the picker should be inclusive.'}
   ],
   n:'The code is deliberately small. Pull attention to parameter binding and the read-only connection: those two lines are the difference between a toy and something safe to share. The date range end is exclusive in this query; note that as a deliberate choice you would confirm with users.' },

 { k:'cards', cols:3, t:'Design patterns: dashboards and self-service',
   cards:[
    {h:'One question per dashboard', p:'Title it with the decision it supports. Put the headline number first, then the breakdown.'},
    {h:'Context beats decoration', p:'Show targets, prior periods and thresholds. Avoid 3D charts, rainbow palettes and gauges.'},
    {h:'Certified versus exploratory', p:'Label certified content, and give people a sandbox so exploration does not pollute the standard.'},
    {h:'Performance budget', p:'Aggregate in marts, limit filters and tiles per page, and cache expensive queries.'},
    {h:'Access by role', p:'Use groups and row-level security rather than sharing individual links to sensitive data.'},
    {h:'Lifecycle', p:'Track usage; archive unused dashboards on a schedule; assign an owner to every one.'}
   ],
   n:'The senior idea is lifecycle: dashboards are products with owners, usage metrics and retirement dates, not one-off deliverables.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'The “everything” dashboard.', why:'Nobody knows what decision it serves; it is slow.', fix:'One purpose per dashboard; link to details.'},
   {bad:'Business logic inside the BI tool.', why:'Numbers differ across tools; hard to test.', fix:'Push logic into models and the semantic layer.'},
   {bad:'Live queries on raw tables.', why:'Slow, expensive and fragile.', fix:'Point dashboards at modeled, aggregated marts.'},
   {bad:'Ungoverned self-service.', why:'Hundreds of conflicting, stale reports.', fix:'Certified datasets, naming rules and cleanups.'},
   {bad:'Chart choice by habit.', why:'Misleading or unreadable visuals.', fix:'Pick the chart for the comparison being made.'},
   {bad:'No usage monitoring.', why:'You cannot tell what is valuable.', fix:'Track views, owners and last-used dates.'}
  ], n:'These pitfalls explain most dashboard sprawl. The remedies are mostly governance, not design skills.' },

 { k:'cards', cols:3, t:'What senior looks like: BI',
   cards:[
    {h:'Decisions', tag:'senior', list:['BI standard and exceptions','What is certified','Embedded versus internal analytics']},
    {h:'Trade-offs', tag:'senior', list:['Self-service freedom versus consistency','License cost versus operating cost','Live queries versus extracts and caches']},
    {h:'Responsibilities', tag:'senior', list:['Own the data layer beneath dashboards','Set review and certification processes','Track adoption and performance','Train and support analysts and business users']}
   ],
   n:'The engineering role in BI is the foundation: reliable marts, fast queries and clear definitions. The pretty chart is the last 10%.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Each dashboard names the decision it supports','Dashboards read from tested marts or a semantic layer','Slow dashboards are measured and improved','Sensitive data uses roles and row-level security','Unused dashboards are archived','I know when a data app beats a dashboard']},
   right:{h:'Interview-style questions', items:['A key dashboard takes 40 seconds to load. What do you check?','How would you govern self-service without blocking analysts?','Power BI, Tableau or Looker for a 200-person company? What would you ask first?','When would you build a Streamlit app instead of a dashboard?','How do you handle two teams who define “active customer” differently?']},
   n:'Look for answers that start with questions about audience and existing stack rather than with a favorite tool.' }
]);

/* ===================== 8. DATA QUALITY AND OBSERVABILITY ===================== */
function pyramidSVG(){
  var cx = 500, levels = [
    ['Business reconciliation', 'Totals match finance and source systems', 320, '#DC2626'],
    ['Logic tests and data diff in CI', 'Unit tests on risky models; compare PR output to production', 460, '#EA580C'],
    ['Monitors on key tables', 'Freshness, volume, schema and distribution checks', 600, '#CA8A04'],
    ['Generic tests on every model', 'unique, not null, relationships, accepted values', 740, '#16A34A']
  ];
  var s = '', y = 16, h = 66;
  levels.forEach(function(l, i){
    var w = l[2], x = cx - w / 2;
    s += '<rect class="bx" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"/><rect x="' + x + '" y="' + y + '" width="8" height="' + h + '" rx="4" fill="' + l[3] + '"/>';
    s += txt(cx, y + 28, l[0], 'b', 'middle') + txt(cx, y + 48, l[1], 'sm', 'middle');
    y += h + 8;
  });
  s += '<path class="ln" d="M976 300V40" marker-end="url(#arr)"/>' + txt(966, 80, 'fewer, costlier,', 'sm', 'end') + txt(966, 96, 'more targeted', 'sm', 'end');
  s += '<path class="ln" d="M24 40V300" marker-end="url(#arr)"/>' + txt(36, 250, 'more, cheaper,', 'sm') + txt(36, 266, 'broader', 'sm');
  return svg(1000, 310, s, 'Data test pyramid from generic tests at the base to business reconciliation at the top');
}

SEC(8, [
 { k:'cards', cols:3, t:'Data quality and observability: earn and keep trust',
   lead:'Quality is testing what you expect. Observability is noticing what you did not expect.',
   cards:[
    {h:'Freshness', tag:'must', p:'Did the data arrive on time?'},
    {h:'Volume', tag:'must', p:'Did the usual number of rows arrive? Zero rows and doubled rows are both incidents.'},
    {h:'Schema', tag:'must', p:'Did columns appear, vanish or change type?'},
    {h:'Distribution', tag:'must', p:'Did null rates, ranges or category mixes shift?'},
    {h:'Lineage and impact', tag:'senior', p:'Who consumes this table? Observability tools use lineage to scope an incident.'},
    {h:'Incident discipline', tag:'senior', p:'Detect, triage, communicate, fix, and learn. Good alerting is as important as good checks.'}
   ],
   n:'Introduce the four classic check categories, then make the point that a test only catches what someone thought to write. Monitors catch the unknown unknowns, at the cost of noise.' },

 { k:'table', t:'Tool landscape: quality and observability', head:TH, rows:[
   ['dbt tests','Built-in testing','Assertions on models in dbt projects','No extra tool; runs in your pipeline; version-controlled','Rule-based only; no anomaly detection by itself','Included with dbt'],
   ['Great Expectations','Validation framework (Python)','Programmable validations across data sources','Rich expectation library; works with many backends','More setup and configuration than dbt tests','Open source core plus a managed offering'],
   ['Soda','Checks language and platform','Declarative checks with a simple YAML-like language','Readable checks; open-source scanning engine','Advanced features need the paid platform','Open source plus platform plans'],
   ['Elementary','dbt-native observability (open source)','dbt teams wanting anomaly tests and reports in dbt','Runs inside dbt; reports from dbt artifacts','Tied to dbt workflows','Open source plus cloud option'],
   ['Monte Carlo','Data observability platform','Enterprises wanting broad automated monitoring','Automated monitors; lineage; incident workflow','Cost; tuning needed to limit noisy alerts','Subscription'],
   ['Datafold','Data diff and CI','Seeing the data impact of a code change before merge','Compares PR build to production','Primarily a change-validation tool, not a monitor','Subscription'],
   ['Bigeye / Metaplane','Observability platforms','Monitoring tables without writing every test','Metric monitors with anomaly detection','Cost; may overlap with in-pipeline tests','Subscription']
  ], cap:'Common combination: dbt tests for rules, an anomaly monitor for the unknown, and data diff in CI for change safety.',
   n:'Three jobs: assert rules (dbt tests, Great Expectations, Soda), detect anomalies (Elementary, Monte Carlo, Bigeye, Metaplane), and validate changes (Datafold). Most teams need all three eventually, not all on day one.' },

 { k:'code', t:'Deep dive: layered checks in dbt and Soda',
   lead:'Rule-based tests, anomaly monitors and a business rule, each at the level where it is cheapest to run.',
   blocks:[
    {lang:'yaml', title:'models/marts/_marts__models.yml (dbt + Elementary)', code:`
models:
  - name: fct_orders
    data_tests:
      - elementary.volume_anomalies:
          timestamp_column: ordered_at
      - elementary.freshness_anomalies:
          timestamp_column: updated_at
      - elementary.schema_changes
    columns:
      - name: order_id
        data_tests: [unique, not_null]
      - name: order_amount
        data_tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              inclusive: true`},
    {lang:'sql', title:'tests/assert_revenue_matches_finance.sql (singular test)', code:`
-- Fails (returns rows) when monthly revenue differs from the
-- finance-approved figures by more than 0.5 percent.
with ours as (
    select date_trunc('month', ordered_at) as month, sum(order_amount) as revenue
    from {{ ref('fct_orders') }}
    group by 1
),
finance as (
    select month, revenue from {{ ref('finance_monthly_revenue') }}
)
select o.month, o.revenue, f.revenue as finance_revenue
from ours o
join finance f using (month)
where abs(o.revenue - f.revenue) > 0.005 * f.revenue`},
    {lang:'yaml', title:'checks/orders.yml (SodaCL)', code:`
checks for orders:
  - row_count > 0
  - freshness(updated_at) < 6h
  - missing_count(customer_id) = 0
  - duplicate_count(order_id) = 0
  - schema:
      name: Required columns exist
      fail:
        when required column missing: [order_id, customer_id, order_amount]`}
   ],
   n:'Three tools, one idea: put each check where it is cheapest and most precise. The singular test is the business reconciliation; Elementary covers volume, freshness and schema monitoring; Soda shows the same rules in a different, declarative syntax. Package versions and exact test names should be checked against current docs.' },

 { k:'svg', t:'Design pattern: the data test pyramid',
   lead:'Most checks should be cheap and generic. Reserve expensive, targeted checks for the places where errors are costly.',
   svg: pyramidSVG(),
   cap:'Add a test after an incident, never just to hit a coverage number. Each test should be tied to a failure you care about.',
   n:'Compare with software testing: lots of unit tests at the bottom, few end-to-end tests at the top. In data, the base is generic tests on every model, and the top is reconciliation against an independent source such as finance.' },

 { k:'cards', cols:3, t:'Incident response and alert fatigue',
   lead:'Detection is half the job. The other half is making sure the right person acts calmly and quickly.',
   cards:[
    {h:'Severity and ownership', p:'Every important table has an owner and a severity level. Page for broken executive reports, not for experimental tables.', tag:'senior'},
    {h:'Route and group alerts', p:'Alert the owning team, group related failures and suppress downstream noise from a single upstream break.', tag:'senior'},
    {h:'Tune or delete noisy checks', p:'An alert that is ignored is worse than none. Review alert volume monthly.', tag:'must'},
    {h:'Communicate early', p:'Tell consumers what is wrong, what is affected and when the next update is, before they ask.', tag:'must'},
    {h:'Blameless postmortems', p:'Capture the cause, detection gap and one improvement. Turn each into a test or monitor.', tag:'senior'},
    {h:'Data diff in CI', p:'Compare the PR build to production for changed models. It catches unintended impact before merge.', tag:'senior'}
   ],
   n:'Alert fatigue kills observability programs. Fewer, better alerts with clear owners beat comprehensive coverage nobody reads.' },

 { k:'pit', t:'Common pitfalls and anti-patterns', rows:[
   {bad:'Testing only primary keys.', why:'Misses freshness, volume and business-rule failures.', fix:'Layer checks according to the pyramid.'},
   {bad:'Alerting on everything.', why:'People mute the channel.', fix:'Tiered severity, owners and weekly review.'},
   {bad:'Anomaly monitors on volatile tables with default thresholds.', why:'Constant false positives.', fix:'Tune seasonality and thresholds, or skip the table.'},
   {bad:'Tests that fail but do not block.', why:'Bad data ships anyway.', fix:'Decide which tests block deploys and which warn.'},
   {bad:'No owner or runbook.', why:'Alerts arrive and nobody acts.', fix:'Assign owners; link a runbook in each alert.'},
   {bad:'Buying a platform instead of defining quality.', why:'Tools cannot decide what “good” means.', fix:'Define SLAs and critical tables first.'}
  ], n:'The last pitfall is organizational. Tools help only after the team agrees what to protect.' },

 { k:'cards', cols:3, t:'What senior looks like: quality and observability',
   cards:[
    {h:'Decisions', tag:'senior', list:['Which tables are critical','What blocks a deploy and what warns','Build monitors or buy a platform']},
    {h:'Trade-offs', tag:'senior', list:['Coverage versus alert noise','Speed of delivery versus depth of testing','Tool cost versus engineering time']},
    {h:'Responsibilities', tag:'senior', list:['Define data SLAs with stakeholders','Run incident response and postmortems','Track quality metrics over time','Make quality part of the definition of done']}
   ],
   n:'Seniors treat data quality as a product with measurable outcomes: incident counts, time to detect and time to resolve.' },

 { k:'check', t:'Checklist and interview questions',
   left:{h:'Self-check', items:['Critical tables are identified and owned','Primary keys and relationships are tested everywhere','Freshness and volume are monitored for key tables','Tests run in CI and failures block bad merges','Alerts have owners and runbooks','Postmortems produce new checks']},
   right:{h:'Interview-style questions', items:['A dashboard shows zero revenue for yesterday. How do you investigate?','How do you prevent alert fatigue?','dbt tests versus an observability platform: when do you need each?','How would you add data diff to a CI process?','What would you test first in a pipeline with no tests?']},
   n:'A good answer to the first question starts with scoping using lineage, then checks freshness and volume, and only then looks at logic.' }
]);
