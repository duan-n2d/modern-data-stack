"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function fabricSVG(){
  var s = '<rect class="bx2" x="10" y="20" width="980" height="44" rx="8"/>' + txt(500, 48, L('Capacity (F SKU): one shared compute budget, measured in capacity units, for every workload','Capacity (F SKU): một ngân sách compute dùng chung, đo bằng capacity unit, cho mọi workload'), 'b', 'middle');
  var w = [['Data Factory', L('pipelines|Dataflows Gen2','pipeline|Dataflows Gen2')], ['Data Engineering', L('Lakehouse|Spark notebooks','Lakehouse|Spark notebook')], ['Data Warehouse', L('T-SQL|Delta tables','T-SQL|bảng Delta')], ['Real-Time', 'Intelligence|Eventstream, Eventhouse'], ['Data Science', L('notebooks, ML|experiments','notebook, thử nghiệm|ML')], ['Power BI', L('semantic models|Direct Lake','semantic model|Direct Lake')]];
  w.forEach(function(x, i){ s += bx(10 + i * 163, 90, 152, 120, x[0], x[1], '#0078D4'); s += arrow(86 + i * 163, 212, 86 + i * 163, 250); });
  s += '<rect class="bx" x="10" y="252" width="980" height="66" rx="8"/><rect x="10" y="252" width="980" height="7" rx="3" fill="#0078D4"/>';
  s += txt(500, 282, L('OneLake: one logical lake per tenant, Delta Parquet files, shortcuts and mirroring','OneLake: một lake logic cho mỗi tenant, file Delta Parquet, shortcut và mirroring'), 'b', 'middle');
  s += txt(500, 302, L('every engine above reads and writes the same files','mọi engine ở trên đọc và ghi cùng các file'), 'sm', 'middle');
  s += '<rect class="bx2" x="10" y="340" width="980" height="44" rx="8"/>' + txt(500, 368, L('Workspaces, roles, sensitivity labels and Purview govern items across workloads','Workspace, vai trò, sensitivity label và Purview quản trị các item trên mọi workload'), 'b', 'middle');
  return svg(1000, 400, s, L('Microsoft Fabric architecture: capacity, six workloads, OneLake, governance','Kiến trúc Microsoft Fabric: capacity, sáu workload, OneLake, quản trị'));
}
