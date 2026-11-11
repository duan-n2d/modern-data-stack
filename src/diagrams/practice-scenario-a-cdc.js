"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

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
  return svg(1000, 350, s, L('Scenario A: CDC to lakehouse','Kịch bản A: CDC vào lakehouse'));
}
