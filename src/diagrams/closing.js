"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function archSVG(cols, bars, label){
  var heads = [L('Sources','Nguồn'),L('Ingest','Nạp'),L('Store','Lưu trữ'),L('Transform','Biến đổi'),L('Serve','Phục vụ'),L('Consume','Sử dụng')];
  var colors = ['#7A869F','#0891B2','#7C3AED','#EA580C','#DB2777','#B45309'];
  var W = 160, G = 28, Y = 34, H = 150, s = txt(10, 22, L('Data flow, left to right','Luồng dữ liệu, trái sang phải'), 'lg');
  for(var i = 0; i < 6; i++){
    var x = 10 + i * (W + G);
    s += bx(x, Y, W, H, heads[i], cols[i], colors[i]);
    if(i < 5) s += arrow(x + W + 2, Y + H / 2, x + W + G - 3, Y + H / 2);
  }
  var by = Y + H + 22;
  s += txt(10, by, L('Cross-cutting','Xuyên suốt'), 'lg');
  var bc = ['#16A34A','#DC2626','#0F766E','#475569'];
  bars.forEach(function(b, i){
    var y = by + 12 + i * 46;
    s += '<rect class="bx" x="10" y="' + y + '" width="1080" height="38" rx="8"/><rect x="10" y="' + y + '" width="8" height="38" rx="4" fill="' + bc[i] + '"/>';
    s += txt(30, y + 16, b[0], 'b') + txt(30, y + 31, b[1], 'sm');
  });
  return svg(1100, by + 12 + bars.length * 46 + 4, s, label);
}

function batchArchSVG(){
  return archSVG(
   [L('SaaS APIs|operational DBs|event tracking','API SaaS|database vận hành|theo dõi sự kiện'),
    L('Airbyte or Fivetran|Python (dlt) for APIs|files into object storage','Airbyte hoặc Fivetran|Python (dlt) cho API|file vào object storage'),
    L('S3 or MinIO raw|Iceberg tables|(bronze)','S3 hoặc MinIO thô|bảng Iceberg|(bronze)'),
    L('dbt on Spark or Trino|staging, intermediate,|marts','dbt trên Spark hoặc Trino|staging, intermediate,|mart'),
    L('Semantic layer|metrics and|access policies','Semantic layer|metric và|chính sách truy cập'),
    L('BI, notebooks|reverse ETL','BI, notebook|reverse ETL')],
   [[L('Orchestration','Điều phối'), L('Airflow or Dagster: schedules, retries, backfills, dbt runs','Airflow hoặc Dagster: lịch chạy, retry, backfill, chạy dbt')],
    [L('Quality and observability','Chất lượng và observability'), L('dbt tests, freshness, volume and schema monitors, alerts','dbt test, freshness, monitor volume và schema, cảnh báo')],
    [L('Governance','Quản trị'), L('Catalog, OpenLineage lineage, RBAC, masking','Catalog, lineage OpenLineage, RBAC, masking')],
    [L('DevOps','DevOps'), L('Git, Slim CI, Terraform, per-PR environments','Git, Slim CI, Terraform, môi trường theo PR')]],
   L('Modern batch platform','Nền tảng batch hiện đại'));
}

function streamArchSVG(){
  var W = 140, Y = 30, H = 120, X = [10, 180, 350, 520, 690, 860];
  var b = [[L('OLTP database','Database OLTP'), L('write-ahead log|(WAL, binlog)','log ghi trước|(WAL, binlog)')],
           [L('Debezium','Debezium'), L('Kafka Connect source|snapshot, then log','Kafka Connect source|snapshot rồi đọc log')],
           [L('Kafka','Kafka'), L('topic per table|Schema Registry|replayable log','topic mỗi bảng|Schema Registry|log có thể phát lại')],
           [L('Flink','Flink'), L('event time, watermarks|state, checkpoints','event time, watermark|state, checkpoint')],
           [L('Iceberg','Iceberg'), L('REST catalog (Polaris)|ACID commits','REST catalog (Polaris)|commit ACID')],
           [L('Trino and BI','Trino và BI'), L('SQL, dashboards,|APIs','SQL, dashboard,|API')]];
  var s = '';
  b.forEach(function(x, i){ s += bx(X[i], Y, W, H, x[0], x[1], i === 2 ? '#0891B2' : '#7C3AED'); if(i < 5) s += arrow(X[i] + W + 2, Y + H / 2, X[i + 1] - 3, Y + H / 2); });
  s += bx(520, 200, 140, 70, L('Checkpoint store','Kho checkpoint'), L('S3 / MinIO','S3 / MinIO'), '#475569') + arrow(590, 198, 590, 152);
  s += bx(690, 200, 310, 70, L('Object storage','Object storage'), L('Parquet data files + Iceberg metadata','file dữ liệu Parquet + metadata Iceberg'), '#475569') + arrow(760, 152, 760, 198);
  s += '<path class="ln dash" d="M420 152V230H182V152" marker-end="url(#arr)"/>' + txt(300, 224, L('replay from offsets','phát lại từ offset'), 'sm', 'middle');
  s += '<rect class="bx2" x="10" y="296" width="990" height="40" rx="8"/>' + txt(505, 321, L('Observability: consumer lag, checkpoint duration, watermark delay, commit failures  ·  Security: TLS, ACLs, private networking','Giám sát: consumer lag, thời lượng checkpoint, độ trễ watermark  ·  Bảo mật: TLS, ACL'), 'b', 'middle');
  return svg(1010, 350, s, L('Streaming platform','Nền tảng streaming'));
}

function lakehouseArchSVG(){
  var s = bx(10, 10, 980, 54, L('Compute','Compute'), L('Spark (batch)  ·  Flink (streaming)  ·  SQL engines (accelerated queries)','Spark (batch)  ·  Flink (streaming)  ·  SQL engine (truy vấn tăng tốc)'), '#0369A1', 'bx2');
  s += bx(10, 100, 170, 190, L('Ingestion','Nạp dữ liệu'), L('REST APIs|Kafka streams|CDC from databases|files (CSV, Parquet)|IoT sensors','REST API|Kafka stream|CDC từ database|file (CSV, Parquet)|cảm biến IoT'), '#7A869F');
  s += bx(230, 100, 170, 190, L('Bronze','Bronze'), L('raw, append-only|object storage|full history','thô, chỉ ghi thêm|object storage|đủ lịch sử'), '#B45309');
  s += bx(440, 100, 170, 190, L('Silver','Silver'), L('table format (ACID)|schema enforcement|dedupe, quality checks','table format (ACID)|ép schema|loại trùng, kiểm tra chất lượng'), '#64748B');
  s += bx(650, 100, 170, 190, L('Gold','Gold'), L('star schemas|feature tables|materialized views|data products','star schema|bảng feature|materialized view|data product'), '#CA8A04');
  s += bx(860, 100, 130, 190, L('Consumers','Nơi dùng'), L('BI|notebooks|ML pipelines|agents','BI|notebook|pipeline ML|agent'), '#475569');
  s += arrow(182, 195, 228, 195) + arrow(402, 195, 438, 195) + arrow(612, 195, 648, 195) + arrow(822, 195, 858, 195);
  s += bx(10, 316, 980, 64, L('Unified governance and catalog','Quản trị và catalog thống nhất'), L('access control  ·  lineage  ·  audit  ·  schema and metadata management','kiểm soát truy cập  ·  lineage  ·  audit  ·  quản lý schema và metadata'), '#0F766E', 'bx2');
  return svg(1000, 394, s, L('Enterprise lakehouse','Lakehouse doanh nghiệp'));
}

function k8sPlatformSVG(){
  var s = bx(10, 10, 980, 62, L('Observability','Observability'), L('Prometheus metrics  ·  Grafana dashboards  ·  logs and traces  ·  alerts','Metric Prometheus  ·  dashboard Grafana  ·  log và trace  ·  cảnh báo'), '#DC2626', 'bx2');
  var w = [['Spark on K8s', L('driver and executor pods','pod driver và executor')], ['Airflow', L('KubernetesExecutor,|pod per task','KubernetesExecutor,|mỗi task một pod')], ['Flink', L('operator, HA|checkpoints to object store','operator, HA|checkpoint ra object store')], ['Kafka', L('operator-managed|brokers, persistent volumes','broker do operator quản lý,|persistent volume')], [L('dbt jobs','Job dbt'), L('CronJob or workflow|steps','CronJob hoặc bước|workflow')]];
  w.forEach(function(x, i){ s += bx(10 + i * 198, 104, 184, 96, x[0], x[1], '#EA580C'); });
  s += bx(10, 232, 980, 70, L('Kubernetes','Kubernetes'), L('namespaces per team  ·  RBAC  ·  network policies  ·  resource quotas  ·  HPA and cluster autoscaler  ·  ingress  ·  GitOps (Argo CD or Flux)  ·  external secrets','namespace mỗi đội  ·  RBAC  ·  network policy  ·  resource quota  ·  HPA và cluster autoscaler  ·  ingress  ·  GitOps (Argo CD hoặc Flux)  ·  external secrets'), '#2563EB', 'bx2');
  s += bx(10, 334, 980, 62, L('Infrastructure','Hạ tầng'), L('cloud account and VPC  ·  node pools (on-demand, spot, GPU)  ·  storage classes  ·  object storage  ·  load balancers  ·  Terraform','tài khoản cloud và VPC  ·  node pool (on-demand, spot, GPU)  ·  storage class  ·  object storage  ·  load balancer  ·  Terraform'), '#475569', 'bx2');
  s += arrow(500, 232, 500, 202) + arrow(500, 334, 500, 304) + arrow(500, 104, 500, 74);
  return svg(1000, 410, s, L('Data platform on Kubernetes','Nền tảng dữ liệu trên Kubernetes'));
}

function aiArchSVG(){
  var X = [10, 215, 420, 625, 830], W = 160, Y = 30, H = 150;
  var b = [[L('Data platform','Data platform'), L('warehouse, lakehouse,|streams, documents','warehouse, lakehouse,|stream, tài liệu'), '#7C3AED'],
           [L('Governed semantic layer','Semantic layer có quản trị'), L('metrics, definitions,|policies, deterministic SQL','metric, định nghĩa,|policy, SQL tất định'), '#DB2777'],
           [L('Retrieval (RAG)','Truy xuất (RAG)'), L('embeddings, vector store,|hybrid search, rerank','embedding, vector store,|tìm hybrid, rerank'), '#9333EA'],
           [L('MCP layer','Tầng MCP'), L('tools, resources,|auth, routing','tool, resource,|xác thực, định tuyến'), '#9333EA'],
           [L('AI agents','AI agent'), L('assistants, analytics,|ops, developer agents','trợ lý, phân tích,|vận hành, lập trình'), '#B45309']];
  var s = '';
  b.forEach(function(x, i){ s += bx(X[i], Y, W, H, x[0], x[1], x[2]); if(i < 4) s += arrow(X[i] + W + 2, Y + H / 2, X[i + 1] - 3, Y + H / 2); });
  var bars = [[L('Identity and entitlements','Danh tính và quyền'), L('every agent call carries the user identity; the semantic layer enforces row and column policies','mỗi lời gọi của agent mang danh tính người dùng; semantic layer thực thi policy dòng và cột')],
              [L('Observability and evaluation','Observability và đánh giá'), L('trace prompts, retrieval and tool calls; golden test sets; cost and latency','trace prompt, truy xuất và tool call; bộ test vàng; chi phí và độ trễ')],
              [L('Guardrails','Guardrail'), L('read-only by default, approvals for writes, prompt-injection defences, output checks','mặc định chỉ đọc, duyệt cho thao tác ghi, phòng thủ prompt injection, kiểm tra đầu ra')]];
  bars.forEach(function(x, i){
    var y = 210 + i * 50;
    s += '<rect class="bx" x="10" y="' + y + '" width="980" height="40" rx="8"/><rect x="10" y="' + y + '" width="8" height="40" rx="4" fill="#9333EA"/>' + txt(30, y + 17, x[0], 'b') + txt(30, y + 32, x[1], 'sm');
  });
  return svg(1000, 366, s, L('AI-powered data platform','Nền tảng dữ liệu tích hợp AI'));
}
