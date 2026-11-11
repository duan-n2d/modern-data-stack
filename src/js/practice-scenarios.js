"use strict";

function flowRow(list, y, h, x0, x1, gap){
  var n = list.length, w = (x1 - x0 - (n - 1) * gap) / n, s = '';
  list.forEach(function(b, i){
    var x = x0 + i * (w + gap);
    s += bx(x, y, w, h, b[0], b[1], b[2]);
    if(i < n - 1) s += arrow(x + w + 2, y + h / 2, x + w + gap - 3, y + h / 2);
  });
  return s;
}
function bar(y, title, sub, color){
  return '<rect class="bx" x="10" y="' + y + '" width="980" height="44" rx="8"/><rect x="10" y="' + y + '" width="8" height="44" rx="4" fill="' + color + '"/>' + txt(30, y + 19, title, 'b') + txt(30, y + 35, sub, 'sm');
}

/* ---------- diagrams ---------- */
function scenASVG(){
  var s = flowRow([
    [L('PostgreSQL','PostgreSQL'), L('WAL, logical|replication slot','WAL, logical|replication slot'), '#7A869F'],
    [L('Debezium','Debezium'), L('Kafka Connect|snapshot, then stream','Kafka Connect|snapshot rồi stream'), '#0891B2'],
    [L('Kafka','Kafka'), L('topic per table|Schema Registry','topic mỗi bảng|Schema Registry'), '#0891B2'],
    [L('Flink','Flink'), L('event time,|checkpoints','event time,|checkpoint'), '#0E7490'],
    [L('Iceberg','Iceberg'), L('REST catalog,|object storage','REST catalog,|object storage'), '#7C3AED'],
    [L('Trino','Trino'), L('SQL, BI,|reconciliation','SQL, BI,|đối soát'), '#B45309']
  ], 20, 110, 10, 990, 26);
  s += txt(10, 168, L('Tables in the lakehouse','Các bảng trong lakehouse'), 'lg');
  s += flowRow([
    [L('Bronze: raw change events','Bronze: sự kiện thay đổi thô'), L('append-only, with LSN and timestamp','chỉ ghi thêm, kèm LSN và timestamp'), '#B45309'],
    [L('Silver: current state','Silver: trạng thái hiện tại'), L('latest row per key, deletes applied','dòng mới nhất mỗi key, áp dụng xóa'), '#64748B'],
    [L('Gold: marts and features','Gold: mart và feature'), L('aggregates, history, ML tables','tổng hợp, lịch sử, bảng ML'), '#CA8A04']
  ], 184, 86, 10, 990, 40);
  s += bar(292, L('Validation','Kiểm chứng'), L('compare count, sum and max(updated_at) between Postgres and Trino on a schedule','so sánh count, sum và max(updated_at) giữa Postgres và Trino theo lịch'), '#DC2626');
  return svg(1000, 350, s, 'Scenario A: CDC to lakehouse');
}
function scenBSVG(){
  var s = '<rect class="bx2" x="10" y="10" width="980" height="44" rx="8"/>' + txt(500, 38, L('Airflow orchestrates every step: schedule, retries, backfills, dependencies','Airflow điều phối mọi bước: lịch chạy, retry, backfill, phụ thuộc'), 'b', 'middle');
  s += flowRow([
    [L('Sources','Nguồn'), L('database, API,|files, Kafka','database, API,|file, Kafka'), '#7A869F'],
    [L('Load raw','Nạp dữ liệu thô'), L('idempotent loads|per logical date','nạp idempotent|theo logical date'), '#0891B2'],
    [L('Warehouse raw','Raw trong warehouse'), L('append-only,|load metadata','chỉ ghi thêm,|metadata nạp'), '#7C3AED'],
    [L('dbt transform and test','dbt biến đổi và test'), L('staging, marts, SCD2,|tests, contracts','staging, mart, SCD2,|test, contract'), '#EA580C'],
    [L('Consumers','Nơi dùng'), L('BI, ML,|reverse ETL','BI, ML,|reverse ETL'), '#B45309']
  ], 80, 110, 10, 990, 30);
  s += bar(214, L('Quality and reconciliation','Chất lượng và đối soát'), L('row counts versus source, freshness, dbt tests, anomaly monitors','số dòng so với nguồn, freshness, dbt test, monitor bất thường'), '#DC2626');
  s += bar(266, L('CI/CD and rollback','CI/CD và rollback'), L('pull request: Slim CI  →  deploy: clone schema  →  bad release: swap back','pull request: Slim CI  →  deploy: clone schema  →  bản lỗi: hoán đổi lại'), '#475569');
  return svg(1000, 322, s, 'Scenario B: batch analytics');
}
function scenCSVG(){
  var s = flowRow([
    [L('Kafka','Kafka'), L('events topic','topic sự kiện'), '#0891B2'],
    [L('Spark Streaming','Spark Streaming'), L('micro-batch,|checkpoints','micro-batch,|checkpoint'), '#EA580C'],
    [L('Iceberg tables','Bảng Iceberg'), L('hidden partitioning,|ACID commits','hidden partitioning,|commit ACID'), '#7C3AED'],
    [L('Polaris','Polaris'), L('REST catalog|(table pointers, access)','REST catalog|(con trỏ bảng, quyền)'), '#7C3AED'],
    [L('Trino','Trino'), L('interactive SQL','SQL tương tác'), '#B45309']
  ], 20, 110, 10, 990, 30);
  s += bx(10, 170, 480, 80, L('MinIO or S3','MinIO hoặc S3'), L('Parquet data files and Iceberg metadata','file dữ liệu Parquet và metadata Iceberg'), '#475569', 'bx2');
  s += bx(520, 170, 470, 80, L('Maintenance job (Spark)','Job bảo trì (Spark)'), L('compaction, rewrite manifests, expire snapshots','compaction, viết lại manifest, hết hạn snapshot'), '#EA580C', 'bx2');
  s += arrow(750, 168, 750, 132) + arrow(490, 210, 520, 210);
  s += bar(278, L('Concurrent writers','Writer đồng thời'), L('streaming append, compaction and backfills all commit optimistically; conflicts are detected and retried','append streaming, compaction và backfill đều commit lạc quan; xung đột được phát hiện và retry'), '#DC2626');
  return svg(1000, 334, s, 'Scenario C: lakehouse platform');
}
function scenSlide(o){
  return { k:'html', t:o.t, lead:o.lead, n:o.n, html:function(){
    return '<div class="fig">' + o.svg() + '</div><div class="grid c3" style="margin-top:14px">' +
      o.cards.map(function(c){ return cardHTML({h:c[0], p:c[1]}, true); }).join('') + '</div>';
  }};
}
var SIM_HEAD = [L('Failure','Sự cố'), L('How to simulate','Cách mô phỏng'), L('Expected behaviour','Hành vi mong đợi'), L('How to verify','Cách kiểm chứng')];

/* ================= Scenario A: CDC ================= */
PRACTICE.push({ name:L('Scenario A: real-time CDC to a lakehouse','Kịch bản A: CDC thời gian thực vào lakehouse'), color:'#0E7490', slides:[
 scenSlide({ t:L('Scenario A: PostgreSQL → Debezium → Kafka → Flink → Iceberg → Trino','Kịch bản A: PostgreSQL → Debezium → Kafka → Flink → Iceberg → Trino'),
   lead:L('Change events flow from the database log to analytics tables. The hard parts are duplicates, ordering, schema change and proving the copy is correct.','Sự kiện thay đổi chảy từ log của database sang bảng analytics. Phần khó là trùng lặp, thứ tự, đổi schema và chứng minh bản sao là đúng.'),
   svg:scenASVG,
   cards:[[L('Duplicates and ordering','Trùng lặp và thứ tự'), L('Replays and retries create duplicates. Keep the LSN and event time, and apply a change only if its LSN is newer than the stored one.','Replay và retry tạo bản trùng. Giữ LSN và event time, và chỉ áp dụng thay đổi nếu LSN mới hơn bản đang lưu.')],
          [L('Schema evolution','Tiến hóa schema'), L('Add nullable columns first. Register schemas with compatibility rules, and let Iceberg evolve columns by ID.','Thêm cột nullable trước. Đăng ký schema với quy tắc tương thích, và để Iceberg tiến hóa cột theo ID.')],
          [L('Recovery and correctness','Khôi phục và tính đúng'), L('Restart from checkpoints and committed offsets, then prove equality with source using count, sum and max timestamp.','Khởi động lại từ checkpoint và offset đã commit, rồi chứng minh khớp nguồn bằng count, sum và max timestamp.')]],
   n:L('This follows the CDC lakehouse design from your reference diagram: operational databases, Kafka Connect with Debezium, Kafka with a Schema Registry, streaming ingestion, then bronze, silver and gold. Use Flink or Spark for the streaming step.','Kịch bản này theo thiết kế CDC lakehouse trong sơ đồ tham chiếu của bạn: database vận hành, Kafka Connect với Debezium, Kafka với Schema Registry, ingestion streaming, rồi bronze, silver, gold. Dùng Flink hoặc Spark cho bước streaming.') }),

 { k:'code', t:L('Scenario A implementation: connector, streaming job and idempotent repair','Kịch bản A triển khai: connector, job streaming và sửa idempotent'),
   lead:L('Capture changes, apply them as upserts, and keep a SQL merge that is safe to rerun for repair.','Bắt thay đổi, áp dụng như upsert, và giữ một câu merge SQL an toàn khi chạy lại để sửa dữ liệu.'),
   blocks:[
    {lang:'json', title:'pg-orders-cdc.json (Debezium PostgreSQL connector)', code:`
{
  "name": "pg-orders-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "pg.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "\${file:/opt/secrets/pg.properties:password}",
    "database.dbname": "shop",
    "topic.prefix": "shop",
    "table.include.list": "public.orders,public.customers",
    "plugin.name": "pgoutput",
    "slot.name": "debezium_shop",
    "publication.name": "dbz_publication",
    "snapshot.mode": "initial",
    "heartbeat.interval.ms": "10000",
    "key.converter": "io.confluent.connect.avro.AvroConverter",
    "key.converter.schema.registry.url": "http://schema-registry:8081",
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "http://schema-registry:8081"
  }
}`},
    {lang:'sql', title:'orders_cdc_to_iceberg.sql (Flink SQL)', code:`
CREATE TABLE orders_cdc (
    order_id    BIGINT,
    customer_id BIGINT,
    status      STRING,
    amount      DECIMAL(10, 2),
    updated_at  TIMESTAMP(3),
    PRIMARY KEY (order_id) NOT ENFORCED,
    WATERMARK FOR updated_at AS updated_at - INTERVAL '10' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'shop.public.orders',
    'properties.bootstrap.servers' = 'broker1:9092',
    'properties.group.id' = 'flink-orders-cdc',
    'scan.startup.mode' = 'earliest-offset',
    'format' = 'debezium-json'
);

CREATE CATALOG lake WITH (
    'type' = 'iceberg', 'catalog-type' = 'rest',
    'uri' = 'http://polaris:8181/api/catalog', 'warehouse' = 'lake'
);  -- plus the credentials your catalog requires

CREATE TABLE IF NOT EXISTS lake.silver.orders_current (
    order_id BIGINT, customer_id BIGINT, status STRING,
    amount DECIMAL(10, 2), updated_at TIMESTAMP(3),
    PRIMARY KEY (order_id) NOT ENFORCED
) WITH ('format-version' = '2', 'write.upsert.enabled' = 'true');

INSERT INTO lake.silver.orders_current
SELECT order_id, customer_id, status, amount, updated_at FROM orders_cdc;`},
    {lang:'sql', title:'repair_merge.sql (Spark SQL, safe to rerun)', code:`
MERGE INTO lake.silver.orders_current t
USING (
    SELECT * FROM (
        SELECT *, ROW_NUMBER() OVER (
            PARTITION BY order_id ORDER BY source_lsn DESC, event_ts DESC) AS rn
        FROM lake.bronze.orders_cdc
        WHERE ingest_date = current_date()
    ) WHERE rn = 1
) s ON t.order_id = s.order_id
WHEN MATCHED AND s.op = 'd' THEN DELETE
WHEN MATCHED AND s.source_lsn > t.source_lsn THEN UPDATE SET *
WHEN NOT MATCHED AND s.op <> 'd' THEN INSERT *;`}
   ],
   points:[
    {h:L('Replication slot','Replication slot'), tag:'senior', p:L('The slot keeps WAL until the connector reads it. A stopped connector makes the source disk grow. Monitor slot lag.','Slot giữ WAL cho đến khi connector đọc. Connector dừng làm đĩa của nguồn đầy dần. Hãy giám sát độ trễ của slot.')},
    {h:L('Ordering rule','Quy tắc thứ tự'), p:L('Apply a change only if its source LSN is newer. That makes replays and out-of-order arrivals harmless.','Chỉ áp dụng thay đổi nếu source LSN mới hơn. Điều đó làm replay và sự kiện đến sai thứ tự trở nên vô hại.')},
    {h:L('Deletes','Xóa'), p:L('Capture delete events, not just inserts and updates, or the lake diverges from the source.','Phải bắt cả sự kiện delete, không chỉ insert và update, nếu không lake sẽ lệch khỏi nguồn.')},
    {h:L('Versions and secrets','Phiên bản và secret'), tag:'senior', p:L('Connector property names differ between Debezium versions (older ones use `database.server.name`). The password comes from a config provider, never from the file.','Tên thuộc tính connector khác nhau giữa các phiên bản Debezium (bản cũ dùng `database.server.name`). Mật khẩu lấy từ config provider, không nằm trong file.')}
   ],
   n:L('Treat these as templates to adapt: hostnames, catalog credentials and the Flink-Iceberg upsert options depend on your versions. The merge statement is the correctness backstop: if the streaming job ever misbehaves, re-running it repairs silver from bronze.','Hãy coi đây là mẫu để điều chỉnh: hostname, credential của catalog và các tùy chọn upsert Flink-Iceberg phụ thuộc phiên bản. Câu merge là chốt chặn tính đúng: nếu job streaming có lúc hoạt động sai, chạy lại nó sẽ sửa silver từ bronze.') },

 { k:'table', t:L('Scenario A failure simulations','Kịch bản A: mô phỏng sự cố'), head:SIM_HEAD, rows:[
   [L('Flink TaskManager crash','Flink TaskManager sập'), L('Kill the TaskManager during a load test','Tắt TaskManager trong lúc test tải'), L('Job restores from the last checkpoint; no gaps or duplicates in silver','Job khôi phục từ checkpoint gần nhất; silver không thiếu hay trùng'), L('Reconciliation query: counts and checksums match','Query đối soát: số dòng và checksum khớp')],
   [L('Connector restart','Connector khởi động lại'), L('Restart Kafka Connect mid-stream','Khởi động lại Kafka Connect giữa chừng'), L('Resumes from the stored offset; duplicates possible but harmless','Tiếp tục từ offset đã lưu; có thể trùng nhưng vô hại'), L('Duplicate count in bronze versus rows in silver','Số trùng ở bronze so với số dòng ở silver')],
   [L('Replication slot lost','Mất replication slot'), L('Drop the slot, then restart the connector','Xóa slot rồi khởi động lại connector'), L('Connector fails; a re-snapshot is needed','Connector lỗi; cần snapshot lại'), L('Re-snapshot, then reconcile; alert on slot absence','Snapshot lại rồi đối soát; cảnh báo khi mất slot')],
   [L('Schema change','Đổi schema'), L('Add a nullable column, then try a rename','Thêm cột nullable, sau đó thử đổi tên'), L('Add succeeds; rename is rejected or handled by a mapping','Thêm thành công; đổi tên bị từ chối hoặc xử lý bằng mapping'), L('Schema Registry compatibility result; Iceberg schema history','Kết quả tương thích của Schema Registry; lịch sử schema Iceberg')],
   [L('Out-of-order and late events','Sự kiện sai thứ tự và đến trễ'), L('Replay older events after newer ones','Phát lại sự kiện cũ sau sự kiện mới'), L('Older events do not overwrite newer state','Sự kiện cũ không ghi đè trạng thái mới'), L('Compare LSN and updated_at of final rows','So sánh LSN và updated_at của các dòng cuối')],
   [L('Poison record','Record độc'), L('Inject a malformed event','Chèn một sự kiện sai định dạng'), L('Job routes it to a dead-letter topic and continues','Job chuyển nó sang dead-letter topic và chạy tiếp'), L('Dead-letter count and alert','Số lượng dead-letter và cảnh báo')]
  ], cap:L('Run each failure on purpose. A pipeline that was never broken in testing will break in production.','Hãy cố ý chạy từng sự cố. Pipeline chưa từng bị phá khi test sẽ hỏng ở production.'),
   n:L('Verification always uses the same instrument: a reconciliation query comparing the source and the lake.','Việc kiểm chứng luôn dùng cùng một công cụ: query đối soát so nguồn với lake.') },

 labSlide({ t:L('Scenario A lab, performance test and design review','Kịch bản A: lab, test hiệu năng và review thiết kế'),
   lead:L('Build it, break it, measure it, and defend it.','Xây nó, phá nó, đo nó và bảo vệ nó.'),
   scenario:L('Replicate an orders and customers database into Iceberg with seconds-to-minutes freshness and provably correct results.','Sao chép database orders và customers vào Iceberg với độ mới từ vài giây đến vài phút và kết quả chứng minh được là đúng.'),
   input:L('Docker Compose: PostgreSQL, Kafka, Schema Registry, Kafka Connect with Debezium, Flink, an Iceberg REST catalog, MinIO and Trino. A generator performing 500 changes per second with 5 percent deletes.','Docker Compose: PostgreSQL, Kafka, Schema Registry, Kafka Connect với Debezium, Flink, Iceberg REST catalog, MinIO và Trino. Bộ sinh thực hiện 500 thay đổi mỗi giây với 5 phần trăm là xóa.'),
   tasks:[L('Deploy the pipeline and show end-to-end freshness.','Triển khai pipeline và cho thấy độ mới đầu-cuối.'), L('Run all failure simulations and record results.','Chạy mọi mô phỏng sự cố và ghi lại kết quả.'), L('Raise the change rate until lag appears; find and relieve the bottleneck.','Tăng tốc độ thay đổi đến khi xuất hiện lag; tìm và gỡ nút thắt.'), L('Write the reconciliation job and alerts.','Viết job đối soát và cảnh báo.')],
   expected:L('A freshness and lag chart versus change rate, a failure matrix with outcomes, and a passing reconciliation.','Biểu đồ độ mới và lag theo tốc độ thay đổi, ma trận sự cố kèm kết quả và một lần đối soát đạt.'),
   rubric:[L('Correctness proven after every failure','Tính đúng được chứng minh sau mỗi sự cố'), L('Bottleneck identified from metrics','Nút thắt xác định từ metric'), L('Schema change handled safely','Đổi schema được xử lý an toàn'), L('Runbook written for each failure','Có runbook cho từng sự cố')],
   design:L('Design review: justify Flink versus Spark for the streaming step, the key and partition choices, the compaction plan, and what you would change at 100 times the volume.','Review thiết kế: biện minh Flink so với Spark cho bước streaming, lựa chọn key và partition, kế hoạch compaction, và bạn sẽ đổi gì khi khối lượng gấp 100 lần.'),
   n:L('Grade the failure matrix more heavily than the happy path.','Chấm ma trận sự cố nặng hơn đường chạy thuận lợi.') })
]});

/* ================= Scenario B: batch analytics ================= */
PRACTICE.push({ name:L('Scenario B: batch analytics platform','Kịch bản B: nền tảng analytics batch'), color:'#EA580C', slides:[
 scenSlide({ t:L('Scenario B: source database → Airflow → dbt → warehouse → BI','Kịch bản B: database nguồn → Airflow → dbt → warehouse → BI'),
   lead:L('Airflow schedules, dbt transforms and tests, the warehouse stores, BI and ML consume. The craft is in backfills, reconciliation, history and safe deployment.','Airflow lên lịch, dbt biến đổi và test, warehouse lưu trữ, BI và ML sử dụng. Tay nghề nằm ở backfill, đối soát, lịch sử và triển khai an toàn.'),
   svg:scenBSVG,
   cards:[[L('Incremental and backfill','Incremental và backfill'), L('Loads are keyed by logical date and idempotent, so thirty days of history can be rerun without duplicates.','Các lần load khóa theo logical date và idempotent, nên có thể chạy lại ba mươi ngày lịch sử mà không trùng.')],
          [L('History and reconciliation','Lịch sử và đối soát'), L('Dimensions keep history with SCD Type 2. Counts and totals are compared with the source after every load.','Dimension giữ lịch sử bằng SCD Type 2. Số dòng và tổng được so với nguồn sau mỗi lần load.')],
          [L('Deploy and roll back','Triển khai và rollback'), L('Slim CI builds only what changed. A cloned schema makes the previous version one swap away.','Slim CI chỉ build thứ đã đổi. Schema được clone giúp phiên bản trước chỉ cách một lần hoán đổi.')]],
   n:L('This follows your Airflow, dbt and warehouse diagram: raw sources load into the warehouse, dbt transforms and tests, and consumers read marts. Orchestration sits above the whole flow.','Kịch bản này theo sơ đồ Airflow, dbt và warehouse của bạn: nguồn thô nạp vào warehouse, dbt biến đổi và test, nơi dùng đọc mart. Điều phối nằm phía trên toàn bộ luồng.') }),

 { k:'code', t:L('Scenario B implementation: DAG, backfill and rollback','Kịch bản B triển khai: DAG, backfill và rollback'),
   lead:L('A reconciliation gate before dbt, a bounded backfill, and a schema swap for rollback.','Cổng đối soát trước dbt, backfill có giới hạn và hoán đổi schema để rollback.'),
   blocks:[
    {lang:'python', title:'warehouse_daily.py', code:`
import pendulum
from airflow.decorators import dag, task
from airflow.operators.bash import BashOperator


@dag(
    dag_id="warehouse_daily",
    schedule="0 2 * * *",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    catchup=False,
    max_active_runs=2,
)
def warehouse_daily():
    @task(retries=3)
    def extract_load(ds=None) -> int:
        rows = load_partition_from_source(ds)         # idempotent: overwrite the partition for ds
        return rows

    @task
    def reconcile(ds=None, loaded_rows: int = 0) -> None:
        source_rows = count_source_rows(ds)
        if source_rows != loaded_rows:
            raise ValueError(f"{ds}: source {source_rows} != loaded {loaded_rows}")

    dbt_build = BashOperator(
        task_id="dbt_build",
        bash_command="cd /opt/dbt && dbt build --target prod --vars \\"{run_date: '{{ ds }}'}\\"",
    )

    reconcile(loaded_rows=extract_load()) >> dbt_build


warehouse_daily()`},
    {lang:'bash', title:'backfill.sh (Airflow 2.x CLI)', code:`
# Rerun 30 days with limited concurrency (the DAG's max_active_runs applies)
airflow dags backfill -s 2026-10-01 -e 2026-10-30 warehouse_daily`},
    {lang:'sql', title:'rollback.sql (Snowflake)', code:`
-- Before deploying: keep the current version
CREATE OR REPLACE SCHEMA analytics_prev CLONE analytics;

-- ... deploy and validate ...

-- If the release is bad: swap the previous version back in
ALTER SCHEMA analytics SWAP WITH analytics_prev;`}
   ],
   points:[
    {h:L('Gate before transform','Cổng trước biến đổi'), p:L('Fail the run when counts disagree, so bad data never reaches marts.','Cho run thất bại khi số dòng không khớp, để dữ liệu xấu không bao giờ tới mart.')},
    {h:L('Idempotent partitions','Partition idempotent'), tag:'senior', p:L('Overwriting the partition for the logical date makes retries and backfills safe.','Ghi đè partition của logical date làm retry và backfill an toàn.')},
    {h:L('Data rollback','Rollback dữ liệu'), tag:'senior', p:L('Code rollback is `git revert`. Data rollback needs clones, snapshots or time travel prepared in advance.','Rollback code là `git revert`. Rollback dữ liệu cần clone, snapshot hoặc time travel chuẩn bị sẵn.')},
    {h:L('Version-specific CLI','CLI theo phiên bản'), p:L('The backfill command differs in Airflow 3. Check the documentation for your version.','Lệnh backfill khác ở Airflow 3. Hãy xem tài liệu của phiên bản bạn dùng.')}
   ],
   n:L('Helper functions such as load_partition_from_source are placeholders for your extract logic. The schema swap pattern is Snowflake syntax; other warehouses have equivalents such as table clones or snapshots.','Các hàm trợ giúp như load_partition_from_source là chỗ giữ chỗ cho logic extract của bạn. Mẫu hoán đổi schema là cú pháp Snowflake; warehouse khác có tương đương như clone bảng hoặc snapshot.') },

 { k:'table', t:L('Scenario B failure simulations','Kịch bản B: mô phỏng sự cố'), head:SIM_HEAD, rows:[
   [L('Source arrives late','Nguồn đến trễ'), L('Delay the extract by two hours','Trễ bước extract hai giờ'), L('Freshness alert; dbt does not build on stale data','Cảnh báo freshness; dbt không build trên dữ liệu cũ'), L('Alert fired; run state; marts untouched','Cảnh báo được kích hoạt; trạng thái run; mart không bị đụng')],
   [L('Partial load','Load dở dang'), L('Kill the loader halfway','Tắt bộ nạp giữa chừng'), L('Reconcile gate fails; retry overwrites the partition','Cổng đối soát thất bại; retry ghi đè partition'), L('Source versus loaded counts after retry','Số dòng nguồn so với đã nạp sau retry')],
   [L('Schema drift','Lệch schema'), L('Add and rename a source column','Thêm và đổi tên một cột nguồn'), L('Detected by contract or tests before marts change','Được contract hoặc test phát hiện trước khi mart đổi'), L('Failing test names the column','Test thất bại nêu rõ cột')],
   [L('Backfill duplicates','Backfill gây trùng'), L('Backfill 30 days twice','Backfill 30 ngày hai lần'), L('Second run produces identical results','Lần chạy thứ hai cho kết quả giống hệt'), L('Checksums per partition match','Checksum theo partition khớp')],
   [L('Bad release','Bản phát hành lỗi'), L('Deploy a model with a wrong join','Deploy một model có join sai'), L('Rollback restores the previous marts quickly','Rollback khôi phục mart trước đó nhanh chóng'), L('Totals match the pre-release snapshot','Tổng khớp với snapshot trước phát hành')],
   [L('Credit spike','Chi phí tăng vọt'), L('Run a full refresh of every model','Chạy full refresh mọi model'), L('Budget alert and resource monitor trigger','Cảnh báo ngân sách và resource monitor được kích hoạt'), L('Alert time versus spend','Thời điểm cảnh báo so với chi tiêu')]
  ], cap:L('Each simulation maps to a control: gates, idempotency, contracts, rollback, budgets.','Mỗi mô phỏng gắn với một kiểm soát: cổng, idempotency, contract, rollback, ngân sách.'),
   n:L('Link every row to the layer that owns the control: orchestration, quality, modeling, DevOps, FinOps.','Nối từng hàng với layer sở hữu kiểm soát đó: điều phối, chất lượng, mô hình hóa, DevOps, FinOps.') },

 labSlide({ t:L('Scenario B lab, performance test and design review','Kịch bản B: lab, test hiệu năng và review thiết kế'),
   lead:L('Operate a small warehouse platform through a month of change.','Vận hành một nền tảng warehouse nhỏ qua một tháng thay đổi.'),
   scenario:L('Deliver daily marts for finance with full history of customer attributes, correct totals and a safe release process.','Cung cấp mart hằng ngày cho tài chính với đầy đủ lịch sử thuộc tính khách hàng, tổng đúng và quy trình phát hành an toàn.'),
   input:L('Postgres as the source, DuckDB or a cloud warehouse as the target, Airflow, dbt, a generator that adds late updates and schema changes.','Postgres làm nguồn, DuckDB hoặc cloud warehouse làm đích, Airflow, dbt, bộ sinh dữ liệu thêm cập nhật muộn và đổi schema.'),
   tasks:[L('Build the DAG, dbt project, SCD2 dimension and reconciliation gate.','Xây DAG, dự án dbt, dimension SCD2 và cổng đối soát.'), L('Backfill 30 days, then rerun and show identical results.','Backfill 30 ngày, rồi chạy lại và cho thấy kết quả giống hệt.'), L('Run all failure simulations.','Chạy mọi mô phỏng sự cố.'), L('Deploy a bad change and roll back; measure time to recover.','Deploy một thay đổi lỗi rồi rollback; đo thời gian khôi phục.')],
   expected:L('A passing CI pipeline, an identical-results proof for the backfill, and a rollback with a measured recovery time.','Pipeline CI đạt, bằng chứng kết quả giống hệt cho backfill và một lần rollback có đo thời gian khôi phục.'),
   rubric:[L('Idempotency demonstrated, not claimed','Idempotency được chứng minh, không chỉ tuyên bố'), L('History correct for changed attributes','Lịch sử đúng với thuộc tính đã đổi'), L('Rollback tested','Rollback đã được test'), L('Cost guardrails in place','Có hàng rào chi phí')],
   design:L('Design review: justify incremental strategies, how you would scale to 500 models, and the ownership model for marts.','Review thiết kế: biện minh chiến lược incremental, cách mở rộng lên 500 model và mô hình sở hữu mart.'),
   n:L('A good submission shows evidence for each claim: queries, checksums and timings.','Bài nộp tốt cho thấy bằng chứng cho từng tuyên bố: query, checksum và thời gian.') })
]});

/* ================= Scenario C: lakehouse ================= */
PRACTICE.push({ name:L('Scenario C: lakehouse platform','Kịch bản C: nền tảng lakehouse'), color:'#7C3AED', slides:[
 scenSlide({ t:L('Scenario C: Kafka → Spark → MinIO → Iceberg → Polaris → Trino','Kịch bản C: Kafka → Spark → MinIO → Iceberg → Polaris → Trino'),
   lead:L('A lakehouse lives or dies by file layout, metadata health and safe concurrent writes.','Một lakehouse sống hay chết nhờ cách bố trí file, sức khỏe metadata và ghi đồng thời an toàn.'),
   svg:scenCSVG,
   cards:[[L('Partition design','Thiết kế partition'), L('Partition by event day, not by a high-cardinality key. Use sort order or clustering for the filters you query most.','Partition theo ngày sự kiện, không theo khóa cardinality cao. Dùng sort order hoặc clustering cho bộ lọc bạn truy vấn nhiều nhất.')],
          [L('Compaction and snapshots','Compaction và snapshot'), L('Streaming creates small files. Compact on a schedule, rewrite manifests and expire snapshots to bound metadata.','Streaming tạo file nhỏ. Compaction theo lịch, viết lại manifest và hết hạn snapshot để giới hạn metadata.')],
          [L('Concurrency and optimization','Đồng thời và tối ưu'), L('Streaming, compaction and backfills commit optimistically. Align their partitions and test conflict behaviour, then tune queries by pruning.','Streaming, compaction và backfill commit lạc quan. Căn partition của chúng và test hành vi xung đột, rồi tối ưu query bằng pruning.')]],
   n:L('Compare with Scenario A: here the focus is the table layout and maintenance, not the change capture.','So với Kịch bản A: ở đây trọng tâm là bố cục bảng và bảo trì, không phải bắt thay đổi.') }),

 { k:'code', t:L('Scenario C implementation: catalog, table and streaming write','Kịch bản C triển khai: catalog, bảng và ghi streaming'),
   lead:L('Configure the REST catalog on MinIO, create a hidden-partitioned table and stream into it.','Cấu hình REST catalog trên MinIO, tạo bảng hidden partitioning và stream vào đó.'),
   blocks:[
    {lang:'bash', title:'spark_submit_flags.sh', code:`
--conf spark.sql.catalog.lake=org.apache.iceberg.spark.SparkCatalog
--conf spark.sql.catalog.lake.type=rest
--conf spark.sql.catalog.lake.uri=http://polaris:8181/api/catalog
--conf spark.sql.catalog.lake.warehouse=lake
--conf spark.sql.catalog.lake.io-impl=org.apache.iceberg.aws.s3.S3FileIO
--conf spark.sql.catalog.lake.s3.endpoint=http://minio:9000
--conf spark.sql.catalog.lake.s3.path-style-access=true
# plus the catalog credentials and S3 access settings your deployment requires`},
    {lang:'sql', title:'create_events.sql (Spark SQL)', code:`
CREATE TABLE IF NOT EXISTS lake.bronze.events (
    event_id   STRING,
    user_id    BIGINT,
    event_name STRING,
    event_ts   TIMESTAMP,
    payload    STRING
) USING iceberg
PARTITIONED BY (days(event_ts))
TBLPROPERTIES ('format-version' = '2', 'write.target-file-size-bytes' = '536870912');`},
    {lang:'python', title:'stream_events.py', code:`
from pyspark.sql import functions as F

events = (
    spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", "broker1:9092")
    .option("subscribe", "events")
    .option("startingOffsets", "earliest")
    .load()
    .select(F.from_json(F.col("value").cast("string"), schema).alias("e"))
    .select("e.*")
)

query = (
    events.writeStream.format("iceberg")
    .outputMode("append")
    .trigger(processingTime="1 minute")
    .option("checkpointLocation", "s3a://lake/checkpoints/events")
    .toTable("lake.bronze.events")
)
query.awaitTermination()`}
   ],
   points:[
    {h:L('Hidden partitioning','Hidden partitioning'), p:L('`days(event_ts)` partitions by day while queries filter on `event_ts` directly.','`days(event_ts)` chia partition theo ngày trong khi query lọc trực tiếp trên `event_ts`.')},
    {h:L('Trigger interval','Chu kỳ trigger'), tag:'senior', p:L('A longer trigger produces fewer, larger files. Trade freshness for file health.','Trigger dài hơn tạo ít file hơn và lớn hơn. Đánh đổi độ mới lấy sức khỏe file.')},
    {h:L('Checkpoint location','Vị trí checkpoint'), p:L('Losing the checkpoint means losing the stream’s progress. Store it durably and back it up.','Mất checkpoint là mất tiến độ của stream. Lưu bền vững và backup nó.')},
    {h:L('Verify properties','Kiểm tra thuộc tính'), tag:'senior', p:L('Catalog and S3 option names depend on Iceberg and catalog versions. Confirm them in the docs.','Tên tùy chọn catalog và S3 phụ thuộc phiên bản Iceberg và catalog. Hãy xác nhận trong tài liệu.')}
   ],
   n:L('Show the three layers of configuration: the catalog connection, the table design and the streaming job. Authentication to Polaris and MinIO is deliberately left as a placeholder.','Cho thấy ba lớp cấu hình: kết nối catalog, thiết kế bảng và job streaming. Xác thực tới Polaris và MinIO cố ý để chỗ giữ chỗ.') },

 { k:'table', t:L('Scenario C failure simulations','Kịch bản C: mô phỏng sự cố'), head:SIM_HEAD, rows:[
   [L('Small files explosion','Bùng nổ file nhỏ'), L('Set a 5-second trigger for an hour','Đặt trigger 5 giây trong một giờ'), L('Query time and planning time rise','Thời gian query và planning tăng'), L('File count and size from `.files`; time before and after compaction','Số file và kích thước từ `.files`; thời gian trước và sau compaction')],
   [L('Concurrent write conflict','Xung đột ghi đồng thời'), L('Run compaction and a backfill on the same partitions','Chạy compaction và backfill trên cùng partition'), L('One commit retries or fails cleanly; no data corruption','Một commit retry hoặc thất bại gọn gàng; không hỏng dữ liệu'), L('Commit logs; row counts after both finish','Log commit; số dòng sau khi cả hai xong')],
   [L('Catalog unavailable','Catalog không sẵn sàng'), L('Stop Polaris for ten minutes','Dừng Polaris mười phút'), L('Writes and new queries fail; the stream resumes after recovery','Ghi và query mới thất bại; stream tiếp tục sau khi hồi phục'), L('No data loss; the stream catches up','Không mất dữ liệu; stream bắt kịp')],
   [L('Object storage node loss','Mất node object storage'), L('Stop one MinIO node','Dừng một node MinIO'), L('Reads and writes continue if erasure coding allows','Đọc và ghi tiếp tục nếu erasure coding cho phép'), L('Read checks; storage health status','Kiểm tra đọc; trạng thái sức khỏe storage')],
   [L('Lost checkpoint','Mất checkpoint'), L('Delete the streaming checkpoint','Xóa checkpoint của streaming'), L('Stream reprocesses from the chosen start; duplicates appear','Stream xử lý lại từ điểm bắt đầu đã chọn; xuất hiện bản trùng'), L('Dedupe step removes duplicates; counts reconcile','Bước dedupe loại bỏ trùng; số dòng đối soát khớp')],
   [L('Bad overwrite','Ghi đè sai'), L('Overwrite a partition by mistake','Ghi đè nhầm một partition'), L('Recover with a snapshot rollback','Khôi phục bằng rollback snapshot'), L('Row counts and checksums match before the mistake','Số dòng và checksum khớp với trước khi nhầm')]
  ], cap:L('Maintenance procedures are part of the platform, so test them like production code.','Các thủ tục bảo trì là một phần của nền tảng, nên hãy test như code production.'),
   n:L('The memorable simulation is the small-files one: learners watch the cost of a seemingly harmless trigger setting.','Mô phỏng đáng nhớ là file nhỏ: người học thấy cái giá của một cấu hình trigger tưởng chừng vô hại.') },

 labSlide({ t:L('Scenario C lab, performance test and design review','Kịch bản C: lab, test hiệu năng và review thiết kế'),
   lead:L('Design a layout, then prove it with measurements.','Thiết kế bố cục, rồi chứng minh bằng số đo.'),
   scenario:L('Ingest 50 million events per day into Iceberg and keep interactive queries under a few seconds as history grows.','Nạp 50 triệu sự kiện mỗi ngày vào Iceberg và giữ query tương tác dưới vài giây khi lịch sử lớn lên.'),
   input:L('Docker Compose with Kafka, Spark, MinIO, Polaris and Trino. A generator producing events with a skewed user distribution and a representative query set.','Docker Compose với Kafka, Spark, MinIO, Polaris và Trino. Bộ sinh tạo sự kiện với phân phối người dùng lệch và một bộ query đại diện.'),
   tasks:[L('Compare two partition and sort strategies on file count, scan size and query time.','So sánh hai chiến lược partition và sort theo số file, kích thước quét và thời gian query.'), L('Schedule compaction and snapshot expiry; measure their effect.','Lên lịch compaction và hết hạn snapshot; đo tác động.'), L('Run all failure simulations.','Chạy mọi mô phỏng sự cố.'), L('Load test with 10 concurrent queries while writes continue.','Test tải với 10 query đồng thời trong khi ghi vẫn tiếp diễn.')],
   expected:L('A comparison table of layouts, a maintenance schedule with justification, and a load-test report.','Bảng so sánh các bố cục, lịch bảo trì có biện minh và báo cáo test tải.'),
   rubric:[L('Decisions backed by measurements','Quyết định có số đo hậu thuẫn'), L('Maintenance is automated and monitored','Bảo trì được tự động hóa và giám sát'), L('Concurrency behaviour understood','Hiểu hành vi đồng thời'), L('Cost and storage growth estimated','Ước tính được chi phí và tăng trưởng dung lượng')],
   design:L('Design review: how would you add multi-tenant access control, retention of 90 days with time travel for 7, and disaster recovery for object storage and the catalog?','Review thiết kế: bạn sẽ thêm kiểm soát truy cập đa tenant, lưu 90 ngày với time travel 7 ngày và disaster recovery cho object storage và catalog thế nào?'),
   n:L('The deliverable is a defended design backed by numbers, not a working demo alone.','Sản phẩm là một thiết kế được bảo vệ bằng số liệu, không chỉ một bản demo chạy được.') })
]});

"use strict";

function incidentSlide(o){
  var rows = [
    [L('1. Symptoms','1. Triệu chứng'), o.sym], [L('2. Business impact','2. Tác động nghiệp vụ'), o.impact], [L('3. Possible root causes','3. Nguyên nhân gốc có thể'), o.causes],
    [L('4. Evidence to collect','4. Bằng chứng cần thu thập'), o.evidence], [L('5. Diagnostic procedure','5. Quy trình chẩn đoán'), o.diag], [L('6. Resolution options and trade-offs','6. Phương án xử lý và đánh đổi'), o.fix],
    [L('7. Prevention','7. Phòng ngừa'), o.prev], [L('8. Postmortem','8. Postmortem'), o.post]
  ];
  return { k:'table', t:o.t, lead:L('A composite teaching example, not a report of a real company incident.','Ví dụ giảng dạy tổng hợp, không phải báo cáo sự cố của một công ty thật.'),
    head:[L('Step','Bước'), L('Content','Nội dung')], rows:rows, n:o.n };
}

PRACTICE.push({ name:L('Incident knowledge base','Kho tri thức sự cố'), color:'#DC2626', slides:[
 { k:'table', t:L('Incident categories and first evidence to collect','Các nhóm sự cố và bằng chứng cần thu thập đầu tiên'),
   head:[L('Category','Nhóm'), L('Example problem','Vấn đề ví dụ'), L('First evidence','Bằng chứng đầu tiên'), L('Usual owner','Chủ sở hữu thường gặp')], rows:[
   [L('Data correctness','Tính đúng dữ liệu'), L('Duplicate or missing records, wrong aggregation','Bản ghi trùng hoặc thiếu, tổng hợp sai'), L('Row counts per stage, key uniqueness, source comparison','Số dòng theo từng giai đoạn, tính duy nhất của khóa, so với nguồn'), L('Pipeline owner','Chủ pipeline')],
   [L('Performance','Hiệu năng'), L('Slow queries, Spark skew, Kafka lag','Query chậm, Spark lệch, Kafka lag'), L('Query plan, Spark UI, lag per partition','Query plan, Spark UI, lag theo partition'), L('Platform team','Đội platform')],
   [L('Reliability','Độ tin cậy'), L('Failed jobs, retries, checkpoint failures','Job lỗi, retry, checkpoint thất bại'), L('Task logs, retry history, checkpoint metrics','Log task, lịch sử retry, metric checkpoint'), L('Pipeline owner','Chủ pipeline')],
   [L('Infrastructure','Hạ tầng'), L('Disk full, OOM, network timeout','Đầy đĩa, OOM, timeout mạng'), L('Host metrics, kernel and container logs','Metric máy chủ, log kernel và container'), L('Platform team','Đội platform')],
   [L('Orchestration','Điều phối'), L('DAG deadlocks, scheduler delays','Deadlock DAG, scheduler trễ'), L('Scheduler logs, pool usage, metadata database load','Log scheduler, mức dùng pool, tải của metadata database'), L('Platform team','Đội platform')],
   [L('Lakehouse','Lakehouse'), L('Small files, metadata growth, concurrent write conflicts','File nhỏ, metadata phình, xung đột ghi đồng thời'), L('File sizes, manifest counts, commit logs','Kích thước file, số manifest, log commit'), L('Data platform','Data platform')],
   [L('Security','Bảo mật'), L('Expired credentials, permission errors','Credential hết hạn, lỗi quyền'), L('Audit logs, secret expiry, policy changes','Audit log, hạn secret, thay đổi policy'), L('Security and platform','Bảo mật và platform')],
   [L('Cost','Chi phí'), L('Excess compute, inefficient storage, unnecessary scans','Compute thừa, storage kém hiệu quả, quét không cần thiết'), L('Cost by tag, top queries, storage growth','Chi phí theo tag, query tốn nhất, tăng trưởng dung lượng'), L('FinOps owner','Chủ FinOps')]
  ], cap:L('Classify first. The category decides which evidence you collect and who gets paged.','Phân loại trước. Nhóm sự cố quyết định bạn thu thập bằng chứng gì và gọi ai.'),
   n:L('A shared taxonomy speeds up triage: everyone uses the same words for what is broken.','Một bảng phân loại chung giúp phân loại nhanh hơn: mọi người dùng cùng từ ngữ cho thứ đang hỏng.') },

 { k:'cards', cols:2, t:L('The incident format: eight steps','Định dạng sự cố: tám bước'),
   lead:L('Use the same eight sections for every incident and every runbook. The format is what turns an incident into learning.','Dùng cùng tám mục cho mọi sự cố và mọi runbook. Định dạng là thứ biến sự cố thành bài học.'),
   cards:[
    {h:L('1. Symptoms and 2. Business impact','1. Triệu chứng và 2. Tác động nghiệp vụ'), p:L('What was observed, by whom, since when, and which reports, customers or decisions were affected.','Quan sát được gì, bởi ai, từ khi nào, và báo cáo, khách hàng hay quyết định nào bị ảnh hưởng.')},
    {h:L('3. Possible root causes and 4. Evidence','3. Nguyên nhân gốc có thể và 4. Bằng chứng'), p:L('List hypotheses, and for each the evidence that would confirm or reject it: logs, metrics, queries, recent changes.','Liệt kê các giả thuyết, và với mỗi giả thuyết là bằng chứng xác nhận hoặc bác bỏ: log, metric, query, thay đổi gần đây.')},
    {h:L('5. Diagnostic procedure','5. Quy trình chẩn đoán'), p:L('Ordered steps from cheapest to most expensive, each with the command or dashboard to use.','Các bước theo thứ tự từ rẻ nhất đến đắt nhất, mỗi bước kèm lệnh hoặc dashboard cần dùng.')},
    {h:L('6. Resolution options and trade-offs','6. Phương án xử lý và đánh đổi'), p:L('Mitigate first (stop the bleeding), then fix the cause. State what each option costs and risks.','Giảm nhẹ trước (cầm máu), rồi sửa nguyên nhân. Nêu mỗi phương án tốn gì và rủi ro gì.')},
    {h:L('7. Prevention','7. Phòng ngừa'), p:L('The test, monitor, contract or process change that would have caught it earlier, with an owner and a date.','Test, monitor, contract hoặc thay đổi quy trình lẽ ra đã bắt được sớm hơn, kèm người chịu trách nhiệm và ngày hạn.')},
    {h:L('8. Postmortem','8. Postmortem'), p:L('Blameless review: timeline, what worked, what did not, and the follow-up actions that are tracked to completion.','Review không đổ lỗi: dòng thời gian, cái gì tốt, cái gì chưa tốt, và các hành động tiếp theo được theo dõi đến khi hoàn tất.')}
   ],
   n:L('Insist that prevention and postmortem are not optional. An incident without a prevention action will happen again.','Nhấn mạnh phòng ngừa và postmortem không phải tùy chọn. Sự cố không có hành động phòng ngừa sẽ xảy ra lại.') },

 incidentSlide({ t:L('Incident example 1 (data correctness): duplicated revenue after a backfill','Ví dụ sự cố 1 (tính đúng dữ liệu): doanh thu bị nhân đôi sau backfill'),
   sym:L('Monthly revenue is 18 percent higher than finance’s ledger. It appeared the morning after a 30-day backfill.','Doanh thu tháng cao hơn sổ cái của tài chính 18 phần trăm. Nó xuất hiện vào sáng sau một lần backfill 30 ngày.'),
   impact:L('Finance and sales leaders saw inflated numbers for a day; one forecast was shared externally.','Lãnh đạo tài chính và kinh doanh thấy số liệu thổi phồng trong một ngày; một dự báo đã được gửi ra ngoài.'),
   causes:L('Backfill appended instead of overwriting partitions; a join fan-out; a duplicated source extract.','Backfill ghi thêm thay vì ghi đè partition; join nở dòng; extract nguồn bị trùng.'),
   evidence:L('Row counts per partition before and after; distinct versus total order IDs; backfill run history; the SQL of the load step.','Số dòng theo partition trước và sau; số order ID khác nhau so với tổng; lịch sử các lần chạy backfill; SQL của bước load.'),
   diag:L('1) Compare totals by day with the source. 2) Check key uniqueness. 3) Find the first day where counts diverge. 4) Read the load step for append versus overwrite.','1) So tổng theo ngày với nguồn. 2) Kiểm tra tính duy nhất của khóa. 3) Tìm ngày đầu tiên số dòng bắt đầu lệch. 4) Đọc bước load để biết ghi thêm hay ghi đè.'),
   fix:L('Option A: restore the affected partitions from a snapshot (fast, needs snapshots). Option B: rebuild from the source (slower, always possible). Notify consumers either way.','Phương án A: khôi phục các partition bị ảnh hưởng từ snapshot (nhanh, cần có snapshot). Phương án B: dựng lại từ nguồn (chậm hơn, luôn làm được). Dù cách nào cũng thông báo cho consumer.'),
   prev:L('Make loads idempotent by logical date, add a uniqueness test on order_id and a reconciliation test against the ledger.','Làm load idempotent theo logical date, thêm test tính duy nhất cho order_id và test đối soát với sổ cái.'),
   post:L('Timeline, the missing test, and tracked actions: idempotent load, reconciliation gate, backfill runbook.','Dòng thời gian, test còn thiếu và các hành động được theo dõi: load idempotent, cổng đối soát, runbook backfill.'),
   n:L('Note the order: confirm and contain, then explain, then prevent. The reconciliation test would have turned this into a failed run instead of a wrong dashboard.','Lưu ý thứ tự: xác nhận và khoanh vùng, rồi giải thích, rồi phòng ngừa. Test đối soát lẽ ra đã biến sự cố này thành một lần chạy thất bại thay vì dashboard sai.') }),

 incidentSlide({ t:L('Incident example 2 (performance): Kafka consumer lag and rebalance storm','Ví dụ sự cố 2 (hiệu năng): Kafka consumer lag và bão rebalance'),
   sym:L('Lag on the orders topic grows from seconds to 40 minutes. Consumer logs show repeated rebalances every few minutes.','Lag trên topic orders tăng từ vài giây lên 40 phút. Log consumer cho thấy rebalance lặp lại mỗi vài phút.'),
   impact:L('Near-real-time dashboards and fraud checks are stale; downstream SLAs are at risk.','Dashboard gần thời gian thực và kiểm tra gian lận bị cũ; SLA phía sau bị đe dọa.'),
   causes:L('Handler exceeds `max.poll.interval.ms` after a slow downstream call; a consumer pod is repeatedly OOM-killed; deployments restart members; eager assignment pauses everyone.','Handler vượt `max.poll.interval.ms` sau một lời gọi phía sau chậm; một pod consumer liên tục bị OOM kill; lần deploy khởi động lại các thành viên; gán eager làm mọi người tạm dừng.'),
   evidence:L('Group state and member list; rebalance count over time; poll duration; container restarts; lag per partition.','Trạng thái group và danh sách thành viên; số lần rebalance theo thời gian; thời gian poll; số lần container khởi động lại; lag theo partition.'),
   diag:L('1) Describe the group and check members. 2) Correlate rebalances with deployments or restarts. 3) Measure handler time per batch. 4) Check broker health and ISR.','1) Describe group và kiểm tra thành viên. 2) Đối chiếu rebalance với deploy hoặc khởi động lại. 3) Đo thời gian handler mỗi batch. 4) Kiểm tra sức khỏe broker và ISR.'),
   fix:L('Mitigate: reduce `max.poll.records`, pause deployments. Fix: speed up or isolate the slow call, raise memory, use cooperative-sticky assignment and static membership. Trade-off: slower failure detection with a longer timeout.','Giảm nhẹ: giảm `max.poll.records`, dừng deploy. Sửa: tăng tốc hoặc cô lập lời gọi chậm, tăng bộ nhớ, dùng gán cooperative-sticky và static membership. Đánh đổi: timeout dài hơn thì phát hiện lỗi chậm hơn.'),
   prev:L('Alert on rebalance rate and lag growth; load-test handlers; set memory from measurement; use rolling deploys with static membership.','Cảnh báo theo tốc độ rebalance và tăng lag; test tải handler; đặt bộ nhớ theo số đo; deploy cuốn chiếu với static membership.'),
   post:L('Timeline and metrics, why the alert did not fire early, and actions for handler isolation and rebalance alerts.','Dòng thời gian và metric, vì sao cảnh báo không kích hoạt sớm và các hành động về cô lập handler và cảnh báo rebalance.'),
   n:L('This answers the question of what triggers a rebalance, how it shows up in metrics and logs, what it costs, and which remedies exist. Setting names should be verified for your Kafka version.','Đây là câu trả lời cho câu hỏi điều gì kích hoạt rebalance, nó hiện ra thế nào trong metric và log, giá phải trả là gì và có những cách xử lý nào. Tên cấu hình nên được kiểm tra theo phiên bản Kafka của bạn.') })
]});

/* ================= Competency levels ================= */
PRACTICE.push({ name:L('Competency levels L1 to L5','Thang năng lực L1 đến L5'), color:'#0369A1', slides:[
 { k:'table', t:L('Five competency levels, proven by evidence','Năm mức năng lực, chứng minh bằng bằng chứng'),
   lead:L('A technology is not “completed” because someone read its slides. Each level requires demonstrated evidence.','Một công nghệ không “xong” chỉ vì ai đó đã đọc slide. Mỗi mức yêu cầu bằng chứng đã chứng minh.'),
   head:[L('Level','Mức'), L('Capability','Năng lực'), L('Evidence required','Bằng chứng yêu cầu')], rows:[
   [L('L1 Understand','L1 Hiểu'), L('Explain concepts, architecture and use cases','Giải thích khái niệm, kiến trúc và trường hợp dùng'), L('Written or spoken explanation, and an architecture sketch','Giải thích bằng văn bản hoặc lời nói, và một bản phác kiến trúc')],
   [L('L2 Implement','L2 Triển khai'), L('Build and integrate a working solution','Xây và tích hợp một giải pháp chạy được'), L('A working repository with tests and a README','Một repository chạy được có test và README')],
   [L('L3 Operate','L3 Vận hành'), L('Monitor, troubleshoot and recover','Giám sát, xử lý sự cố và khôi phục'), L('Completed failure drills with logs, metrics and a runbook','Các bài diễn tập sự cố đã hoàn thành kèm log, metric và runbook')],
   [L('L4 Optimize','L4 Tối ưu'), L('Improve performance, reliability and cost','Cải thiện hiệu năng, độ tin cậy và chi phí'), L('Before-and-after measurements for a real bottleneck','Số đo trước và sau cho một nút thắt thật')],
   [L('L5 Architect','L5 Kiến trúc'), L('Make design decisions and justify trade-offs','Ra quyết định thiết kế và biện minh đánh đổi'), L('A design review and ADR defended against questions','Một buổi review thiết kế và ADR được bảo vệ trước các câu hỏi')]
  ], cap:L('Multiple-choice quizzes can support L1. They cannot demonstrate L3 or above.','Trắc nghiệm có thể hỗ trợ L1. Chúng không chứng minh được L3 trở lên.'),
   n:L('Each level builds on the previous one. Assess L3 with a live failure drill, not a questionnaire.','Mỗi mức xây trên mức trước. Đánh giá L3 bằng diễn tập sự cố trực tiếp, không bằng bảng câu hỏi.') },

 { k:'table', t:L('Evidence required per technology','Bằng chứng yêu cầu theo từng công nghệ'),
   head:[L('Technology','Công nghệ'), L('L3 Operate evidence','Bằng chứng L3 Vận hành'), L('L4 Optimize evidence','Bằng chứng L4 Tối ưu'), L('L5 Architect evidence','Bằng chứng L5 Kiến trúc')], rows:[
   ['Kafka', L('Diagnose consumer lag, handle a failed broker, explain recovery behaviour','Chẩn đoán consumer lag, xử lý broker hỏng, giải thích hành vi khôi phục'), L('Tune throughput and latency with benchmarks; fix a hot partition','Tinh chỉnh throughput và độ trễ bằng benchmark; sửa partition nóng'), L('Design partitioning, replication and delivery semantics for a stated workload','Thiết kế partition, replication và ngữ nghĩa giao nhận cho một workload cụ thể')],
   ['Spark', L('Read the Spark UI; recover a failed stage; fix an OOM','Đọc Spark UI; khôi phục stage lỗi; sửa OOM'), L('Remove a shuffle or skew with measured speedup','Bỏ shuffle hoặc lệch với mức tăng tốc đã đo'), L('Choose batch design, cluster model and cost envelope','Chọn thiết kế batch, mô hình cluster và khung chi phí')],
   ['Flink', L('Recover from checkpoint; handle backpressure and late data','Khôi phục từ checkpoint; xử lý backpressure và dữ liệu trễ'), L('Reduce checkpoint time and state size','Giảm thời gian checkpoint và kích thước state'), L('Design event-time, state and exactly-once strategy','Thiết kế chiến lược event-time, state và exactly-once')],
   ['Iceberg', L('Restore a snapshot; fix commit conflicts','Khôi phục snapshot; sửa xung đột commit'), L('Compaction and layout improvements with scan metrics','Cải thiện compaction và bố cục với số đo quét'), L('Choose catalog, format and maintenance policy','Chọn catalog, format và chính sách bảo trì')],
   ['Airflow', L('Diagnose stuck tasks; backfill safely; recover a scheduler','Chẩn đoán task kẹt; backfill an toàn; khôi phục scheduler'), L('Reduce scheduler latency and warehouse contention','Giảm độ trễ scheduler và tranh chấp warehouse'), L('Choose executor, isolation and multi-team model','Chọn executor, cô lập và mô hình nhiều đội')],
   ['dbt', L('Debug failures with artifacts; reconcile incremental models','Debug lỗi bằng artifact; đối soát model incremental'), L('Cut build time and cost with measurements','Giảm thời gian build và chi phí có số đo'), L('Define project structure, contracts and ownership','Định nghĩa cấu trúc dự án, contract và quyền sở hữu')],
   ['SQL', L('Find and fix fan-out and NULL bugs','Tìm và sửa lỗi nở dòng và NULL'), L('Turn a slow query fast with plan evidence','Biến query chậm thành nhanh bằng bằng chứng từ plan'), L('Model data for correctness and evolution','Mô hình hóa dữ liệu để đúng và tiến hóa được')],
   ['Python', L('Profile and fix memory and concurrency problems','Profile và sửa vấn đề bộ nhớ và đồng thời'), L('Replace a slow loop or process with measured gain','Thay vòng lặp hoặc process chậm với mức cải thiện đã đo'), L('Structure packages, tests and deployment','Cấu trúc package, test và triển khai')]
  ], cap:L('Each cell is an observable task, not a topic to have read.','Mỗi ô là một nhiệm vụ quan sát được, không phải chủ đề đã đọc.'),
   n:L('Hand these cells to learners as a checklist. For each, they provide a link to their evidence.','Đưa các ô này cho người học như một checklist. Với mỗi ô, họ cung cấp liên kết tới bằng chứng của mình.') }
]});

/* ================= Version and source governance ================= */
PRACTICE.push({ name:L('Version and source governance','Quản trị phiên bản và nguồn'), color:'#475569', slides:[
 { k:'code', t:L('Version and source governance for a long-lived handbook','Quản trị phiên bản và nguồn cho một handbook sống lâu'),
   lead:L('Technical content rots. Every topic should state which version it describes, where the claim comes from, and when it was last checked.','Nội dung kỹ thuật bị lỗi thời. Mỗi chủ đề nên nêu mô tả phiên bản nào, thông tin đến từ đâu và kiểm tra lần cuối khi nào.'),
   blocks:[{lang:'yaml', title:'topic-metadata.yaml (one record per topic)', code:`
topic: kafka-consumer-rebalancing
technology: Apache Kafka
applies_to: ">= 3.x (verify KRaft and protocol details for your version)"
official_docs: https://kafka.apache.org/documentation/
last_verified: YYYY-MM-DD        # date someone checked the claims against the docs
verified_by: "reviewer name"
source_confidence: official-docs   # official-docs | engineering-experience | community
deprecations:
  - "Eager rebalance protocol is superseded by cooperative protocols"
migration_notes: "See the upgrade notes for your target version"
adr: ADR-0012                      # decision record explaining platform choices`}],
   points:[
    {h:L('Source confidence','Độ tin cậy của nguồn'), p:L('Official documentation, engineering experience, or community reference. Say which one a claim rests on.','Tài liệu chính thức, kinh nghiệm kỹ thuật, hoặc tham chiếu cộng đồng. Nêu rõ một tuyên bố dựa trên loại nào.')},
    {h:L('Last verified date','Ngày xác minh gần nhất'), tag:'senior', p:L('A date and a name. Unverified content should be visibly marked, not silently trusted.','Một ngày và một cái tên. Nội dung chưa xác minh phải được đánh dấu rõ, không được tin ngầm.')},
    {h:L('Version-specific examples','Ví dụ theo phiên bản'), p:L('Keep code examples next to the versions they were tested on, and add migration notes when behaviour changes.','Giữ ví dụ code cạnh các phiên bản đã test, và thêm ghi chú migration khi hành vi thay đổi.')},
    {h:L('Review cadence','Chu kỳ rà soát'), tag:'senior', p:L('Re-verify fast-moving technologies (Kafka, Spark, Flink, Iceberg, Airflow, dbt, AI tooling) at least quarterly.','Xác minh lại các công nghệ thay đổi nhanh (Kafka, Spark, Flink, Iceberg, Airflow, dbt, công cụ AI) ít nhất mỗi quý.')}
   ],
   n:L('This deck does not yet carry per-slide metadata. The record format above is the proposed standard; the next slide lists what needs verification first.','Bộ slide này chưa có metadata cho từng slide. Định dạng bản ghi ở trên là chuẩn đề xuất; slide kế tiếp liệt kê những thứ cần xác minh trước.') },

 { k:'table', t:L('Version-sensitive topics in this deck, and where to verify them','Các chủ đề nhạy cảm với phiên bản trong deck này và nơi xác minh'),
   lead:L('Honest status: these claims come from general engineering knowledge and have not been re-verified against current releases in this revision.','Tình trạng trung thực: các tuyên bố này đến từ kiến thức kỹ thuật chung và chưa được xác minh lại với các bản phát hành hiện tại trong lần sửa này.'),
   head:[L('Technology','Công nghệ'), L('Version-sensitive topic','Chủ đề nhạy cảm với phiên bản'), L('Official documentation','Tài liệu chính thức'), L('Confidence in this deck','Độ tin cậy trong deck')], rows:[
   ['Kafka', L('KRaft versus ZooKeeper, client defaults, rebalance protocols','KRaft so với ZooKeeper, mặc định của client, giao thức rebalance'), 'kafka.apache.org/documentation', L('Engineering knowledge; verify','Kiến thức kỹ thuật; cần xác minh')],
   ['Debezium', L('Property names (`topic.prefix` versus `database.server.name`), snapshot modes','Tên thuộc tính (`topic.prefix` so với `database.server.name`), chế độ snapshot'), 'debezium.io/documentation', L('Engineering knowledge; verify','Kiến thức kỹ thuật; cần xác minh')],
   ['Spark', L('AQE defaults, shuffle and memory settings, Structured Streaming options','Mặc định AQE, cấu hình shuffle và bộ nhớ, tùy chọn Structured Streaming'), 'spark.apache.org/docs/latest', L('Engineering knowledge; verify','Kiến thức kỹ thuật; cần xác minh')],
   ['Flink', L('Option names, Kafka and Iceberg connector options, idleness settings','Tên tùy chọn, tùy chọn connector Kafka và Iceberg, cấu hình idle'), 'nightlies.apache.org/flink', L('Engineering knowledge; verify','Kiến thức kỹ thuật; cần xác minh')],
   ['Iceberg / Polaris', L('Format versions, Spark procedures, REST catalog options','Phiên bản format, Spark procedure, tùy chọn REST catalog'), 'iceberg.apache.org/docs/latest, polaris.apache.org', L('Engineering knowledge; verify','Kiến thức kỹ thuật; cần xác minh')],
   ['Airflow', L('Airflow 3 imports, SDK, API server, backfill CLI, SLA features','Import Airflow 3, SDK, API server, CLI backfill, tính năng SLA'), 'airflow.apache.org/docs', L('Engineering knowledge; verify','Kiến thức kỹ thuật; cần xác minh')],
   ['dbt', L('`data_tests` key, MetricFlow spec, microbatch, new engine status','Khóa `data_tests`, đặc tả MetricFlow, microbatch, tình trạng engine mới'), 'docs.getdbt.com', L('Engineering knowledge; verify','Kiến thức kỹ thuật; cần xác minh')],
   ['Terraform / Kubernetes', L('Provider schemas, licensing, API versions','Schema provider, giấy phép, phiên bản API'), 'developer.hashicorp.com/terraform, kubernetes.io/docs', L('Engineering knowledge; verify','Kiến thức kỹ thuật; cần xác minh')],
   [L('AI tooling (MCP, LLM APIs)','Công cụ AI (MCP, API LLM)'), L('Specification and auth, SDK signatures, model names','Đặc tả và xác thực, chữ ký SDK, tên model'), L('Each vendor’s current docs','Tài liệu hiện hành của từng nhà cung cấp'), L('Changes fastest; verify before use','Thay đổi nhanh nhất; xác minh trước khi dùng')]
  ], cap:L('Before relying on a configuration or command from this deck, check it against the documentation for your exact version.','Trước khi dựa vào một cấu hình hoặc lệnh trong deck này, hãy đối chiếu với tài liệu của đúng phiên bản bạn dùng.'),
   n:L('This table is a work list. Closing each row with a verified date and a version range is the next governance step.','Bảng này là một danh sách việc cần làm. Đóng từng hàng bằng ngày xác minh và dải phiên bản là bước quản trị tiếp theo.') }
]});

"use strict";

function groupNamed(list, en){ return list.filter(function(g){ return (g.name && g.name.en === en) || g.name === en; })[0]; }
function insertLab(layer, slide){ var s = DATA[layer - 1].slides; s.splice(s.length - 1, 0, slide); }
function lcSlide(o){
  return { k:'html', t:o.t, lead:o.lead, n:o.n, html:function(){
    return '<div class="lc" style="margin-top:22px">' + o.steps.map(function(x){
      return '<div><h4>' + inl(x[0]) + '</h4><p>' + inl(x[1]) + '</p><small>' + esc(X('observe: ', 'quan sát: ')) + esc(x[2]) + '</small></div>';
    }).join('') + '</div>';
  }};
}

/* ================= 11 new labs (one per layer that lacked a hands-on exercise) ================= */
insertLab(3, labSlide({ t:L('Warehouse lab: query optimization and workload isolation','Lab warehouse: tối ưu query và cô lập workload'),
  lead:L('Find the expensive queries, fix them, and stop ELT from slowing dashboards.','Tìm các query đắt, sửa chúng và ngăn ELT làm chậm dashboard.'),
  scenario:L('Dashboards slow down every morning while ELT jobs run on the same compute.','Dashboard chậm đi mỗi sáng khi các job ELT chạy trên cùng compute.'),
  input:L('A warehouse (cloud trial or DuckDB for the query part) with a 100-million-row fact table, a BI query set and an ELT job set.','Một warehouse (bản dùng thử trên cloud hoặc DuckDB cho phần query) với bảng fact 100 triệu dòng, một bộ query BI và một bộ job ELT.'),
  tasks:[L('Rank the top ten queries by time and data scanned from query history.','Xếp hạng mười query hàng đầu theo thời gian và dữ liệu quét từ lịch sử query.'), L('Fix three of them using partitioning or clustering, column pruning and pre-aggregation.','Sửa ba query bằng partition hoặc clustering, cắt cột và tổng hợp trước.'), L('Move ELT and BI to separate compute with a budget alert.','Chuyển ELT và BI sang compute riêng kèm cảnh báo ngân sách.'), L('Re-run both workloads together and measure dashboard latency.','Chạy lại cả hai workload cùng lúc và đo độ trễ dashboard.')],
  expected:L('A before-and-after table of runtime and scanned data, and dashboard latency that no longer depends on ELT.','Bảng trước-sau về thời gian chạy và dữ liệu quét, và độ trễ dashboard không còn phụ thuộc ELT.'),
  rubric:[L('Fixes justified by plan or profile evidence','Cách sửa được biện minh bằng bằng chứng plan hoặc profile'), L('Isolation verified under concurrent load','Cô lập được kiểm chứng dưới tải đồng thời'), L('Cost impact estimated','Ước tính được tác động chi phí')],
  design:L('Size compute and isolation for a peak of 200 concurrent dashboard users plus a nightly load.','Định cỡ compute và cô lập cho đỉnh 200 người dùng dashboard đồng thời cộng một lần load ban đêm.'),
  n:L('Check that the speedup is measured by the same query before and after, not by different queries.','Kiểm tra mức tăng tốc được đo bằng cùng một query trước và sau, không phải các query khác nhau.') }));

insertLab(6, labSlide({ t:L('Semantic layer lab: governed metrics for BI and APIs','Lab semantic layer: metric có quản trị cho BI và API'),
  lead:L('Define a metric once and prove two consumers agree.','Định nghĩa metric một lần và chứng minh hai nơi dùng cho cùng kết quả.'),
  scenario:L('Two dashboards report different revenue because each defines it in its own way.','Hai dashboard báo doanh thu khác nhau vì mỗi nơi tự định nghĩa theo cách riêng.'),
  input:L('A tested mart (orders, customers), a semantic layer (MetricFlow or Cube), one BI tool or SQL client and an HTTP client for the API.','Một mart đã test (orders, customers), một semantic layer (MetricFlow hoặc Cube), một công cụ BI hoặc SQL client và HTTP client cho API.'),
  tasks:[L('Define revenue, orders and average order value with owners and descriptions.','Định nghĩa revenue, orders và average order value kèm chủ sở hữu và mô tả.'), L('Query them from the BI tool and from the API.','Truy vấn chúng từ công cụ BI và từ API.'), L('Add a test that fails if the two outputs differ.','Thêm test thất bại nếu hai kết quả khác nhau.'), L('Deprecate one duplicate definition and communicate it.','Ngừng dùng một định nghĩa trùng lặp và thông báo.')],
  expected:L('Identical numbers from both consumers, a metric catalog with owners, and a deprecation note.','Con số giống hệt từ cả hai nơi dùng, danh mục metric có chủ sở hữu và một ghi chú ngừng dùng.'),
  rubric:[L('Grain and join paths are explicit','Grain và đường join rõ ràng'), L('Single definition with an owner','Một định nghĩa duy nhất có chủ sở hữu'), L('Change process is described','Quy trình thay đổi được mô tả')],
  design:L('Design the review process for changing a metric that finance and sales both depend on.','Thiết kế quy trình review khi đổi một metric mà cả tài chính và kinh doanh đều phụ thuộc.'),
  n:L('The automated comparison test is the evidence that matters.','Test so sánh tự động là bằng chứng quan trọng.') }));

insertLab(8, labSlide({ t:L('Data quality lab: contracts and anomaly detection','Lab chất lượng dữ liệu: contract và phát hiện bất thường'),
  lead:L('Plant defects, then catch them with the cheapest control that works.','Gài lỗi, rồi bắt chúng bằng kiểm soát rẻ nhất mà hiệu quả.'),
  scenario:L('An upstream team changes a column and a feed silently loses half its rows.','Một đội phía trên đổi một cột và một nguồn âm thầm mất nửa số dòng.'),
  input:L('A dbt project over a small warehouse, a generator that plants duplicates, a null spike, late data, a schema change and a volume drop.','Một dự án dbt trên warehouse nhỏ, bộ sinh gài trùng lặp, đột biến NULL, dữ liệu trễ, đổi schema và giảm khối lượng.'),
  tasks:[L('Add a model contract and generic tests.','Thêm contract cho model và các test generic.'), L('Add freshness and volume anomaly monitors.','Thêm monitor bất thường về freshness và khối lượng.'), L('Run the generator and record which control caught each defect.','Chạy bộ sinh và ghi lại kiểm soát nào bắt từng lỗi.'), L('Route alerts to an owner and write one incident note in the eight-step format.','Chuyển cảnh báo tới chủ sở hữu và viết một ghi chú sự cố theo định dạng tám bước.')],
  expected:L('A matrix of defect versus control, with false positives counted.','Ma trận lỗi so với kiểm soát, có đếm số báo động giả.'),
  rubric:[L('Every planted defect is detected','Mọi lỗi đã gài đều được phát hiện'), L('False positives are measured and reduced','Báo động giả được đo và giảm'), L('Alerts have owners and runbooks','Cảnh báo có chủ sở hữu và runbook')],
  design:L('Decide which tests block a deployment and which only warn, and defend the line.','Quyết định test nào chặn deploy và test nào chỉ cảnh báo, rồi bảo vệ ranh giới đó.'),
  n:L('Reward learners who notice a defect no control caught and propose one.','Đánh giá cao người học nhận ra lỗi không kiểm soát nào bắt được và đề xuất kiểm soát mới.') }));

insertLab(9, labSlide({ t:L('Governance lab: RBAC, masking and lineage','Lab quản trị: RBAC, masking và lineage'),
  lead:L('Give each role exactly the data it should see, and prove it.','Cho mỗi role đúng dữ liệu nó nên thấy, và chứng minh điều đó.'),
  scenario:L('Analysts need customer metrics but must not see raw emails; an auditor asks where a column came from.','Analyst cần chỉ số khách hàng nhưng không được thấy email gốc; kiểm toán viên hỏi một cột đến từ đâu.'),
  input:L('A warehouse or Postgres with roles, a customers table containing PII, and an OpenLineage-capable orchestrator or dbt.','Một warehouse hoặc Postgres có role, bảng customers chứa PII và orchestrator hoặc dbt hỗ trợ OpenLineage.'),
  tasks:[L('Create analyst, engineer and pii_reader roles with least privilege.','Tạo role analyst, engineer và pii_reader với quyền tối thiểu.'), L('Apply a masking policy and a row-level policy.','Áp dụng masking policy và row-level policy.'), L('Collect lineage and trace one column end to end.','Thu lineage và truy vết một cột từ đầu đến cuối.'), L('Pull the audit log for access to the PII column.','Lấy audit log về truy cập cột PII.')],
  expected:L('A role-by-data visibility matrix, a lineage graph for one column and audit evidence.','Ma trận role theo dữ liệu, graph lineage cho một cột và bằng chứng audit.'),
  rubric:[L('Masked and unmasked results shown per role','Có kết quả bị che và không che theo từng role'), L('Lineage reaches the dashboard','Lineage đi tới dashboard'), L('Audit proves who read what','Audit chứng minh ai đã đọc gì')],
  design:L('Design how classification tags propagate through lineage and drive policies automatically.','Thiết kế cách tag phân loại lan truyền qua lineage và tự động điều khiển policy.'),
  n:L('Test with denied attempts as well as allowed ones.','Test cả các lần bị từ chối chứ không chỉ các lần được phép.') }));

insertLab(10, labSlide({ t:L('Reverse ETL lab: an idempotent activation pipeline','Lab reverse ETL: pipeline activation idempotent'),
  lead:L('Sync warehouse data to a rate-limited API without duplicates or accidents.','Đồng bộ dữ liệu warehouse tới một API có giới hạn tốc độ mà không trùng lặp hay tai nạn.'),
  scenario:L('Customer health scores must reach a CRM, respecting consent and API limits.','Điểm sức khỏe khách hàng phải tới được CRM, tôn trọng sự đồng ý và giới hạn API.'),
  input:L('A mart with consent flags, a mock CRM API returning 429 and 500 randomly, and Python or a reverse ETL tool.','Một mart có cờ đồng ý, một CRM API giả trả 429 và 500 ngẫu nhiên, và Python hoặc công cụ reverse ETL.'),
  tasks:[L('Build the activation model with the consent filter.','Xây model activation có bộ lọc đồng ý.'), L('Implement a diff-based, idempotent upsert with retries and backoff.','Cài upsert dựa trên diff, idempotent, có retry và backoff.'), L('Add a kill switch that stops a sync changing more than a set share of records.','Thêm kill switch dừng sync khi thay đổi vượt một tỷ lệ bản ghi đặt trước.'), L('Run twice and kill the job midway; show the destination is correct.','Chạy hai lần và tắt job giữa chừng; cho thấy đích vẫn đúng.')],
  expected:L('The second run changes nothing; a partial failure resumes cleanly; the kill switch trips on an empty model.','Lần chạy thứ hai không đổi gì; lỗi dở dang tiếp tục gọn gàng; kill switch kích hoạt với model rỗng.'),
  rubric:[L('Idempotency proven by comparison','Idempotency được chứng minh bằng so sánh'), L('Rate limits respected','Tôn trọng giới hạn tốc độ'), L('No record outside consent is sent','Không gửi bản ghi nào ngoài phạm vi đồng ý')],
  design:L('Design rollback for a sync that wrote bad values to ten thousand CRM records.','Thiết kế rollback cho một lần sync đã ghi giá trị sai vào mười nghìn bản ghi CRM.'),
  n:L('The empty-model test is the one that prevents real disasters.','Test với model rỗng là test ngăn được thảm họa thật.') }));

insertLab(11, labSlide({ t:L('DevOps lab: CI/CD with Terraform and rollback','Lab DevOps: CI/CD với Terraform và rollback'),
  lead:L('Change infrastructure and data models through a pipeline, then undo a bad release.','Thay đổi hạ tầng và model dữ liệu qua pipeline, rồi hoàn tác một bản phát hành lỗi.'),
  scenario:L('A team still deploys by hand and cannot say what changed last Friday.','Một đội vẫn deploy bằng tay và không nói được thứ thay đổi hôm thứ Sáu là gì.'),
  input:L('A Git repository, a cloud account or local stand-in, Terraform, dbt and a CI service.','Một Git repository, tài khoản cloud hoặc môi trường giả lập cục bộ, Terraform, dbt và một dịch vụ CI.'),
  tasks:[L('Define a schema, role and storage bucket in Terraform with remote state.','Định nghĩa schema, role và storage bucket bằng Terraform với remote state.'), L('Run plan on pull requests and apply on merge with an approval.','Chạy plan trên pull request và apply khi merge có phê duyệt.'), L('Add dbt Slim CI with a per-PR schema.','Thêm dbt Slim CI với schema riêng cho mỗi PR.'), L('Deploy a bad model, then roll back and time the recovery.','Deploy một model lỗi, rồi rollback và đo thời gian khôi phục.')],
  expected:L('Pipeline logs for each stage, a rollback demonstration and a measured recovery time.','Log pipeline cho từng giai đoạn, một lần trình diễn rollback và thời gian khôi phục đã đo.'),
  rubric:[L('No manual production changes','Không có thay đổi production thủ công'), L('Plan reviewed before apply','Plan được review trước khi apply'), L('Rollback covers code and data','Rollback bao gồm cả code và dữ liệu')],
  design:L('Design environments, approvals and drift detection for five teams sharing one platform.','Thiết kế môi trường, phê duyệt và phát hiện drift cho năm đội dùng chung một nền tảng.'),
  n:L('Ask learners to show the pipeline run that applied the change, not a screenshot of the result.','Yêu cầu người học cho xem lần chạy pipeline đã áp dụng thay đổi, không phải ảnh chụp kết quả.') }));

insertLab(12, labSlide({ t:L('Modeling lab: SCD Type 2 and Data Vault','Lab mô hình hóa: SCD Type 2 và Data Vault'),
  lead:L('Keep history correctly, then compare two modeling styles on the same data.','Giữ lịch sử đúng, rồi so sánh hai phong cách mô hình hóa trên cùng dữ liệu.'),
  scenario:L('Customers change region over time and finance needs revenue by the region that applied at the time of sale.','Khách hàng đổi khu vực theo thời gian và tài chính cần doanh thu theo khu vực có hiệu lực tại thời điểm bán.'),
  input:L('Raw customers and orders with attribute changes and late-arriving updates, dbt on DuckDB or a warehouse.','Dữ liệu customers và orders thô có thay đổi thuộc tính và cập nhật đến muộn, dbt trên DuckDB hoặc warehouse.'),
  tasks:[L('Build a Type 2 dimension with a dbt snapshot.','Xây dimension Type 2 bằng dbt snapshot.'), L('Write the point-in-time join from facts to the dimension.','Viết point-in-time join từ fact tới dimension.'), L('Model the same domain as hubs, links and satellites.','Mô hình hóa cùng miền đó thành hub, link và satellite.'), L('Compare query complexity, load logic and audit ability.','So sánh độ phức tạp query, logic load và khả năng audit.')],
  expected:L('Revenue by historical region that matches a hand-computed sample, and a written comparison of the two styles.','Doanh thu theo khu vực lịch sử khớp với mẫu tính tay, và bản so sánh bằng văn bản hai phong cách.'),
  rubric:[L('Grain stated for every table','Nêu grain cho mọi bảng'), L('Historical totals verified','Tổng lịch sử được kiểm chứng'), L('Choice between styles justified','Lựa chọn giữa hai phong cách được biện minh')],
  design:L('Decide when this company should move from dimensional marts to Data Vault, and what would trigger the move.','Quyết định khi nào công ty này nên chuyển từ mart dimensional sang Data Vault, và điều gì kích hoạt việc chuyển.'),
  n:L('Hand-compute a small sample so correctness is proven independently.','Tính tay một mẫu nhỏ để chứng minh tính đúng một cách độc lập.') }));

insertLab(15, labSlide({ t:L('AI engineering lab: RAG with evaluation and access controls','Lab AI: RAG có đánh giá và kiểm soát truy cập'),
  lead:L('Build retrieval that respects permissions and measure it honestly.','Xây truy xuất tôn trọng quyền truy cập và đo nó một cách trung thực.'),
  scenario:L('An internal assistant must answer from company documents but never reveal documents a user cannot open.','Một trợ lý nội bộ phải trả lời từ tài liệu công ty nhưng không bao giờ tiết lộ tài liệu người dùng không mở được.'),
  input:L('A small document set with access groups, an embedding model, a vector store with metadata filters, an LLM, and a golden set of 30 questions.','Một bộ tài liệu nhỏ có nhóm truy cập, một embedding model, vector store có bộ lọc metadata, một LLM và bộ vàng 30 câu hỏi.'),
  tasks:[L('Index documents with access tags and chunk metadata.','Lập chỉ mục tài liệu với tag truy cập và metadata của chunk.'), L('Filter retrieval by the caller’s groups before ranking.','Lọc truy xuất theo nhóm của người gọi trước khi xếp hạng.'), L('Measure recall at k and answer faithfulness on the golden set.','Đo recall tại k và độ trung thực của câu trả lời trên bộ vàng.'), L('Add a document containing a prompt injection and show the defence.','Thêm một tài liệu chứa prompt injection và cho thấy cách phòng thủ.')],
  expected:L('An evaluation report, a permission test showing denied documents never appear, and an injection test result.','Báo cáo đánh giá, test quyền cho thấy tài liệu bị từ chối không bao giờ xuất hiện và kết quả test injection.'),
  rubric:[L('Access control enforced before generation','Kiểm soát truy cập được ép trước khi sinh câu trả lời'), L('Retrieval and generation measured separately','Đo riêng truy xuất và sinh câu trả lời'), L('Tracing and logs available','Có tracing và log')],
  design:L('Design re-indexing, deletion of documents and audit of what each answer used.','Thiết kế lập chỉ mục lại, xóa tài liệu và audit xem mỗi câu trả lời đã dùng gì.'),
  n:L('A single leaked document fails the lab regardless of other results.','Chỉ một tài liệu bị lộ là trượt lab bất kể các kết quả khác.') }));

insertLab(17, labSlide({ t:L('Security lab: threat-model a data pipeline','Lab bảo mật: threat model một data pipeline'),
  lead:L('Find the weaknesses, fix three, and prove the fixes with attacks that should fail.','Tìm điểm yếu, sửa ba cái, và chứng minh bằng các cuộc tấn công đáng lẽ phải thất bại.'),
  scenario:L('A pipeline reads customer data from a database, lands it in object storage and loads a warehouse.','Một pipeline đọc dữ liệu khách hàng từ database, hạ cánh vào object storage và nạp vào warehouse.'),
  input:L('The architecture of one real or sample pipeline, a cloud sandbox, and the STRIDE table from this deck.','Kiến trúc của một pipeline thật hoặc mẫu, một sandbox cloud và bảng STRIDE trong deck này.'),
  tasks:[L('Draw the data flow with trust boundaries.','Vẽ luồng dữ liệu với các ranh giới tin cậy.'), L('Fill a threat register using STRIDE with severity and owner.','Điền sổ đăng ký mối đe dọa bằng STRIDE kèm mức độ nghiêm trọng và chủ sở hữu.'), L('Implement three mitigations: least-privilege role, private networking rule, secret rotation.','Cài ba biện pháp: role quyền tối thiểu, quy tắc mạng riêng, xoay secret.'), L('Attempt the blocked actions and capture the denials.','Thử các hành động bị chặn và ghi lại các lần bị từ chối.')],
  expected:L('A threat register and evidence (logs or screenshots) of denied attempts.','Sổ mối đe dọa và bằng chứng (log hoặc ảnh chụp) về các lần thử bị từ chối.'),
  rubric:[L('Trust boundaries identified correctly','Xác định đúng ranh giới tin cậy'), L('Mitigations verified by attempted attacks','Biện pháp được kiểm chứng bằng tấn công thử'), L('Residual risk stated','Nêu rủi ro còn lại')],
  design:L('Present the top three risks and the order in which you would fix them, with reasons.','Trình bày ba rủi ro hàng đầu và thứ tự bạn sẽ sửa, kèm lý do.'),
  n:L('Run this only in an environment you are authorized to test.','Chỉ chạy trong môi trường bạn được phép kiểm thử.') }));

insertLab(18, labSlide({ t:L('Reliability lab: simulate failures and recover','Lab độ tin cậy: mô phỏng sự cố và khôi phục'),
  lead:L('Break a pipeline on purpose and measure how fast it recovers.','Cố tình làm hỏng một pipeline và đo tốc độ nó hồi phục.'),
  scenario:L('A pipeline claims 15-minute recovery but has never been tested.','Một pipeline tuyên bố khôi phục trong 15 phút nhưng chưa từng được test.'),
  input:L('Any working pipeline from an earlier lab, a fault-injection method (stop containers, drop network, expire a credential) and monitoring.','Một pipeline đang chạy từ lab trước, một cách chèn lỗi (dừng container, ngắt mạng, làm hết hạn credential) và giám sát.'),
  tasks:[L('Define RPO and RTO targets and the detection signals.','Định nghĩa mục tiêu RPO và RTO cùng các tín hiệu phát hiện.'), L('Inject five failures one at a time.','Chèn năm sự cố, mỗi lần một cái.'), L('Record detection time, recovery time and data loss for each.','Ghi thời gian phát hiện, thời gian khôi phục và mất dữ liệu cho từng cái.'), L('Write or fix the runbook for each.','Viết hoặc sửa runbook cho từng cái.')],
  expected:L('A table of failure, detection time, recovery time and data lost, compared with the targets.','Bảng sự cố, thời gian phát hiện, thời gian khôi phục và dữ liệu mất, so với mục tiêu.'),
  rubric:[L('Measured, not estimated','Được đo, không ước đoán'), L('At least one target missed and analyzed','Ít nhất một mục tiêu không đạt và được phân tích'), L('Runbooks usable by someone else','Runbook người khác dùng được')],
  design:L('Propose a DR design that would meet a stricter RPO and RTO and state the extra cost.','Đề xuất thiết kế DR đạt RPO và RTO chặt hơn và nêu chi phí tăng thêm.'),
  n:L('Missing a target is a good result if it is measured and explained.','Không đạt mục tiêu vẫn là kết quả tốt nếu được đo và giải thích.') }));

insertLab(19, labSlide({ t:L('FinOps lab: cost per million processed records','Lab FinOps: chi phí cho mỗi triệu bản ghi được xử lý'),
  lead:L('Turn a bill into a unit cost and then reduce it.','Biến hóa đơn thành chi phí đơn vị rồi giảm nó.'),
  scenario:L('Leadership asks what it costs to process a million records and whether the platform is getting more efficient.','Lãnh đạo hỏi xử lý một triệu bản ghi tốn bao nhiêu và nền tảng có đang hiệu quả hơn không.'),
  input:L('A batch pipeline from an earlier lab, resource tags, billing or usage data, and datasets of three sizes.','Một pipeline batch từ lab trước, tag tài nguyên, dữ liệu hóa đơn hoặc mức dùng và ba bộ dữ liệu có kích thước khác nhau.'),
  tasks:[L('Tag all resources and attribute compute, storage and network cost to the pipeline.','Gắn tag mọi tài nguyên và quy gán chi phí compute, storage và network cho pipeline.'), L('Run the three data sizes and compute cost per million records.','Chạy ba kích thước dữ liệu và tính chi phí mỗi triệu bản ghi.'), L('Identify the top two cost levers and apply them.','Xác định hai đòn bẩy chi phí hàng đầu và áp dụng.'), L('Re-measure and report the change.','Đo lại và báo cáo thay đổi.')],
  expected:L('A chart of unit cost against data size, before and after optimization, with the method documented.','Biểu đồ chi phí đơn vị theo kích thước dữ liệu, trước và sau tối ưu, kèm phương pháp được ghi lại.'),
  rubric:[L('Includes storage and network, not only compute','Gồm cả storage và network, không chỉ compute'), L('Method is reproducible','Phương pháp tái lập được'), L('Savings are verified, not assumed','Khoản tiết kiệm được kiểm chứng, không giả định')],
  design:L('Propose a monthly unit-cost report and a budget alert policy for the whole platform.','Đề xuất báo cáo chi phí đơn vị hằng tháng và chính sách cảnh báo ngân sách cho cả nền tảng.'),
  n:L('Prices change, so ask learners to record the date and source of the prices they used.','Giá thay đổi, nên yêu cầu người học ghi lại ngày và nguồn của giá họ dùng.') }));

/* ================= Execution lifecycle diagrams ================= */
addTo('Kafka', [ lcSlide({ t:L('Kafka lifecycle: from producer to consumer','Vòng đời Kafka: từ producer đến consumer'),
  lead:L('Six steps from a record being created to progress being committed, and what to observe at each.','Sáu bước từ lúc record được tạo đến lúc tiến độ được commit, và cần quan sát gì ở mỗi bước.'),
  steps:[[L('Serialize and partition','Serialize và chọn partition'), L('The producer serializes key and value and picks a partition.','Producer serialize key và value rồi chọn partition.'), 'record-send-rate, batch-size-avg'],
         [L('Send to the leader','Gửi tới leader'), L('Records are batched and sent to the partition leader.','Record được gom batch và gửi tới leader của partition.'), 'request-latency-avg'],
         [L('Append to the log','Ghi vào log'), L('The broker appends to the active segment and assigns an offset.','Broker ghi thêm vào segment đang mở và gán offset.'), 'log end offset'],
         [L('Replicate and acknowledge','Replicate và xác nhận'), L('Followers fetch; the ack follows `acks` and `min.insync.replicas`.','Follower fetch; ack theo `acks` và `min.insync.replicas`.'), 'UnderReplicatedPartitions'],
         [L('Consumer fetch','Consumer fetch'), L('The consumer fetches from its offset up to the high watermark.','Consumer fetch từ offset của nó đến high watermark.'), 'fetch-rate, records-lag-max'],
         [L('Process and commit','Xử lý và commit'), L('The application processes, then commits the offset.','Ứng dụng xử lý rồi commit offset.'), 'kafka-consumer-groups.sh --describe']],
  n:L('Walk the six steps and ask at which step each earlier incident would appear.','Đi qua sáu bước và hỏi từng sự cố trước đó sẽ xuất hiện ở bước nào.') }) ]);
addTo('Spark', [ lcSlide({ t:L('Spark lifecycle: from DataFrame to executors','Vòng đời Spark: từ DataFrame đến executor'),
  lead:L('How a few lines of code become tasks on a cluster.','Vài dòng code trở thành task trên cluster như thế nào.'),
  steps:[[L('Build the logical plan','Dựng logical plan'), L('Transformations are lazy and build a logical plan.','Transformation lazy và dựng logical plan.'), 'df.explain("extended")'],
         [L('Analyze and optimize','Phân tích và tối ưu'), L('Catalyst resolves names and rewrites the plan.','Catalyst phân giải tên và viết lại plan.'), 'optimized logical plan'],
         [L('Choose the physical plan','Chọn physical plan'), L('Join and aggregation strategies are selected.','Chiến lược join và aggregation được chọn.'), 'df.explain("formatted")'],
         [L('Create stages','Tạo stage'), L('The DAG scheduler cuts stages at shuffles.','DAG scheduler cắt stage tại shuffle.'), 'Spark UI: Stages'],
         [L('Schedule tasks','Lập lịch task'), L('The task scheduler sends one task per partition to executors.','Task scheduler gửi mỗi partition một task tới executor.'), 'task time distribution'],
         [L('Execute and shuffle','Thực thi và shuffle'), L('Executors process partitions and write or read shuffle data.','Executor xử lý partition và ghi hoặc đọc dữ liệu shuffle.'), 'shuffle read/write, spill']],
  n:L('Each step maps to a place in the Spark UI or an explain output.','Mỗi bước tương ứng một chỗ trong Spark UI hoặc output explain.') }) ]);
addTo('Airflow', [ lcSlide({ t:L('Airflow lifecycle: from file to finished task','Vòng đời Airflow: từ file đến task hoàn tất'),
  lead:L('Every step is recorded as state in the metadata database.','Mọi bước đều được ghi thành trạng thái trong metadata database.'),
  steps:[[L('Parse the DAG file','Parse file DAG'), L('The DAG processor parses and serializes the DAG.','DAG processor parse và serialize DAG.'), 'airflow dags list-import-errors'],
         [L('Create a DAG run','Tạo DAG run'), L('The scheduler creates a run for the schedule or event.','Scheduler tạo run theo lịch hoặc sự kiện.'), 'DAG runs in the UI'],
         [L('Evaluate dependencies','Đánh giá phụ thuộc'), L('Tasks whose upstream is complete become scheduled.','Task có upstream đã xong chuyển sang scheduled.'), 'task state: scheduled'],
         [L('Queue to the executor','Đưa vào hàng đợi executor'), L('Pool and concurrency limits decide when a task is queued.','Giới hạn pool và đồng thời quyết định khi nào task được đưa vào hàng đợi.'), 'executor queued tasks, pool usage'],
         [L('Run on a worker','Chạy trên worker'), L('A worker or pod runs the task code.','Worker hoặc pod chạy code của task.'), 'task logs'],
         [L('Record and continue','Ghi nhận và tiếp tục'), L('Success, retry or failure is stored and downstream is decided.','Thành công, retry hoặc thất bại được lưu và quyết định task phía sau.'), 'airflow tasks states-for-dag-run']],
  n:L('Commands shown are Airflow 2.x CLI names; verify them for your version.','Các lệnh là tên CLI của Airflow 2.x; hãy xác minh theo phiên bản của bạn.') }) ]);
addTo('Flink', [ lcSlide({ t:L('Flink lifecycle: from job submission to committed output','Vòng đời Flink: từ gửi job đến output được commit'),
  lead:L('Time, state and checkpoints connect into one lifecycle.','Thời gian, state và checkpoint nối thành một vòng đời.'),
  steps:[[L('Submit the job','Gửi job'), L('The JobGraph becomes an ExecutionGraph.','JobGraph trở thành ExecutionGraph.'), 'Web UI: Job overview'],
         [L('Allocate slots','Cấp phát slot'), L('The ResourceManager provides slots on TaskManagers.','ResourceManager cấp slot trên các TaskManager.'), 'available task slots'],
         [L('Read and timestamp','Đọc và gán timestamp'), L('Sources read records and generate watermarks.','Source đọc record và sinh watermark.'), 'currentOutputWatermark'],
         [L('Process with state','Xử lý với state'), L('Operators update keyed state and fire windows.','Operator cập nhật keyed state và kích hoạt cửa sổ.'), 'state size, busyTimeMsPerSecond'],
         [L('Checkpoint','Checkpoint'), L('Barriers trigger asynchronous state snapshots.','Barrier kích hoạt snapshot state bất đồng bộ.'), 'lastCheckpointDuration'],
         [L('Commit the sink','Commit sink'), L('Transactional sinks commit when the checkpoint completes.','Sink giao dịch commit khi checkpoint hoàn tất.'), 'backPressuredTimeMsPerSecond']],
  n:L('Metric names come from the Flink metrics reference; confirm them for your version.','Tên metric lấy từ tài liệu metric của Flink; hãy xác nhận theo phiên bản của bạn.') }) ]);
addTo('Iceberg', [ lcSlide({ t:L('Iceberg lifecycle: a write and a read','Vòng đời Iceberg: một lần ghi và một lần đọc'),
  lead:L('Six steps from new data files to a reader seeing a consistent snapshot.','Sáu bước từ file dữ liệu mới đến lúc reader thấy một snapshot nhất quán.'),
  steps:[[L('Write data files','Ghi file dữ liệu'), L('The writer produces Parquet data files.','Writer tạo các file dữ liệu Parquet.'), 'table.files'],
         [L('Write manifests','Ghi manifest'), L('Manifest files list the new files with statistics.','File manifest liệt kê các file mới kèm thống kê.'), 'table.manifests'],
         [L('Write the manifest list','Ghi manifest list'), L('A new manifest list defines the snapshot.','Manifest list mới định nghĩa snapshot.'), 'table.snapshots'],
         [L('Write metadata','Ghi metadata'), L('A new metadata file records the snapshot.','File metadata mới ghi nhận snapshot.'), 'table.history'],
         [L('Swap the pointer','Đổi con trỏ'), L('The catalog atomically points to the new metadata; conflicts retry.','Catalog trỏ nguyên tử tới metadata mới; xung đột sẽ retry.'), 'commit conflict errors'],
         [L('Plan a read','Lập kế hoạch đọc'), L('A reader prunes manifests then files by statistics.','Reader loại manifest rồi file theo thống kê.'), 'files scanned vs total']],
  n:L('Reading this slide next to the Iceberg architecture diagram makes the tree of metadata concrete.','Đọc slide này cạnh sơ đồ kiến trúc Iceberg làm cây metadata trở nên cụ thể.') }) ]);
addTo('dbt', [ lcSlide({ t:L('dbt lifecycle: from project to artifacts','Vòng đời dbt: từ dự án đến artifact'),
  lead:L('What happens between typing dbt build and seeing a green run.','Chuyện gì xảy ra giữa lúc gõ dbt build và lúc thấy run xanh.'),
  steps:[[L('Parse','Parse'), L('Jinja and YAML are parsed into the manifest.','Jinja và YAML được parse thành manifest.'), 'target/manifest.json'],
         [L('Build the graph','Dựng đồ thị'), L('ref and source calls define dependencies.','Lời gọi ref và source định nghĩa phụ thuộc.'), 'dbt ls'],
         [L('Select nodes','Chọn node'), L('Selectors and state comparison choose what to run.','Selector và so sánh state chọn thứ cần chạy.'), '--select state:modified+'],
         [L('Compile','Compile'), L('Jinja is rendered into SQL for the adapter.','Jinja được render thành SQL cho adapter.'), 'target/compiled'],
         [L('Materialize and test','Materialize và test'), L('Models run in order with threads; tests run after each.','Model chạy theo thứ tự với các thread; test chạy sau mỗi model.'), 'dbt build logs'],
         [L('Write artifacts','Ghi artifact'), L('Results and catalog are written for CI and tools.','Kết quả và catalog được ghi cho CI và công cụ.'), 'target/run_results.json']],
  n:L('Point out that most debugging starts at the compiled SQL.','Chỉ ra rằng phần lớn việc debug bắt đầu từ SQL đã compile.') }) ]);
addTo('Kubernetes', [ lcSlide({ t:L('Kubernetes lifecycle: from kubectl apply to traffic','Vòng đời Kubernetes: từ kubectl apply đến lưu lượng'),
  lead:L('How a declared Deployment becomes a running, reachable pod.','Một Deployment đã khai báo trở thành pod chạy được và truy cập được như thế nào.'),
  steps:[[L('Submit the manifest','Gửi manifest'), L('kubectl sends the object to the API server.','kubectl gửi đối tượng tới API server.'), 'kubectl apply -f'],
         [L('Authenticate and admit','Xác thực và cho phép'), L('Authentication, RBAC and admission checks run.','Chạy xác thực, RBAC và kiểm tra admission.'), 'kubectl auth can-i'],
         [L('Persist the state','Lưu trạng thái'), L('The object is stored in etcd.','Đối tượng được lưu trong etcd.'), 'kubectl get deploy'],
         [L('Create pods','Tạo pod'), L('Controllers create a ReplicaSet and Pods.','Controller tạo ReplicaSet và Pod.'), 'kubectl get rs,pods'],
         [L('Schedule','Lập lịch'), L('The scheduler binds each pod to a node using requests.','Scheduler gán mỗi pod vào một node dựa trên requests.'), 'kubectl describe pod (Events)'],
         [L('Run and probe','Chạy và probe'), L('The kubelet pulls the image, starts containers, runs probes; Services route traffic.','Kubelet kéo image, khởi động container, chạy probe; Service điều hướng lưu lượng.'), 'kubectl logs --previous']],
  n:L('Pending pods point to step 5, CrashLoopBackOff to step 6.','Pod Pending trỏ tới bước 5, CrashLoopBackOff trỏ tới bước 6.') }) ]);

/* ================= Debugging command reference + decision matrices ================= */
PRACTICE.push({ name:L('Debugging command reference','Tham chiếu lệnh debug'), color:'#B91C1C', slides:[
 { k:'table', t:L('Diagnostic focus, commands and signals per technology','Trọng tâm chẩn đoán, lệnh và tín hiệu theo công nghệ'),
   lead:L('Start from the signal, then drill into the technology. Command and metric names vary by version, so confirm them in the documentation.','Bắt đầu từ tín hiệu, rồi đào sâu vào công nghệ. Tên lệnh và metric thay đổi theo phiên bản, hãy xác nhận trong tài liệu.'),
   head:[L('Technology','Công nghệ'), L('Diagnostic focus','Trọng tâm chẩn đoán'), L('Commands and where to look','Lệnh và nơi cần nhìn'), L('Unhealthy signal','Tín hiệu không lành mạnh')], rows:[
   ['Kafka', L('Consumer lag, ISR, under-replicated partitions','Consumer lag, ISR, partition thiếu bản sao'), '`kafka-consumer-groups.sh --describe`, `kafka-topics.sh --describe --under-replicated-partitions`', L('Lag growing; ISR smaller than replicas','Lag tăng; ISR nhỏ hơn số replica')],
   ['Spark', L('Stage duration, shuffle spill, skew, executor OOM','Thời lượng stage, shuffle spill, lệch, executor OOM'), L('Spark UI Stages tab, `df.explain("formatted")`, executor logs','Tab Stages của Spark UI, `df.explain("formatted")`, log executor'), L('Max task far above median; spill; lost executors','Task lâu nhất vượt xa trung vị; spill; mất executor')],
   ['Flink', L('Checkpoint duration, backpressure, watermark delay','Thời lượng checkpoint, backpressure, độ trễ watermark'), L('Web UI checkpoints and backpressure views; metrics `lastCheckpointDuration`, `backPressuredTimeMsPerSecond`, `currentOutputWatermark`','Màn checkpoint và backpressure trong Web UI; metric `lastCheckpointDuration`, `backPressuredTimeMsPerSecond`, `currentOutputWatermark`'), L('Checkpoints timing out; watermark not advancing','Checkpoint timeout; watermark không tiến')],
   ['Airflow', L('Scheduler delay, task state, queue time','Độ trễ scheduler, trạng thái task, thời gian chờ hàng đợi'), '`airflow dags list-import-errors`, `airflow tasks states-for-dag-run`, scheduler logs', L('Tasks stuck in queued; import errors; slow parsing','Task kẹt ở queued; lỗi import; parse chậm')],
   ['dbt', L('Compiled SQL, lineage, test failures','SQL đã compile, lineage, test thất bại'), '`dbt compile`, `dbt ls --select`, `dbt debug`, `target/run_results.json`', L('Surprising SQL; slow model; failing tests','SQL bất ngờ; model chậm; test thất bại')],
   ['Iceberg', L('Snapshot growth, manifest count, small files','Tăng trưởng snapshot, số manifest, file nhỏ'), L('`table.snapshots`, `table.files`, `table.manifests`, maintenance procedures','`table.snapshots`, `table.files`, `table.manifests`, thủ tục bảo trì'), L('Thousands of tiny files; many manifests; slow planning','Hàng nghìn file nhỏ; nhiều manifest; planning chậm')],
   ['Kubernetes', L('Pod events, requests and limits, probes, scheduling','Sự kiện pod, requests và limits, probe, lập lịch'), '`kubectl describe pod`, `kubectl get events --sort-by=.lastTimestamp`, `kubectl logs --previous`, `kubectl top pod`', L('Pending; CrashLoopBackOff; OOMKilled; failing probes','Pending; CrashLoopBackOff; OOMKilled; probe thất bại')]
  ], cap:L('Pair this table with the incident format: signal, evidence, diagnosis, fix, prevention.','Kết hợp bảng này với định dạng sự cố: tín hiệu, bằng chứng, chẩn đoán, cách sửa, phòng ngừa.'),
   n:L('This is a quick reference, not a substitute for the technology’s own monitoring guide.','Đây là tham chiếu nhanh, không thay thế hướng dẫn giám sát của chính công nghệ đó.') }
]});

PRACTICE.push({ name:L('System design decision matrices','Ma trận quyết định thiết kế hệ thống'), color:'#0369A1', slides:[
 { k:'table', t:L('Decision matrix: five common design choices','Ma trận quyết định: năm lựa chọn thiết kế phổ biến'),
   lead:L('No option is universally better. Each choice depends on constraints, and each has a cost to reverse.','Không lựa chọn nào tốt hơn ở mọi nơi. Mỗi lựa chọn phụ thuộc ràng buộc, và mỗi cái đều có chi phí để đảo ngược.'),
   head:[L('Decision','Quyết định'), L('Choose A when','Chọn A khi'), L('Choose B when','Chọn B khi'), L('Migration implications','Hệ quả khi di chuyển')], rows:[
   [L('Batch (A: Airflow + warehouse) versus streaming (B: Kafka + Flink)','Batch (A: Airflow + warehouse) so với streaming (B: Kafka + Flink)'), L('Minutes to hours of latency is acceptable; a small team; simpler operations','Chấp nhận độ trễ từ vài phút đến vài giờ; đội nhỏ; vận hành đơn giản'), L('Seconds of latency pay for themselves; the team can run stateful streaming','Độ trễ vài giây đáng giá; đội vận hành được streaming có state'), L('Moving to streaming needs event design, replay and reconciliation; the reverse loses freshness','Chuyển sang streaming cần thiết kế sự kiện, replay và đối soát; chiều ngược lại mất độ mới')],
   [L('Lakehouse format (A: Iceberg, B: Delta Lake)','Định dạng lakehouse (A: Iceberg, B: Delta Lake)'), L('Many engines must read the same tables; avoiding lock-in matters','Nhiều engine phải đọc cùng bảng; tránh khóa chặt vào nhà cung cấp là quan trọng'), L('You are centered on Databricks and its ecosystem','Bạn xoay quanh Databricks và hệ sinh thái của nó'), L('Interoperability layers exist, but tables and catalogs usually need rewrites and testing','Có lớp tương thích, nhưng bảng và catalog thường cần viết lại và test')],
   [L('Orchestration (A: Airflow, B: Dagster)','Điều phối (A: Airflow, B: Dagster)'), L('Large existing estate, wide integrations, task-centric workflows','Hệ thống hiện có lớn, nhiều tích hợp, workflow xoay quanh task'), L('Asset lineage, freshness and local developer experience are priorities','Lineage theo asset, độ mới và trải nghiệm phát triển cục bộ là ưu tiên'), L('Run both in parallel; migrate pipeline by pipeline; map tasks to assets','Chạy song song; di chuyển từng pipeline; ánh xạ task sang asset')],
   [L('Processing (A: Spark, B: Flink)','Xử lý (A: Spark, B: Flink)'), L('Large batch, ML and SQL workloads; micro-batch streaming is enough','Batch lớn, workload ML và SQL; micro-batch streaming là đủ'), L('Low-latency, event-time, stateful streaming is the core need','Nhu cầu cốt lõi là streaming độ trễ thấp, event-time, có state'), L('Different state, time and API models; plan for rewrites, not a lift and shift','Mô hình state, thời gian và API khác nhau; hãy tính viết lại, không phải chép nguyên')],
   [L('Transformation (A: dbt, B: SQLMesh)','Biến đổi (A: dbt, B: SQLMesh)'), L('Broad ecosystem, team familiarity, hiring pool','Hệ sinh thái rộng, đội đã quen, dễ tuyển người'), L('Virtual environments and plan-based deployment are priorities','Môi trường ảo và triển khai dựa trên plan là ưu tiên'), L('SQL models port easily; macros, tests and CI usually need rework','Model SQL chuyển dễ; macro, test và CI thường cần làm lại')]
  ], cap:L('Add a measured proof of concept to any decision that would be expensive to reverse.','Hãy thêm proof of concept có đo đạc cho mọi quyết định tốn kém nếu phải đảo ngược.'),
   n:L('These rows are starting points for a conversation, not verdicts.','Các hàng này là điểm khởi đầu cho cuộc thảo luận, không phải phán quyết.') },

 { k:'table', t:L('Worked decision: batch or streaming for order analytics','Quyết định minh họa: batch hay streaming cho analytics đơn hàng'),
   head:[L('Element','Yếu tố'), L('Content','Nội dung')], rows:[
   [L('Scenario','Kịch bản'), L('An e-commerce company wants live order dashboards and fraud alerts; finance needs exact daily totals.','Một công ty thương mại điện tử muốn dashboard đơn hàng trực tiếp và cảnh báo gian lận; tài chính cần tổng ngày chính xác.')],
   [L('Constraints','Ràng buộc'), L('Four engineers, no streaming experience, one Kafka cluster already used by the application team, budget for managed services.','Bốn kỹ sư, chưa có kinh nghiệm streaming, đã có một cluster Kafka do đội ứng dụng dùng, có ngân sách cho dịch vụ managed.')],
   [L('Recommendation','Khuyến nghị'), L('Hybrid: keep batch for finance totals; add a small streaming path only for fraud alerts and the live dashboard, using managed services where possible.','Kết hợp: giữ batch cho tổng tài chính; thêm một đường streaming nhỏ chỉ cho cảnh báo gian lận và dashboard trực tiếp, dùng dịch vụ managed khi có thể.')],
   [L('Disadvantages','Nhược điểm'), L('Two paths to keep consistent; the team must learn state, watermarks and replay; higher on-call load.','Hai đường phải giữ nhất quán; đội phải học state, watermark và replay; gánh nặng on-call cao hơn.')],
   [L('Migration implications','Hệ quả khi di chuyển'), L('Start with a reconciliation job comparing both paths. Retire the streaming path if the business value does not justify the cost.','Bắt đầu bằng job đối soát so sánh hai đường. Bỏ đường streaming nếu giá trị nghiệp vụ không biện minh được chi phí.')],
   [L('How to review it','Cách review'), L('Ask what happens when the stream is wrong for an hour, who is paged, and how the two totals are reconciled.','Hỏi chuyện gì xảy ra khi luồng sai một giờ, ai bị gọi và hai tổng được đối soát thế nào.')]
  ], cap:L('Notice that the recommendation names its costs. A decision without stated disadvantages is not finished.','Hãy chú ý khuyến nghị nêu rõ chi phí của nó. Quyết định không nêu nhược điểm là chưa xong.'),
   n:L('Use this format for every design review: scenario, constraints, recommendation, disadvantages, migration, review questions.','Dùng định dạng này cho mọi buổi review thiết kế: kịch bản, ràng buộc, khuyến nghị, nhược điểm, di chuyển, câu hỏi review.') }
]});

/* ================= Kafka L1-L5 and official sources ================= */
groupNamed(PRACTICE, 'Competency levels L1 to L5').slides.push(
 { k:'table', t:L('Kafka progression with measurable acceptance criteria','Lộ trình Kafka với tiêu chí nghiệm thu đo được'),
   head:[L('Level','Mức'), L('Outcome','Kết quả'), L('Acceptance criteria','Tiêu chí nghiệm thu')], rows:[
   [L('L1 Understand','L1 Hiểu'), L('Explain partitions, replication, consumer groups and offsets','Giải thích partition, replication, consumer group và offset'), L('Draws the producer-to-consumer path correctly and explains what `acks=all` and offsets guarantee, unaided','Vẽ đúng đường đi từ producer đến consumer và giải thích `acks=all` cùng offset bảo đảm gì, không cần tài liệu')],
   [L('L2 Implement','L2 Triển khai'), L('Build a producer and consumer with schema validation','Xây producer và consumer có kiểm tra schema'), L('Runs 1 million records with no loss, rejects a record that violates the schema, and ships with tests','Chạy 1 triệu record không mất, từ chối record vi phạm schema và có kèm test')],
   [L('L3 Troubleshoot','L3 Xử lý sự cố'), L('Investigate lag, rebalances and failed processing','Điều tra lag, rebalance và xử lý lỗi'), L('Given an injected lag problem, names the cause from metrics and logs alone; kills a broker and shows no acknowledged data was lost','Với sự cố lag được chèn sẵn, nêu đúng nguyên nhân chỉ từ metric và log; tắt một broker và chứng minh không mất dữ liệu đã xác nhận')],
   [L('L4 Optimize','L4 Tối ưu'), L('Benchmark throughput, latency and resources','Benchmark throughput, độ trễ và tài nguyên'), L('Documents a baseline, changes one setting at a time, and shows a reproducible improvement with the method and hardware stated','Ghi lại baseline, mỗi lần đổi một cấu hình, và cho thấy cải thiện tái lập được kèm phương pháp và phần cứng')],
   [L('L5 Architect','L5 Kiến trúc'), L('Design a fault-tolerant streaming platform','Thiết kế nền tảng streaming chịu lỗi'), L('Presents a design with partitioning, replication, security and capacity decisions, and defends the trade-offs in review','Trình bày thiết kế gồm quyết định partition, replication, bảo mật và năng lực, và bảo vệ các đánh đổi trong buổi review')]
  ], cap:L('Replace “knows Kafka” with a list of demonstrated outcomes like these.','Thay “biết Kafka” bằng danh sách kết quả đã chứng minh như thế này.'),
   n:L('Use the same pattern for every technology: one measurable acceptance criterion per level.','Dùng cùng mẫu cho mọi công nghệ: mỗi mức một tiêu chí nghiệm thu đo được.') }
);

groupNamed(PRACTICE, 'Version and source governance').slides.push(
 { k:'html', t:L('Official documentation links and evidence levels','Liên kết tài liệu chính thức và mức bằng chứng'),
   lead:L('Every claim in this deck falls into one of four evidence levels. Use the links below to confirm anything before relying on it.','Mọi tuyên bố trong deck này thuộc một trong bốn mức bằng chứng. Dùng các liên kết bên dưới để xác nhận trước khi dựa vào.'),
   html:function(){
     var ev = [
      [L('Official','Chính thức'), L('Stated in the technology’s documentation.','Được nêu trong tài liệu của công nghệ.')],
      [L('Lab-verified','Đã kiểm chứng bằng lab'), L('Reproduced in a practical lab. No content in this revision carries this level yet.','Đã tái hiện trong một lab thực hành. Chưa nội dung nào trong bản này đạt mức này.')],
      [L('Conceptual','Khái niệm'), L('A simplified explanation of how something works.','Giải thích đơn giản hóa về cách một thứ hoạt động.')],
      [L('Illustrative','Minh họa'), L('Sample code and configuration. Not executed in this revision; adapt and test before use.','Code và cấu hình mẫu. Chưa được chạy trong bản này; hãy điều chỉnh và test trước khi dùng.')]
     ];
     var links = [
      ['Apache Kafka','https://kafka.apache.org/documentation/'],['Debezium','https://debezium.io/documentation/'],['Apache Spark','https://spark.apache.org/docs/latest/'],
      ['Apache Flink','https://nightlies.apache.org/flink/flink-docs-stable/'],['Apache Iceberg','https://iceberg.apache.org/docs/latest/'],['Apache Polaris','https://polaris.apache.org/'],
      ['Trino','https://trino.io/docs/current/'],['Apache Airflow','https://airflow.apache.org/docs/'],['dbt','https://docs.getdbt.com/'],['Dagster','https://docs.dagster.io/'],
      ['Snowflake','https://docs.snowflake.com/'],['BigQuery','https://cloud.google.com/bigquery/docs'],['Databricks','https://docs.databricks.com/'],['DuckDB','https://duckdb.org/docs/'],
      ['PostgreSQL','https://www.postgresql.org/docs/'],['Kubernetes','https://kubernetes.io/docs/'],['Terraform','https://developer.hashicorp.com/terraform/docs'],
      ['AWS','https://docs.aws.amazon.com/'],['Azure','https://learn.microsoft.com/azure/'],['Microsoft Fabric','https://learn.microsoft.com/fabric/'],
      ['Model Context Protocol','https://modelcontextprotocol.io/'],['Claude API','https://docs.claude.com/'],['PyTorch','https://pytorch.org/docs/stable/'],['scikit-learn','https://scikit-learn.org/stable/'],
      ['OpenLineage','https://openlineage.io/docs/'],['Great Expectations','https://docs.greatexpectations.io/'],['Soda','https://docs.soda.io/']
     ];
     return '<div class="grid c2" style="margin-bottom:14px">' + ev.map(function(x){ return cardHTML({h:x[0], p:x[1]}, true); }).join('') + '</div>' +
       '<p class="refs" style="line-height:2">' + links.map(function(l){ return '<a href="' + l[1] + '" target="_blank" rel="noopener noreferrer">' + esc(l[0]) + '</a>'; }).join('') + '</p>';
   },
   n:L('Links point to official documentation home pages. Check the version selector on each site, since the page you land on may describe a different release than the one you run.','Các liên kết trỏ tới trang chủ tài liệu chính thức. Hãy kiểm tra bộ chọn phiên bản trên mỗi trang, vì trang bạn vào có thể mô tả bản phát hành khác với bản bạn chạy.') }
);
