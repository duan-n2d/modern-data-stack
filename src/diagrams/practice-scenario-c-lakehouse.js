"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

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
  return svg(1000, 334, s, L('Scenario C: lakehouse platform','Kịch bản C: nền tảng lakehouse'));
}
