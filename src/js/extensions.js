"use strict";
DICT['Store'] = 'Lưu trữ'; DICT['Compute'] = 'Compute';

/* ---------- Kafka engineering curriculum (added to the Kafka appendix group) ---------- */
(function(){
  var kafka = ARCH.filter(function(g){ return g.name === 'Kafka'; })[0];
  kafka.slides.push(
   { k:'table', t:L('Kafka engineering curriculum: 12 modules','Giáo trình Kafka: 12 module'),
     lead:L('Each module should be learned with one diagram, one configuration, one troubleshooting exercise and one design question.','Mỗi module nên học cùng một sơ đồ, một cấu hình, một bài tập xử lý sự cố và một câu hỏi thiết kế.'),
     head:[L('Module','Module'), L('Topics','Chủ đề'), L('After this you can…','Học xong bạn có thể…')], rows:[
     ['01 Architecture', 'Broker, controller, KRaft, metadata', L('Explain where state lives and what a controller does','Giải thích trạng thái nằm ở đâu và controller làm gì')],
     ['02 Producer internals', 'Batching, acks, retries, idempotence', L('Tune a producer for durability or throughput','Tinh chỉnh producer cho độ bền hoặc throughput')],
     ['03 Partitioning', 'Keys, partitioner, ordering, hot partitions', L('Choose a key and a partition count with reasons','Chọn khóa và số partition có lý do')],
     ['04 Replication', 'Leader, follower, ISR, min.insync.replicas, election', L('Predict what happens when a broker fails','Dự đoán điều gì xảy ra khi một broker hỏng')],
     ['05 Consumer internals', 'Poll loop, offsets, group coordinator, rebalance', L('Avoid rebalance storms and lost commits','Tránh bão rebalance và mất commit')],
     ['06 Delivery semantics', 'At-most/at-least/exactly-once, transactions', L('Design an end-to-end exactly-once pipeline','Thiết kế pipeline exactly-once đầu-cuối')],
     ['07 Storage', 'Segments, indexes, retention, compaction', L('Size disks and explain compaction','Định cỡ đĩa và giải thích compaction')],
     ['08 Schema management', 'Avro, Protobuf, Schema Registry, compatibility', L('Evolve a schema without breaking consumers','Tiến hóa schema mà không làm hỏng consumer')],
     ['09 Connect and CDC', 'Connectors, Debezium, offsets, snapshots', L('Run a CDC pipeline and handle a re-snapshot','Chạy pipeline CDC và xử lý snapshot lại')],
     ['10 Performance', 'Throughput, latency, compression, sizing', L('Benchmark and size a cluster','Benchmark và định cỡ một cluster')],
     ['11 Operations', 'Monitoring, lag, rolling upgrades, recovery', L('Run an on-call rotation for Kafka','Trực on-call cho Kafka')],
     ['12 Security and deployment', 'TLS, SASL, ACLs, Docker, Kubernetes', L('Deploy and secure a cluster','Triển khai và bảo mật một cluster')]
    ], cap:L('The same module pattern should be applied to Spark, Flink, Airflow, Iceberg, dbt, Snowflake, BigQuery, Kubernetes and Terraform.','Cùng mẫu module này nên áp dụng cho Spark, Flink, Airflow, Iceberg, dbt, Snowflake, BigQuery, Kubernetes và Terraform.'),
     n:L('Use the table as a syllabus. The third column is the Level 3 outcome: not “knows the term” but “can do the task in production”.','Dùng bảng như một đề cương. Cột thứ ba là kết quả Level 3: không phải “biết thuật ngữ” mà là “làm được việc ở production”.') },

   { k:'code', t:L('Kafka hands-on: topic, producer, consumer','Kafka thực hành: topic, producer, consumer'),
     lead:L('A durability-first setup: three replicas, two must acknowledge, idempotent producer, manual commits after processing.','Một thiết lập ưu tiên độ bền: ba replica, hai phải xác nhận, producer idempotent, commit thủ công sau khi xử lý.'),
     blocks:[
      {lang:'bash', title:'create_topic.sh', code:`
kafka-topics.sh --bootstrap-server broker1:9092 --create --topic orders \\
  --partitions 12 --replication-factor 3 \\
  --config min.insync.replicas=2 --config retention.ms=604800000`},
      {lang:'ini', title:'producer.properties', code:`
bootstrap.servers=broker1:9092,broker2:9092
acks=all
enable.idempotence=true
max.in.flight.requests.per.connection=5
delivery.timeout.ms=120000
linger.ms=20
batch.size=65536
compression.type=zstd`},
      {lang:'python', title:'consumer.py (confluent-kafka)', code:`
from confluent_kafka import Consumer

c = Consumer({
    "bootstrap.servers": "broker1:9092",
    "group.id": "orders-etl",
    "enable.auto.commit": False,
    "auto.offset.reset": "earliest",
    "isolation.level": "read_committed",
    "partition.assignment.strategy": "cooperative-sticky",
})
c.subscribe(["orders"])

while True:
    msg = c.poll(1.0)
    if msg is None:
        continue
    if msg.error():
        raise RuntimeError(msg.error())
    process(msg.value())                    # must be idempotent
    c.commit(message=msg, asynchronous=False)  # commit only after success`}
     ],
     points:[
      {h:L('Durability trio','Bộ ba độ bền'), p:L('`acks=all`, `min.insync.replicas=2` and replication factor 3: one broker can fail with no loss and no downtime.','`acks=all`, `min.insync.replicas=2` và replication factor 3: một broker có thể hỏng mà không mất dữ liệu và không ngừng dịch vụ.')},
      {h:L('Throughput knobs','Núm vặn throughput'), p:L('`linger.ms`, `batch.size` and compression trade a little latency for much higher throughput.','`linger.ms`, `batch.size` và nén đổi một chút độ trễ lấy throughput cao hơn nhiều.')},
      {h:L('Commit after processing','Commit sau khi xử lý'), tag:'senior', p:L('This gives at-least-once. Make `process` idempotent so duplicates are harmless.','Cách này cho at-least-once. Hãy làm `process` idempotent để bản trùng vô hại.')},
      {h:L('Cooperative rebalancing','Rebalance hợp tác'), tag:'senior', p:L('Cooperative-sticky assignment limits stop-the-world pauses when consumers join or leave.','Gán cooperative-sticky giảm các lần dừng toàn bộ khi consumer vào hoặc rời.')}
     ],
     n:L('Hostnames and sizes are examples. Property names are standard Kafka client settings, but defaults change between versions, so check the documentation for the version you run.','Hostname và kích thước chỉ là ví dụ. Tên thuộc tính là cấu hình chuẩn của Kafka client, nhưng giá trị mặc định đổi theo phiên bản, hãy xem tài liệu của phiên bản bạn chạy.') },

   { k:'table', t:L('Kafka troubleshooting: symptoms to recovery','Xử lý sự cố Kafka: từ triệu chứng đến khôi phục'),
     head:[L('Symptom','Triệu chứng'), L('Likely causes','Nguyên nhân có thể'), L('Diagnose','Chẩn đoán'), L('Recover','Khôi phục')], rows:[
     [L('Consumer lag grows','Consumer lag tăng'), L('Slow handler, hot partition, too few consumers','Handler chậm, partition nóng, quá ít consumer'), '`kafka-consumer-groups.sh --bootstrap-server broker1:9092 --describe --group orders-etl`', L('Fix the slow step; scale consumers up to partition count','Sửa bước chậm; tăng consumer đến số partition')],
     [L('Constant rebalances','Rebalance liên tục'), L('Handler exceeds `max.poll.interval.ms`, flapping members','Handler vượt `max.poll.interval.ms`, thành viên chập chờn'), L('Consumer logs, group state, poll duration','Log consumer, trạng thái group, thời gian poll'), L('Shorten batches, raise the interval, use cooperative assignment','Rút ngắn batch, tăng ngưỡng, dùng gán hợp tác')],
     [L('Under-replicated partitions','Partition thiếu bản sao'), L('Broker down, slow disk or network','Broker hỏng, đĩa hoặc mạng chậm'), '`kafka-topics.sh --bootstrap-server broker1:9092 --describe --under-replicated-partitions`', L('Restore the broker; check ISR recovers','Khôi phục broker; kiểm tra ISR hồi phục')],
     [L('Duplicates downstream','Trùng lặp phía sau'), L('Retry after commit failure, at-least-once consumer','Retry sau lỗi commit, consumer at-least-once'), L('Compare event IDs, check commit order','So sánh event ID, kiểm tra thứ tự commit')   , L('Add dedupe key or idempotent sink','Thêm khóa chống trùng hoặc sink idempotent')],
     [L('Producer timeouts','Producer bị timeout'), L('`min.insync.replicas` not met, network, overloaded broker','Không đủ `min.insync.replicas`, mạng, broker quá tải'), L('Producer error codes, broker request metrics','Mã lỗi producer, metric request của broker'), L('Restore replicas; tune batching and timeouts','Khôi phục replica; tinh chỉnh batching và timeout')],
     [L('Disk filling up','Đĩa đầy dần'), L('Retention too long, compaction stuck, traffic spike','Retention quá dài, compaction kẹt, lưu lượng tăng đột biến'), L('Per-topic size, log segments, retention settings','Dung lượng từng topic, log segment, cấu hình retention'), L('Lower retention, add storage or brokers, rebalance partitions','Giảm retention, thêm đĩa hoặc broker, cân bằng lại partition')]
    ], cap:L('Check current Kafka documentation for the exact command options of your version.','Xem tài liệu Kafka hiện hành để biết chính xác tùy chọn lệnh của phiên bản bạn dùng.'),
     n:L('Run this as a drill: break a test cluster in each of these ways and let learners find the cause from metrics and logs alone.','Chạy như một bài diễn tập: làm hỏng cluster test theo từng cách và để người học tìm nguyên nhân chỉ từ metric và log.') }
  );
})();

/* ---------- five reference architectures ---------- */
function archSlide(o){
  return { k:'html', t:o.t, lead:o.lead, n:o.n, html:function(){
    return '<div class="fig">' + o.svg() + '</div><div class="grid c3" style="margin-top:14px">' +
      o.cards.map(function(c){ return cardHTML({h:c[0], p:c[1]}, true); }).join('') + '</div>';
  }};
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
   'Modern batch platform');
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
  return svg(1010, 350, s, 'Streaming platform');
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
  return svg(1000, 394, s, 'Enterprise lakehouse');
}
function k8sPlatformSVG(){
  var s = bx(10, 10, 980, 62, L('Observability','Observability'), L('Prometheus metrics  ·  Grafana dashboards  ·  logs and traces  ·  alerts','Metric Prometheus  ·  dashboard Grafana  ·  log và trace  ·  cảnh báo'), '#DC2626', 'bx2');
  var w = [['Spark on K8s', L('driver and executor pods','pod driver và executor')], ['Airflow', L('KubernetesExecutor,|pod per task','KubernetesExecutor,|mỗi task một pod')], ['Flink', L('operator, HA|checkpoints to object store','operator, HA|checkpoint ra object store')], ['Kafka', L('operator-managed|brokers, persistent volumes','broker do operator quản lý,|persistent volume')], ['dbt jobs', L('CronJob or workflow|steps','CronJob hoặc bước|workflow')]];
  w.forEach(function(x, i){ s += bx(10 + i * 198, 104, 184, 96, x[0], x[1], '#EA580C'); });
  s += bx(10, 232, 980, 70, L('Kubernetes','Kubernetes'), L('namespaces per team  ·  RBAC  ·  network policies  ·  resource quotas  ·  HPA and cluster autoscaler  ·  ingress  ·  GitOps (Argo CD or Flux)  ·  external secrets','namespace mỗi đội  ·  RBAC  ·  network policy  ·  resource quota  ·  HPA và cluster autoscaler  ·  ingress  ·  GitOps (Argo CD hoặc Flux)  ·  external secrets'), '#2563EB', 'bx2');
  s += bx(10, 334, 980, 62, L('Infrastructure','Hạ tầng'), L('cloud account and VPC  ·  node pools (on-demand, spot, GPU)  ·  storage classes  ·  object storage  ·  load balancers  ·  Terraform','tài khoản cloud và VPC  ·  node pool (on-demand, spot, GPU)  ·  storage class  ·  object storage  ·  load balancer  ·  Terraform'), '#475569', 'bx2');
  s += arrow(500, 232, 500, 202) + arrow(500, 334, 500, 304) + arrow(500, 104, 500, 74);
  return svg(1000, 410, s, 'Data platform on Kubernetes');
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
  return svg(1000, 366, s, 'AI-powered data platform');
}

CLOSING.splice(0, 0,
 { k:'table', t:L('How to use this deck: 3 levels across 6 domains','Cách dùng bộ slide: 3 level qua 6 domain'),
   lead:L('You do not need every tool at the same depth. Choose a level per layer: understand it, implement it, or engineer it in production.','Bạn không cần mọi công cụ ở cùng một độ sâu. Chọn level cho từng lớp: hiểu nó, triển khai nó, hoặc làm kỹ thuật cho nó ở production.'),
   head:[L('Domain','Domain'), L('Layers','Các lớp'), L('Level 1: Understand','Level 1: Hiểu'), L('Level 2: Implement','Level 2: Triển khai'), L('Level 3: Engineer','Level 3: Làm kỹ thuật')], rows:[
   [L('1. Foundations','1. Nền tảng'), '1, 12', L('Know what SQL, Python and modeling solve','Biết SQL, Python và mô hình hóa giải quyết gì'), L('Write tested SQL and a star schema','Viết SQL có test và một star schema'), L('Optimize at scale; own modeling standards','Tối ưu ở quy mô lớn; nắm chuẩn mô hình hóa')],
   [L('2. Modern data platform','2. Data platform hiện đại'), '2, 3, 4, 6, 7, 10', L('Explain ingestion, storage, transformation, semantic layer','Giải thích ingestion, storage, transformation, semantic layer'), L('Build an ELT pipeline with dbt and a BI layer','Xây pipeline ELT với dbt và một lớp BI'), L('Design for scale, cost, schema change and replay','Thiết kế cho quy mô, chi phí, đổi schema và phát lại')],
   [L('3. Platform operations','3. Vận hành nền tảng'), '5, 8, 9, 17, 19', L('Know orchestration, quality, governance, security, cost','Biết điều phối, chất lượng, quản trị, bảo mật, chi phí'), L('Add tests, lineage, RBAC and budgets','Thêm test, lineage, RBAC và ngân sách'), L('Run SLAs, audits, incident response and FinOps','Vận hành SLA, audit, xử lý sự cố và FinOps')],
   [L('4. Infrastructure and architecture','4. Hạ tầng và kiến trúc'), '11, 18, appendix', L('Explain Kubernetes, Terraform, CAP and replication','Giải thích Kubernetes, Terraform, CAP và replication'), L('Deploy with CI/CD and infrastructure as code','Triển khai bằng CI/CD và infrastructure as code'), L('Design HA and DR; troubleshoot distributed failures','Thiết kế HA và DR; xử lý sự cố phân tán')],
   [L('5. Advanced data and AI','5. Dữ liệu nâng cao và AI'), '13, 15, 16', L('Explain models, RAG, MCP and agent loops','Giải thích model, RAG, MCP và vòng lặp agent'), L('Train a model; build a RAG or tool-using agent','Huấn luyện một model; xây RAG hoặc agent dùng tool'), L('Evaluate, secure and monitor AI in production','Đánh giá, bảo mật và giám sát AI ở production')],
   [L('6. Engineering excellence','6. Xuất sắc kỹ thuật'), '14', L('Know ADRs, build vs buy, prioritization','Biết ADR, build vs buy, ưu tiên'), L('Write ADRs and run design reviews','Viết ADR và chạy buổi review thiết kế'), L('Set technical direction and mentor others','Đặt định hướng kỹ thuật và dìu dắt người khác')]
  ], cap:L('Planned next layers: API and integration, platform engineering, data mesh and data products, and event-driven architecture.','Các lớp dự kiến tiếp theo: API và tích hợp, platform engineering, data mesh và data product, và kiến trúc hướng sự kiện.'),
   n:L('Use the levels to scope learning. A mid-level engineer targets Level 2 across the board and Level 3 in two or three layers they own; a senior owns Level 3 in most operations and architecture layers.','Dùng các level để định phạm vi học. Engineer mid-level nhắm Level 2 ở mọi nơi và Level 3 ở hai hoặc ba lớp mình phụ trách; senior nắm Level 3 ở hầu hết lớp vận hành và kiến trúc.') },

 archSlide({ t:L('Reference architecture A: modern batch data platform','Kiến trúc tham chiếu A: data platform batch hiện đại'),
   lead:L('Sources, managed ingestion, raw storage, dbt transformation, a semantic layer and BI. Quality monitoring watches the whole path.','Nguồn, ingestion managed, lưu trữ thô, biến đổi bằng dbt, semantic layer và BI. Giám sát chất lượng theo dõi toàn bộ đường đi.'),
   svg:batchArchSVG,
   cards:[[L('Ingestion','Ingestion'), L('Managed connectors for SaaS, CDC for operational databases, and files landing in object storage. Raw data stays append-only.','Connector managed cho SaaS, CDC cho database vận hành, và file hạ cánh vào object storage. Dữ liệu thô chỉ ghi thêm.')],
          [L('Transformation','Biến đổi'), L('dbt builds staging, intermediate and mart models with tests and contracts, deployed by CI.','dbt dựng model staging, intermediate và mart có test và contract, triển khai bằng CI.')],
          [L('Failure points','Điểm dễ hỏng'), L('Schema drift, late sources, partial loads and non-idempotent reruns. Orchestration and freshness checks catch them.','Lệch schema, nguồn đến trễ, load dở dang và chạy lại không idempotent. Điều phối và kiểm tra freshness bắt được chúng.')]],
   n:L('This is the default most teams should start from. Technology options: Airbyte or Fivetran, Python, S3 or MinIO, Iceberg, Spark or Trino, dbt, Airflow.','Đây là mặc định hầu hết đội nên bắt đầu. Lựa chọn công nghệ: Airbyte hoặc Fivetran, Python, S3 hoặc MinIO, Iceberg, Spark hoặc Trino, dbt, Airflow.') }),

 archSlide({ t:L('Reference architecture B: real-time streaming platform','Kiến trúc tham chiếu B: nền tảng streaming thời gian thực'),
   lead:L('Row changes flow from the database log through Kafka and Flink into Iceberg tables that Trino can query within seconds to minutes.','Thay đổi dòng dữ liệu chảy từ log của database qua Kafka và Flink vào bảng Iceberg mà Trino truy vấn được sau vài giây đến vài phút.'),
   svg:streamArchSVG,
   cards:[[L('Event time and watermarks','Event time và watermark'), L('Window by when the event happened, not when it arrived. A watermark says how long to wait for stragglers.','Chia cửa sổ theo lúc sự kiện xảy ra, không phải lúc nó đến. Watermark cho biết chờ các sự kiện đến muộn bao lâu.')],
          [L('Checkpoints and replay','Checkpoint và phát lại'), L('Flink snapshots state and Kafka offsets together. After failure it restores and re-reads, so no acknowledged event is lost.','Flink snapshot state và offset Kafka cùng lúc. Sau lỗi nó khôi phục và đọc lại, nên không mất sự kiện đã xác nhận.')],
          [L('Late events and exactly-once','Sự kiện trễ và exactly-once'), L('Allow lateness or route late data to a side output. Exactly-once needs transactional or idempotent writes to Iceberg.','Cho phép trễ hoặc đưa dữ liệu trễ ra side output. Exactly-once cần ghi giao dịch hoặc idempotent vào Iceberg.')]],
   n:L('Contrast with the batch platform: lower latency and more moving parts. Also mention compaction of small files that streaming writes create in Iceberg.','So với nền tảng batch: độ trễ thấp hơn và nhiều bộ phận chuyển động hơn. Cũng nhắc compaction các file nhỏ mà streaming tạo ra trong Iceberg.') }),

 archSlide({ t:L('Reference architecture C: enterprise lakehouse','Kiến trúc tham chiếu C: lakehouse doanh nghiệp'),
   lead:L('Bronze, silver and gold layers on a transactional table format, with compute engines on top and one governance layer across everything.','Các tầng bronze, silver và gold trên table format có giao dịch, engine compute ở trên và một lớp quản trị xuyên suốt.'),
   svg:lakehouseArchSVG,
   cards:[[L('Table format and catalog','Table format và catalog'), L('Iceberg or Delta gives ACID commits and schema evolution. The catalog is the pointer, the permission point and the discovery point.','Iceberg hoặc Delta cho commit ACID và tiến hóa schema. Catalog là con trỏ, điểm phân quyền và điểm khám phá.')],
          [L('Compaction and metadata','Compaction và metadata'), L('Schedule file compaction, snapshot expiry and orphan cleanup, or reads and costs degrade.','Lên lịch compaction file, hết hạn snapshot và dọn file mồ côi, nếu không đọc chậm và chi phí tăng.')],
          [L('Governance','Quản trị'), L('Access control, lineage and audit at the catalog level apply to every engine that reads the tables.','Kiểm soát truy cập, lineage và audit ở mức catalog áp dụng cho mọi engine đọc các bảng.')]],
   n:L('Gold is where data products are published with contracts. Whether the stack is Databricks and Unity Catalog or an open stack with Iceberg and a REST catalog, the responsibilities are the same.','Gold là nơi xuất bản data product kèm contract. Dù stack là Databricks và Unity Catalog hay stack mở với Iceberg và REST catalog, trách nhiệm vẫn như nhau.') }),

 archSlide({ t:L('Reference architecture D: data platform on Kubernetes','Kiến trúc tham chiếu D: data platform trên Kubernetes'),
   lead:L('One cluster runs batch, streaming and orchestration workloads with shared guardrails: quotas, network policies, secrets and GitOps.','Một cluster chạy các workload batch, streaming và điều phối với hàng rào chung: quota, network policy, secret và GitOps.'),
   svg:k8sPlatformSVG,
   cards:[[L('Scheduling and isolation','Lập lịch và cô lập'), L('Namespaces, quotas and node pools separate teams and workload types. Taints keep expensive nodes for the jobs that need them.','Namespace, quota và node pool tách đội và loại workload. Taint giữ node đắt cho job thật sự cần.')],
          [L('Autoscaling','Autoscaling'), L('HPA scales pods; the cluster autoscaler adds nodes. Cap both to keep cost predictable.','HPA co giãn pod; cluster autoscaler thêm node. Đặt giới hạn cả hai để chi phí dự đoán được.')],
          [L('Secrets, networking, deployment','Secret, mạng, triển khai'), L('Workload identity and external secrets avoid stored keys; network policies limit traffic; GitOps deploys declared state.','Workload identity và external secrets tránh lưu khóa; network policy giới hạn lưu lượng; GitOps triển khai trạng thái đã khai báo.')]],
   n:L('Kubernetes pays off when you run many services and need a shared platform. For a small team, managed services are usually cheaper to operate.','Kubernetes đáng giá khi bạn chạy nhiều dịch vụ và cần nền tảng dùng chung. Với đội nhỏ, dịch vụ managed thường rẻ hơn để vận hành.') }),

 archSlide({ t:L('Reference architecture E: AI-powered data platform','Kiến trúc tham chiếu E: data platform có AI'),
   lead:L('MCP gives agents connectivity. The governed semantic layer gives them meaning: consistent metrics, enforced policies and deterministic SQL.','MCP cho agent khả năng kết nối. Semantic layer có quản trị cho chúng ý nghĩa: metric nhất quán, policy được thực thi và SQL tất định.'),
   svg:aiArchSVG,
   cards:[[L('Ingestion for RAG','Ingestion cho RAG'), L('Documents are parsed, chunked, embedded and indexed with metadata and access tags. Re-index when sources change.','Tài liệu được phân tích, chia chunk, embed và lập chỉ mục kèm metadata và tag quyền. Lập chỉ mục lại khi nguồn đổi.')],
          [L('Retrieval and evaluation','Truy xuất và đánh giá'), L('Hybrid search plus a reranker, measured by recall@k and answer faithfulness on a golden set.','Tìm hybrid cộng reranker, đo bằng recall@k và độ trung thực của câu trả lời trên bộ test vàng.')],
          [L('Agents and security','Agent và bảo mật'), L('Agents call governed tools through MCP with the user’s identity, read-only by default, with logging and approvals for risky actions.','Agent gọi tool có quản trị qua MCP bằng danh tính của người dùng, mặc định chỉ đọc, có log và duyệt cho hành động rủi ro.')]],
   n:L('Key message: MCP connects, the semantic layer ensures answers are correct, consistent and compliant. Without the semantic layer an agent can connect to everything and still return the wrong number.','Thông điệp chính: MCP kết nối, semantic layer bảo đảm câu trả lời đúng, nhất quán và tuân thủ. Không có semantic layer, agent có thể kết nối mọi thứ mà vẫn trả sai con số.') })
);

"use strict";
(function(){
  var more = {'Symptom':'Triệu chứng','Likely cause':'Nguyên nhân có thể','Diagnose':'Chẩn đoán','Fix':'Cách sửa','Stage':'Giai đoạn','What happens':'Điều gì xảy ra','Where to observe':'Quan sát ở đâu',
   'Mechanism':'Cơ chế','How it works':'Cách hoạt động','On failure':'Khi lỗi','Key settings':'Cấu hình chính','State':'Trạng thái','Meaning':'Ý nghĩa','Executor':'Executor','Isolation':'Cô lập','Best for':'Phù hợp nhất',
   'Module':'Module','Required content':'Nội dung bắt buộc','Where in this deck':'Ở đâu trong bộ slide','Parameter':'Tham số','Controls':'Điều khiển','Typical production choice':'Lựa chọn production điển hình','Scenario':'Kịch bản'};
  for(var k in more){ DICT[k] = more[k]; }
})();

/* ---------- helpers ---------- */
function labSlide(o){
  return { k:'html', t:o.t, lead:o.lead, n:o.n, html:function(){
    var lab = { scn:X('Scenario','Kịch bản'), inp:X('Input and setup','Đầu vào và thiết lập'), tasks:X('Tasks','Nhiệm vụ'), exp:X('Expected output','Kết quả mong đợi'), rub:X('Evaluation criteria','Tiêu chí đánh giá'), des:X('Production design question','Câu hỏi thiết kế production') };
    var ol = function(a){ return '<ol class="qs">' + a.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ol>'; };
    var ul = function(a){ return '<ul class="checks">' + a.map(function(x){ return '<li><span>' + inl(x) + '</span></li>'; }).join('') + '</ul>'; };
    return '<div class="grid c2">' +
      '<div class="card"><h4>' + lab.scn + '</h4><p>' + inl(o.scenario) + '</p></div>' +
      '<div class="card plain"><h4>' + lab.inp + '</h4><p>' + inl(o.input) + '</p></div>' +
      '<div class="card plain"><h4>' + lab.tasks + '</h4>' + ol(o.tasks) + '</div>' +
      '<div class="card plain"><h4>' + lab.exp + '</h4><p>' + inl(o.expected) + '</p><h4 style="margin-top:12px">' + lab.rub + '</h4>' + ul(o.rubric) + '</div></div>' +
      '<div class="card plain" style="margin-top:14px"><h4>' + lab.des + '</h4><p>' + inl(o.design) + '</p></div>';
  }};
}
function addTo(name, slides){
  var g = ARCH.filter(function(x){ return x.name === name; })[0];
  slides.forEach(function(s){ g.slides.push(s); });
}

/* ---------- template slide (in appendix overview) ---------- */
ARCH[0].slides.push({ k:'table', t:L('Technology module template: 10 modules, 3 levels','Template module cho từng công nghệ: 10 module, 3 level'),
  lead:L('Every core technology is taught with the same ten modules. Not every technology needs the same number of slides, but none should skip internals, troubleshooting or a lab.','Mỗi công nghệ lõi được dạy bằng cùng mười module. Không cần cùng số slide, nhưng không công nghệ nào được bỏ qua cơ chế bên trong, troubleshooting hay lab.'),
  head:['Module','Required content','Where in this deck'], rows:[
   ['01 Overview', L('Purpose, use cases, alternatives, limits','Mục đích, trường hợp dùng, lựa chọn thay thế, giới hạn'), L('Layer sections and tool landscape tables','Các phần layer và bảng bức tranh công cụ')],
   ['02 Fundamentals', L('Concepts, terminology, core principles','Khái niệm, thuật ngữ, nguyên lý cốt lõi'), L('Layer overview slides','Slide tổng quan của layer')],
   ['03 Internal architecture', L('Components, diagram, control and data flow','Thành phần, sơ đồ, luồng điều khiển và dữ liệu'), L('Appendix: architecture slide','Phụ lục: slide kiến trúc')],
   ['04 Internal mechanisms', L('Algorithms, lifecycle, state, metadata','Thuật toán, vòng đời, trạng thái, metadata'), L('Appendix: internals slide','Phụ lục: slide cơ chế bên trong')],
   ['05 Configuration', L('Key parameters, defaults, tuning, security','Tham số chính, mặc định, tuning, bảo mật'), L('Internals and hands-on slides','Slide cơ chế và thực hành')],
   ['06 Implementation', L('Install, code, API, CLI, integration','Cài đặt, code, API, CLI, tích hợp'), L('Code slides in layers and appendix','Slide code trong layer và phụ lục')],
   ['07 Production operations', L('Deploy, scale, HA, monitor, backup, recover','Triển khai, mở rộng, HA, giám sát, backup, khôi phục'), L('Layers 17 to 19 and operating notes','Layer 17 đến 19 và lưu ý vận hành')],
   ['08 Troubleshooting', L('Errors, logs, root cause, recovery','Lỗi, log, nguyên nhân gốc, khôi phục'), L('Troubleshooting tables per technology','Bảng troubleshooting cho từng công nghệ')],
   ['09 Performance and design', L('Bottlenecks, tuning, trade-offs','Nút thắt, tuning, đánh đổi'), L('Troubleshooting and performance slides','Slide troubleshooting và hiệu năng')],
   ['10 Hands-on and assessment', L('Labs, projects, design exercises, interviews','Lab, dự án, bài tập thiết kế, phỏng vấn'), L('Lab slides with rubrics','Slide lab có tiêu chí chấm')]
  ], cap:L('Deepened so far: Kafka (with a full Partitioning lesson), Spark, Flink, Iceberg, Airflow, dbt, SQL and Python. Other technologies still have the shorter two-slide form.','Đã đào sâu: Kafka (kèm bài Partitioning đầy đủ), Spark, Flink, Iceberg, Airflow, dbt, SQL và Python. Các công nghệ khác vẫn ở dạng hai slide ngắn hơn.'),
  n:L('Use this as the contract for new content. When a module is missing, the technology is not finished, whatever its slide count.','Dùng làm hợp đồng cho nội dung mới. Khi thiếu một module, công nghệ đó chưa hoàn thành, bất kể số slide.') });

/* ================= KAFKA: Partitioning lesson (10 sections over 4 slides) + internals ================= */
function partitionSVG(){
  var s = bx(10, 120, 130, 100, L('Producer','Producer'), L('key = customer_id','key = customer_id'), '#0891B2');
  s += bx(180, 120, 170, 100, L('Partitioner','Partitioner'), L('hash(key) mod N|null key: sticky batch','hash(key) mod N|key rỗng: batch dính'), '#0891B2');
  for(var i = 0; i < 4; i++){
    s += bx(400, 20 + i * 92, 170, 76, 'Partition ' + i, X('leader on broker ','leader trên broker ') + (i % 3 + 1) + '|log segments, offsets', '#475569');
    s += arrow(352, 170, 398, 58 + i * 92);
  }
  s += bx(640, 50, 190, 120, L('Consumer 1','Consumer 1'), L('reads P0 and P1|in order per partition','đọc P0 và P1|đúng thứ tự mỗi partition'), '#0891B2');
  s += bx(640, 210, 190, 120, L('Consumer 2','Consumer 2'), L('reads P2 and P3','đọc P2 và P3'), '#0891B2');
  s += arrow(572, 58, 638, 100) + arrow(572, 150, 638, 120) + arrow(572, 242, 638, 260) + arrow(572, 334, 638, 290);
  s += txt(860, 150, L('one consumer per','mỗi partition một'), 'sm') + txt(860, 166, L('partition per group','consumer trong group'), 'sm');
  return svg(1000, 392, s, 'Kafka partitioning');
}
addTo('Kafka', [
 { k:'html', t:L('Kafka module: Partitioning (1 of 4) fundamentals, mechanism, workflow','Module Kafka: Partitioning (1/4) nền tảng, cơ chế, quy trình'),
   lead:L('Partitions are how a topic scales and how ordering is defined. This lesson follows the ten-part template.','Partition là cách topic mở rộng và là cách thứ tự được định nghĩa. Bài này theo template mười phần.'),
   html:function(){
     var c = [
      [L('1. Fundamentals','1. Nền tảng'), L('A topic is split into partitions. Each partition is an ordered log read by at most one consumer per group. More partitions mean more parallelism, but ordering exists only inside one partition.','Topic được chia thành các partition. Mỗi partition là một log có thứ tự, được tối đa một consumer trong mỗi group đọc. Nhiều partition nghĩa là song song hơn, nhưng thứ tự chỉ tồn tại trong một partition.')],
      [L('2. Internal mechanism','2. Cơ chế bên trong'), L('For a keyed record the default partitioner hashes the key bytes (murmur2) modulo the partition count. Records without a key are placed in batches onto one partition at a time (sticky). Each partition is a sequence of segment files with offsets.','Với record có key, partitioner mặc định băm byte của key (murmur2) rồi lấy modulo số partition. Record không có key được đặt theo batch vào từng partition một (sticky). Mỗi partition là chuỗi file segment có offset.')],
      [L('3. Workflow','3. Quy trình'), L('Producer sends a record, partitioner picks the partition, the leader appends it, followers replicate, consumers read by offset. Changing the partition count later changes where keys land, which can break per-key ordering.','Producer gửi record, partitioner chọn partition, leader ghi thêm, follower replicate, consumer đọc theo offset. Đổi số partition sau này làm đổi nơi key rơi vào, có thể phá thứ tự theo key.')]
     ];
     return '<div class="fig">' + partitionSVG() + '</div><div class="grid c3" style="margin-top:14px">' + c.map(function(x){ return cardHTML({h:x[0], p:x[1]}, true); }).join('') + '</div>';
   },
   n:L('Stress the ordering rule: per key, not per topic. If the business needs order per customer, the customer ID must be the key.','Nhấn mạnh quy tắc thứ tự: theo key, không theo topic. Nếu nghiệp vụ cần thứ tự theo khách hàng thì customer ID phải là key.') },

 { k:'code', t:L('Kafka module: Partitioning (2 of 4) configuration and code','Module Kafka: Partitioning (2/4) cấu hình và code'),
   lead:L('Choose the key deliberately, and know the settings that interact with it.','Chọn key có chủ đích, và biết các cấu hình tương tác với nó.'),
   blocks:[
    {lang:'python', title:'partitioned_producer.py (confluent-kafka)', code:`
import json

from confluent_kafka import Producer

p = Producer({
    "bootstrap.servers": "broker1:9092",
    "enable.idempotence": True,
    "acks": "all",
    "partitioner": "murmur2_random",   # same hashing as the Java client for keyed records
    "linger.ms": 20,
})


def on_delivery(err, msg):
    if err:
        print(f"failed: {err}")
    else:
        print(f"partition={msg.partition()} offset={msg.offset()}")


def send_order(order: dict) -> None:
    # Same customer_id -> same partition -> one customer's events stay ordered
    p.produce("orders", key=str(order["customer_id"]), value=json.dumps(order), on_delivery=on_delivery)
    p.poll(0)


def send_hot_key(order: dict, salts: int = 8) -> None:
    # Spread a very hot customer over several partitions. Ordering per customer is lost.
    key = f"{order['customer_id']}#{order['order_id'] % salts}"
    p.produce("orders", key=key, value=json.dumps(order), on_delivery=on_delivery)
    p.poll(0)


p.flush()`}
   ],
   points:[
    {h:L('Partition count','Số partition'), p:L('Set at topic creation (`--partitions`). Raising it later remaps keys.','Đặt khi tạo topic (`--partitions`). Tăng sau này sẽ ánh xạ lại key.')},
    {h:L('Key strategy','Chiến lược key'), tag:'senior', p:L('Pick the entity whose events must stay ordered. A skewed key (one huge customer) creates a hot partition.','Chọn thực thể có sự kiện phải giữ thứ tự. Key lệch (một khách hàng khổng lồ) tạo ra partition nóng.')},
    {h:L('`acks` and `min.insync.replicas`','`acks` và `min.insync.replicas`'), p:L('Durability per partition. Use `acks=all` with `min.insync.replicas=2` and replication factor 3.','Độ bền theo từng partition. Dùng `acks=all` với `min.insync.replicas=2` và replication factor 3.')},
    {h:L('Ordering and retries','Thứ tự và retry'), tag:'senior', p:L('Idempotent producers keep order across retries. Without it, retries with several in-flight requests can reorder.','Producer idempotent giữ thứ tự khi retry. Nếu không, retry với nhiều request đang bay có thể làm đảo thứ tự.')}
   ],
   n:L('The custom partitioner class setting exists in the Java client; in librdkafka-based clients you choose a named partitioner. Defaults and client options differ between versions, so verify against your client documentation.','Cấu hình lớp partitioner tùy biến có ở Java client; ở client dựa trên librdkafka bạn chọn partitioner có tên. Mặc định và tùy chọn client khác nhau theo phiên bản, hãy đối chiếu tài liệu client của bạn.') },

 { k:'table', t:L('Kafka module: Partitioning (3 of 4) performance and troubleshooting','Module Kafka: Partitioning (3/4) hiệu năng và troubleshooting'),
   head:['Symptom','Likely cause','Diagnose','Fix'], rows:[
   [L('One partition has most of the traffic','Một partition chứa phần lớn lưu lượng'), L('Skewed key distribution','Phân phối key bị lệch'), L('Bytes in per partition; consumer lag per partition','Byte vào theo partition; lag theo partition'), L('Better key, salting for hot keys, or a composite key','Key tốt hơn, salting cho key nóng, hoặc key ghép')],
   [L('Lag only on one partition','Chỉ một partition bị lag'), L('Hot partition or one slow poison record','Partition nóng hoặc một record độc làm chậm'), '`kafka-consumer-groups.sh --describe --group <group>`', L('Skip or dead-letter the bad record; fix the skew','Bỏ qua hoặc chuyển dead-letter record lỗi; sửa độ lệch')],
   [L('Added consumers but no speedup','Thêm consumer nhưng không nhanh hơn'), L('Consumers exceed partitions','Số consumer vượt số partition'), L('Group assignment: idle members','Phân công của group: thành viên rảnh'), L('Add partitions, or speed up each handler','Thêm partition, hoặc làm handler nhanh hơn')],
   [L('Order violated for one entity','Thứ tự bị phá với một thực thể'), L('Wrong key, partition count changed, or retries without idempotence','Sai key, số partition đổi, hoặc retry không idempotent'), L('Compare offsets and timestamps for that key','So sánh offset và timestamp của key đó'), L('Fix the key; enable idempotence; migrate to a new topic when resizing','Sửa key; bật idempotence; chuyển sang topic mới khi đổi cỡ')],
   [L('Slow rebalances and many open files','Rebalance chậm và nhiều file mở'), L('Far too many partitions','Quá nhiều partition'), L('Partitions per broker, rebalance duration','Số partition mỗi broker, thời gian rebalance'), L('Consolidate topics; size partitions from throughput targets','Gộp topic; định cỡ partition từ mục tiêu throughput')]
  ], cap:L('Sizing starting point: partitions ≥ target throughput ÷ throughput per partition, for both producers and consumers. Benchmark your own message sizes.','Điểm xuất phát định cỡ: partition ≥ throughput mục tiêu ÷ throughput mỗi partition, cho cả producer và consumer. Hãy benchmark theo kích thước message của bạn.'),
   n:L('Walk the first row with a real story: a marketplace where one seller produces 40 percent of orders. Choosing seller ID as the key creates a hot partition; choosing order ID loses per-seller ordering. The honest answer is a trade-off decided by the business.','Kể câu chuyện thật cho hàng đầu: một sàn thương mại mà một người bán tạo 40 phần trăm đơn. Chọn seller ID làm key tạo partition nóng; chọn order ID thì mất thứ tự theo người bán. Câu trả lời trung thực là một đánh đổi do nghiệp vụ quyết định.') },

 labSlide({ t:L('Kafka module: Partitioning (4 of 4) lab, production design, assessment','Module Kafka: Partitioning (4/4) lab, thiết kế production, đánh giá'),
   lead:L('Observe skew, fix it, and measure the difference.','Quan sát độ lệch, sửa nó và đo sự khác biệt.'),
   scenario:L('An orders topic has 12 partitions. One customer produces 35 percent of events and one partition lags far behind the rest.','Topic orders có 12 partition. Một khách hàng tạo 35 phần trăm sự kiện và một partition lag xa hơn hẳn các partition còn lại.'),
   input:L('Local Kafka (Docker Compose, 3 brokers). A generator script that emits 1 million order events with a Zipf-skewed customer_id. A consumer that sleeps 1 ms per record.','Kafka cục bộ (Docker Compose, 3 broker). Script sinh 1 triệu sự kiện đơn hàng với customer_id lệch kiểu Zipf. Consumer ngủ 1 ms mỗi record.'),
   tasks:[L('Create the topic with 12 partitions and replication factor 3.','Tạo topic 12 partition, replication factor 3.'), L('Produce the skewed data and record bytes and lag per partition.','Sinh dữ liệu lệch và ghi lại byte và lag theo partition.'), L('Fix the skew with salting for the hot key and measure again.','Sửa độ lệch bằng salting cho key nóng và đo lại.'), L('Kill one broker during the run and record recovery time.','Tắt một broker trong lúc chạy và ghi thời gian hồi phục.')],
   expected:L('A before-and-after table of lag per partition and total drain time, plus a note on what ordering guarantee was given up.','Bảng trước-sau về lag theo partition và tổng thời gian xử lý xong, kèm ghi chú về bảo đảm thứ tự đã nhượng lại.'),
   rubric:[L('Skew is demonstrated with data, not asserted','Độ lệch được chứng minh bằng dữ liệu, không chỉ khẳng định'), L('The fix is justified against the ordering requirement','Cách sửa được biện minh theo yêu cầu thứ tự'), L('Broker failure shows no acknowledged data loss','Lỗi broker không làm mất dữ liệu đã xác nhận'), L('Metrics and commands are reproducible','Số liệu và lệnh có thể tái lập')],
   design:L('Design the partition and key strategy for an order system with several million events per day, per-customer ordering, and one very large merchant. State the trade-offs and how you would resize the topic later.','Thiết kế chiến lược partition và key cho hệ thống đơn hàng vài triệu sự kiện mỗi ngày, cần thứ tự theo khách hàng và có một merchant rất lớn. Nêu các đánh đổi và cách bạn đổi cỡ topic sau này.'),
   n:L('Assessment: ask learners to defend the key choice in a design review. The strongest answers state the ordering guarantee they keep and the one they sacrifice.','Đánh giá: yêu cầu người học bảo vệ lựa chọn key trong buổi review thiết kế. Câu trả lời mạnh nhất nêu bảo đảm thứ tự họ giữ và cái họ hy sinh.') }),

 { k:'table', t:L('Kafka internals: ISR, rebalance, transactions, storage','Nội bộ Kafka: ISR, rebalance, transaction, lưu trữ'),
   head:['Mechanism','How it works','On failure','Key settings'], rows:[
   [L('Replication and ISR','Replication và ISR'), L('Followers fetch from the leader. The in-sync replica set is those keeping up. The high watermark is the highest offset replicated to all ISR; consumers read up to it.','Follower fetch từ leader. Tập ISR gồm các replica theo kịp. High watermark là offset cao nhất đã replicate tới mọi ISR; consumer đọc đến mức đó.'), L('A lagging follower leaves the ISR; if the leader fails, a new leader is elected from the ISR','Follower tụt lại rời ISR; nếu leader hỏng, leader mới được bầu từ ISR'), '`replica.lag.time.max.ms`, `min.insync.replicas`, `unclean.leader.election.enable`'],
   [L('Group coordinator and rebalance','Group coordinator và rebalance'), L('Members join the group; one is the leader and computes the assignment; the coordinator distributes it. Cooperative protocols move only the affected partitions.','Các thành viên tham gia group; một người là leader và tính phân công; coordinator phân phối. Giao thức hợp tác chỉ chuyển các partition bị ảnh hưởng.'), L('A member missing heartbeats or exceeding the poll interval is removed and a rebalance starts','Thành viên mất heartbeat hoặc vượt ngưỡng poll bị loại và rebalance bắt đầu'), '`session.timeout.ms`, `heartbeat.interval.ms`, `max.poll.interval.ms`'],
   [L('Idempotent producer','Producer idempotent'), L('The broker tracks a producer ID and a sequence number per partition and drops duplicates.','Broker theo dõi producer ID và số thứ tự theo partition và loại bỏ bản trùng.'), L('Retries cannot create duplicates inside a session','Retry không tạo bản trùng trong một phiên'), '`enable.idempotence`'],
   [L('Transactions','Transaction'), L('A transactional producer writes to several partitions atomically using a transaction coordinator and commit markers. Consumers with read_committed skip aborted data. A producer epoch fences zombies.','Producer giao dịch ghi nguyên tử vào nhiều partition qua transaction coordinator và commit marker. Consumer read_committed bỏ qua dữ liệu bị hủy. Epoch của producer chặn zombie.'), L('A crashed producer’s open transaction is aborted after a timeout','Giao dịch đang mở của producer bị sập sẽ bị hủy sau timeout'), '`transactional.id`, `isolation.level`'],
   [L('Log storage','Lưu trữ log'), L('Each partition is a directory of segments with offset and time indexes. Old segments are deleted by retention or rewritten by compaction (latest value per key).','Mỗi partition là thư mục các segment cùng chỉ mục offset và thời gian. Segment cũ bị xóa theo retention hoặc ghi lại bằng compaction (giá trị mới nhất mỗi key).'), L('Disk full stops the broker; recover by freeing space or reducing retention','Đầy đĩa làm broker dừng; khôi phục bằng giải phóng chỗ hoặc giảm retention'), '`retention.ms`, `segment.bytes`, `cleanup.policy`'],
   [L('KRaft controller','Controller KRaft'), L('A Raft quorum stores cluster metadata as a log and elects partition leaders.','Quorum Raft lưu metadata cluster dưới dạng log và bầu leader cho partition.'), L('Losing a controller quorum freezes metadata changes, not data already being served','Mất quorum controller làm đóng băng thay đổi metadata, không ảnh hưởng dữ liệu đang phục vụ'), '`process.roles`, `controller.quorum.voters`']
  ], cap:L('Setting names and defaults vary by Kafka version. Confirm them in the documentation for your release.','Tên và mặc định của cấu hình thay đổi theo phiên bản Kafka. Hãy xác nhận trong tài liệu của bản bạn dùng.'),
   n:L('This is the Level 3 reference table: each row explains a mechanism, what breaks, and which knob you turn.','Đây là bảng tham chiếu Level 3: mỗi hàng giải thích một cơ chế, cái gì có thể hỏng và núm nào cần vặn.') }
]);

/* ================= SPARK ================= */
addTo('Spark', [
 { k:'html', t:L('Spark internals: from query to tasks','Nội bộ Spark: từ query đến task'),
   lead:L('Understanding the plan pipeline is what lets you read the Spark UI and fix slow jobs.','Hiểu pipeline tạo plan là điều giúp bạn đọc Spark UI và sửa job chậm.'),
   html:function(){
     var tb = tableHTML(['Stage','What happens','Where to observe'], [
      [L('Parse and analyze','Parse và phân tích'), L('SQL or DataFrame code becomes a logical plan; names and types are resolved against the catalog','SQL hoặc code DataFrame thành logical plan; tên và kiểu được phân giải theo catalog'), '`explain("extended")`'],
      [L('Catalyst optimization','Tối ưu Catalyst'), L('Rules rewrite the plan: predicate pushdown, column pruning, constant folding, join reordering','Các rule viết lại plan: đẩy predicate xuống, cắt cột, gập hằng số, sắp xếp lại join'), L('Optimized logical plan','Optimized logical plan')],
      [L('Physical planning','Lập kế hoạch vật lý'), L('Chooses strategies: broadcast hash join, sort-merge join, shuffle hash join, aggregation type','Chọn chiến lược: broadcast hash join, sort-merge join, shuffle hash join, loại aggregation'), '`explain("formatted")`'],
      [L('Code generation','Sinh code'), L('Whole-stage codegen (Tungsten) fuses operators into tight loops over compact memory','Whole-stage codegen (Tungsten) hợp nhất operator thành vòng lặp chặt trên bộ nhớ gọn'), L('Stages marked with a star in the plan','Stage đánh dấu sao trong plan')],
      [L('DAG and task scheduling','Lập lịch DAG và task'), L('The DAG scheduler cuts stages at shuffles; the task scheduler sends one task per partition to executors','DAG scheduler cắt stage tại shuffle; task scheduler gửi mỗi partition một task tới executor'), L('Spark UI: Jobs, Stages, Tasks','Spark UI: Jobs, Stages, Tasks')],
      [L('Adaptive execution','Thực thi thích ứng'), L('At stage boundaries AQE uses real statistics to coalesce partitions, switch to broadcast joins and split skewed partitions','Tại ranh giới stage, AQE dùng thống kê thật để gộp partition, chuyển sang broadcast join và tách partition lệch'), L('SQL tab: adaptive plan','Tab SQL: adaptive plan')]
     ]);
     var cd = codeBlock({lang:'python', title:'read_the_plan.py', code:`
df = (
    spark.table("curated.orders")
    .where("order_date >= '2026-01-01'")
    .join(spark.table("curated.dim_customers"), "customer_id")
    .groupBy("country")
    .agg({"amount": "sum"})
)
df.explain("formatted")  # look for: PushedFilters, BroadcastHashJoin vs SortMergeJoin, Exchange (shuffle)`});
     var mem = '<div class="card plain" style="margin:14px 0"><h4>' + X('Memory model','Mô hình bộ nhớ') + '</h4><p>' + inl(X('Executor memory is split into execution memory (joins, sorts, aggregations), storage memory (cached data) and overhead for off-heap and native use. When execution memory runs out, Spark spills to disk; when overhead runs out, the container manager can kill the executor.','Bộ nhớ executor chia thành bộ nhớ thực thi (join, sort, aggregation), bộ nhớ lưu trữ (dữ liệu cache) và overhead cho off-heap và native. Khi bộ nhớ thực thi hết, Spark spill ra đĩa; khi overhead hết, trình quản lý container có thể giết executor.')) + '</p></div>';
     return tb + mem + cd;
   },
   n:L('Teach learners to read explain output before touching configuration. Most fixes (filter earlier, broadcast the small side, remove a shuffle) come from the plan, not from memory settings.','Dạy người học đọc output explain trước khi đụng tới cấu hình. Phần lớn cách sửa (lọc sớm hơn, broadcast phía nhỏ, bỏ một shuffle) đến từ plan, không phải từ cấu hình bộ nhớ.') },

 { k:'table', t:L('Spark troubleshooting: errors to fixes','Troubleshooting Spark: từ lỗi đến cách sửa'),
   head:['Symptom','Likely cause','Diagnose','Fix'], rows:[
   ['`java.lang.OutOfMemoryError` ' + X('on executor','trên executor'), L('Partitions too large, wide aggregation, skew','Partition quá lớn, aggregation rộng, lệch'), L('Stage page: spill, GC time, task size distribution','Trang stage: spill, thời gian GC, phân phối kích thước task'), L('More partitions, less data per task, fix skew, raise executor memory last','Thêm partition, giảm dữ liệu mỗi task, sửa lệch, tăng bộ nhớ executor sau cùng')],
   [L('Container killed for exceeding memory limits','Container bị giết vì vượt giới hạn bộ nhớ'), L('Off-heap, Python or native memory beyond overhead','Off-heap, Python hoặc native vượt overhead'), L('Cluster manager logs showing the kill reason','Log của cluster manager cho biết lý do bị giết'), '`spark.executor.memoryOverhead`' + X(', fewer cores per executor',', ít core hơn mỗi executor')],
   ['`FetchFailedException`', L('Executor lost during shuffle, spot reclaim, node failure','Mất executor trong shuffle, bị thu hồi spot, node hỏng'), L('Executor loss events; node and spot logs','Sự kiện mất executor; log node và spot'), L('Use stable nodes for shuffle-heavy jobs; consider shuffle service or external shuffle storage','Dùng node ổn định cho job nặng shuffle; cân nhắc shuffle service hoặc lưu shuffle ngoài')],
   [L('Driver crashes after `collect()` or `toPandas()`','Driver sập sau `collect()` hoặc `toPandas()`'), L('Result too large for driver memory','Kết quả quá lớn so với bộ nhớ driver'), L('Driver logs; result size','Log driver; kích thước kết quả'), L('Aggregate first, write to storage, or limit rows','Tổng hợp trước, ghi ra storage, hoặc giới hạn số dòng')],
   [L('Job slow with thousands of tiny tasks','Job chậm với hàng nghìn task nhỏ'), L('Too many small input files or partitions','Quá nhiều file đầu vào nhỏ hoặc partition'), L('Task count versus data size','Số task so với kích thước dữ liệu'), L('Compact files; `coalesce`; adjust `spark.sql.shuffle.partitions`','Gộp file; `coalesce`; chỉnh `spark.sql.shuffle.partitions`')],
   [L('One task takes far longer than the others','Một task lâu hơn hẳn các task còn lại'), L('Key skew','Lệch key'), L('Stage summary: max versus median task time','Tóm tắt stage: task lâu nhất so với trung vị'), L('AQE skew join, salting, filter the dominant key separately','AQE skew join, salting, lọc riêng key chiếm ưu thế')]
  ], cap:L('Change one setting at a time and record the Spark UI before and after.','Chỉ đổi một cấu hình mỗi lần và ghi lại Spark UI trước và sau.'),
   n:L('Memory settings are the last resort. First reduce the data each task sees, then tune memory.','Cấu hình bộ nhớ là phương án cuối. Trước tiên giảm dữ liệu mỗi task thấy, rồi mới tinh chỉnh bộ nhớ.') },

 labSlide({ t:L('Spark lab: find and fix a skewed join','Lab Spark: tìm và sửa một join bị lệch'),
   lead:L('Reproduce skew, read it in the Spark UI, and fix it three ways.','Tái tạo độ lệch, đọc nó trong Spark UI và sửa bằng ba cách.'),
   scenario:L('A daily job joins 500 million events to a customer table and takes four hours because one stage has a single very slow task.','Job hằng ngày join 500 triệu sự kiện với bảng khách hàng và mất bốn giờ vì một stage có đúng một task rất chậm.'),
   input:L('A local or small-cluster Spark session. A generator producing events where 30 percent share one customer_id. A customer table of 5 million rows.','Một Spark session cục bộ hoặc cluster nhỏ. Bộ sinh dữ liệu trong đó 30 phần trăm sự kiện chung một customer_id. Bảng khách hàng 5 triệu dòng.'),
   tasks:[L('Run the join and capture the stage task-time distribution.','Chạy join và ghi lại phân phối thời gian task của stage.'), L('Fix 1: enable adaptive skew join. Fix 2: salt the hot key. Fix 3: handle the hot key in a separate broadcast join.','Cách 1: bật adaptive skew join. Cách 2: salting key nóng. Cách 3: xử lý key nóng bằng broadcast join riêng.'), L('Compare runtime, shuffle bytes and result equality for all variants.','So sánh thời gian chạy, byte shuffle và kết quả giống nhau cho mọi biến thể.')],
   expected:L('A table with runtime and shuffle bytes for the baseline and each fix, and proof that all outputs match.','Bảng thời gian chạy và byte shuffle cho baseline và từng cách sửa, cùng bằng chứng mọi kết quả khớp nhau.'),
   rubric:[L('Skew is shown with max versus median task time','Độ lệch được chỉ ra bằng task lâu nhất so với trung vị'), L('Correctness verified, not assumed','Tính đúng đắn được kiểm chứng, không giả định'), L('Trade-offs of each fix explained','Giải thích đánh đổi của từng cách sửa'), L('Only one variable changed per experiment','Mỗi thí nghiệm chỉ đổi một biến')],
   design:L('Design the join strategy for a table whose hot keys change daily and are not known in advance.','Thiết kế chiến lược join cho bảng có key nóng đổi hằng ngày và không biết trước.'),
   n:L('Look for learners who verify equality of outputs; a faster wrong answer is a failure.','Tìm những người học kiểm chứng kết quả giống nhau; câu trả lời nhanh hơn nhưng sai là thất bại.') })
]);

/* ================= FLINK ================= */
addTo('Flink', [
 { k:'html', t:L('Flink internals: time, state and checkpoints','Nội bộ Flink: thời gian, state và checkpoint'),
   lead:L('Four mechanisms explain almost every Flink behaviour: event time, watermarks, keyed state and checkpoints.','Bốn cơ chế giải thích gần như mọi hành vi của Flink: event time, watermark, keyed state và checkpoint.'),
   html:function(){
     var tb = tableHTML(['Mechanism','How it works','On failure','Key settings'], [
      [L('Watermarks','Watermark'), L('A watermark W(t) asserts that no more events with timestamp ≤ t are expected. A window fires when the watermark passes its end. With several inputs the operator uses the minimum.','Watermark W(t) khẳng định sẽ không còn sự kiện có timestamp ≤ t. Cửa sổ kích hoạt khi watermark vượt cuối cửa sổ. Với nhiều đầu vào, operator dùng giá trị nhỏ nhất.'), L('An idle source partition can stall the watermark; later events may be dropped as late','Một partition nguồn rảnh có thể làm watermark đứng yên; sự kiện đến sau có thể bị bỏ như trễ'), L('watermark strategy, `table.exec.source.idle-timeout`, allowed lateness','chiến lược watermark, `table.exec.source.idle-timeout`, allowed lateness')],
      [L('Keyed state','Keyed state'), L('State is partitioned by key and lives with the operator, on heap or in RocksDB on local disk.','State được chia theo key và nằm cùng operator, trên heap hoặc trong RocksDB ở đĩa cục bộ.'), L('Large state slows checkpoints and recovery','State lớn làm checkpoint và khôi phục chậm'), L('state backend, state TTL','state backend, state TTL')],
      [L('Checkpoint barriers','Checkpoint barrier'), L('The JobManager injects barriers into the streams. Each operator snapshots its state when barriers arrive, aligned across inputs, and acknowledges. When all acknowledge the checkpoint is complete.','JobManager chèn barrier vào các luồng. Mỗi operator snapshot state khi barrier đến, căn chỉnh giữa các đầu vào, rồi xác nhận. Khi tất cả xác nhận thì checkpoint hoàn tất.'), L('Restart from the last completed checkpoint; sources rewind to saved offsets','Khởi động lại từ checkpoint hoàn tất gần nhất; nguồn quay về offset đã lưu'), L('interval, timeout, min pause, unaligned checkpoints','interval, timeout, min pause, unaligned checkpoint')],
      [L('Backpressure','Backpressure'), L('Credit-based flow control: a slow downstream stops granting credits and upstream operators slow down.','Điều khiển luồng theo credit: phía sau chậm ngừng cấp credit và các operator phía trước chậm lại.'), L('Persistent backpressure delays barriers and checkpoints','Backpressure kéo dài làm trễ barrier và checkpoint'), L('parallelism, buffer settings, find the slow operator','parallelism, cấu hình buffer, tìm operator chậm')],
      [L('Savepoints','Savepoint'), L('A user-triggered, portable snapshot used for upgrades, rescaling and migrations.','Snapshot do người dùng kích hoạt, mang đi được, dùng cho nâng cấp, đổi cỡ và di chuyển.'), L('Incompatible state schema blocks restore','Schema state không tương thích làm restore thất bại'), L('operator UIDs, state schema evolution','UID của operator, tiến hóa schema state')]
     ]);
     var cd = codeBlock({lang:'sql', title:'orders_tumbling_window.sql (Flink SQL)', code:`
CREATE TABLE orders (
    order_id    BIGINT,
    customer_id BIGINT,
    amount      DECIMAL(10, 2),
    order_ts    TIMESTAMP(3),
    WATERMARK FOR order_ts AS order_ts - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'orders',
    'properties.bootstrap.servers' = 'broker1:9092',
    'properties.group.id' = 'flink-orders',
    'scan.startup.mode' = 'earliest-offset',
    'format' = 'json'
);

SELECT window_start, window_end, COUNT(*) AS orders, SUM(amount) AS revenue
FROM TABLE(TUMBLE(TABLE orders, DESCRIPTOR(order_ts), INTERVAL '1' MINUTE))
GROUP BY window_start, window_end;`});
     return tb + '<div style="margin-top:14px">' + cd + '</div>';
   },
   n:L('The 5-second watermark delay is a trade-off: a larger delay tolerates more disorder but increases latency. Setting names change between Flink versions, so verify them in the docs.','Độ trễ watermark 5 giây là một đánh đổi: trễ lớn hơn chịu được nhiều xáo trộn hơn nhưng tăng độ trễ. Tên cấu hình thay đổi giữa các phiên bản Flink, hãy kiểm tra trong tài liệu.') },

 { k:'table', t:L('Flink troubleshooting: symptoms to fixes','Troubleshooting Flink: từ triệu chứng đến cách sửa'),
   head:['Symptom','Likely cause','Diagnose','Fix'], rows:[
   [L('Checkpoints time out or fail','Checkpoint bị timeout hoặc thất bại'), L('Backpressure, huge state, slow storage','Backpressure, state quá lớn, storage chậm'), L('Checkpoint history: duration, size, alignment time','Lịch sử checkpoint: thời lượng, kích thước, thời gian căn chỉnh'), L('Fix the slow operator, shrink state, try unaligned checkpoints, check storage throughput','Sửa operator chậm, giảm state, thử unaligned checkpoint, kiểm tra throughput storage')],
   [L('Job is backpressured','Job bị backpressure'), L('A slow sink, skewed key, or too little parallelism','Sink chậm, key lệch, hoặc parallelism quá thấp'), L('Backpressure and busy-time metrics per operator','Metric backpressure và busy-time theo operator'), L('Scale the bottleneck operator, batch sink writes, rebalance keys','Mở rộng operator nút thắt, gộp batch ghi sink, cân bằng key')],
   [L('Windows never fire','Cửa sổ không bao giờ kích hoạt'), L('Watermark is stuck: idle partitions or no timestamps','Watermark kẹt: partition rảnh hoặc không có timestamp'), L('Watermark per source subtask in the UI','Watermark theo từng subtask nguồn trong UI'), L('Set idleness timeout; verify the timestamp field','Đặt idle timeout; kiểm tra trường timestamp')],
   [L('Results missing late events','Kết quả thiếu sự kiện đến muộn'), L('Allowed lateness too small','Allowed lateness quá nhỏ'), L('Late-record counters, side output','Bộ đếm record trễ, side output'), L('Increase lateness or route late data to a side output and correct later','Tăng độ trễ cho phép hoặc đưa dữ liệu trễ ra side output rồi sửa sau')],
   [L('State grows without bound','State phình mãi'), L('No TTL on keyed state; high-cardinality keys','Không có TTL cho keyed state; key có cardinality cao'), L('State size per operator over time','Kích thước state theo operator theo thời gian'), L('Set state TTL, redesign keys, use RocksDB','Đặt state TTL, thiết kế lại key, dùng RocksDB')],
   [L('Restart loop','Vòng lặp khởi động lại'), L('Poison record, deserialization error, restore failure','Record độc, lỗi deserialize, restore thất bại'), L('Exception stack in the JobManager logs','Stack exception trong log JobManager'), L('Skip or dead-letter the record; fix schema compatibility; restore from a savepoint','Bỏ qua hoặc dead-letter record; sửa tương thích schema; restore từ savepoint')]
  ], cap:L('Backpressure is the main health signal. Always start by finding which operator is the slow one.','Backpressure là tín hiệu sức khỏe chính. Luôn bắt đầu bằng việc tìm operator nào đang chậm.'),
   n:L('Practice reading the Flink UI: the checkpoint tab, backpressure column and watermark view answer most questions.','Luyện đọc Flink UI: tab checkpoint, cột backpressure và màn watermark trả lời hầu hết câu hỏi.') },

 labSlide({ t:L('Flink lab: out-of-order events and recovery','Lab Flink: sự kiện sai thứ tự và khôi phục'),
   lead:L('Prove that event-time windows are correct under disorder and that a crash loses nothing.','Chứng minh cửa sổ event-time đúng khi dữ liệu xáo trộn và crash không làm mất gì.'),
   scenario:L('Per-minute revenue from an orders stream must be correct even though 5 percent of events arrive up to 30 seconds late, and the job must survive a crash.','Doanh thu mỗi phút từ luồng đơn hàng phải đúng dù 5 phần trăm sự kiện đến trễ tới 30 giây, và job phải sống sót qua một lần crash.'),
   input:L('Kafka topic with a generator that shuffles event timestamps. Flink session with checkpoints every 10 seconds to local storage. An independent batch query over the same data as ground truth.','Topic Kafka với bộ sinh xáo trộn timestamp. Flink session có checkpoint mỗi 10 giây vào storage cục bộ. Một query batch độc lập trên cùng dữ liệu làm chuẩn.'),
   tasks:[L('Run the windowed query with a 5-second watermark delay and compare with ground truth.','Chạy query theo cửa sổ với độ trễ watermark 5 giây và so với chuẩn.'), L('Tune the delay and allowed lateness until the difference is below 0.1 percent.','Chỉnh độ trễ và allowed lateness đến khi chênh lệch dưới 0.1 phần trăm.'), L('Kill the TaskManager mid-run and confirm no duplicates or gaps.','Tắt TaskManager giữa chừng và xác nhận không có trùng hay thiếu.'), L('Take a savepoint, change parallelism and resume.','Lấy savepoint, đổi parallelism rồi chạy tiếp.')],
   expected:L('A report of window error versus latency for each delay setting, and a recovery log showing restore from checkpoint.','Báo cáo sai số cửa sổ theo độ trễ cho từng cấu hình, và log khôi phục cho thấy restore từ checkpoint.'),
   rubric:[L('Correctness measured against ground truth','Tính đúng đo so với dữ liệu chuẩn'), L('Latency versus accuracy trade-off quantified','Đánh đổi độ trễ và độ chính xác được định lượng'), L('Recovery shows exactly-once results','Khôi phục cho kết quả exactly-once'), L('Savepoint rescale succeeds','Đổi cỡ bằng savepoint thành công')],
   design:L('Design the late-data policy for a financial report that must be final within one hour but may be corrected afterwards.','Thiết kế chính sách dữ liệu trễ cho báo cáo tài chính phải chốt trong một giờ nhưng có thể điều chỉnh sau đó.'),
   n:L('The key learning: lateness handling is a business decision about when a number is final.','Điểm học chính: xử lý dữ liệu trễ là quyết định nghiệp vụ về thời điểm một con số được coi là chốt.') })
]);

/* ================= ICEBERG ================= */
addTo('Iceberg', [
 { k:'code', t:L('Iceberg internals: snapshots, maintenance and concurrency','Nội bộ Iceberg: snapshot, bảo trì và đồng thời'),
   lead:L('Every commit creates a snapshot. Maintenance keeps metadata small, files large and storage bounded.','Mỗi commit tạo một snapshot. Bảo trì giữ metadata nhỏ, file lớn và dung lượng có giới hạn.'),
   blocks:[
    {lang:'sql', title:'inspect_and_time_travel.sql (Spark SQL)', code:`
SELECT * FROM catalog.db.orders.snapshots;         -- every commit
SELECT * FROM catalog.db.orders.manifests;         -- manifest files and stats
SELECT file_path, record_count, file_size_in_bytes FROM catalog.db.orders.files;

SELECT * FROM catalog.db.orders VERSION AS OF 4871234567890;
SELECT * FROM catalog.db.orders TIMESTAMP AS OF '2026-11-01 00:00:00';`},
    {lang:'sql', title:'maintenance.sql (run on a schedule)', code:`
-- 1) Compact small files toward a target size
CALL catalog.system.rewrite_data_files(
    table => 'db.orders',
    options => map('target-file-size-bytes', '536870912')
);

-- 2) Rewrite manifests so planning stays fast
CALL catalog.system.rewrite_manifests('db.orders');

-- 3) Drop old snapshots (this removes time travel to them)
CALL catalog.system.expire_snapshots(
    table => 'db.orders',
    older_than => TIMESTAMP '2026-10-01 00:00:00',
    retain_last => 5
);

-- 4) Delete files no snapshot references
CALL catalog.system.remove_orphan_files(table => 'db.orders');`}
   ],
   points:[
    {h:L('Snapshot lifecycle','Vòng đời snapshot'), p:L('Each commit adds a snapshot; expiring snapshots lets unreferenced files be deleted. Time travel only works for retained snapshots.','Mỗi commit thêm một snapshot; hết hạn snapshot cho phép xóa file không còn được tham chiếu. Time travel chỉ hoạt động với snapshot còn giữ.')},
    {h:L('Optimistic concurrency','Đồng thời lạc quan'), tag:'senior', p:L('Writers commit by swapping the catalog pointer. If another writer won, Iceberg validates for conflicts and retries, or fails when changes overlap.','Writer commit bằng cách đổi con trỏ catalog. Nếu writer khác thắng, Iceberg kiểm tra xung đột và retry, hoặc thất bại khi thay đổi chồng lấn.')},
    {h:L('Delete files','File delete'), p:L('Merge-on-read writes delete files that readers must apply. Compaction folds them back into data files.','Merge-on-read ghi file delete mà reader phải áp dụng. Compaction gộp chúng lại vào file dữ liệu.')},
    {h:L('Safety first','An toàn trước'), tag:'senior', p:L('Never run orphan cleanup with a retention shorter than your longest running write job.','Không chạy dọn file mồ côi với thời gian giữ ngắn hơn job ghi chạy lâu nhất của bạn.')}
   ],
   n:L('Procedure names and arguments are from the Iceberg Spark procedures and may differ by version and engine. Always test maintenance on a copy first.','Tên và tham số thủ tục lấy từ Iceberg Spark procedures và có thể khác theo phiên bản và engine. Luôn test bảo trì trên bản sao trước.') },

 { k:'table', t:L('Iceberg troubleshooting and performance','Troubleshooting và hiệu năng Iceberg'),
   head:['Symptom','Likely cause','Diagnose','Fix'], rows:[
   [L('Query planning is slow','Lập kế hoạch query chậm'), L('Too many manifests or snapshots','Quá nhiều manifest hoặc snapshot'), L('Count of `.manifests`; planning time in engine UI','Số dòng `.manifests`; thời gian planning trong UI engine'), L('`rewrite_manifests`, expire snapshots','`rewrite_manifests`, hết hạn snapshot')],
   [L('Reads are slow with many tiny files','Đọc chậm vì nhiều file nhỏ'), L('Streaming or frequent small writes','Ghi streaming hoặc ghi nhỏ thường xuyên'), L('File size distribution from `.files`','Phân phối kích thước file từ `.files`'), L('`rewrite_data_files`; tune write batch size','`rewrite_data_files`; chỉnh kích thước batch ghi')],
   [L('Commit failures under concurrency','Commit thất bại khi đồng thời'), L('Overlapping writers modify the same files','Các writer chồng lấn sửa cùng file'), L('Commit conflict errors in writer logs','Lỗi xung đột commit trong log writer'), L('Partition-aligned writers, retry settings, serialize conflicting jobs','Writer căn theo partition, cấu hình retry, tuần tự hóa job xung đột')],
   [L('Storage keeps growing','Dung lượng cứ tăng'), L('Old snapshots and orphan files','Snapshot cũ và file mồ côi'), L('Storage size versus live data size','Dung lượng so với kích thước dữ liệu sống'), L('Scheduled `expire_snapshots` and `remove_orphan_files`','Lên lịch `expire_snapshots` và `remove_orphan_files`')],
   [L('Reads slow after many updates and deletes','Đọc chậm sau nhiều lần update và delete'), L('Accumulated delete files (merge-on-read)','File delete tích tụ (merge-on-read)'), L('Delete file count per partition','Số file delete theo partition'), L('Compact, or use copy-on-write for read-heavy tables','Compaction, hoặc dùng copy-on-write cho bảng nặng đọc')],
   [L('Engine cannot see the latest data','Engine không thấy dữ liệu mới nhất'), L('Catalog cache or wrong catalog configuration','Cache catalog hoặc cấu hình catalog sai'), L('Compare current snapshot ID across engines','So sánh ID snapshot hiện tại giữa các engine'), L('Refresh the table; align catalog settings','Làm mới bảng; đồng bộ cấu hình catalog')]
  ], cap:L('Treat maintenance as a scheduled, monitored pipeline, like any other data job.','Coi bảo trì là một pipeline có lịch và có giám sát, như mọi job dữ liệu khác.'),
   n:L('The system tables (snapshots, files, manifests) are the main debugging tool: they turn invisible metadata problems into queries.','Các bảng hệ thống (snapshots, files, manifests) là công cụ debug chính: chúng biến vấn đề metadata vô hình thành các query.') },

 labSlide({ t:L('Iceberg lab: small files, snapshots and time travel','Lab Iceberg: file nhỏ, snapshot và time travel'),
   lead:L('Create the problem, measure it, fix it, and recover from a bad write.','Tạo ra vấn đề, đo nó, sửa nó và khôi phục sau một lần ghi hỏng.'),
   scenario:L('A streaming job writes every minute, leaving thousands of tiny files. Later a bad backfill overwrites good data.','Một job streaming ghi mỗi phút, để lại hàng nghìn file nhỏ. Sau đó một lần backfill hỏng ghi đè dữ liệu tốt.'),
   input:L('Spark with an Iceberg REST or Hadoop catalog on local object storage. A script appending 100 small batches. A second script that overwrites a partition by mistake.','Spark với Iceberg REST hoặc Hadoop catalog trên object storage cục bộ. Một script ghi thêm 100 batch nhỏ. Một script thứ hai ghi đè nhầm một partition.'),
   tasks:[L('Append 100 small batches; record file count, average size and query time.','Ghi thêm 100 batch nhỏ; ghi lại số file, kích thước trung bình và thời gian query.'), L('Compact and rewrite manifests; measure again.','Compaction và viết lại manifest; đo lại.'), L('Run the bad overwrite, then restore the previous state using a snapshot.','Chạy lần ghi đè hỏng rồi khôi phục trạng thái trước bằng snapshot.'), L('Expire old snapshots and verify storage shrinks without breaking the current table.','Hết hạn snapshot cũ và xác minh dung lượng giảm mà không hỏng bảng hiện tại.')],
   expected:L('Before-and-after metrics for files and query time, and a verified restore with matching row counts and checksums.','Số liệu trước-sau về file và thời gian query, và một lần khôi phục đã kiểm chứng với số dòng và checksum khớp.'),
   rubric:[L('Improvement is measured, not asserted','Cải thiện được đo, không chỉ khẳng định'), L('Restore verified by data comparison','Khôi phục được kiểm chứng bằng so sánh dữ liệu'), L('Retention settings justified','Cấu hình retention được biện minh'), L('No data loss from cleanup','Dọn dẹp không gây mất dữ liệu')],
   design:L('Design the maintenance schedule and retention policy for a high-volume streaming table that must support seven days of time travel.','Thiết kế lịch bảo trì và chính sách retention cho bảng streaming khối lượng lớn phải hỗ trợ time travel bảy ngày.'),
   n:L('The restore step is the memorable one: it shows what snapshots really buy you.','Bước khôi phục là bước đáng nhớ nhất: nó cho thấy snapshot thực sự mang lại điều gì.') })
]);

/* ================= AIRFLOW ================= */
addTo('Airflow', [
 { k:'html', t:L('Airflow internals: scheduler loop, task states and executors','Nội bộ Airflow: vòng lặp scheduler, trạng thái task và executor'),
   lead:L('Every Airflow behaviour is a state transition recorded in the metadata database.','Mọi hành vi của Airflow đều là một chuyển trạng thái được ghi trong metadata database.'),
   html:function(){
     var st = tableHTML(['State','Meaning','Next'], [
      ['scheduled', L('Dependencies are met and the scheduler has decided the task should run','Phụ thuộc đã thỏa và scheduler quyết định task nên chạy'), 'queued'],
      ['queued', L('Handed to the executor; waiting for a worker or pool slot','Đã giao cho executor; chờ worker hoặc slot trong pool'), 'running'],
      ['running', L('A worker is executing the task','Một worker đang thực thi task'), 'success, failed, up_for_retry, deferred'],
      ['up_for_retry', L('Failed but retries remain; waits for the retry delay','Thất bại nhưng còn retry; chờ độ trễ retry'), 'scheduled'],
      ['deferred', L('Waiting on a trigger in the triggerer without holding a worker','Chờ một trigger trong triggerer mà không giữ worker'), 'scheduled'],
      ['upstream_failed', L('An upstream task failed, so this one will not run','Task phía trước thất bại nên task này sẽ không chạy'), L('terminal','kết thúc')]
     ]);
     var ex = tableHTML(['Executor','How it runs tasks','Isolation','Best for'], [
      ['LocalExecutor', L('Subprocesses on the scheduler machine','Tiến trình con trên máy scheduler'), L('Low','Thấp'), L('Small setups and development','Cấu hình nhỏ và phát triển')],
      ['CeleryExecutor', L('Tasks sent through a broker to long-lived workers','Task gửi qua broker tới worker chạy lâu dài'), L('Medium: shared worker environment','Trung bình: môi trường worker dùng chung'), L('Steady high task volume, fast start','Số task cao ổn định, khởi động nhanh')],
      ['KubernetesExecutor', L('One pod per task','Mỗi task một pod'), L('High: per-task image and resources','Cao: image và tài nguyên riêng mỗi task'), L('Varied dependencies, bursty load','Phụ thuộc đa dạng, tải bùng phát')]
     ]);
     var cd = codeBlock({lang:'python', title:'concurrency_controls.py', code:`
import pendulum
from airflow.decorators import dag, task


@dag(
    dag_id="warehouse_loads",
    schedule="@hourly",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    catchup=False,
    max_active_runs=1,    # one run at a time
    max_active_tasks=8,   # tasks running in parallel within this DAG
)
def warehouse_loads():
    @task(pool="warehouse_pool", retries=3, retry_delay=pendulum.duration(minutes=5))
    def load_table(name: str) -> None:
        ...  # the pool caps how many of these hit the warehouse at once

    for table in ["orders", "customers", "payments"]:
        load_table.override(task_id=f"load_{table}")(table)


warehouse_loads()`});
     return st + '<div style="margin-top:14px">' + ex + '</div><div style="margin-top:14px">' + cd + '</div>';
   },
   n:L('The scheduler loop: parse DAGs, create runs, evaluate task dependencies, queue tasks, check on running ones. Pools, parallelism and max_active settings are the dials that prevent overload. Executor behaviour and some settings differ in Airflow 3, so check the docs.','Vòng lặp scheduler: parse DAG, tạo run, đánh giá phụ thuộc task, đưa task vào hàng đợi, kiểm tra task đang chạy. Pool, parallelism và các cấu hình max_active là các núm chặn quá tải. Hành vi executor và một số cấu hình khác ở Airflow 3, hãy xem tài liệu.') },

 { k:'table', t:L('Airflow troubleshooting: symptoms to fixes','Troubleshooting Airflow: từ triệu chứng đến cách sửa'),
   head:['Symptom','Likely cause','Diagnose','Fix'], rows:[
   [L('Tasks stuck in queued','Task kẹt ở queued'), L('Pool full, worker slots exhausted, executor not picking up','Pool đầy, hết slot worker, executor không nhận việc'), L('Pool usage; worker and executor logs','Mức dùng pool; log worker và executor'), L('Raise pool or parallelism; add workers; fix the executor connection','Tăng pool hoặc parallelism; thêm worker; sửa kết nối executor')],
   [L('DAG missing from the UI','DAG không hiện trong UI'), L('Import error or slow parsing','Lỗi import hoặc parse chậm'), L('Import errors page; DAG processor logs','Trang import error; log DAG processor'), L('Fix the import; keep top-level code light','Sửa import; giữ code cấp cao nhẹ')],
   [L('Scheduler lag or stalled runs','Scheduler trễ hoặc run bị đứng'), L('Heavy parsing, slow metadata database','Parse nặng, metadata database chậm'), L('Scheduler heartbeat; database CPU and locks','Heartbeat scheduler; CPU và khóa của database'), L('Reduce DAG count and top-level work; tune and clean the database','Giảm số DAG và việc cấp cao; tinh chỉnh và dọn database')],
   [L('Task marked failed with no logs (zombie)','Task bị đánh dấu failed không có log (zombie)'), L('Worker died or lost heartbeat','Worker chết hoặc mất heartbeat'), L('Worker and node logs; OOM kills','Log worker và node; bị OOM kill'), L('Raise memory; use deferrable operators for long waits','Tăng bộ nhớ; dùng deferrable operator cho các lần chờ dài')],
   [L('Backfill duplicates data','Backfill làm trùng dữ liệu'), L('Tasks are not idempotent','Task không idempotent'), L('Compare row counts per partition','So sánh số dòng mỗi partition'), L('Key outputs by logical date; overwrite partitions or merge','Khóa đầu ra theo logical date; ghi đè partition hoặc merge')],
   [L('Too many runs fired at once','Quá nhiều run chạy cùng lúc'), L('`catchup=True` on an old start date','`catchup=True` với start date cũ'), L('Run list and start date','Danh sách run và start date'), L('Set `catchup=False`; backfill deliberately in bounded ranges','Đặt `catchup=False`; backfill có chủ đích theo khoảng giới hạn')]
  ], cap:L('Read task logs first, then scheduler logs, then the metadata database.','Đọc log task trước, rồi log scheduler, rồi metadata database.'),
   n:L('Most incidents trace back to one of three things: non-idempotent tasks, resource limits (pools and workers), or heavy DAG files.','Phần lớn sự cố quy về một trong ba điều: task không idempotent, giới hạn tài nguyên (pool và worker), hoặc file DAG nặng.') },

 labSlide({ t:L('Airflow lab: a resilient, backfillable pipeline','Lab Airflow: pipeline bền bỉ và backfill được'),
   lead:L('Build a daily pipeline, break it on purpose, and recover without duplicates.','Xây pipeline hằng ngày, cố tình làm hỏng nó và khôi phục mà không trùng dữ liệu.'),
   scenario:L('A daily extract-load-transform pipeline must survive failures, run 30 days of history safely, and not overload the warehouse.','Pipeline extract-load-transform hằng ngày phải sống sót qua lỗi, chạy an toàn 30 ngày lịch sử và không làm quá tải warehouse.'),
   input:L('Airflow in Docker Compose. A fake API returning data per date and failing 20 percent of calls. DuckDB or Postgres as the warehouse.','Airflow trong Docker Compose. Một API giả trả dữ liệu theo ngày và lỗi 20 phần trăm số lần gọi. DuckDB hoặc Postgres làm warehouse.'),
   tasks:[L('Write the DAG with retries, backoff, a row-count check and idempotent loads keyed by logical date.','Viết DAG có retry, backoff, kiểm tra số dòng và load idempotent khóa theo logical date.'), L('Backfill 30 days with limited concurrency using a pool.','Backfill 30 ngày với đồng thời giới hạn bằng pool.'), L('Kill a worker mid-run and rerun failed tasks.','Tắt một worker giữa chừng và chạy lại task lỗi.'), L('Add an alert for a missed freshness target.','Thêm cảnh báo khi trễ mục tiêu freshness.')],
   expected:L('30 partitions loaded exactly once, matching row counts against the source, and an alert fired in a failure drill.','30 partition được nạp đúng một lần, số dòng khớp nguồn và một cảnh báo được kích hoạt trong bài diễn tập lỗi.'),
   rubric:[L('Reruns create no duplicates','Chạy lại không tạo trùng'), L('Concurrency is bounded','Đồng thời có giới hạn'), L('Failure handling is visible and tested','Xử lý lỗi nhìn thấy được và đã test'), L('DAG file is light to parse','File DAG nhẹ khi parse')],
   design:L('Choose an executor and sizing for 2,000 daily tasks with mixed Python dependencies, and justify the choice.','Chọn executor và định cỡ cho 2.000 task mỗi ngày với phụ thuộc Python hỗn hợp, và biện minh lựa chọn.'),
   n:L('Check that learners actually compared row counts after the backfill instead of trusting green task states.','Kiểm tra xem người học có thật sự so sánh số dòng sau backfill thay vì tin vào trạng thái xanh của task.') })
]);

/* ================= DBT ================= */
addTo('dbt', [
 { k:'code', t:L('dbt internals: the graph, selection and state comparison','Nội bộ dbt: đồ thị, selection và so sánh state'),
   lead:L('dbt is a graph tool. Selection syntax and state comparison are how you run only what matters.','dbt là công cụ đồ thị. Cú pháp selection và so sánh state giúp bạn chỉ chạy những gì quan trọng.'),
   blocks:[
    {lang:'bash', title:'selection_cheatsheet.sh', code:`
dbt ls --select stg_orders+                       # a model and everything downstream
dbt ls --select +fct_orders                       # a model and everything upstream
dbt ls --select tag:daily,config.materialized:incremental
dbt build --select state:modified+ --defer --state ./prod-artifacts
dbt build --select result:error+ --state ./target   # rerun failures and their children`},
    {lang:'python', title:'inspect_manifest.py', code:`
import json

with open("target/manifest.json") as f:
    manifest = json.load(f)

for unique_id, node in manifest["nodes"].items():
    if node["resource_type"] == "model":
        parents = node["depends_on"]["nodes"]
        print(unique_id, node["config"]["materialized"], f"{len(parents)} parents")`}
   ],
   points:[
    {h:L('Lifecycle','Vòng đời'), p:L('Parse builds the manifest, selection picks nodes, compile renders Jinja to SQL, execute runs models in dependency order, then writes artifacts.','Parse dựng manifest, selection chọn node, compile render Jinja ra SQL, execute chạy model theo thứ tự phụ thuộc, rồi ghi artifact.')},
    {h:L('State comparison','So sánh state'), tag:'senior', p:L('`state:modified` compares your manifest with a saved one (usually production) by file and config checksums.','`state:modified` so manifest của bạn với manifest đã lưu (thường là production) bằng checksum file và cấu hình.')},
    {h:L('Materialization lifecycle','Vòng đời materialization'), p:L('A materialization is a macro: it decides how to create, replace, merge or skip an object in the warehouse.','Materialization là một macro: nó quyết định cách tạo, thay, merge hoặc bỏ qua một đối tượng trong warehouse.')},
    {h:L('Adapters','Adapter'), tag:'senior', p:L('Adapters translate dbt’s abstractions into each warehouse’s dialect and capabilities. Behaviour such as incremental strategies depends on the adapter.','Adapter dịch các khái niệm của dbt sang dialect và khả năng của từng warehouse. Hành vi như incremental strategy phụ thuộc adapter.')}
   ],
   n:L('Selector syntax and artifact fields evolve with dbt versions. The manifest is a rich data source: observability tools and lineage extractors read it.','Cú pháp selector và trường artifact thay đổi theo phiên bản dbt. Manifest là nguồn dữ liệu phong phú: công cụ observability và công cụ trích lineage đọc nó.') },

 { k:'table', t:L('dbt troubleshooting: symptoms to fixes','Troubleshooting dbt: từ triệu chứng đến cách sửa'),
   head:['Symptom','Likely cause','Diagnose','Fix'], rows:[
   ['`Compilation Error: model not found`', L('Wrong `ref` name, disabled model, or package not installed','Sai tên `ref`, model bị tắt, hoặc chưa cài package'), '`dbt ls`, `dbt deps`', L('Fix the name or enable the model; run `dbt deps`','Sửa tên hoặc bật model; chạy `dbt deps`')],
   [L('Incremental model drifts from source','Model incremental lệch khỏi nguồn'), L('Late data, logic change, unreliable `updated_at`','Dữ liệu trễ, đổi logic, `updated_at` không đáng tin'), L('Compare counts and checksums for recent partitions','So sánh số dòng và checksum của các partition gần đây'), L('Overlap window, periodic `--full-refresh`, reconciliation test','Cửa sổ chồng lấn, `--full-refresh` định kỳ, test đối soát')],
   [L('Run takes much longer than before','Lần chạy lâu hơn nhiều so với trước'), L('A model changed to a table, a new fan-out join, or full scans','Model đổi thành table, join nở dòng mới, hoặc quét toàn bảng'), L('`run_results.json` timing; warehouse query profile','Thời gian trong `run_results.json`; query profile của warehouse'), L('Incremental, prune columns, fix the join grain','Incremental, cắt cột, sửa grain của join')],
   [L('Tests flaky or fail only in CI','Test chập chờn hoặc chỉ fail ở CI'), L('Non-deterministic data, time-dependent tests, missing fixtures','Dữ liệu không tất định, test phụ thuộc thời gian, thiếu fixture'), L('Rerun with a fixed dataset','Chạy lại với tập dữ liệu cố định'), L('Pin test data, use unit tests, avoid `current_date` in tests','Cố định dữ liệu test, dùng unit test, tránh `current_date` trong test')],
   [L('Contract error after a column change','Lỗi contract sau khi đổi cột'), L('Column name or type no longer matches the declared contract','Tên hoặc kiểu cột không còn khớp contract đã khai báo'), L('Compare model SQL with the YAML','So sánh SQL của model với YAML'), L('Update the contract with a version bump; notify consumers','Cập nhật contract kèm tăng version; thông báo cho consumer')],
   [L('Connection or concurrency errors','Lỗi kết nối hoặc đồng thời'), L('Too many threads for the warehouse','Quá nhiều thread so với warehouse'), L('Warehouse concurrency and queue metrics','Metric đồng thời và hàng đợi của warehouse'), L('Lower `threads`; isolate dbt on its own warehouse','Giảm `threads`; cô lập dbt trên warehouse riêng')]
  ], cap:L('`target/run_results.json` and `target/compiled` answer most “what ran and how” questions.','`target/run_results.json` và `target/compiled` trả lời hầu hết câu hỏi “đã chạy gì và thế nào”.'),
   n:L('Teach learners to open the compiled SQL: a surprising number of dbt bugs are bugs in the rendered SQL, not in dbt.','Dạy người học mở SQL đã compile: số lượng bug dbt thật ra là bug trong SQL đã render, không phải trong dbt, nhiều đáng ngạc nhiên.') },

 labSlide({ t:L('dbt lab: a tested, incremental, contract-backed project','Lab dbt: dự án có test, incremental và contract'),
   lead:L('Build a small project the way a team would, then change it safely.','Xây một dự án nhỏ như một đội thật sẽ làm, rồi thay đổi nó an toàn.'),
   scenario:L('Build orders and customers marts from raw tables, and ship a breaking column change without surprising downstream users.','Xây mart orders và customers từ bảng thô, và phát hành thay đổi cột gây phá vỡ mà không làm bất ngờ người dùng phía sau.'),
   input:L('DuckDB or Postgres, dbt Core, a seed of raw orders and customers with intentional duplicates and late updates.','DuckDB hoặc Postgres, dbt Core, một seed orders và customers thô có cố ý trùng lặp và cập nhật muộn.'),
   tasks:[L('Create staging, intermediate and mart models with unique, not-null and relationship tests.','Tạo model staging, intermediate và mart với test unique, not-null và relationship.'), L('Make the fact incremental with a safe overlap and write a unit test for the tricky logic.','Làm fact thành incremental với chồng lấn an toàn và viết unit test cho logic khó.'), L('Add a contract to a public mart, then rename a column using a new model version.','Thêm contract cho một mart công khai, rồi đổi tên một cột bằng phiên bản model mới.'), L('Add a CI workflow that builds only modified models.','Thêm workflow CI chỉ build các model đã đổi.')],
   expected:L('A passing CI run, evidence that late data is handled, and a change log explaining the versioned model change.','Một lần chạy CI thành công, bằng chứng dữ liệu trễ được xử lý và changelog giải thích thay đổi model có version.'),
   rubric:[L('Tests catch the planted data problems','Test bắt được các lỗi dữ liệu đã gài'), L('Incremental logic reconciles with a full refresh','Logic incremental đối soát khớp với full refresh'), L('Breaking change handled with versions, not surprise','Thay đổi phá vỡ được xử lý bằng version, không gây bất ngờ'), L('CI runs only what changed','CI chỉ chạy phần đã đổi')],
   design:L('Design the project structure, ownership and contract policy for ten teams contributing to one dbt project.','Thiết kế cấu trúc dự án, quyền sở hữu và chính sách contract cho mười đội cùng đóng góp vào một dự án dbt.'),
   n:L('Assess the reconciliation between incremental and full-refresh results: it reveals whether the logic is safe.','Đánh giá việc đối soát giữa kết quả incremental và full-refresh: nó cho thấy logic có an toàn hay không.') })
]);

/* ================= SQL and PYTHON (layer 1) ================= */
(function(){
  var sql = [
   { k:'html', t:L('SQL internals: how an engine runs your query','Nội bộ SQL: engine chạy query của bạn thế nào'),
     lead:L('Knowing the lifecycle explains why one query is fast and another, logically identical, is slow.','Hiểu vòng đời giải thích vì sao query này nhanh còn query kia, tương đương về logic, lại chậm.'),
     html:function(){
       var tb = tableHTML(['Stage','What happens','Where to observe'], [
        [L('Parse and bind','Parse và bind'), L('Text becomes a syntax tree; names and types are resolved','Văn bản thành cây cú pháp; tên và kiểu được phân giải'), L('Syntax and unknown-column errors','Lỗi cú pháp và cột không tồn tại')],
        [L('Logical optimization','Tối ưu logic'), L('Rewrites: push filters down, prune columns, simplify expressions, unnest subqueries','Viết lại: đẩy filter xuống, cắt cột, đơn giản hóa biểu thức, mở subquery'), '`EXPLAIN`'],
        [L('Cost-based planning','Lập kế hoạch dựa trên chi phí'), L('Uses table statistics to choose join order and join algorithm (nested loop, hash, merge)','Dùng thống kê bảng để chọn thứ tự join và thuật toán join (nested loop, hash, merge)'), L('Estimated versus actual rows in the plan','Số dòng ước lượng so với thực tế trong plan')],
        [L('Execution','Thực thi'), L('Operators read data (using indexes, partition pruning or column statistics), join, aggregate and sort, spilling to disk if memory runs out','Các operator đọc dữ liệu (dùng index, partition pruning hoặc thống kê cột), join, aggregate và sort, spill ra đĩa nếu hết bộ nhớ'), '`EXPLAIN ANALYZE`']
       ]);
       var cd = codeBlock({lang:'sql', title:'read_a_plan.sql (DuckDB or PostgreSQL)', code:`
EXPLAIN ANALYZE
SELECT c.country, SUM(o.amount) AS revenue
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_date >= DATE '2026-10-01'
GROUP BY c.country;
-- Look for: estimated vs actual rows, the join type, scans without filter pushdown, sorts that spill`});
       return tb + '<div style="margin-top:14px">' + cd + '</div>';
     },
     n:L('The most useful skill is comparing estimated and actual row counts: a large gap usually means stale statistics or a predicate the optimizer cannot estimate.','Kỹ năng hữu ích nhất là so sánh số dòng ước lượng và thực tế: chênh lệch lớn thường nghĩa là thống kê cũ hoặc một điều kiện mà optimizer không ước lượng nổi.') },

   { k:'table', t:L('SQL troubleshooting and performance','Troubleshooting và hiệu năng SQL'),
     head:['Symptom','Likely cause','Diagnose','Fix'], rows:[
     [L('Query slow on a big table','Query chậm trên bảng lớn'), L('Full scan: filter on a function or no pruning','Quét toàn bảng: lọc trên hàm hoặc không pruning được'), L('Plan: rows scanned versus returned','Plan: số dòng quét so với trả về'), L('Sargable range filters; partition or cluster keys','Filter dạng khoảng sargable; khóa partition hoặc cluster')],
     [L('Result row count too high','Số dòng kết quả quá nhiều'), L('Join fan-out from a non-unique key','Join nở dòng do khóa không duy nhất'), L('Count before and after each join; test key uniqueness','Đếm trước và sau từng join; test tính duy nhất của khóa'), L('Join at the right grain; aggregate before joining','Join đúng grain; tổng hợp trước khi join')],
     [L('Slow aggregation or sort','Aggregation hoặc sort chậm'), L('Spilling to disk or high-cardinality grouping','Spill ra đĩa hoặc group theo cardinality cao'), L('Spill and memory metrics in the plan','Metric spill và bộ nhớ trong plan'), L('Pre-aggregate, reduce columns, increase memory or warehouse size last','Tổng hợp trước, giảm cột, tăng bộ nhớ hoặc cỡ warehouse sau cùng')],
     [L('Plan changes after data grows','Plan đổi sau khi dữ liệu lớn lên'), L('Stale statistics; a different join strategy chosen','Thống kê cũ; chọn chiến lược join khác'), L('Estimated versus actual rows','Dòng ước lượng so với thực tế'), L('Refresh statistics; hint only when necessary','Làm mới thống kê; chỉ dùng hint khi cần')],
     [L('Wrong numbers with NULLs','Số sai do NULL'), L('`NOT IN`, `<>` and joins treat NULL specially','`NOT IN`, `<>` và join xử lý NULL đặc biệt'), L('Count NULLs in key and filter columns','Đếm NULL ở cột khóa và cột lọc'), L('Use `NOT EXISTS`, `IS DISTINCT FROM`, explicit NULL handling','Dùng `NOT EXISTS`, `IS DISTINCT FROM`, xử lý NULL rõ ràng')],
     [L('Report differs by timezone','Báo cáo lệch theo múi giờ'), L('Timestamp stored or cast in different zones','Timestamp lưu hoặc cast ở múi giờ khác nhau'), L('Check column types and session timezone','Kiểm tra kiểu cột và múi giờ của session'), L('Store UTC; convert once at the edge','Lưu UTC; chuyển đổi một lần ở lớp ngoài cùng')]
    ], cap:L('Correctness bugs (fan-out, NULLs, timezones) are more dangerous than slow queries because they look fine.','Lỗi về tính đúng (nở dòng, NULL, múi giờ) nguy hiểm hơn query chậm vì chúng trông có vẻ ổn.'),
     n:L('Teach the habit of reconciling counts after every join. It catches fan-out before anyone sees a wrong dashboard.','Dạy thói quen đối soát số dòng sau mỗi join. Nó bắt lỗi nở dòng trước khi ai đó nhìn thấy dashboard sai.') },

   labSlide({ t:L('SQL lab: make a 5-minute query run in seconds','Lab SQL: đưa query 5 phút xuống còn vài giây'),
     lead:L('Measure first, change one thing at a time, and prove the result is identical.','Đo trước, mỗi lần đổi một thứ, và chứng minh kết quả giống hệt.'),
     scenario:L('A revenue-by-country report on 10 million orders is slow and some numbers look inflated.','Báo cáo doanh thu theo quốc gia trên 10 triệu đơn hàng chạy chậm và một số con số trông bị thổi phồng.'),
     input:L('DuckDB. Generate data with `CREATE TABLE orders AS SELECT i AS order_id, (random()*1000000)::INT AS customer_id, DATE \'2026-01-01\' + (random()*300)::INT AS order_date, (random()*500)::DECIMAL(10,2) AS amount FROM range(10000000) t(i);` and a customers table with a few duplicated customer_ids.','DuckDB. Sinh dữ liệu bằng `CREATE TABLE orders AS SELECT i AS order_id, (random()*1000000)::INT AS customer_id, DATE \'2026-01-01\' + (random()*300)::INT AS order_date, (random()*500)::DECIMAL(10,2) AS amount FROM range(10000000) t(i);` và bảng customers có vài customer_id trùng.'),
     tasks:[L('Run the report with `EXPLAIN ANALYZE` and record time and rows.','Chạy báo cáo với `EXPLAIN ANALYZE` và ghi lại thời gian và số dòng.'), L('Find and fix the fan-out caused by duplicate customers.','Tìm và sửa lỗi nở dòng do khách hàng trùng.'), L('Remove `SELECT *`, filter early and pre-aggregate before the join.','Bỏ `SELECT *`, lọc sớm và tổng hợp trước khi join.'), L('Verify the final result equals a trusted reference query.','Xác minh kết quả cuối bằng một query tham chiếu đáng tin.')],
     expected:L('A table of runtime and rows per step, a corrected total, and a one-line proof of equality with the reference.','Bảng thời gian và số dòng theo từng bước, tổng đã sửa, và một dòng chứng minh bằng với tham chiếu.'),
     rubric:[L('Correctness bug found, not only speed','Tìm ra lỗi về tính đúng, không chỉ tốc độ'), L('One change per measurement','Mỗi lần đo chỉ một thay đổi'), L('Plan evidence for each improvement','Có bằng chứng từ plan cho mỗi cải thiện'), L('Result verified against a reference','Kết quả được kiểm chứng với tham chiếu')],
     design:L('Explain how you would prevent this class of bug permanently using tests and data modeling.','Giải thích cách bạn ngăn loại lỗi này vĩnh viễn bằng test và mô hình hóa dữ liệu.'),
     n:L('The planted duplicate keys are the point: a fast wrong answer must fail the lab.','Các khóa trùng được gài sẵn chính là mấu chốt: câu trả lời nhanh nhưng sai phải bị trượt lab.') })
  ];
  var py = [
   { k:'code', t:L('Python internals: GIL, concurrency models and profiling','Nội bộ Python: GIL, mô hình đồng thời và profiling'),
     lead:L('Choose the concurrency model by the bottleneck: waiting on IO, burning CPU, or moving data.','Chọn mô hình đồng thời theo nút thắt: chờ IO, đốt CPU hay di chuyển dữ liệu.'),
     blocks:[
      {lang:'python', title:'async_fetch.py (many IO waits)', code:`
import asyncio

import httpx


async def fetch_all(urls: list[str], limit: int = 10) -> list[dict]:
    sem = asyncio.Semaphore(limit)  # bounded concurrency protects the API

    async with httpx.AsyncClient(timeout=30) as client:
        async def one(url: str) -> dict:
            async with sem:
                r = await client.get(url)
                r.raise_for_status()
                return r.json()

        return await asyncio.gather(*(one(u) for u in urls))`},
      {lang:'python', title:'profile.py (find the real bottleneck)', code:`
import cProfile
import pstats
import tracemalloc

tracemalloc.start()
with cProfile.Profile() as pr:
    result = transform(df)                     # your function

pstats.Stats(pr).sort_stats("cumtime").print_stats(10)   # top 10 by cumulative time
current, peak = tracemalloc.get_traced_memory()
print(f"peak memory: {peak / 1e6:.1f} MB")`}
     ],
     points:[
      {h:L('The GIL','GIL'), p:L('In standard CPython only one thread runs Python bytecode at a time. Threads help IO-bound work but not pure-Python CPU work. Newer free-threaded builds are changing this, so check your version.','Trong CPython chuẩn chỉ một thread chạy bytecode Python tại một thời điểm. Thread giúp việc nặng IO nhưng không giúp việc CPU thuần Python. Bản free-threaded mới đang thay đổi điều này, hãy kiểm tra phiên bản của bạn.')},
      {h:L('Pick by bottleneck','Chọn theo nút thắt'), tag:'senior', p:L('Asyncio or threads for IO; processes for CPU-bound Python; vectorized libraries (polars, DuckDB, NumPy) to avoid Python loops entirely.','Asyncio hoặc thread cho IO; process cho Python nặng CPU; thư viện vector hóa (polars, DuckDB, NumPy) để tránh hẳn vòng lặp Python.')},
      {h:L('Memory','Bộ nhớ'), p:L('Dataframes can need several times their file size. Stream, chunk or use columnar engines for large data.','Dataframe có thể cần gấp vài lần kích thước file. Hãy stream, chia chunk hoặc dùng engine cột cho dữ liệu lớn.')},
      {h:L('Packaging','Đóng gói'), tag:'senior', p:L('Pin dependencies in a lock file, use virtual environments or containers, and keep one environment per project.','Cố định phụ thuộc trong lock file, dùng môi trường ảo hoặc container, và mỗi dự án một môi trường.')}
     ],
     n:L('Profile before optimizing: developers are poor at guessing the bottleneck. The async example shows the semaphore pattern that prevents overwhelming an API.','Profile trước khi tối ưu: lập trình viên đoán nút thắt rất tệ. Ví dụ async cho thấy mẫu semaphore ngăn làm quá tải một API.') },

   { k:'table', t:L('Python troubleshooting and performance','Troubleshooting và hiệu năng Python'),
     head:['Symptom','Likely cause','Diagnose','Fix'], rows:[
     [L('Process killed or `MemoryError`','Process bị giết hoặc `MemoryError`'), L('Whole dataset loaded into memory','Toàn bộ dữ liệu nạp vào bộ nhớ'), L('`tracemalloc`, resident memory over time','`tracemalloc`, bộ nhớ thường trú theo thời gian'), L('Chunk or stream; use polars lazy or DuckDB; select needed columns early','Chia chunk hoặc stream; dùng polars lazy hoặc DuckDB; chọn cột cần dùng sớm')],
     [L('Loop over rows is very slow','Vòng lặp qua từng dòng rất chậm'), L('Python-level iteration over a dataframe','Lặp cấp Python trên dataframe'), L('`cProfile` shows time in the loop body','`cProfile` cho thấy thời gian nằm trong thân vòng lặp'), L('Vectorize or push the logic into SQL','Vector hóa hoặc đẩy logic vào SQL')],
     [L('Threads give no speedup','Thread không nhanh hơn'), L('CPU-bound work under the GIL','Việc nặng CPU dưới GIL'), L('CPU usage stays near one core','CPU chỉ quanh một core'), L('Use processes or native vectorized code','Dùng process hoặc code vector hóa native')],
     [L('`PicklingError` in multiprocessing','`PicklingError` trong multiprocessing'), L('Lambdas, closures or open handles passed to workers','Truyền lambda, closure hoặc handle đang mở cho worker'), L('Traceback names the unpicklable object','Traceback nêu đối tượng không pickle được'), L('Use top-level functions and pass plain data','Dùng hàm cấp module và truyền dữ liệu thuần')],
     [L('Works locally, fails in CI','Chạy được local, lỗi ở CI'), L('Unpinned or conflicting dependencies, different Python version','Phụ thuộc không cố định hoặc xung đột, khác phiên bản Python'), L('Compare `pip freeze` and Python versions','So sánh `pip freeze` và phiên bản Python'), L('Lock file, constraints, containerize the environment','Lock file, ràng buộc, container hóa môi trường')],
     [L('Wrong dates or duplicate rows','Ngày sai hoặc dòng trùng'), L('Naive timestamps and timezone conversions','Timestamp không có múi giờ và chuyển đổi múi giờ'), L('Inspect `tzinfo`; compare against source values','Kiểm tra `tzinfo`; so sánh với giá trị nguồn'), L('Use timezone-aware UTC internally','Dùng UTC có múi giờ ở bên trong')]
    ], cap:L('Measure with a profiler and a memory tracer before changing code.','Đo bằng profiler và công cụ theo dõi bộ nhớ trước khi đổi code.'),
     n:L('Most data engineering Python problems are memory, packaging or timezone problems rather than algorithm problems.','Phần lớn vấn đề Python trong data engineering là bộ nhớ, đóng gói hoặc múi giờ, không phải vấn đề thuật toán.') },

   labSlide({ t:L('Python lab: a reliable, bounded ingestion script','Lab Python: script ingestion tin cậy và có giới hạn'),
     lead:L('Fetch from a flaky API concurrently, stay within memory, and test the logic.','Lấy dữ liệu từ API chập chờn một cách đồng thời, giữ trong giới hạn bộ nhớ và test logic.'),
     scenario:L('Download 5,000 pages from an API that rate-limits and fails randomly, then load them into Parquet without exhausting memory.','Tải 5.000 trang từ một API có giới hạn tốc độ và lỗi ngẫu nhiên, rồi nạp vào Parquet mà không cạn bộ nhớ.'),
     input:L('A small local mock API (FastAPI) that returns 429 and 500 randomly. Python 3.11 or newer with httpx, polars or DuckDB and pytest.','Một API giả cục bộ nhỏ (FastAPI) trả 429 và 500 ngẫu nhiên. Python 3.11 trở lên với httpx, polars hoặc DuckDB và pytest.'),
     tasks:[L('Write an async fetcher with a semaphore, retries with jitter and a timeout.','Viết bộ lấy dữ liệu async với semaphore, retry có jitter và timeout.'), L('Stream results into Parquet files in chunks.','Stream kết quả ra các file Parquet theo từng chunk.'), L('Profile time and peak memory.','Profile thời gian và bộ nhớ đỉnh.'), L('Write pytest tests for the retry and chunk logic, including a failure test.','Viết test pytest cho logic retry và chunk, gồm một test lỗi.')],
     expected:L('All pages loaded once, peak memory below a stated limit, and passing tests.','Mọi trang được nạp một lần, bộ nhớ đỉnh dưới giới hạn đã nêu và test đều pass.'),
     rubric:[L('Concurrency is bounded and retries are safe','Đồng thời có giới hạn và retry an toàn'), L('Memory stays flat as pages grow','Bộ nhớ ổn định khi số trang tăng'), L('Tests cover the failure paths','Test bao phủ các nhánh lỗi'), L('Profiling evidence is included','Có bằng chứng từ profiling')],
     design:L('Extend the design to run daily on a schedule with idempotent output and alerting.','Mở rộng thiết kế để chạy hằng ngày theo lịch với đầu ra idempotent và cảnh báo.'),
     n:L('Check that the semaphore actually limits concurrent requests, for example by logging the active count.','Kiểm tra semaphore thực sự giới hạn số request đồng thời, ví dụ bằng cách log số request đang hoạt động.') })
  ];
  var s = DATA[0].slides;
  var last = s.pop();                 // keep the checklist last
  sql.concat(py).forEach(function(x){ s.push(x); });
  s.push(last);
})();
