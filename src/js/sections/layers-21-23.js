"use strict";

function lifecycleDESVG(){
  var s = flowRow([
    [L('Generation','Sinh dữ liệu'), L('apps, databases,|IoT, SaaS','ứng dụng, database,|IoT, SaaS'), '#7A869F'],
    [L('Storage','Lưu trữ'), L('warehouse, lake,|lakehouse','warehouse, lake,|lakehouse'), '#7C3AED'],
    [L('Ingestion','Nạp dữ liệu'), L('batch, CDC,|streaming','batch, CDC,|streaming'), '#0891B2'],
    [L('Transformation','Biến đổi'), L('clean, model,|aggregate','làm sạch, mô hình,|tổng hợp'), '#EA580C'],
    [L('Serving','Phục vụ'), L('BI, ML, APIs,|reverse ETL','BI, ML, API,|reverse ETL'), '#B45309']
  ], 20, 100, 10, 990, 30);
  s += txt(10, 150, L('Layers: generation (sources) · storage 3 · ingestion 2 · transformation 4 · serving 7, 10, 15','Layer: sinh dữ liệu (nguồn) · lưu trữ 3 · nạp 2 · biến đổi 4 · phục vụ 7, 10, 15'), 'sm');
  s += txt(10, 184, L('Undercurrents: they cut across every stage','Dòng chảy ngầm: cắt ngang mọi giai đoạn'), 'lg');
  var u = [[L('Security','Bảo mật'), L('layer 17','layer 17'), '#B91C1C'], [L('Data management','Quản trị dữ liệu'), L('layers 6, 8, 9, 12','layer 6, 8, 9, 12'), '#0F766E'], [L('DataOps','DataOps'), L('layers 8, 11','layer 8, 11'), '#475569'],
           [L('Data architecture','Kiến trúc dữ liệu'), L('layers 3, 12, 18','layer 3, 12, 18'), '#7C3AED'], [L('Orchestration','Điều phối'), L('layer 5','layer 5'), '#16A34A'], [L('Software engineering','Kỹ nghệ phần mềm'), L('layers 1, 11, 20','layer 1, 11, 20'), '#2563EB']];
  u.forEach(function(x, i){
    var col = i % 3, row = Math.floor(i / 3), w = 316, xx = 10 + col * (w + 16), yy = 200 + row * 60;
    s += '<rect class="bx" x="' + xx + '" y="' + yy + '" width="' + w + '" height="48" rx="8"/><rect x="' + xx + '" y="' + yy + '" width="8" height="48" rx="4" fill="' + x[2] + '"/>' + txt(xx + 22, yy + 21, x[0], 'b') + txt(xx + 22, yy + 38, x[1], 'sm');
  });
  return svg(1000, 330, s, 'Data engineering lifecycle');
}
function parquetSVG(){
  var s = bx(10, 50, 80, 130, 'PAR1', L('magic|bytes','magic|bytes'), '#475569');
  s += '<rect class="bx2" x="110" y="20" width="380" height="190" rx="10"/>' + txt(126, 42, L('Row group 1 (about a million rows)','Row group 1 (khoảng một triệu dòng)'), 'b');
  [['user_id', 120], ['country', 238], ['amount', 356]].forEach(function(c){ s += bx(c[1], 56, 112, 140, c[0], L('column chunk|pages: dictionary,|RLE, bit-packing|min/max stats','column chunk|page: dictionary,|RLE, bit-packing|thống kê min/max'), '#1D4ED8'); });
  s += bx(510, 20, 180, 190, L('Row group 2, 3, …','Row group 2, 3, …'), L('same layout:|one column chunk|per column','cùng bố cục:|mỗi cột một|column chunk'), '#64748B', 'bx2');
  s += bx(710, 20, 190, 190, L('Footer','Footer'), L('schema|row group offsets|column statistics|(min, max, nulls)|read first','schema|offset row group|thống kê cột|(min, max, null)|đọc đầu tiên'), '#CA8A04');
  s += bx(920, 50, 70, 130, 'PAR1', L('magic|bytes','magic|bytes'), '#475569');
  s += arrow(805, 212, 805, 250) + txt(805, 268, L('a reader starts at the footer, skips row groups by statistics,','reader bắt đầu từ footer, bỏ qua row group nhờ thống kê,'), 'sm', 'middle') + txt(805, 284, L('then reads only the needed column chunks','rồi chỉ đọc các column chunk cần thiết'), 'sm', 'middle');
  return svg(1000, 300, s, 'Parquet file layout');
}

/* ================= 21. DATA ENGINEERING CONCEPTS AND MODELING THEORY ================= */
SEC(21, [
 { k:'cards', cols:3, t:L('Data engineering concepts and modeling theory','Khái niệm data engineering và lý thuyết mô hình hóa'),
   lead:L('Tools change; these ideas do not. This layer covers the lifecycle, the role, modeling theory (normalization, Inmon versus Kimball, entity-centric modeling), data assets and products, master data, and how to keep learning.','Công cụ thay đổi, các ý tưởng này thì không. Layer này gồm vòng đời, vai trò, lý thuyết mô hình hóa (chuẩn hóa, Inmon so với Kimball, entity-centric), data asset và data product, master data, và cách tiếp tục học.'),
   cards:[
    {h:L('Lifecycle','Vòng đời'), tag:'must', p:L('Generation, storage, ingestion, transformation and serving, with undercurrents that cut across all of them.','Sinh dữ liệu, lưu trữ, nạp, biến đổi và phục vụ, cùng các dòng chảy ngầm cắt ngang tất cả.')},
    {h:L('The role','Vai trò'), tag:'must', p:L('What a data engineer owns and how it differs from software and analytics engineering.','Data engineer sở hữu gì và khác kỹ sư phần mềm và analytics engineer ở đâu.')},
    {h:L('Modeling theory','Lý thuyết mô hình hóa'), tag:'must', p:L('Normalization for OLTP, dimensional models for analytics, Inmon and Kimball as two philosophies.','Chuẩn hóa cho OLTP, mô hình dimensional cho analytics, Inmon và Kimball là hai triết lý.')},
    {h:L('Entity-centric modeling','Mô hình entity-centric'), tag:'senior', p:L('Model around business entities with wide, snapshot-based tables instead of many joins.','Mô hình hóa quanh thực thể nghiệp vụ bằng bảng rộng dựa trên snapshot thay vì nhiều join.')},
    {h:L('Assets and products','Asset và product'), tag:'senior', p:L('Data assets, software-defined assets and data products with owners, contracts and SLAs.','Data asset, software-defined asset và data product có chủ sở hữu, contract và SLA.')},
    {h:L('Master data and automation','Master data và tự động hóa'), tag:'nice', p:L('Golden records and metadata-driven warehouse automation.','Golden record và tự động hóa warehouse dựa trên metadata.')}
   ],
   n:L('Use this layer to build shared vocabulary before diving into tools.','Dùng layer này để xây từ vựng chung trước khi đi vào công cụ.') },

 { k:'svg', t:L('The data engineering lifecycle and its undercurrents','Vòng đời data engineering và các dòng chảy ngầm'),
   lead:L('Five stages move data from where it is created to where it is used. Six undercurrents decide whether the whole system is safe, reliable and maintainable.','Năm giai đoạn đưa dữ liệu từ nơi sinh ra đến nơi dùng. Sáu dòng chảy ngầm quyết định cả hệ thống có an toàn, đáng tin và bảo trì được hay không.'),
   svg:lifecycleDESVG,
   cap:L('The lifecycle framing follows Fundamentals of Data Engineering by Reis and Housley. Layer numbers show where this deck covers each part.','Cách chia vòng đời theo cuốn Fundamentals of Data Engineering của Reis và Housley. Số layer cho biết deck này nói về từng phần ở đâu.'),
   n:L('Use the lifecycle as a map for any incident or design: which stage, and which undercurrent should have prevented it.','Dùng vòng đời như bản đồ cho mọi sự cố hay thiết kế: ở giai đoạn nào, và dòng chảy ngầm nào lẽ ra phải ngăn được nó.') },

 { k:'table', t:L('The role: data engineer, software engineer, analytics engineer','Vai trò: data engineer, kỹ sư phần mềm, analytics engineer'),
   lead:L('The roles overlap, but the center of gravity differs. Typical job descriptions ask for SQL, Python, one cloud, orchestration, modeling, CI/CD and communication.','Các vai trò chồng lấn nhưng trọng tâm khác nhau. Mô tả công việc điển hình yêu cầu SQL, Python, một cloud, điều phối, mô hình hóa, CI/CD và giao tiếp.'),
   head:[L('Dimension','Khía cạnh'), L('Data engineer','Data engineer'), L('Software engineer','Kỹ sư phần mềm'), L('Analytics engineer','Analytics engineer')], rows:[
   [L('Main output','Sản phẩm chính'), L('Pipelines, platforms and reliable datasets','Pipeline, nền tảng và dataset đáng tin'), L('Applications and services','Ứng dụng và dịch vụ'), L('Modeled, tested, documented datasets and metrics','Dataset và metric đã mô hình hóa, test, có tài liệu')],
   [L('What breaks silently','Cái gì hỏng âm thầm'), L('Data is wrong but jobs are green','Dữ liệu sai nhưng job vẫn xanh'), L('Usually visible errors and latency','Thường là lỗi và độ trễ nhìn thấy được'), L('Metric logic drifts between reports','Logic metric lệch giữa các báo cáo')],
   [L('State','Trạng thái'), L('Data is the state: reprocessing and backfills are normal','Dữ liệu chính là trạng thái: xử lý lại và backfill là bình thường'), L('Often stateless services with a database behind','Thường là dịch vụ không trạng thái với database phía sau'), L('Models rebuilt from raw data','Model được dựng lại từ dữ liệu thô')],
   [L('Testing','Kiểm thử'), L('Unit tests plus data tests, reconciliation, contracts','Unit test cùng test dữ liệu, đối soát, contract'), L('Unit, integration and end-to-end tests','Unit, integration và end-to-end test'), L('Data tests, unit tests on models','Test dữ liệu, unit test trên model')],
   [L('Closest consumers','Người dùng gần nhất'), L('Analysts, ML engineers, applications','Analyst, ML engineer, ứng dụng'), L('End users and other services','Người dùng cuối và dịch vụ khác'), L('Analysts and business stakeholders','Analyst và các bên liên quan nghiệp vụ')],
   [L('Typical skills','Kỹ năng điển hình'), L('SQL, Python, distributed systems, cloud, orchestration','SQL, Python, hệ thống phân tán, cloud, điều phối'), L('Languages, APIs, system design, testing','Ngôn ngữ, API, thiết kế hệ thống, kiểm thử'), L('SQL, dbt, modeling, BI, communication','SQL, dbt, mô hình hóa, BI, giao tiếp')]
  ], cap:L('A data engineer is largely a software engineer whose product is data, with extra duties around correctness, freshness and cost.','Data engineer phần lớn là kỹ sư phần mềm có sản phẩm là dữ liệu, kèm thêm trách nhiệm về tính đúng, độ mới và chi phí.'),
   n:L('Titles vary by company. Focus on the responsibilities rather than the label.','Chức danh khác nhau theo công ty. Hãy tập trung vào trách nhiệm hơn là nhãn.') },

 { k:'html', t:L('Normalization and denormalization','Chuẩn hóa và phi chuẩn hóa'),
   lead:L('Normalize to protect writes (OLTP). Denormalize to speed up reads (analytics). Know both and why.','Chuẩn hóa để bảo vệ thao tác ghi (OLTP). Phi chuẩn hóa để tăng tốc đọc (analytics). Hiểu cả hai và lý do.'),
   html:function(){
     var tb = tableHTML([L('Form','Dạng'), L('Rule','Quy tắc'), L('Problem it removes','Vấn đề nó loại bỏ')], [
      ['1NF', L('Atomic values; no repeating groups','Giá trị nguyên tử; không có nhóm lặp'), L('Lists stored in one cell','Danh sách lưu trong một ô')],
      ['2NF', L('1NF and no partial dependency on part of a composite key','1NF và không phụ thuộc một phần vào một phần của khóa ghép'), L('Attributes repeated for each part of the key','Thuộc tính lặp lại cho từng phần của khóa')],
      ['3NF', L('2NF and no transitive dependency (non-key depends on non-key)','2NF và không phụ thuộc bắc cầu (không-khóa phụ thuộc không-khóa)'), L('Update anomalies, such as changing a country name in many rows','Bất thường khi cập nhật, như đổi tên quốc gia ở nhiều dòng')],
      ['BCNF', L('Every determinant is a candidate key','Mọi determinant đều là khóa ứng viên'), L('Remaining anomalies from overlapping candidate keys','Bất thường còn lại do các khóa ứng viên chồng lấn')]
     ]);
     var cd = codeBlock({lang:'sql', title:'normalized_vs_denormalized.sql', code:`
-- Normalized (OLTP): each fact stored once, more joins
create table countries (country_id int primary key, country_name text not null);
create table customers (customer_id bigint primary key, name text, country_id int references countries(country_id));
create table orders (order_id bigint primary key, customer_id bigint references customers(customer_id),
                     ordered_at timestamp, amount numeric(10, 2));

-- Denormalized (analytics): wide and read-optimized, repeated values accepted
create table fct_orders_wide as
select o.order_id, o.ordered_at, o.amount, c.customer_id, c.name as customer_name, co.country_name
from orders o
join customers c using (customer_id)
join countries co using (country_id);`});
     var cards = '<div class="grid c2" style="margin:14px 0">' +
       cardHTML({h:X('Why normalize','Vì sao chuẩn hóa'), p:X('Updates touch one place, integrity is enforced by constraints, storage is small. Ideal for transactional systems.','Cập nhật chỉ chạm một nơi, toàn vẹn được ràng buộc ép buộc, dung lượng nhỏ. Lý tưởng cho hệ thống giao dịch.')}, true) +
       cardHTML({h:X('Why denormalize','Vì sao phi chuẩn hóa'), p:X('Fewer joins, simpler queries and faster scans on columnar engines. The cost is redundancy, so rebuild from the source of truth rather than updating in place.','Ít join hơn, query đơn giản hơn và quét nhanh hơn trên engine cột. Cái giá là dư thừa, nên hãy dựng lại từ nguồn sự thật thay vì cập nhật tại chỗ.')}, true) + '</div>';
     return tb + cards + cd;
   },
   n:L('Connect to section 12: star schemas are deliberately denormalized dimensions around a fact table.','Nối với phần 12: star schema là các dimension được phi chuẩn hóa có chủ đích quanh một bảng fact.') },

 { k:'table', t:L('Inmon versus Kimball (and Data Vault)','Inmon so với Kimball (và Data Vault)'),
   lead:L('Two classic warehouse philosophies. Many real platforms mix them: an integrated, history-preserving core with dimensional marts on top.','Hai triết lý warehouse kinh điển. Nhiều nền tảng thật kết hợp cả hai: một lõi tích hợp có lưu lịch sử với các mart dimensional phía trên.'),
   head:[L('Aspect','Khía cạnh'), L('Inmon','Inmon'), L('Kimball','Kimball'), L('Data Vault','Data Vault')], rows:[
   [L('Direction','Hướng đi'), L('Top-down: build an enterprise warehouse first','Từ trên xuống: xây warehouse doanh nghiệp trước'), L('Bottom-up: build business-process marts that share conformed dimensions','Từ dưới lên: xây mart theo quy trình nghiệp vụ dùng chung dimension conformed'), L('Integration layer first, marts later','Lớp tích hợp trước, mart sau')],
   [L('Core model','Mô hình lõi'), L('Normalized (about 3NF) enterprise model','Mô hình doanh nghiệp đã chuẩn hóa (khoảng 3NF)'), L('Star schemas of facts and dimensions','Star schema gồm fact và dimension'), L('Hubs, links and satellites','Hub, link và satellite')],
   [L('Time to first value','Thời gian ra giá trị đầu tiên'), L('Slower: heavy upfront modeling','Chậm hơn: mô hình hóa nặng từ đầu'), L('Faster: a mart per business process','Nhanh hơn: một mart cho mỗi quy trình nghiệp vụ'), L('Medium: requires automation to stay efficient','Trung bình: cần tự động hóa để hiệu quả')],
   [L('Strengths','Điểm mạnh'), L('One integrated, consistent source of truth','Một nguồn sự thật tích hợp và nhất quán'), L('Business-friendly, fast queries, BI-ready','Thân thiện nghiệp vụ, query nhanh, sẵn sàng cho BI'), L('Handles change and auditability well','Xử lý thay đổi và khả năng audit tốt')],
   [L('Weaknesses','Điểm yếu'), L('Complex and slow to deliver; marts still needed','Phức tạp và giao chậm; vẫn cần mart'), L('Needs discipline on conformed dimensions across teams','Cần kỷ luật về dimension conformed giữa các đội'), L('Many tables and joins; needs a presentation layer','Nhiều bảng và join; cần lớp trình bày')],
   [L('Best when','Phù hợp khi'), L('A central team governs a stable enterprise model','Một đội trung tâm quản trị mô hình doanh nghiệp ổn định'), L('You need analytics answers quickly in a few domains','Bạn cần câu trả lời analytics nhanh ở vài domain'), L('Many volatile sources and strict audit needs','Nhiều nguồn biến động và yêu cầu audit nghiêm ngặt')]
  ], cap:L('Descriptions are generalizations of well-known approaches; real implementations vary.','Các mô tả là khái quát hóa của các cách tiếp cận nổi tiếng; cài đặt thực tế có khác biệt.'),
   n:L('Avoid dogma: the question is which risk you are managing, delivery speed or integration consistency.','Tránh giáo điều: câu hỏi là bạn đang quản lý rủi ro nào, tốc độ giao hàng hay tính nhất quán của tích hợp.') },

 { k:'code', t:L('Entity-centric data modeling (ECM)','Mô hình hóa dữ liệu entity-centric (ECM)'),
   lead:L('Instead of forcing every question through facts and dimensions, build one wide table per business entity, refreshed as daily snapshots.','Thay vì ép mọi câu hỏi đi qua fact và dimension, dựng một bảng rộng cho mỗi thực thể nghiệp vụ, làm mới dưới dạng snapshot hằng ngày.'),
   blocks:[{lang:'sql', title:'entity_customer_daily.sql (DuckDB syntax)', code:`
create or replace table entity_customer_daily as
select
    c.customer_id,
    current_date                                              as ds,
    c.country,
    c.segment,
    count(o.order_id) filter (where o.ordered_at >= current_date - interval '30 days')  as orders_30d,
    sum(o.amount)     filter (where o.ordered_at >= current_date - interval '30 days')  as revenue_30d,
    max(o.ordered_at)                                         as last_order_at,
    date_diff('day', max(o.ordered_at)::date, current_date)   as days_since_last_order
from dim_customers c
left join fct_orders o using (customer_id)
group by all;`}],
   points:[
    {h:L('What it is','Nó là gì'), p:L('A table whose grain is one row per entity per snapshot date, with attributes and rolling metrics side by side.','Bảng có grain là một dòng cho mỗi thực thể mỗi ngày snapshot, với thuộc tính và metric cuốn chiếu cạnh nhau.')},
    {h:L('Benefits','Lợi ích'), tag:'senior', p:L('Fewer joins for analysts, easy history through snapshots, good fit for features and reverse ETL.','Ít join hơn cho analyst, lịch sử dễ có qua snapshot, hợp với feature và reverse ETL.')},
    {h:L('Trade-offs','Đánh đổi'), p:L('Wide tables, storage per snapshot, and metric definitions must be governed or they diverge.','Bảng rộng, tốn dung lượng cho mỗi snapshot, và định nghĩa metric phải được quản trị nếu không sẽ lệch.')},
    {h:L('Source of the idea','Nguồn gốc ý tưởng'), tag:'senior', p:L('Popularized by Maxime Beauchemin’s writing on entity-centric modeling. Treat it as a pattern to evaluate, not a replacement for dimensional modeling.','Được phổ biến qua bài viết của Maxime Beauchemin về mô hình entity-centric. Hãy coi đây là một mẫu cần đánh giá, không phải thay thế cho mô hình dimensional.')}
   ],
   n:L('Show that this complements the star schema: facts remain the system of record, the entity table is a convenient, derived serving layer.','Cho thấy cách này bổ sung cho star schema: fact vẫn là nguồn ghi nhận, bảng entity là lớp phục vụ dẫn xuất tiện dụng.') },

 { k:'code', t:L('Data assets, software-defined assets and data products','Data asset, software-defined asset và data product'),
   lead:L('A data asset is a dataset with value and an owner. A data product adds a contract, an SLA, documentation and discoverability.','Data asset là dataset có giá trị và có chủ sở hữu. Data product thêm contract, SLA, tài liệu và khả năng tìm thấy.'),
   blocks:[{lang:'yaml', title:'customer_360.data-product.yaml (illustrative)', code:`
data_product:
  name: customer_360
  domain: sales
  owner: team-sales-data@example.com
  description: Curated customer attributes and 30-day behaviour.
  output_ports:
    - name: customer_daily
      kind: table
      location: lake.gold.customer_daily
      schema_contract: contracts/customer_daily.contract.yml
  sla:
    freshness: 6h
    availability: "99.5%"
  quality_checks:
    - unique(customer_id, ds)
    - not_null(customer_id)
    - freshness(ds) < 1d
  access:
    classification: confidential
    approval: data-owner
  lineage:
    upstream: [lake.silver.customers, lake.silver.orders]`}],
   points:[
    {h:L('Asset','Asset'), p:L('Anything stored that people rely on: table, file, model, dashboard, feature set.','Bất cứ thứ gì được lưu mà con người dựa vào: bảng, file, model, dashboard, feature set.')},
    {h:L('Software-defined asset','Software-defined asset'), tag:'senior', p:L('Declared in code with its dependencies and checks, so the orchestrator knows what exists and how fresh it is (as in Dagster).','Được khai báo bằng code cùng phụ thuộc và kiểm tra, để orchestrator biết cái gì tồn tại và mới đến đâu (như trong Dagster).')},
    {h:L('Data product','Data product'), tag:'senior', p:L('An asset treated as a product: named owner, output ports, contract, SLA, access rules and lineage.','Một asset được coi như sản phẩm: chủ sở hữu có tên, cổng đầu ra, contract, SLA, quy tắc truy cập và lineage.')},
    {h:L('Data mesh link','Liên hệ với data mesh'), p:L('Data mesh makes domain teams responsible for their data products on a shared platform with federated governance.','Data mesh giao cho các đội domain trách nhiệm với data product của mình trên nền tảng chung với quản trị liên kết.')}
   ],
   n:L('The descriptor format is a sketch. Several open specifications exist for data products and contracts; choose one deliberately.','Định dạng mô tả chỉ là bản phác. Có nhiều đặc tả mở cho data product và contract; hãy chọn một cái có chủ đích.') },

 { k:'code', t:L('Master data management and warehouse automation','Master data management và tự động hóa warehouse'),
   lead:L('MDM builds one trusted record per business entity across systems. Warehouse automation generates repetitive modeling code from metadata.','MDM tạo một bản ghi đáng tin cho mỗi thực thể nghiệp vụ xuyên các hệ thống. Tự động hóa warehouse sinh code mô hình hóa lặp lại từ metadata.'),
   blocks:[{lang:'sql', title:'golden_record.sql (survivorship by source priority)', code:`
with ranked as (
    select
        lower(email) as email_key,
        full_name, phone, source_system, updated_at,
        row_number() over (
            partition by lower(email)
            order by case source_system when 'crm' then 1 when 'billing' then 2 else 3 end,
                     updated_at desc
        ) as rn
    from staging.customer_candidates
)
select email_key as email, full_name, phone
from ranked
where rn = 1;`}],
   points:[
    {h:L('Match and merge','Khớp và gộp'), p:L('Decide when two records are the same entity using exact keys, fuzzy matching or rules, and keep the evidence.','Quyết định khi nào hai bản ghi là cùng một thực thể bằng khóa chính xác, khớp mờ hoặc quy tắc, và giữ lại bằng chứng.')},
    {h:L('Survivorship','Survivorship'), tag:'senior', p:L('Rules that pick the winning value per attribute: source priority, recency or completeness.','Quy tắc chọn giá trị thắng cho từng thuộc tính: ưu tiên nguồn, độ mới hoặc độ đầy đủ.')},
    {h:L('Stewardship','Stewardship'), p:L('People review uncertain matches and own reference data such as country and currency codes.','Con người xem xét các khớp không chắc và sở hữu dữ liệu tham chiếu như mã quốc gia và tiền tệ.')},
    {h:L('Warehouse automation','Tự động hóa warehouse'), tag:'nice', p:L('Metadata-driven generators (commercial tools or dbt packages such as AutomateDV) produce staging, hubs, links and satellites consistently. Review generated code like any other.','Bộ sinh dựa trên metadata (công cụ thương mại hoặc package dbt như AutomateDV) tạo staging, hub, link và satellite nhất quán. Hãy review code sinh ra như mọi code khác.')}
   ],
   n:L('Golden records need a reversible audit trail: which sources fed the winning value, and why.','Golden record cần dấu vết audit đảo ngược được: nguồn nào cho giá trị thắng, và vì sao.') },

 { k:'cards', cols:3, t:L('Learning path, resources and open-source projects','Lộ trình học, tài nguyên và dự án mã nguồn mở'),
   lead:L('Learn by building. Read source and docs of real projects, and keep a portfolio of labs from this deck.','Học bằng cách xây. Đọc source và tài liệu của các dự án thật, và giữ một portfolio gồm các lab từ deck này.'),
   cards:[
    {h:L('Suggested order','Thứ tự gợi ý'), tag:'must', list:[L('SQL and a relational database','SQL và một database quan hệ'), L('Python and testing','Python và kiểm thử'), L('Data modeling','Mô hình hóa dữ liệu'), L('One warehouse plus dbt','Một warehouse cùng dbt'), L('Orchestration','Điều phối'), L('Streaming and lakehouse','Streaming và lakehouse'), L('Platform, security and cost','Nền tảng, bảo mật và chi phí')]},
    {h:L('Books (verify current editions)','Sách (kiểm tra ấn bản hiện hành)'), tag:'must', list:['Fundamentals of Data Engineering (Reis, Housley)','Designing Data-Intensive Applications (Kleppmann)','The Data Warehouse Toolkit (Kimball, Ross)','Building the Data Warehouse (Inmon)','Data Engineering Design Patterns (Konieczny)']},
    {h:L('Newsletters and podcasts','Newsletter và podcast'), tag:'nice', list:['Data Engineering Podcast','Data Engineering Weekly',L('Vendor engineering blogs and conference talks','Blog kỹ thuật của nhà cung cấp và các buổi nói chuyện hội nghị')]},
    {h:L('Open-source projects to read','Dự án mã nguồn mở nên đọc'), tag:'nice', list:['Apache Airflow, Dagster, Kestra','dbt Core, SQLMesh','Apache Iceberg, Arrow, DataFusion','DuckDB, Trino, Spark, Flink, Kafka']},
    {h:L('Practice habits','Thói quen luyện tập'), tag:'senior', list:[L('Write an ADR for every project','Viết ADR cho mỗi dự án'), L('Run a failure drill monthly','Chạy diễn tập sự cố hằng tháng'), L('Explain a system to a colleague','Giải thích một hệ thống cho đồng nghiệp')]},
    {h:L('Community','Cộng đồng'), tag:'nice', p:L('Follow authors and maintainers of the tools you use, join their community channels, and read their release notes.','Theo dõi tác giả và maintainer của các công cụ bạn dùng, tham gia kênh cộng đồng và đọc release note của họ.')}
   ],
   n:L('Titles and editions change: confirm them before recommending. The suggested order is one path, not the only one.','Tên sách và ấn bản thay đổi: hãy xác nhận trước khi giới thiệu. Thứ tự gợi ý chỉ là một con đường, không phải duy nhất.') }
]);

/* ================= 22. DATA FORMATS, COLUMNAR ENGINES, QUERY ENGINES ================= */
SEC(22, [
 { k:'cards', cols:3, t:L('Data formats, columnar engines and query engines','Định dạng dữ liệu, engine cột và query engine'),
   lead:L('Modern analytics is fast because of how data is laid out and how engines read it. This layer explains file formats, in-memory columnar data, query engines, push-downs, OLAP systems and the open, composable stack.','Analytics hiện đại nhanh nhờ cách bố trí dữ liệu và cách engine đọc nó. Layer này giải thích định dạng file, dữ liệu cột trong bộ nhớ, query engine, push-down, hệ OLAP và stack mở, có thể ghép nối.'),
   cards:[
    {h:L('File formats','Định dạng file'), tag:'must', p:L('Parquet, ORC, Avro: row groups, pages, encodings and statistics.','Parquet, ORC, Avro: row group, page, encoding và thống kê.')},
    {h:L('Arrow and in-memory columns','Arrow và cột trong bộ nhớ'), tag:'must', p:L('A shared columnar memory format that lets tools exchange data without copying.','Định dạng bộ nhớ cột dùng chung giúp các công cụ trao đổi dữ liệu mà không sao chép.')},
    {h:L('Query engines','Query engine'), tag:'must', p:L('DuckDB, DataFusion, Trino, Spark SQL: parse, optimize, execute, vectorize.','DuckDB, DataFusion, Trino, Spark SQL: parse, tối ưu, thực thi, vector hóa.')},
    {h:L('Push-downs','Push-down'), tag:'senior', p:L('Moving filters, projections and aggregates to where the data lives to read less.','Đẩy bộ lọc, phép chiếu và tổng hợp tới nơi dữ liệu nằm để đọc ít hơn.')},
    {h:L('Modern OLAP','OLAP hiện đại'), tag:'senior', p:L('ClickHouse, Druid, Pinot, StarRocks and the replacement of classic OLAP cubes.','ClickHouse, Druid, Pinot, StarRocks và việc thay thế OLAP cube cổ điển.')},
    {h:L('Open and declarative stacks','Stack mở và khai báo'), tag:'nice', p:L('Composable open components and pipelines described as configuration.','Các thành phần mở ghép nối được và pipeline mô tả bằng cấu hình.')}
   ],
   n:L('This layer explains why a query scans little data in one layout and everything in another.','Layer này giải thích vì sao một query quét rất ít dữ liệu ở bố cục này và quét tất cả ở bố cục khác.') },

 { k:'html', t:L('Parquet and other data lake file formats','Parquet và các định dạng file data lake khác'),
   lead:L('Columnar files let engines read only the columns and row groups a query needs.','File dạng cột cho phép engine chỉ đọc các cột và row group mà query cần.'),
   html:function(){
     var tb = tableHTML([L('Format','Định dạng'), L('Layout','Bố cục'), L('Best for','Phù hợp nhất'), L('Schema evolution','Tiến hóa schema'), L('Notes','Ghi chú')], [
      ['Parquet', L('Columnar: row groups, column chunks, pages, footer','Cột: row group, column chunk, page, footer'), L('Analytics and lakehouse tables','Analytics và bảng lakehouse'), L('Add columns; rename needs care','Thêm cột; đổi tên cần cẩn thận'), L('Dictionary, RLE and delta encodings; min/max statistics; wide engine support','Encoding dictionary, RLE và delta; thống kê min/max; được nhiều engine hỗ trợ')],
      ['ORC', L('Columnar: stripes with indexes','Cột: stripe kèm chỉ mục'), L('Hive and Hadoop ecosystems','Hệ sinh thái Hive và Hadoop'), L('Supported','Được hỗ trợ'), L('Strong compression; ACID support in Hive','Nén tốt; hỗ trợ ACID trong Hive')],
      ['Avro', L('Row-based with embedded schema','Theo dòng với schema nhúng'), L('Streaming and Kafka records','Streaming và record của Kafka'), L('Strong, with schema resolution rules','Mạnh, có quy tắc phân giải schema'), L('Good for writes and whole-row reads; poor for column scans','Tốt cho ghi và đọc cả dòng; kém cho quét cột')],
      ['Arrow IPC / Feather', L('Columnar in-memory layout on disk','Bố cục cột trong bộ nhớ lưu ra đĩa'), L('Fast interchange between tools','Trao đổi nhanh giữa các công cụ'), L('Limited','Hạn chế'), L('Optimized for speed over size','Tối ưu tốc độ hơn kích thước')],
      ['CSV / JSON', L('Text, row-based','Văn bản, theo dòng'), L('Interchange and human readability','Trao đổi và dễ đọc với con người'), L('None or ad hoc','Không có hoặc tùy biến'), L('Large, slow to parse, types are guessed','Lớn, parse chậm, kiểu dữ liệu bị đoán')]
     ]);
     return '<div class="fig">' + parquetSVG() + '</div><div style="margin-top:14px">' + tb + '</div>';
   },
   n:L('Parquet’s footer is the key: a reader fetches it first, then uses statistics to skip row groups. Sorting data on common filter columns makes those statistics far more selective.','Footer của Parquet là mấu chốt: reader lấy nó trước rồi dùng thống kê để bỏ qua row group. Sắp xếp dữ liệu theo các cột lọc thường dùng làm các thống kê đó chọn lọc hơn nhiều.') },

 { k:'code', t:L('Writing, inspecting and reading Parquet','Ghi, kiểm tra và đọc Parquet'),
   lead:L('See the layout for yourself: row groups, statistics and column projection.','Tự nhìn thấy bố cục: row group, thống kê và phép chiếu cột.'),
   blocks:[{lang:'python', title:'parquet_layout.py (pyarrow)', code:`
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({
    "user_id": pa.array(range(1_000_000), type=pa.int64()),
    "country": pa.array(["VN", "SG", "US", "DE"] * 250_000),
    "amount": pa.array([float(i % 500) for i in range(1_000_000)]),
}).sort_by("country")                      # sorting makes min/max statistics selective

pq.write_table(table, "events.parquet", compression="zstd", row_group_size=250_000, use_dictionary=True)

pf = pq.ParquetFile("events.parquet")
print(pf.metadata.num_row_groups, pf.schema_arrow)
stats = pf.metadata.row_group(0).column(1).statistics
print(stats.min, stats.max, stats.null_count)          # used to skip row groups

# Read only one column and push a filter down to the reader
only_country = pq.read_table("events.parquet", columns=["amount"], filters=[("country", "=", "VN")])
print(only_country.num_rows)`}],
   points:[
    {h:L('Row group size','Kích thước row group'), p:L('Larger groups compress and scan better; smaller groups skip more precisely and use less memory.','Group lớn nén và quét tốt hơn; group nhỏ bỏ qua chính xác hơn và tốn ít bộ nhớ hơn.')},
    {h:L('Sort and cluster','Sắp xếp và gom cụm'), tag:'senior', p:L('Order data by frequently filtered columns so statistics can prune whole row groups.','Sắp xếp dữ liệu theo các cột thường lọc để thống kê loại bỏ được cả row group.')},
    {h:L('Avoid tiny files','Tránh file nhỏ'), p:L('Each file has a footer and an open cost. Many small files slow every engine.','Mỗi file có một footer và chi phí mở. Nhiều file nhỏ làm chậm mọi engine.')},
    {h:L('Types and nulls','Kiểu và null'), tag:'senior', p:L('Choose precise types (decimal, timestamp with zone). Wrong types silently inflate size and cost.','Chọn kiểu chính xác (decimal, timestamp có múi giờ). Sai kiểu âm thầm làm tăng kích thước và chi phí.')}
   ],
   n:L('Run the script and compare file size and read time with a CSV copy of the same data.','Chạy script và so sánh kích thước file và thời gian đọc với bản CSV của cùng dữ liệu.') },

 { k:'html', t:L('Apache Arrow, DataFusion, DuckDB and VertiPaq','Apache Arrow, DataFusion, DuckDB và VertiPaq'),
   lead:L('A shared columnar memory format and embeddable engines changed how tools cooperate.','Một định dạng bộ nhớ cột dùng chung và các engine nhúng được đã thay đổi cách các công cụ phối hợp.'),
   html:function(){
     var tb = tableHTML([L('Project','Dự án'), L('What it is','Nó là gì'), L('Role','Vai trò'), L('Notes','Ghi chú')], [
      ['Apache Arrow', L('A language-independent columnar in-memory format and libraries','Định dạng cột trong bộ nhớ độc lập ngôn ngữ cùng các thư viện'), L('Zero-copy exchange between engines, dataframes and databases; IPC, Flight and ADBC for transport','Trao đổi zero-copy giữa engine, dataframe và database; IPC, Flight và ADBC để truyền tải'), L('A format and toolkit, not a database','Là định dạng và bộ công cụ, không phải database')],
      ['DataFusion', L('An extensible query engine written in Rust on Arrow','Query engine mở rộng được viết bằng Rust trên Arrow'), L('Embeddable SQL engine for building databases and tools','Engine SQL nhúng được để xây database và công cụ'), L('Building block, with a Python binding for direct use','Là khối xây dựng, có binding Python để dùng trực tiếp')],
      ['DuckDB', L('In-process analytical database','Database phân tích chạy trong tiến trình'), L('Local analytics on Parquet, CSV and Arrow; prototyping and testing','Analytics cục bộ trên Parquet, CSV và Arrow; tạo mẫu và test'), L('Single node; vectorized execution','Một node; thực thi vector hóa')],
      ['VertiPaq', L('The in-memory columnar engine of Power BI and tabular models','Engine cột trong bộ nhớ của Power BI và tabular model'), L('Fast analytics via dictionary and run-length encoding and compression','Analytics nhanh nhờ encoding dictionary, run-length và nén'), L('Proprietary; data is compressed and held in memory','Độc quyền; dữ liệu được nén và giữ trong bộ nhớ')]
     ]);
     var cd = codeBlock({lang:'python', title:'arrow_duckdb_datafusion.py', code:`
import duckdb
import pyarrow.dataset as ds
from datafusion import SessionContext

# DuckDB queries an Arrow dataset directly, without copying it into the database
dataset = ds.dataset("lake/events/", format="parquet")
con = duckdb.connect()
con.register("events", dataset)
result = con.sql("select country, count(*) as n from events group by country").arrow()
print(result)                                        # an Arrow table

# DataFusion reads the same files with its own engine
ctx = SessionContext()
ctx.register_parquet("events", "lake/events/")
print(ctx.sql("select country, count(*) as n from events group by country").to_pandas())`});
     return tb + '<div style="margin-top:14px">' + cd + '</div>';
   },
   n:L('Arrow is why modern tools interoperate cheaply: the same in-memory layout is understood by many engines. VertiPaq is the same idea inside the Microsoft BI stack.','Arrow là lý do các công cụ hiện đại phối hợp với chi phí thấp: cùng một bố cục bộ nhớ được nhiều engine hiểu. VertiPaq là cùng ý tưởng bên trong stack BI của Microsoft.') },

 { k:'code', t:L('Query engines and push-downs','Query engine và push-down'),
   lead:L('A query engine parses, optimizes and executes. The cheapest data to process is the data you never read.','Query engine parse, tối ưu và thực thi. Dữ liệu rẻ nhất để xử lý là dữ liệu bạn không bao giờ đọc.'),
   blocks:[
    {lang:'sql', title:'see_pushdown.sql (DuckDB)', code:`
EXPLAIN
SELECT country, count(*) AS n
FROM read_parquet('events/*.parquet')
WHERE event_date >= DATE '2026-10-01' AND country = 'VN'
GROUP BY country;
-- In the scan operator, look for the filters and the projected columns.
-- If the filter appears in a separate FILTER node above the scan, it was not pushed down.`},
    {lang:'text', title:'push_down_types.txt', code:`
Predicate push-down    filter evaluated in the scan, skipping row groups, partitions or files
Projection push-down   only the referenced columns are read
Aggregate push-down    the source computes count, sum, min, max and returns less data
Limit / top-N          the source stops early
Partition pruning      whole partitions are skipped from the file path or metadata
Dynamic filtering      a join builds a filter from one side and applies it to the scan of the other`}
   ],
   points:[
    {h:L('Pipeline','Pipeline'), p:L('Parse, bind, logical optimization, physical planning, then vectorized or compiled execution.','Parse, bind, tối ưu logic, lập kế hoạch vật lý, rồi thực thi vector hóa hoặc compile.')},
    {h:L('Vectorized execution','Thực thi vector hóa'), tag:'senior', p:L('Operators process batches of values at a time, using CPU caches and SIMD effectively.','Operator xử lý từng lô giá trị, dùng hiệu quả cache CPU và SIMD.')},
    {h:L('Why pushdown fails','Vì sao push-down thất bại'), p:L('Wrapping a column in a function, implicit casts, or UDFs can stop the engine from pushing a filter.','Bọc một cột trong hàm, ép kiểu ngầm hoặc UDF có thể ngăn engine đẩy bộ lọc xuống.')},
    {h:L('Verify, do not assume','Hãy kiểm chứng, đừng giả định'), tag:'senior', p:L('Use EXPLAIN to confirm what was pushed down in your engine and connector.','Dùng EXPLAIN để xác nhận cái gì đã được đẩy xuống trong engine và connector của bạn.')}
   ],
   n:L('Output format of EXPLAIN differs between engines. The learning goal is to find where the filter is applied.','Định dạng output của EXPLAIN khác nhau giữa các engine. Mục tiêu học là tìm ra bộ lọc được áp dụng ở đâu.') },

 { k:'code', t:L('Modern OLAP systems and the end of the classic OLAP cube','OLAP hiện đại và sự kết thúc của OLAP cube cổ điển'),
   lead:L('Fast columnar engines plus pre-aggregation and a semantic layer replace many traditional cubes.','Engine cột nhanh cùng pre-aggregation và semantic layer thay thế nhiều cube truyền thống.'),
   blocks:[
    {lang:'sql', title:'clickhouse_events.sql (ClickHouse)', code:`
CREATE TABLE events
(
    event_date  Date,
    user_id     UInt64,
    country     LowCardinality(String),
    event_name  LowCardinality(String),
    amount      Decimal(10, 2)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (country, event_date, user_id);`},
    {lang:'yaml', title:'cube_preaggregation.yml (excerpt)', code:`
cubes:
  - name: orders
    sql_table: analytics.marts.fct_orders
    pre_aggregations:
      - name: daily_revenue
        measures: [CUBE.revenue]
        dimensions: [CUBE.country]
        time_dimension: CUBE.ordered_at
        granularity: day
        refresh_key:
          every: 1 hour`}
   ],
   points:[
    {h:L('ClickHouse','ClickHouse'), p:L('Columnar store with MergeTree tables sorted by a key; strong for fast aggregations on event data.','Kho dạng cột với bảng MergeTree sắp xếp theo khóa; mạnh cho tổng hợp nhanh trên dữ liệu sự kiện.')},
    {h:L('Druid, Pinot, StarRocks','Druid, Pinot, StarRocks'), p:L('Built for low-latency, high-concurrency, user-facing analytics, often on streaming data.','Xây cho analytics hướng người dùng với độ trễ thấp, đồng thời cao, thường trên dữ liệu streaming.')},
    {h:L('Classic cubes','Cube cổ điển'), tag:'senior', p:L('Precomputed multidimensional structures with their own query language. Maintenance and rigidity drove the shift away.','Cấu trúc đa chiều tính trước với ngôn ngữ truy vấn riêng. Chi phí bảo trì và sự cứng nhắc đã thúc đẩy việc rời bỏ.')},
    {h:L('Replacement pattern','Mẫu thay thế'), tag:'senior', p:L('Columnar engine, materialized views or pre-aggregations for hot queries, and a semantic layer for consistent metrics.','Engine cột, materialized view hoặc pre-aggregation cho query nóng, và semantic layer để metric nhất quán.')}
   ],
   n:L('Which system to choose depends on concurrency, latency, freshness and the team’s skills. Check each project’s documentation for current features.','Chọn hệ thống nào phụ thuộc đồng thời, độ trễ, độ mới và kỹ năng của đội. Hãy xem tài liệu từng dự án để biết tính năng hiện tại.') },

 { k:'table', t:L('Open data stack and declarative data stack','Open data stack và declarative data stack'),
   head:[L('Idea','Ý tưởng'), L('Meaning','Ý nghĩa'), L('Examples','Ví dụ'), L('Trade-off','Đánh đổi')], rows:[
   [L('Open formats','Định dạng mở'), L('Data stored in documented formats any engine can read','Dữ liệu lưu ở định dạng có tài liệu mà mọi engine đọc được'), 'Parquet, Iceberg, Delta, Hudi', L('You own file layout and maintenance','Bạn tự lo bố cục file và bảo trì')],
   [L('Open catalogs and protocols','Catalog và giao thức mở'), L('Standard APIs for table metadata and data transfer','API chuẩn cho metadata bảng và truyền dữ liệu'), L('Iceberg REST catalog, Arrow Flight, OpenLineage','Iceberg REST catalog, Arrow Flight, OpenLineage'), L('Standards evolve and tools implement them unevenly','Chuẩn phát triển và công cụ cài đặt không đồng đều')],
   [L('Composable stack','Stack ghép nối'), L('Choose best components and connect them (the open data stack)','Chọn thành phần tốt nhất và nối chúng (open data stack)'), L('DuckDB, Arrow, Iceberg, dbt, Dagster, Superset','DuckDB, Arrow, Iceberg, dbt, Dagster, Superset'), L('More integration work and more owners','Nhiều việc tích hợp hơn và nhiều chủ sở hữu hơn')],
   [L('Declarative stack','Stack khai báo'), L('Describe the desired result in configuration; the tool works out how','Mô tả kết quả mong muốn trong cấu hình; công cụ tự tìm cách'), L('dbt and SQLMesh models, Kestra YAML flows, Dagster assets, Terraform','Model dbt và SQLMesh, flow YAML của Kestra, asset Dagster, Terraform'), L('Less control over execution; debugging needs the compiled plan','Ít kiểm soát việc thực thi; debug cần xem plan đã compile')],
   [L('Vendor-managed suite','Bộ do nhà cung cấp quản lý'), L('One platform provides most components','Một nền tảng cung cấp phần lớn thành phần'), L('Snowflake, Databricks, Fabric, BigQuery','Snowflake, Databricks, Fabric, BigQuery'), L('Faster start, higher lock-in risk','Khởi đầu nhanh hơn, rủi ro khóa chặt cao hơn')]
  ], cap:L('Neither extreme is right for everyone. Decide with a decision matrix and an exit plan.','Không cực nào đúng cho mọi người. Hãy quyết định bằng ma trận quyết định và một kế hoạch rút lui.'),
   n:L('Connect back to the decision matrices: “open” reduces lock-in but moves operational responsibility to you.','Nối lại với các ma trận quyết định: “mở” giảm khóa chặt nhưng chuyển trách nhiệm vận hành sang bạn.') }
]);

/* ================= 23. PROCESSING PARADIGMS AND ANALYTICS SERVING ================= */
SEC(23, [
 { k:'cards', cols:3, t:L('Processing paradigms and analytics serving','Mô hình xử lý và phục vụ analytics'),
   lead:L('How you structure processing (ETL or ELT, functional, declarative, batch or streaming) and how you serve results (SQL, metrics, APIs) determine how maintainable the platform is.','Cách bạn cấu trúc xử lý (ETL hay ELT, functional, declarative, batch hay streaming) và cách bạn phục vụ kết quả (SQL, metric, API) quyết định nền tảng bảo trì dễ đến đâu.'),
   cards:[
    {h:L('ETL versus ELT','ETL so với ELT'), tag:'must', p:L('Where transformation happens, and why ELT became the default.','Nơi phép biến đổi diễn ra, và vì sao ELT trở thành mặc định.')},
    {h:L('Functional data engineering','Functional data engineering'), tag:'must', p:L('Pure, idempotent tasks on immutable partitions.','Task thuần, idempotent trên partition bất biến.')},
    {h:L('Declarative versus imperative','Declarative so với imperative'), tag:'senior', p:L('Describe what you want or script how to get it.','Mô tả thứ bạn muốn hoặc viết kịch bản cách đạt được.')},
    {h:L('Extending SQL','Mở rộng SQL'), tag:'senior', p:L('Pivot, QUALIFY, macros, UDFs and semantic SQL for metrics.','Pivot, QUALIFY, macro, UDF và semantic SQL cho metric.')},
    {h:L('Lambda and Kappa','Lambda và Kappa'), tag:'senior', p:L('Combining batch and streaming without duplicating logic.','Kết hợp batch và streaming mà không nhân đôi logic.')},
    {h:L('Serving and tooling','Phục vụ và công cụ'), tag:'nice', p:L('Analytics APIs, personalized APIs and the engineer’s CLI toolkit.','API analytics, API cá nhân hóa và bộ công cụ CLI của engineer.')}
   ],
   n:L('Most of these are design principles that outlive any particular tool.','Phần lớn là nguyên lý thiết kế sống lâu hơn bất kỳ công cụ cụ thể nào.') },

 { k:'table', t:L('ETL versus ELT in depth','ETL so với ELT một cách sâu hơn'),
   head:[L('Question','Câu hỏi'), L('ETL (transform before loading)','ETL (biến đổi trước khi nạp)'), L('ELT (load, then transform in the warehouse)','ELT (nạp, rồi biến đổi trong warehouse)')], rows:[
   [L('Where compute runs','Compute chạy ở đâu'), L('In an external engine or server','Trong engine hoặc máy chủ bên ngoài'), L('Inside the warehouse or lakehouse','Bên trong warehouse hoặc lakehouse')],
   [L('Raw data kept','Có giữ dữ liệu thô không'), L('Often not, only transformed output','Thường không, chỉ giữ kết quả đã biến đổi'), L('Yes: reprocess without re-extracting','Có: xử lý lại mà không cần extract lại')],
   [L('Flexibility','Linh hoạt'), L('Changes need pipeline redeployment','Thay đổi cần deploy lại pipeline'), L('Change SQL models and rebuild','Đổi model SQL và dựng lại')],
   [L('Sensitive data','Dữ liệu nhạy cảm'), L('Can mask or drop PII before it lands','Có thể che hoặc bỏ PII trước khi hạ cánh'), L('Needs controls on the raw zone','Cần kiểm soát trên vùng raw')],
   [L('Cost profile','Hồ sơ chi phí'), L('Fixed servers, scaling by hand','Máy chủ cố định, mở rộng thủ công'), L('Elastic warehouse compute, watch scan costs','Compute warehouse co giãn, chú ý chi phí quét')],
   [L('Still the better choice when','Vẫn là lựa chọn tốt hơn khi'), L('Regulation forbids landing raw data, or tiny data must be reshaped in flight','Quy định cấm hạ cánh dữ liệu thô, hoặc dữ liệu nhỏ cần định hình lại khi đang chuyển'), L('Most analytics workloads on modern warehouses','Phần lớn workload analytics trên warehouse hiện đại')]
  ], cap:L('A hybrid is common: light, lawful cleanup on the way in (ETLT), then heavy modeling in the warehouse.','Kết hợp là phổ biến: làm sạch nhẹ và hợp lệ khi vào (ETLT), rồi mô hình hóa nặng trong warehouse.'),
   n:L('Avoid the slogan. State the constraint (privacy, latency, cost) that decides the answer.','Tránh khẩu hiệu. Nêu ràng buộc (quyền riêng tư, độ trễ, chi phí) quyết định câu trả lời.') },

 { k:'code', t:L('Functional data engineering and idempotency','Functional data engineering và idempotency'),
   lead:L('Treat pipelines like pure functions: same inputs, same outputs, no hidden side effects. Rerunning must be safe.','Coi pipeline như hàm thuần: cùng đầu vào, cùng đầu ra, không tác dụng phụ ẩn. Chạy lại phải an toàn.'),
   blocks:[
    {lang:'python', title:'pure_task.py', code:`
import duckdb


def build_daily_revenue(con: duckdb.DuckDBPyConnection, ds: str) -> None:
    """Pure with respect to its inputs: the result depends only on the source
    partition for ds, and the target partition is fully replaced."""
    con.execute("delete from marts.daily_revenue where ds = ?", [ds])
    con.execute(
        """
        insert into marts.daily_revenue
        select ?::date as ds, country, sum(amount) as revenue
        from raw.orders
        where order_date = ?::date
        group by country
        """,
        [ds, ds],
    )`},
    {lang:'sql', title:'overwrite_partition.sql', code:`
-- Replace exactly one partition; rerunning produces the same result
INSERT OVERWRITE TABLE marts.daily_revenue PARTITION (ds = '2026-11-09')
SELECT country, SUM(amount) AS revenue
FROM raw.orders
WHERE order_date = DATE '2026-11-09'
GROUP BY country;`}
   ],
   points:[
    {h:L('Principles','Nguyên tắc'), p:L('Immutable inputs, partitioned outputs, deterministic transformations, no dependence on the current time or hidden state.','Đầu vào bất biến, đầu ra chia partition, biến đổi tất định, không phụ thuộc thời gian hiện tại hay trạng thái ẩn.')},
    {h:L('Idempotent writes','Ghi idempotent'), tag:'senior', p:L('Overwrite a partition or merge by key. Never append blindly on retry.','Ghi đè một partition hoặc merge theo khóa. Không bao giờ append mù quáng khi retry.')},
    {h:L('Parameterize by logical date','Tham số hóa theo logical date'), p:L('Use the data’s date, not `now()`, so backfills reproduce history.','Dùng ngày của dữ liệu, không dùng `now()`, để backfill tái hiện lịch sử.')},
    {h:L('Source of the idea','Nguồn gốc ý tưởng'), tag:'senior', p:L('Popularized by Maxime Beauchemin’s article on functional data engineering. The overwrite syntax differs by engine.','Được phổ biến qua bài của Maxime Beauchemin về functional data engineering. Cú pháp ghi đè khác nhau theo engine.')}
   ],
   n:L('Tie to section 18: idempotency is what turns at-least-once delivery into correct results.','Nối với phần 18: idempotency là thứ biến giao nhận at-least-once thành kết quả đúng.') },

 { k:'table', t:L('Declarative versus imperative','Declarative so với imperative'),
   head:[L('Aspect','Khía cạnh'), L('Declarative: describe the result','Declarative: mô tả kết quả'), L('Imperative: script the steps','Imperative: viết kịch bản các bước')], rows:[
   [L('You write','Bạn viết'), L('A SELECT model, a YAML flow, an asset or a Terraform resource','Model SELECT, flow YAML, asset hoặc resource Terraform'), L('A Python or shell script with loops and calls','Script Python hoặc shell có vòng lặp và lời gọi')],
   [L('The tool decides','Công cụ quyết định'), L('Order, parallelism, how to create or update the object','Thứ tự, song song, cách tạo hoặc cập nhật đối tượng'), L('Nothing: every step is yours','Không gì cả: mọi bước đều của bạn')],
   [L('Examples','Ví dụ'), 'dbt, SQLMesh, Kestra, Dagster assets, Terraform, Kubernetes manifests', L('Custom Python ETL, Airflow PythonOperator tasks, cron scripts','ETL Python tự viết, task Airflow PythonOperator, script cron')],
   [L('Strengths','Điểm mạnh'), L('Reviewable, repeatable, state-aware, easier to reason about','Review được, lặp lại được, nhận biết trạng thái, dễ suy luận'), L('Full control, handles unusual logic and APIs','Kiểm soát đầy đủ, xử lý logic và API bất thường')],
   [L('Weaknesses','Điểm yếu'), L('Less control; debugging needs the generated plan','Ít kiểm soát; debug cần xem plan được sinh ra'), L('Easy to create hidden state and non-idempotent steps','Dễ tạo trạng thái ẩn và bước không idempotent')],
   [L('Rule of thumb','Quy tắc ngón tay cái'), L('Default for transformations and infrastructure','Mặc định cho biến đổi và hạ tầng'), L('Use at the edges: extraction, APIs and special cases, wrapped in idempotent functions','Dùng ở rìa: extract, API và ca đặc biệt, bọc trong hàm idempotent')]
  ], cap:L('Most mature platforms are declarative in the middle and imperative at the edges.','Hầu hết nền tảng trưởng thành là declarative ở giữa và imperative ở rìa.'),
   n:L('Show the same transformation as a dbt model and as a Python loop to make the contrast concrete.','Cho xem cùng một phép biến đổi dưới dạng model dbt và vòng lặp Python để làm sự tương phản cụ thể.') },

 { k:'code', t:L('Extending SQL for analytics: pivot, QUALIFY, macros and semantic SQL','Mở rộng SQL cho analytics: pivot, QUALIFY, macro và semantic SQL'),
   lead:L('Standard SQL is only the start. Engines add syntax for common analytics tasks, and semantic layers add a metric-aware SQL.','SQL chuẩn chỉ là khởi đầu. Engine thêm cú pháp cho các tác vụ analytics phổ biến, và semantic layer thêm SQL hiểu metric.'),
   blocks:[
    {lang:'sql', title:'pivot_and_qualify.sql (DuckDB and Snowflake-style)', code:`
-- Portable pivot using conditional aggregation
select country,
       sum(case when status = 'shipped'   then amount end) as shipped,
       sum(case when status = 'cancelled' then amount end) as cancelled
from orders
group by country;

-- DuckDB PIVOT statement
PIVOT orders ON status USING sum(amount) GROUP BY country;

-- Filter on a window result without a wrapper query
select * from orders
qualify row_number() over (partition by customer_id order by ordered_at desc) = 1;`},
    {lang:'sql', title:'semantic_sql.sql (Cube SQL API style)', code:`
-- Query a governed metric with SQL; the semantic layer supplies the formula and joins
SELECT country, MEASURE(revenue) AS revenue
FROM orders
GROUP BY country
ORDER BY revenue DESC;`}
   ],
   points:[
    {h:L('Pivot','Pivot'), p:L('Turn row values into columns. Conditional aggregation works everywhere; PIVOT syntax is shorter where available.','Biến giá trị của dòng thành cột. Aggregation có điều kiện chạy ở mọi nơi; cú pháp PIVOT ngắn hơn khi có.')},
    {h:L('QUALIFY','QUALIFY'), p:L('Filters on window functions directly. Available in several engines, not all.','Lọc trực tiếp trên window function. Có ở vài engine, không phải tất cả.')},
    {h:L('Macros and UDFs','Macro và UDF'), tag:'senior', p:L('Macros reuse SQL at compile time (dbt, DuckDB). UDFs run custom logic but can block push-downs and optimizations.','Macro tái sử dụng SQL lúc compile (dbt, DuckDB). UDF chạy logic tùy biến nhưng có thể chặn push-down và tối ưu.')},
    {h:L('Semantic SQL','Semantic SQL'), tag:'senior', p:L('Query metrics by name so every tool computes them the same way. Syntax differs by product.','Truy vấn metric theo tên để mọi công cụ tính giống nhau. Cú pháp khác nhau theo sản phẩm.')}
   ],
   n:L('Portability trade-off: engine-specific syntax is productive but ties the code to one platform. Isolate it in macros or a thin layer.','Đánh đổi về tính di động: cú pháp riêng của engine tiện nhưng gắn code với một nền tảng. Hãy cô lập nó trong macro hoặc một lớp mỏng.') },

 { k:'table', t:L('Lambda, Kappa and unifying batch and streaming','Lambda, Kappa và hợp nhất batch với streaming'),
   head:[L('Architecture','Kiến trúc'), L('Idea','Ý tưởng'), L('Strengths','Điểm mạnh'), L('Weaknesses','Điểm yếu')], rows:[
   ['Lambda', L('A batch layer for accurate results plus a speed layer for fresh results, merged at serving time','Một lớp batch cho kết quả chính xác cộng một lớp speed cho kết quả mới, gộp khi phục vụ'), L('Accuracy of batch, freshness of streaming','Độ chính xác của batch, độ mới của streaming'), L('Two code paths to keep consistent','Hai đường code phải giữ nhất quán')],
   ['Kappa', L('Everything is a stream; reprocess history by replaying the log','Mọi thứ là stream; xử lý lại lịch sử bằng cách phát lại log'), L('One code path','Một đường code'), L('Needs long retention and a capable streaming engine','Cần lưu trữ dài và engine streaming đủ mạnh')],
   [L('Micro-batch','Micro-batch'), L('Small, frequent batches on a batch engine (for example Structured Streaming)','Các batch nhỏ, thường xuyên trên engine batch (ví dụ Structured Streaming)'), L('Familiar model, good throughput','Mô hình quen thuộc, throughput tốt'), L('Latency bounded by the batch interval','Độ trễ bị chặn bởi chu kỳ batch')],
   [L('Lakehouse unification','Hợp nhất lakehouse'), L('Streaming and batch write and read the same table format','Streaming và batch ghi và đọc cùng một table format'), L('One storage layer, ACID commits, time travel','Một lớp lưu trữ, commit ACID, time travel'), L('Small-file and compaction operations','Vận hành file nhỏ và compaction')]
  ], cap:L('Choose by the latency the business pays for, then minimize the number of code paths.','Chọn theo độ trễ mà nghiệp vụ trả tiền, rồi giảm thiểu số đường code.'),
   n:L('Tie to Scenarios A and C: both use the lakehouse unification approach.','Nối với Kịch bản A và C: cả hai dùng cách hợp nhất lakehouse.') },

 { k:'code', t:L('Analytics APIs and personalized APIs','API analytics và API cá nhân hóa'),
   lead:L('Serve governed data to applications and customers through an API, with parameter binding and per-tenant access.','Phục vụ dữ liệu có quản trị cho ứng dụng và khách hàng qua API, với bind tham số và quyền theo từng tenant.'),
   blocks:[{lang:'python', title:'analytics_api.py (FastAPI + DuckDB sketch)', code:`
import duckdb
from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI()
con = duckdb.connect("warehouse.duckdb", read_only=True)


def current_tenant(authorization: str = Header(...)) -> str:
    tenant = verify_token_and_get_tenant(authorization)   # your auth logic
    if tenant is None:
        raise HTTPException(status_code=401)
    return tenant


@app.get("/v1/revenue")
def revenue(country: str, tenant_id: str = Depends(current_tenant)):
    rows = con.execute(
        """
        select date_trunc('month', ordered_at) as month, sum(amount) as revenue
        from marts.fct_orders
        where tenant_id = ? and country = ?
        group by 1 order by 1
        """,
        [tenant_id, country],
    ).fetchall()
    return [{"month": str(m), "revenue": float(r)} for m, r in rows]`}],
   points:[
    {h:L('Governed source','Nguồn có quản trị'), p:L('Serve from marts or a semantic layer, not raw tables, so numbers match dashboards.','Phục vụ từ mart hoặc semantic layer, không phải bảng thô, để số liệu khớp dashboard.')},
    {h:L('Tenant isolation','Cô lập tenant'), tag:'senior', p:L('The tenant filter comes from the authenticated identity, never from a request parameter.','Bộ lọc tenant lấy từ danh tính đã xác thực, không bao giờ từ tham số của request.')},
    {h:L('Performance','Hiệu năng'), p:L('Cache hot results, pre-aggregate, or use a real-time OLAP store for high concurrency.','Cache kết quả nóng, tổng hợp trước, hoặc dùng kho OLAP thời gian thực cho đồng thời cao.')},
    {h:L('Personalized APIs','API cá nhân hóa'), tag:'senior', p:L('Features and recommendations per user are served from an online store fed by the warehouse, with freshness and fallback rules.','Feature và gợi ý cho từng người dùng được phục vụ từ kho online được warehouse nuôi, kèm quy tắc độ mới và dự phòng.')}
   ],
   n:L('Sketch only: add rate limits, pagination, input validation, observability and an error contract before production.','Chỉ là bản phác: thêm rate limit, phân trang, kiểm tra đầu vào, observability và hợp đồng lỗi trước khi lên production.') },

 { k:'code', t:L('The data engineer’s toolkit: CLI and integration tools','Bộ công cụ của data engineer: CLI và công cụ tích hợp'),
   lead:L('Small command-line tools solve a surprising share of daily problems. Integration CLIs move data between systems.','Các công cụ dòng lệnh nhỏ giải quyết một phần đáng ngạc nhiên các vấn đề hằng ngày. CLI tích hợp chuyển dữ liệu giữa các hệ thống.'),
   blocks:[{lang:'bash', title:'toolkit_examples.sh', code:`
# Query files directly with DuckDB
duckdb -c "select country, count(*) from 'events/*.parquet' group by 1 order by 2 desc"

# Inspect and reshape JSON
curl -s https://api.example.com/orders | jq '.data[] | {id, amount, status}'

# Sync files between object stores or to local disk
rclone sync s3:example-lake/raw/orders ./local/orders --progress

# Talk to PostgreSQL and export
psql "$DATABASE_URL" -c "\\\\copy (select * from orders limit 1000) to 'orders.csv' csv header"

# Work with CSV quickly
csvstat orders.csv`}],
   points:[
    {h:L('Integration tools','Công cụ tích hợp'), p:L('dlt and Meltano (code-first), Airbyte, Singer taps and targets, Sling and Embulk (bulk movers).','dlt và Meltano (code-first), Airbyte, tap và target của Singer, Sling và Embulk (công cụ chuyển khối lượng lớn).')},
    {h:L('Everyday utilities','Tiện ích hằng ngày'), tag:'must', p:L('duckdb, jq, curl, psql, rclone, csvkit, git, make and a good shell. Learn them well.','duckdb, jq, curl, psql, rclone, csvkit, git, make và một shell tốt. Hãy học kỹ chúng.')},
    {h:L('Automate','Tự động hóa'), tag:'senior', p:L('Turn repeated commands into scripts or make targets with `set -euo pipefail` and clear exit codes.','Biến các lệnh lặp lại thành script hoặc make target với `set -euo pipefail` và mã thoát rõ ràng.')},
    {h:L('Safety','An toàn'), p:L('Never paste credentials into commands. Use environment variables, profiles or a secrets manager.','Không bao giờ dán credential vào lệnh. Dùng biến môi trường, profile hoặc secrets manager.')}
   ],
   n:L('Commands are examples; check flags for your installed versions. The `\\copy` meta-command is psql-specific.','Các lệnh chỉ là ví dụ; hãy kiểm tra cờ cho phiên bản bạn cài. Meta-command `\\copy` là của riêng psql.') }
]);
