"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function loopSVG(){
  var s = bx(10, 120, 140, 90, L('User goal','Mục tiêu'), L('+ system prompt|+ tools list','+ system prompt|+ danh sách tool'), '#9333EA');
  s += bx(200, 120, 170, 90, L('Model','Model'), L('reads the context,|picks the next action','đọc ngữ cảnh,|chọn hành động tiếp theo'), '#9333EA');
  s += bx(430, 120, 160, 90, L('Tool call?','Có gọi tool?'), L('stop_reason =|tool_use','stop_reason =|tool_use'), '#475569');
  s += bx(650, 30, 170, 90, L('Run the tool','Chạy tool'), L('your code or an|MCP server','code của bạn hoặc|MCP server'), '#16A34A');
  s += bx(650, 200, 170, 90, L('Append result','Thêm kết quả'), L('tool_result goes|back into context','tool_result quay lại|ngữ cảnh'), '#16A34A');
  s += bx(860, 120, 130, 90, L('Final answer','Câu trả lời'), L('text for the user','văn bản cho người dùng'), '#9333EA');
  s += arrow(152, 165, 198, 165) + arrow(372, 165, 428, 165) + arrow(592, 140, 648, 90) + arrow(735, 122, 735, 198);
  s += '<path class="ln" d="M648 245H285V212" marker-end="url(#arr)"/>' + arrow(592, 175, 858, 175);
  s += txt(610, 100, L('yes','có'), 'sm') + txt(700, 168, L('no','không'), 'sm') + txt(450, 262, L('loop: observe, then decide again','vòng lặp: quan sát, rồi quyết định lại'), 'sm');
  s += '<rect class="bx2" x="10" y="310" width="980" height="44" rx="8"/>' + txt(500, 337, L('Loop controller: max steps, token budget, timeout, permission checks, human approval for risky actions','Bộ điều khiển vòng lặp: số bước tối đa, ngân sách token, timeout, kiểm tra quyền, người duyệt cho hành động rủi ro'), 'b', 'middle');
  return svg(1000, 366, s, L('Agent loop','Vòng lặp agent'));
}

function harnessSVG(){
  var s = '<rect class="bx2 dash" x="5" y="5" width="990" height="390" rx="12"/>';
  s += bx(400, 150, 200, 100, L('LLM','LLM'), L('stateless: tokens in,|tokens out','không trạng thái: token vào,|token ra'), '#9333EA');
  var b = [
    [20, 20, L('System prompt and rules','System prompt và quy tắc'), L('role, style, constraints','vai trò, văn phong, ràng buộc')],
    [375, 20, L('Tools','Tools'), L('built-in functions + MCP servers','hàm có sẵn + MCP server')],
    [730, 20, L('Context manager','Quản lý ngữ cảnh'), L('retrieval, memory, compaction','truy xuất, bộ nhớ, nén ngữ cảnh')],
    [20, 160, L('Hooks and guardrails','Hook và guardrail'), L('validate inputs and outputs','kiểm tra đầu vào và đầu ra')],
    [730, 160, L('Approvals and UI','Phê duyệt và giao diện'), L('human in the loop','con người trong vòng lặp')],
    [20, 300, L('Permissions and sandbox','Quyền và sandbox'), L('least privilege, isolation','đặc quyền tối thiểu, cô lập')],
    [375, 300, L('Loop controller','Bộ điều khiển vòng lặp'), L('steps, budget, retries, stop','số bước, ngân sách, retry, dừng')],
    [730, 300, L('Tracing and evals','Tracing và đánh giá'), L('logs, cost, quality tests','log, chi phí, test chất lượng')]
  ];
  b.forEach(function(x){ s += bx(x[0], x[1], 250, 80, x[2], x[3], '#7C3AED'); });
  s += arrow(272, 200, 398, 200) + arrow(728, 200, 602, 200) + arrow(500, 102, 500, 148) + arrow(500, 298, 500, 252);
  s += arrow(272, 95, 400, 160) + arrow(728, 95, 600, 160) + arrow(272, 305, 400, 240) + arrow(728, 305, 600, 240);
  return svg(1000, 402, s, 'Agent harness');
}

function mcpSVG(){
  var s = txt(495, 20, L('JSON-RPC 2.0 over stdio or Streamable HTTP','JSON-RPC 2.0 qua stdio hoặc Streamable HTTP'), 'sm', 'middle');
  s += '<rect class="bx2" x="10" y="30" width="400" height="310" rx="10"/>' + txt(26, 52, L('Host application (chat app, IDE, agent)','Ứng dụng host (chat, IDE, agent)'), 'b');
  s += bx(30, 100, 170, 120, L('Model + harness','Model + harness'), L('decides which tool|to call and when','quyết định gọi tool|nào và khi nào'), '#9333EA');
  [['A', 60], ['B', 150], ['C', 240]].forEach(function(c){ s += bx(230, c[1], 160, 70, 'MCP client ' + c[0], L('one per server','mỗi server một client'), '#9333EA'); });
  var sv = [[60, L('Warehouse server','Server warehouse'), L('tools: run_sql, list_tables','tools: run_sql, list_tables'), L('Snowflake / BigQuery','Snowflake / BigQuery')],
            [150, L('dbt server','Server dbt'), L('tools: compile, run, test','tools: compile, run, test'), L('dbt project','dbt project')],
            [240, L('Catalog server','Server catalog'), L('resources: lineage, owners','resources: lineage, owner'), L('DataHub / Atlan','DataHub / Atlan')]];
  sv.forEach(function(x){
    s += bx(560, x[0], 210, 70, x[1], x[2], '#7C3AED') + bx(810, x[0], 180, 70, x[3], '', '#7A869F');
    s += arrow(392, x[0] + 35, 558, x[0] + 35) + arrow(772, x[0] + 35, 808, x[0] + 35);
  });
  s += arrow(202, 130, 228, 95) + arrow(202, 160, 228, 185) + arrow(202, 190, 228, 275);
  return svg(1000, 352, s, L('MCP architecture','Kiến trúc MCP'));
}

function ragSVG(){
  var s = txt(10, 34, L('Indexing (offline, repeated when data changes)','Lập chỉ mục (offline, lặp lại khi dữ liệu đổi)'), 'lg');
  s += bx(10, 50, 120, 80, L('Documents','Tài liệu'), L('docs, tickets,|tables, wikis','docs, ticket,|bảng, wiki'), '#9333EA');
  s += bx(160, 50, 130, 80, L('Chunk','Chia chunk'), L('split, clean,|add metadata','tách, làm sạch,|thêm metadata'), '#9333EA');
  s += bx(320, 50, 140, 80, L('Embed','Embed'), L('text → vector|(embedding model)','văn bản → vector|(embedding model)'), '#9333EA');
  s += bx(490, 50, 180, 80, L('Index','Chỉ mục'), L('vector store +|keyword index|+ metadata','vector store +|chỉ mục từ khóa|+ metadata'), '#7C3AED');
  s += arrow(132, 90, 158, 90) + arrow(292, 90, 318, 90) + arrow(462, 90, 488, 90);
  s += txt(10, 214, L('Query (online, per question)','Truy vấn (online, mỗi câu hỏi)'), 'lg');
  s += bx(10, 230, 120, 80, L('Question','Câu hỏi'), '', '#9333EA');
  s += bx(160, 230, 130, 80, L('Embed query','Embed câu hỏi'), L('same embedding|model','cùng embedding|model'), '#9333EA');
  s += bx(320, 230, 140, 80, L('Retrieve','Truy xuất'), L('top-k vector +|keyword (hybrid)','top-k vector +|từ khóa (hybrid)'), '#9333EA');
  s += bx(490, 230, 120, 80, L('Rerank','Rerank'), L('cross-encoder|keeps best n','cross-encoder|giữ n tốt nhất'), '#9333EA');
  s += bx(640, 230, 130, 80, L('Prompt','Prompt'), L('question +|context chunks','câu hỏi +|các chunk'), '#9333EA');
  s += bx(800, 230, 90, 80, L('LLM','LLM'), '', '#9333EA');
  s += bx(910, 230, 80, 80, L('Answer','Trả lời'), L('+ cites','+ trích dẫn'), '#9333EA');
  s += arrow(132, 270, 158, 270) + arrow(292, 270, 318, 270) + arrow(462, 270, 488, 270) + arrow(612, 270, 638, 270) + arrow(772, 270, 798, 270) + arrow(892, 270, 908, 270);
  s += '<path class="ln dash" d="M580 132V190H390V228" marker-end="url(#arr)"/>';
  s += '<rect class="bx2" x="10" y="340" width="980" height="40" rx="8"/>' + txt(500, 365, L('Evaluate each stage: retrieval recall@k, answer faithfulness, citation accuracy, latency, cost','Đánh giá từng giai đoạn: recall@k của truy xuất, độ trung thực của câu trả lời, độ đúng trích dẫn, độ trễ, chi phí'), 'b', 'middle');
  return svg(1000, 394, s, L('RAG pipeline','Pipeline RAG'));
}

function kgSVG(){
  var s = '', c = '#9333EA';
  s += bx(10, 30, 140, 44, 'raw.orders', '', c) + bx(190, 30, 140, 44, 'stg_orders', '', c) + bx(370, 30, 140, 44, 'fct_orders', '', c) + bx(550, 30, 140, 44, 'mart_revenue', '', c) + bx(730, 30, 160, 44, L('Revenue dashboard','Dashboard doanh thu'), '', '#B45309');
  s += bx(190, 150, 140, 44, 'dim_customers', '', c) + bx(550, 150, 140, 44, L('team: Finance','team: Finance'), '', '#0369A1') + bx(10, 150, 140, 44, L('tag: PII','tag: PII'), '', '#DC2626');
  s += arrow(152, 52, 188, 52) + arrow(332, 52, 368, 52) + arrow(512, 52, 548, 52) + arrow(692, 52, 728, 52) + arrow(332, 150, 400, 76);
  s += arrow(620, 76, 620, 148) + arrow(80, 76, 80, 148);
  s += txt(170, 46, 'FEEDS', 'sm', 'middle') + txt(350, 46, 'FEEDS', 'sm', 'middle') + txt(530, 46, 'FEEDS', 'sm', 'middle') + txt(710, 46, 'FEEDS', 'sm', 'middle');
  s += txt(630, 118, 'OWNED_BY', 'sm') + txt(90, 118, 'HAS_TAG', 'sm') + txt(372, 128, 'FEEDS', 'sm');
  return svg(900, 214, s, L('Lineage knowledge graph','Knowledge graph lineage'));
}
