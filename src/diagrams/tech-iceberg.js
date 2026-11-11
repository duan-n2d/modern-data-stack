"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function icebergSVG(){
  var s = '<rect class="bx2" x="10" y="20" width="980" height="44" rx="8"/>' + txt(500, 48, L('Engines: Spark, Flink, Trino, Snowflake, DuckDB and others read and write the same table','Engine: Spark, Flink, Trino, Snowflake, DuckDB và các engine khác đọc và ghi cùng một bảng'), 'b', 'middle');
  s += bx(10, 130, 150, 100, 'Catalog', 'Glue, REST, Hive,|Nessie, JDBC', '#7C3AED');
  s += bx(210, 130, 160, 100, L('Metadata file','File metadata'), L('schema, partition spec,|list of snapshots','schema, partition spec,|danh sách snapshot'), '#7C3AED');
  s += bx(420, 130, 160, 100, 'Manifest list', L('one per snapshot|partition summaries','một cho mỗi snapshot|tóm tắt partition'), '#7C3AED');
  s += bx(630, 90, 170, 80, 'Manifest A', L('file paths, column stats','đường dẫn file, thống kê cột'), '#7C3AED');
  s += bx(630, 200, 170, 80, 'Manifest B', L('file paths, column stats','đường dẫn file, thống kê cột'), '#7C3AED');
  s += bx(850, 90, 140, 80, L('Data files','File dữ liệu'), 'Parquet, ORC, Avro', '#475569');
  s += bx(850, 200, 140, 80, L('Delete files','File delete'), L('row-level deletes','xóa mức dòng'), '#475569');
  s += arrow(162, 180, 208, 180) + arrow(372, 180, 418, 180) + arrow(582, 165, 628, 130) + arrow(582, 195, 628, 240) + arrow(802, 130, 848, 130) + arrow(802, 240, 848, 240);
  s += txt(10, 112, L('pointer to current','con trỏ tới bản hiện tại'), 'sm') + txt(10, 126, 'metadata', 'sm');
  s += '<rect class="bx" x="10" y="310" width="980" height="86" rx="8"/>' + txt(26, 334, 'Commit', 'b');
  s += txt(26, 354, L('1  write new data files    2  write new manifests and manifest list    3  write new metadata file','1  ghi data file mới    2  ghi manifest mới và manifest list    3  ghi file metadata mới'), 'sm');
  s += txt(26, 374, L('4  atomically swap the catalog pointer (optimistic concurrency: if another writer won, validate and retry)','4  hoán đổi con trỏ catalog nguyên tử (optimistic concurrency: nếu writer khác thắng, validate và thử lại)'), 'sm');
  return svg(1000, 410, s, L('Iceberg architecture: catalog, metadata file, manifest list, manifests, data and delete files','Kiến trúc Iceberg: catalog, file metadata, manifest list, manifest, data file và delete file'));
}
