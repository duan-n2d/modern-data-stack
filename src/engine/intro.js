"use strict";
/* The three opening slides: title, agenda and big picture. They are generated from the curriculum. */

function titleSlide(){
  var viz = META.map(function(m, i){
    return '<a href="#" data-sec="' + i + '" style="--c:' + m.color + '"><span>' + (i + 1) + '</span>' + esc(tx(m.name)) + '</a>';
  }).join('');
  return {
    k:'html', title:'Title', lead:null,
    n:X('Welcome. This deck is a roadmap, not a tool catalogue. For each of the 23 layers we cover what it does, which tools compete, how to decide between them, and what a senior engineer is expected to own. Use the stack on the right to jump anywhere. Press O for the overview grid, N for speaker notes, M for the contents panel, L to switch language.',
        'Chào mừng. Bộ slide này là lộ trình, không phải danh mục công cụ. Với mỗi lớp trong 23 lớp, ta xem nó làm gì, công cụ nào cạnh tranh, chọn thế nào và senior phải chịu trách nhiệm điều gì. Dùng cột bên phải để nhảy tới bất kỳ đâu. Phím O: lưới tổng quan, N: ghi chú, M: mục lục, L: đổi ngôn ngữ.'),
    html:'<div class="slide-in" style="height:100%"><div class="hero"><div>' +
      '<h1>' + X('Modern Data Engineering: From Foundations to Senior-Level Architecture', 'Modern Data Engineering: từ nền tảng đến kiến trúc cấp senior') + '</h1>' +
      '<p>' + X('A 23-layer roadmap from mid-level to senior, now including AI engineering and the machine-learning models behind it. For each layer: what it does, which tools compete, and the trade-offs you are expected to own.',
                'Lộ trình 23 lớp từ mid-level lên senior, nay có thêm kỹ thuật AI và các mô hình machine learning phía sau. Với mỗi lớp: nó làm gì, công cụ nào cạnh tranh và những đánh đổi bạn phải chịu trách nhiệm.') + '</p>' +
      '<div class="keys"><span><kbd>←</kbd> <kbd>→</kbd> ' + X('navigate', 'chuyển slide') + '</span><span><kbd>O</kbd> ' + X('overview', 'tổng quan') + '</span><span><kbd>G</kbd> ' + X('knowledge graph', 'đồ thị tri thức') + '</span><span><kbd>N</kbd> ' + X('notes', 'ghi chú') + '</span><span><kbd>M</kbd> ' + X('contents', 'mục lục') + '</span><span><kbd>L</kbd> EN / VI</span></div>' +
      '<p class="note" style="margin-top:14px">' + X('Written for data analysts, analytics engineers and data engineers with 2 to 5 years of experience who know basic SQL and want to reach senior level.', 'Dành cho data analyst, analytics engineer và data engineer có 2 đến 5 năm kinh nghiệm, đã biết SQL cơ bản và muốn lên cấp senior.') + '</p>' +
      '</div><div class="stackviz" aria-label="' + X('The 23 layers', '23 lớp') + '">' + viz + '</div></div></div>'
  };
}

function agendaSlide(){
  var paths = PATHS.map(function(path){
    var items = path.layers.map(function(i){
      return '<li><a href="#" data-sec="' + i + '">' + (i + 1) + '. ' + esc(tx(META[i].name)) + '</a></li>';
    }).join('');
    return '<section class="path" style="--c:' + META[path.layers[0]].color + '"><h3>' + esc(tx(path.name)) + '</h3><ol>' + items + '</ol></section>';
  }).join('');
  return {
    k:'html', t:L('A learning path through 23 layers','Lộ trình học qua 23 layer'),
    lead:L('Six paths move from foundations to production ownership. Layer numbers stay stable for cross-references; each topic links directly to its section.',
           'Sáu lộ trình đi từ nền tảng đến trách nhiệm vận hành production. Số layer được giữ ổn định để đối chiếu; từng chủ đề liên kết thẳng tới phần tương ứng.'),
    n:X('Use the paths in order for a complete course, or jump to the layer that matches a current project. Tool internals and reference architectures are in the appendix; scenarios, incidents and competency material follow the core layers.',
        'Đi theo thứ tự các lộ trình để học trọn bộ, hoặc nhảy đến layer gắn với dự án hiện tại. Nội bộ công cụ và kiến trúc tham chiếu nằm ở phụ lục; kịch bản, sự cố và năng lực nằm sau các layer chính.'),
    html:'<div class="path-map">' + paths + '</div>' +
      '<p class="note"><a href="#" data-sec="30">' + X('Appendix', 'Phụ lục') + '</a>: ' + X('after the layers, a deep dive into how 15 tools work inside (Kafka, Flink, Spark, Hadoop, Iceberg, Airflow, dbt, Snowflake, BigQuery, Databricks, AWS, Azure, Fabric, Kubernetes, Terraform): architecture, components and workflow.',
        'sau các lớp, phần đào sâu cách 15 công cụ hoạt động bên trong (Kafka, Flink, Spark, Hadoop, Iceberg, Airflow, dbt, Snowflake, BigQuery, Databricks, AWS, Azure, Fabric, Kubernetes, Terraform): kiến trúc, thành phần và quy trình.') + '</p>' +
      '<p class="note">' + X('Tags used throughout:', 'Nhãn dùng xuyên suốt:') + ' <span class="badge must">' + esc(tx('Must-know')) + '</span> <span class="badge nice">' + esc(tx('Nice-to-have')) + '</span> <span class="badge senior" style="--accent:#2563EB">' + esc(tx('Senior-level')) + '</span></p>'
  };
}

function bigPictureSlide(){
  var X0 = [10, 196, 382, 568, 754, 940], W = 150, Y = 62, H = 118;
  var boxes = [
    [L('Sources','Nguồn'), L('SaaS apps|databases|events, files','ứng dụng SaaS|database|sự kiện, file'), '#7A869F'],
    [L('Ingestion','Nạp dữ liệu'), L('ELT, CDC|streaming|(2)','ELT, CDC|streaming|(2)'), '#0891B2'],
    [L('Storage','Lưu trữ'), L('warehouse or|lakehouse|(3)','warehouse hoặc|lakehouse|(3)'), '#7C3AED'],
    [L('Transformation','Biến đổi'), L('dbt, SQL, Spark|tests, docs|(4)','dbt, SQL, Spark|test, tài liệu|(4)'), '#EA580C'],
    [L('Semantic layer','Semantic layer'), L('metrics and|dimensions|(6)','metric và|dimension|(6)'), '#DB2777'],
    [L('BI and activation','BI và activation'), L('dashboards, apps|reverse ETL, ML, AI|(7, 10, 13, 15)','dashboard, app|reverse ETL, ML, AI|(7, 10, 13, 15)'), '#B45309']
  ];
  var s = txt(10, 30, L('Data flows left to right','Dữ liệu chảy từ trái sang phải'), 'lg');
  boxes.forEach(function(b, i){ s += bx(X0[i], Y, W, H, b[0], b[1], b[2]); });
  for(var i = 0; i < 5; i++){ s += arrow(X0[i] + W + 2, Y + H / 2, X0[i + 1] - 3, Y + H / 2); }
  s += txt(10, 222, L('Cross-cutting concerns touch every stage','Các mối quan tâm xuyên suốt chạm mọi giai đoạn'), 'lg');
  var bars = [
    [L('Orchestration (5)','Điều phối (5)'), L('schedules, dependencies, retries, SLAs, backfills','lịch chạy, phụ thuộc, retry, SLA, backfill'), '#16A34A'],
    [L('Data quality and observability (8)','Chất lượng dữ liệu và observability (8)'), L('tests, freshness, volume, schema and distribution checks, data diff, incidents','test, freshness, volume, schema, phân phối, data diff, xử lý sự cố'), '#DC2626'],
    [L('Governance and catalog (9)','Quản trị và catalog (9)'), L('contracts, lineage, PII masking, RBAC, row-level security, ownership','contract, lineage, che PII, RBAC, row-level security, quyền sở hữu'), '#0F766E'],
    [L('DevOps and engineering practices (11, 17 to 19)','DevOps và thực hành kỹ thuật (11, 17 đến 19)'), L('Git, CI/CD, IaC, environments, security, reliability, FinOps','Git, CI/CD, IaC, môi trường, bảo mật, độ tin cậy, FinOps'), '#475569']
  ];
  bars.forEach(function(b, i){
    var y = 236 + i * 52;
    s += '<rect class="bx" x="10" y="' + y + '" width="1080" height="44" rx="8"/><rect x="10" y="' + y + '" width="9" height="44" rx="4" fill="' + b[2] + '"/>';
    s += txt(32, y + 19, b[0], 'b') + txt(32, y + 35, b[1], 'sm');
  });
  s += txt(10, 468, L('Skills that apply at every stage','Kỹ năng áp dụng ở mọi giai đoạn'), 'lg');
  var f = [[L('Core languages (1)','Ngôn ngữ nền tảng (1)'), '#2563EB'], [L('Modeling and design (12)','Mô hình hóa (12)'), '#4D7C0F'], [L('Analytics, AI and ML (13, 15, 16)','Analytics, AI và ML (13, 15, 16)'), '#C026D3'], [L('Senior soft skills (14)','Kỹ năng mềm senior (14)'), '#0369A1']];
  f.forEach(function(b, i){
    var x = 10 + i * 275;
    s += '<rect class="bx2" x="' + x + '" y="480" width="260" height="34" rx="8"/><rect x="' + x + '" y="480" width="8" height="34" rx="4" fill="' + b[1] + '"/>' + txt(x + 22, 502, b[0], 'b');
  });
  return {
    k:'svg', t:L('Big picture: one pipeline, four cross-cutting concerns','Bức tranh tổng thể: một pipeline, bốn mối quan tâm xuyên suốt'),
    lead:L('Numbers in brackets point to the section that covers each layer. A senior engineer is accountable for the whole picture, not just one box.','Số trong ngoặc trỏ tới phần nói về từng lớp. Senior chịu trách nhiệm toàn bộ bức tranh, không chỉ một ô.'),
    svg: svg(1100, 524, s, L('Architecture: sources to ingestion to storage to transformation to semantic layer to BI and activation, with orchestration, quality, governance and DevOps across all stages','Kiến trúc: nguồn, ingestion, lưu trữ, transformation, semantic layer, BI và activation, với orchestration, chất lượng, quản trị và DevOps xuyên suốt mọi giai đoạn')),
    cap:L('Reading tip: when something breaks, locate the stage first, then ask which cross-cutting concern should have caught it.','Mẹo đọc: khi có sự cố, xác định giai đoạn trước, rồi hỏi mối quan tâm xuyên suốt nào lẽ ra phải bắt được nó.'),
    n:X('Walk the flow left to right: sources are systems you do not own; ingestion lands raw data; storage holds it; transformation turns it into trustworthy models; the semantic layer fixes metric definitions; BI and activation put it in front of people and tools. Then point at the bars: orchestration, quality, governance and DevOps are not stages, they are properties of the whole system.',
        'Đi từ trái sang phải: nguồn là hệ thống bạn không sở hữu; ingestion đưa dữ liệu thô vào; storage lưu giữ; transformation biến thành model đáng tin; semantic layer cố định định nghĩa metric; BI và activation đưa tới người dùng và công cụ. Sau đó chỉ vào các thanh ngang: điều phối, chất lượng, quản trị, DevOps không phải giai đoạn mà là thuộc tính của cả hệ thống.')
  };
}
