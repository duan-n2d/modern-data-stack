"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function flinkSVG(){
  var s = bx(10, 130, 130, 90, 'Client', L('submits JobGraph','gửi JobGraph'), '#0891B2');
  s += bx(190, 30, 330, 140, 'JobManager', L('Dispatcher, ResourceManager, JobMaster|schedules tasks, triggers checkpoints|restarts on failure','Dispatcher, ResourceManager, JobMaster|lập lịch task, kích hoạt checkpoint|khởi động lại khi lỗi'), '#0891B2');
  s += bx(190, 230, 155, 130, 'TaskManager 1', L('task slots|operator chains|state: heap or RocksDB','task slot|operator chain|state: heap hoặc RocksDB'), '#0891B2');
  s += bx(365, 230, 155, 130, 'TaskManager 2', L('task slots|operator chains|state: heap or RocksDB','task slot|operator chain|state: heap hoặc RocksDB'), '#0891B2');
  s += bx(560, 30, 120, 80, L('Sources','Nguồn'), L('Kafka, files, CDC','Kafka, file, CDC'), '#7A869F');
  s += bx(710, 30, 130, 80, L('Operators','Operator'), 'keyBy, window, join', '#0891B2');
  s += bx(870, 30, 120, 80, L('Sinks','Sink'), L('tables, topics, DBs','bảng, topic, DB'), '#7A869F');
  s += bx(560, 230, 430, 130, L('Checkpoint storage','Lưu trữ checkpoint'), L('barriers flow with the data, state and source offsets snapshot asynchronously|after failure: restore the last checkpoint and replay sources|S3, HDFS, GCS, Azure Blob','barrier chảy cùng dữ liệu, snapshot state và source offset bất đồng bộ|sau lỗi: khôi phục checkpoint gần nhất và replay source|S3, HDFS, GCS, Azure Blob'), '#475569');
  s += arrow(142, 175, 188, 120) + arrow(267, 172, 267, 228) + arrow(442, 172, 442, 228) + arrow(522, 295, 558, 295);
  s += arrow(682, 70, 708, 70) + arrow(842, 70, 868, 70) + '<path class="ln dash" d="M522 250L708 112" marker-end="url(#arr)"/>';
  return svg(1000, 376, s, L('Flink architecture: client, JobManager, TaskManagers with slots, dataflow from sources to sinks, checkpoint storage','Kiến trúc Flink: client, JobManager, TaskManager với slot, dataflow từ source đến sink, lưu trữ checkpoint'));
}
