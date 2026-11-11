"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function bqSVG(){
  var s = bx(10, 150, 120, 90, 'Client', 'console, API, BI', '#0284C7');
  s += bx(170, 150, 180, 90, 'Job service', L('parse, plan, prune|reservation lookup','parse, plan, prune|tra cứu reservation'), '#0284C7');
  s += bx(400, 30, 210, 110, L('Dremel execution','Thực thi Dremel'), L('tree of stages|workers use slots|scales dynamically','cây các stage|worker dùng slot|scale động'), '#0284C7');
  s += bx(400, 190, 210, 110, L('Shuffle tier','Tầng shuffle'), L('in-memory, distributed|moves data between stages','in-memory, phân tán|chuyển dữ liệu giữa các stage'), '#0284C7');
  s += bx(670, 100, 230, 150, L('Colossus storage','Lưu trữ Colossus'), L('Capacitor columnar files|tables, partitions,|clustering metadata','file columnar Capacitor|bảng, partition,|metadata clustering'), '#7C3AED');
  s += '<rect class="bx2" x="10" y="330" width="980" height="52" rx="8"/>' + txt(26, 354, L('Borg schedules workers; a high-bandwidth network connects compute and storage, so they scale independently','Borg lập lịch worker; mạng băng thông cao nối compute và storage, nên scale độc lập'), 'sm');
  s += arrow(132, 195, 168, 195) + arrow(352, 180, 398, 100) + arrow(352, 210, 398, 240) + arrow(612, 85, 668, 150) + arrow(612, 245, 668, 200) + '<path class="ln" d="M505 142L505 188" marker-end="url(#arr)"/>';
  return svg(1000, 396, s, L('BigQuery architecture: job service, Dremel execution with slots, shuffle tier, Colossus storage','Kiến trúc BigQuery: job service, thực thi Dremel với slot, tầng shuffle, lưu trữ Colossus'));
}
