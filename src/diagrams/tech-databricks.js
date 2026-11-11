"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function dbxSVG(){
  var s = bx(10, 20, 980, 110, L('Control plane (managed by Databricks)','Control plane (do Databricks quản lý)'), L('workspace and notebooks UI  ·  jobs and workflows scheduler  ·  cluster manager  ·  Unity Catalog service','workspace và notebook UI  ·  scheduler job và workflow  ·  cluster manager  ·  dịch vụ Unity Catalog'), '#EA580C', 'bx2');
  s += bx(10, 170, 980, 230, L('Compute plane: your cloud account (classic) or Databricks account (serverless)','Compute plane: tài khoản cloud của bạn (classic) hoặc tài khoản Databricks (serverless)'), '', '#475569', 'bx2');
  s += bx(30, 220, 290, 100, L('Clusters','Cluster'), L('Spark, Photon|job and all-purpose','Spark, Photon|job và all-purpose'), '#EA580C');
  s += bx(345, 220, 290, 100, L('SQL warehouses','SQL warehouse'), L('BI and ad hoc SQL|classic, pro, serverless','BI và SQL ad hoc|classic, pro, serverless'), '#EA580C');
  s += bx(660, 220, 310, 100, L('Delta tables on object storage','Bảng Delta trên object storage'), L('Parquet files + _delta_log|S3, ADLS or GCS','File Parquet + _delta_log|S3, ADLS hoặc GCS'), '#7C3AED');
  s += txt(500, 360, L('Unity Catalog enforces permissions and lineage across all compute','Unity Catalog thực thi phân quyền và lineage trên mọi compute'), 'sm', 'middle');
  s += arrow(170, 132, 170, 218) + arrow(490, 132, 490, 218) + arrow(322, 270, 343, 270) + arrow(637, 270, 658, 270);
  return svg(1000, 416, s, L('Databricks architecture: control plane, compute plane, Delta tables on object storage','Kiến trúc Databricks: control plane, compute plane, bảng Delta trên object storage'));
}
