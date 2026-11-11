"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function dbtSVG(){
  var s = bx(10, 30, 180, 120, L('Project','Dự án'), 'models, tests, macros|seeds, snapshots|sources.yml', '#EA580C');
  s += bx(230, 30, 150, 120, 'Parse', L('Jinja and YAML|manifest.json|(nodes, refs)','Jinja và YAML|manifest.json|(nodes, refs)'), '#EA580C');
  s += bx(420, 30, 150, 120, 'Compile', L('Jinja rendered to|plain SQL for|the adapter','Jinja được render thành|SQL thuần cho|adapter'), '#EA580C');
  s += bx(610, 30, 170, 120, 'Execute', L('topological order|N threads|materialize, then test','thứ tự topo|N thread|materialize, rồi test'), '#EA580C');
  s += bx(820, 30, 170, 120, 'Warehouse', L('runs the SQL|dbt stores no data','chạy SQL|dbt không lưu dữ liệu'), '#7C3AED');
  s += arrow(192, 90, 228, 90) + arrow(382, 90, 418, 90) + arrow(572, 90, 608, 90) + arrow(782, 90, 818, 90);
  s += '<rect class="bx2" x="10" y="190" width="980" height="70" rx="8"/>' + txt(26, 214, L('target/ artifacts','artifact trong target/'), 'b') + txt(26, 234, L('manifest.json, run_results.json, catalog.json, compiled SQL: used for docs, Slim CI state comparison and observability tools','manifest.json, run_results.json, catalog.json, SQL đã compile: dùng cho docs, so sánh state Slim CI và công cụ observability'), 'sm');
  s += '<rect class="bx2" x="10" y="280" width="980" height="56" rx="8"/>' + txt(26, 304, L('Materializations','Materialization'), 'b') + txt(26, 322, L('view, table, incremental, ephemeral, snapshot, materialized view (adapter dependent)','view, table, incremental, ephemeral, snapshot, materialized view (tùy adapter)'), 'sm');
  return svg(1000, 350, s, L('dbt architecture: project, parse, compile, execute against the warehouse, and artifacts','Kiến trúc dbt: project, parse, compile, execute trên warehouse và artifact'));
}
