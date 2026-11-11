"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function airflowSVG(){
  var s = bx(10, 30, 150, 80, L('DAG files','File DAG'), L('Python, synced from Git','Python, đồng bộ từ Git'), '#16A34A');
  s += bx(210, 30, 170, 80, 'DAG processor', L('parses files|serializes DAGs','parse file|serialize DAG'), '#16A34A');
  s += bx(430, 30, 170, 100, 'Metadata database', L('Postgres or MySQL|runs, tasks, state','Postgres hoặc MySQL|run, task, state'), '#475569');
  s += bx(210, 170, 170, 100, 'Scheduler', L('creates DAG runs|checks dependencies|queues ready tasks','tạo DAG run|kiểm tra dependency|xếp hàng task sẵn sàng'), '#16A34A');
  s += bx(430, 170, 170, 100, 'Triggerer', L('async triggers for|deferrable operators','async trigger cho|deferrable operator'), '#16A34A');
  s += bx(210, 310, 170, 70, 'Executor', 'Local, Celery, Kubernetes', '#16A34A');
  s += bx(430, 310, 170, 70, 'Workers', L('run task code','chạy code task'), '#16A34A');
  s += bx(700, 30, 220, 100, L('API server and UI','API server và UI'), L('REST API, web UI|task execution API (v3)','REST API, web UI|API thực thi task (v3)'), '#16A34A');
  s += bx(700, 310, 220, 70, L('External systems','Hệ thống bên ngoài'), L('warehouse, S3, dbt, Spark, APIs','warehouse, S3, dbt, Spark, API'), '#7A869F');
  s += arrow(162, 70, 208, 70) + arrow(382, 70, 428, 70) + arrow(382, 195, 450, 132) + arrow(515, 168, 515, 132);
  s += arrow(295, 272, 295, 308) + arrow(382, 345, 428, 345) + arrow(602, 345, 698, 345) + arrow(698, 80, 602, 80);
  return svg(960, 394, s, L('Airflow architecture: DAG files, processor, scheduler, metadata database, executor, workers, triggerer, API server','Kiến trúc Airflow: file DAG, processor, scheduler, metadata database, executor, worker, triggerer, API server'));
}
