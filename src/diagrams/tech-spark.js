"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function sparkSVG(){
  var s = bx(10, 90, 210, 150, 'Driver', 'SparkSession|logical plan, Catalyst|DAG scheduler|task scheduler', '#EA580C');
  s += bx(300, 20, 200, 80, 'Cluster manager', 'YARN, Kubernetes, Standalone', '#475569');
  s += bx(600, 30, 190, 80, 'Executor 1', L('tasks, cache, shuffle files','task, cache, file shuffle'), '#EA580C');
  s += bx(600, 130, 190, 80, 'Executor 2', L('tasks, cache, shuffle files','task, cache, file shuffle'), '#EA580C');
  s += bx(600, 230, 190, 80, 'Executor 3', L('tasks, cache, shuffle files','task, cache, file shuffle'), '#EA580C');
  s += bx(840, 90, 150, 150, L('Storage','Lưu trữ'), 'S3, ADLS, HDFS|Parquet, Iceberg,|Delta', '#7C3AED');
  s += arrow(222, 120, 298, 70) + '<path class="ln dash" d="M502 70L598 70" marker-end="url(#arr)"/>' + arrow(222, 190, 598, 170) + txt(400, 168, L('tasks and results','task và kết quả'), 'sm', 'middle');
  s += arrow(792, 70, 838, 130) + arrow(792, 170, 838, 165) + arrow(792, 270, 838, 200);
  s += bx(10, 340, 300, 56, L('Action starts a job','Action khởi tạo một job'), '', '#EA580C') + bx(345, 340, 310, 56, L('Job splits into stages at shuffles','Job chia thành stage tại các shuffle'), '', '#EA580C') + bx(690, 340, 300, 56, L('Stage runs one task per partition','Stage chạy một task mỗi partition'), '', '#EA580C');
  s += arrow(312, 368, 343, 368) + arrow(657, 368, 688, 368);
  return svg(1000, 410, s, L('Spark architecture: driver, cluster manager, executors, storage, and job to stage to task hierarchy','Kiến trúc Spark: driver, cluster manager, executor, storage và phân cấp job, stage, task'));
}
