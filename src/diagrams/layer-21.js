"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function lifecycleDESVG(){
  var s = flowRow([
    [L('Generation','Sinh dữ liệu'), L('apps, databases,|IoT, SaaS','ứng dụng, database,|IoT, SaaS'), '#7A869F'],
    [L('Storage','Lưu trữ'), L('warehouse, lake,|lakehouse','warehouse, lake,|lakehouse'), '#7C3AED'],
    [L('Ingestion','Nạp dữ liệu'), L('batch, CDC,|streaming','batch, CDC,|streaming'), '#0891B2'],
    [L('Transformation','Biến đổi'), L('clean, model,|aggregate','làm sạch, mô hình,|tổng hợp'), '#EA580C'],
    [L('Serving','Phục vụ'), L('BI, ML, APIs,|reverse ETL','BI, ML, API,|reverse ETL'), '#B45309']
  ], 20, 100, 10, 990, 30);
  s += txt(10, 150, L('Layers: generation (sources) · storage 3 · ingestion 2 · transformation 4 · serving 7, 10, 15','Layer: sinh dữ liệu (nguồn) · lưu trữ 3 · nạp 2 · biến đổi 4 · phục vụ 7, 10, 15'), 'sm');
  s += txt(10, 184, L('Undercurrents: they cut across every stage','Dòng chảy ngầm: cắt ngang mọi giai đoạn'), 'lg');
  var u = [[L('Security','Bảo mật'), L('layer 17','layer 17'), '#B91C1C'], [L('Data management','Quản trị dữ liệu'), L('layers 6, 8, 9, 12','layer 6, 8, 9, 12'), '#0F766E'], [L('DataOps','DataOps'), L('layers 8, 11','layer 8, 11'), '#475569'],
           [L('Data architecture','Kiến trúc dữ liệu'), L('layers 3, 12, 18','layer 3, 12, 18'), '#7C3AED'], [L('Orchestration','Điều phối'), L('layer 5','layer 5'), '#16A34A'], [L('Software engineering','Kỹ nghệ phần mềm'), L('layers 1, 11, 20','layer 1, 11, 20'), '#2563EB']];
  u.forEach(function(x, i){
    var col = i % 3, row = Math.floor(i / 3), w = 316, xx = 10 + col * (w + 16), yy = 200 + row * 60;
    s += '<rect class="bx" x="' + xx + '" y="' + yy + '" width="' + w + '" height="48" rx="8"/><rect x="' + xx + '" y="' + yy + '" width="8" height="48" rx="4" fill="' + x[2] + '"/>' + txt(xx + 22, yy + 21, x[0], 'b') + txt(xx + 22, yy + 38, x[1], 'sm');
  });
  return svg(1000, 330, s, L('Data engineering lifecycle','Vòng đời data engineering'));
}
