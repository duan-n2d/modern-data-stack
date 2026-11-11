"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

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
  return svg(1000, 322, s, L('Scenario B: batch analytics','Kịch bản B: phân tích batch'));
}
