"use strict";

/* ---------- diagrams (language-aware, built at render time) ---------- */
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
  return svg(1000, 366, s, 'Agent loop');
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
  return svg(1000, 352, s, 'MCP architecture');
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
  return svg(1000, 394, s, 'RAG pipeline');
}
function kgSVG(){
  var s = '', c = '#9333EA';
  s += bx(10, 30, 140, 44, 'raw.orders', '', c) + bx(190, 30, 140, 44, 'stg_orders', '', c) + bx(370, 30, 140, 44, 'fct_orders', '', c) + bx(550, 30, 140, 44, 'mart_revenue', '', c) + bx(730, 30, 160, 44, L('Revenue dashboard','Dashboard doanh thu'), '', '#B45309');
  s += bx(190, 150, 140, 44, 'dim_customers', '', c) + bx(550, 150, 140, 44, L('team: Finance','team: Finance'), '', '#0369A1') + bx(10, 150, 140, 44, L('tag: PII','tag: PII'), '', '#DC2626');
  s += arrow(152, 52, 188, 52) + arrow(332, 52, 368, 52) + arrow(512, 52, 548, 52) + arrow(692, 52, 728, 52) + arrow(332, 150, 400, 76);
  s += arrow(620, 76, 620, 148) + arrow(80, 76, 80, 148);
  s += txt(170, 46, 'FEEDS', 'sm', 'middle') + txt(350, 46, 'FEEDS', 'sm', 'middle') + txt(530, 46, 'FEEDS', 'sm', 'middle') + txt(710, 46, 'FEEDS', 'sm', 'middle');
  s += txt(630, 118, 'OWNED_BY', 'sm') + txt(90, 118, 'HAS_TAG', 'sm') + txt(372, 128, 'FEEDS', 'sm');
  return svg(900, 214, s, 'Lineage knowledge graph');
}

/* ---------- section 15 ---------- */
SEC(15, [
 { k:'cards', cols:3, t:L('AI engineering: from prompts to agents','Kỹ thuật AI: từ prompt đến agent'),
   lead:L('Modern data stacks now ship LLM features. Seniors need the architecture and the vocabulary: how a model is called, how it gets context (RAG), how it uses tools (MCP), and how a loop inside a harness keeps it useful and safe.',
          'Data stack hiện đại đều có tính năng LLM. Senior cần hiểu kiến trúc và thuật ngữ: model được gọi thế nào, lấy ngữ cảnh ra sao (RAG), dùng công cụ thế nào (MCP), và vòng lặp trong harness giữ nó hữu ích và an toàn ra sao.'),
   cards:[
    {h:L('LLM','LLM'), tag:'must', p:L('A stateless function: tokens in, tokens out. It only knows what is in its context window.','Hàm không trạng thái: token vào, token ra. Nó chỉ biết những gì nằm trong context window.')},
    {h:L('RAG','RAG'), tag:'must', p:L('Retrieval-augmented generation: fetch relevant documents or rows and put them in the prompt so answers are grounded.','Retrieval-augmented generation: lấy tài liệu hoặc dòng dữ liệu liên quan đưa vào prompt để câu trả lời có căn cứ.')},
    {h:L('Tools and MCP','Tool và MCP'), tag:'must', p:L('Functions the model can ask you to run. The Model Context Protocol standardizes how tools and data are exposed.','Các hàm model có thể yêu cầu bạn chạy. Model Context Protocol chuẩn hóa cách mở tool và dữ liệu ra.')},
    {h:L('Agent loop','Vòng lặp agent'), tag:'must', p:L('Think, act, observe, repeat until the goal is met or a limit is hit.','Nghĩ, hành động, quan sát, lặp lại đến khi đạt mục tiêu hoặc chạm giới hạn.')},
    {h:L('Harness','Harness'), tag:'senior', p:L('The runtime around the model: prompts, tools, memory, permissions, limits, tracing. Most agent quality lives here.','Runtime bao quanh model: prompt, tool, bộ nhớ, quyền, giới hạn, tracing. Phần lớn chất lượng agent nằm ở đây.')},
    {h:L('Graph','Graph'), tag:'senior', p:L('Knowledge graphs store relations (GraphRAG). Workflow graphs define agent control flow as nodes and edges.','Knowledge graph lưu quan hệ (GraphRAG). Workflow graph định nghĩa luồng điều khiển của agent bằng node và edge.')}
   ],
   n:L('Introduce the six pieces as a stack: the model at the center, RAG and tools feeding it, the loop driving it, the harness containing it, and graphs as two different structures (data and control).','Giới thiệu sáu mảnh như một ngăn xếp: model ở giữa, RAG và tool cấp cho nó, vòng lặp điều khiển nó, harness chứa nó, và graph là hai cấu trúc khác nhau (dữ liệu và điều khiển).') },

 { k:'code', t:L('Tool calling: the request and response format','Tool calling: định dạng request và response'),
   lead:L('The model never runs your code. It returns a structured request; you execute it and send the result back as the next message.','Model không bao giờ chạy code của bạn. Nó trả về một yêu cầu có cấu trúc; bạn thực thi rồi gửi kết quả lại trong tin nhắn kế tiếp.'),
   blocks:[
    {lang:'python', title:'request.py (Anthropic Python SDK)', code:`
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY

tools = [{
    "name": "run_sql",
    "description": "Run a read-only SQL query on the analytics warehouse and return up to 100 rows.",
    "input_schema": {
        "type": "object",
        "properties": {"sql": {"type": "string", "description": "A single SELECT statement"}},
        "required": ["sql"],
    },
}]

resp = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "How many orders shipped yesterday?"}],
)
print(resp.stop_reason)  # "tool_use" when the model wants a tool`},
    {lang:'json', title:'resp.content (what the model returns)', code:`
[
  {"type": "text", "text": "I will query the orders table."},
  {
    "type": "tool_use",
    "id": "toolu_01A",
    "name": "run_sql",
    "input": {"sql": "select count(*) from marts.fct_orders where order_status = 'shipped' and ordered_at::date = current_date - 1"}
  }
]`},
    {lang:'json', title:'next user message (what you send back)', code:`
{
  "role": "user",
  "content": [
    {"type": "tool_result", "tool_use_id": "toolu_01A", "content": "count\\n1284"}
  ]
}`}
   ],
   points:[
    {h:L('Messages are the whole state','Messages là toàn bộ trạng thái'), p:L('The API is stateless. You resend the full conversation each call, including earlier tool results.','API không có trạng thái. Mỗi lần gọi bạn gửi lại toàn bộ hội thoại, gồm cả kết quả tool trước đó.')},
    {h:L('Schema is the contract','Schema là hợp đồng'), p:L('The JSON Schema in `input_schema` and the description decide how well the model uses the tool.','JSON Schema trong `input_schema` và phần mô tả quyết định model dùng tool tốt đến đâu.')},
    {h:L('You own execution','Bạn sở hữu việc thực thi'), tag:'senior', p:L('Validate arguments, enforce read-only access and cap output size before running anything.','Kiểm tra tham số, ép quyền chỉ đọc và giới hạn kích thước output trước khi chạy bất cứ thứ gì.')},
    {h:L('Tokens are the unit of cost','Token là đơn vị chi phí'), p:L('Input, output and tool results all count. Long tool outputs are the usual budget leak.','Input, output và kết quả tool đều tính phí. Output tool dài là chỗ rò rỉ ngân sách thường gặp.')}
   ],
   n:L('Show the three artifacts in order: your request with a tool definition, the model’s tool_use block, and your tool_result. Model names change often, so check the current model list before copying the string.','Cho xem ba thành phần theo thứ tự: request có định nghĩa tool, block tool_use của model, và tool_result của bạn. Tên model đổi thường xuyên, hãy kiểm tra danh sách model hiện hành trước khi chép chuỗi này.') },

 { k:'svg', t:L('The agent loop: observe, decide, act','Vòng lặp agent: quan sát, quyết định, hành động'),
   lead:L('An agent is a loop around a model. Each pass either calls a tool and feeds the result back, or ends with an answer.','Agent là một vòng lặp quanh model. Mỗi lượt hoặc gọi tool và đưa kết quả quay lại, hoặc kết thúc bằng câu trả lời.'),
   svg:loopSVG,
   cap:L('The loop controller, not the model, owns the stopping rules. Never rely on the model to stop itself.','Bộ điều khiển vòng lặp, không phải model, nắm các quy tắc dừng. Đừng trông chờ model tự dừng.'),
   n:L('Trace one example: user asks a data question, model requests run_sql, the tool returns rows, the model reads them and answers. Then stress the bottom bar: step and budget limits are what stop a runaway loop.','Theo dõi một ví dụ: người dùng hỏi về dữ liệu, model yêu cầu run_sql, tool trả về dòng dữ liệu, model đọc và trả lời. Sau đó nhấn mạnh thanh dưới: giới hạn bước và ngân sách là thứ chặn vòng lặp chạy mãi.') },

 { k:'code', t:L('A minimal agent loop with limits','Vòng lặp agent tối giản có giới hạn'),
   lead:L('Under 30 lines: call the model, run requested tools, append results, stop on an answer or a limit.','Dưới 30 dòng: gọi model, chạy tool được yêu cầu, thêm kết quả, dừng khi có câu trả lời hoặc chạm giới hạn.'),
   blocks:[{lang:'python', title:'agent.py', code:`
MODEL = "claude-sonnet-5-5"


def run_agent(question: str, max_steps: int = 8) -> str:
    messages = [{"role": "user", "content": question}]
    for step in range(max_steps):
        resp = client.messages.create(
            model=MODEL, max_tokens=1024, tools=tools, messages=messages
        )
        messages.append({"role": "assistant", "content": resp.content})

        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")

        results = []
        for block in resp.content:
            if block.type != "tool_use":
                continue
            try:
                output, is_error = TOOL_REGISTRY[block.name](**block.input), False
            except Exception as exc:  # report failures back to the model
                output, is_error = f"Tool error: {exc}", True
            results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": str(output)[:4000],  # cap what re-enters the context
                "is_error": is_error,
            })
        messages.append({"role": "user", "content": results})

    return "Stopped: step limit reached"`}],
   points:[
    {h:L('Hard step limit','Giới hạn bước cứng'), p:L('`max_steps` turns an infinite loop into a bounded cost.','`max_steps` biến vòng lặp vô hạn thành chi phí có giới hạn.')},
    {h:L('Errors go back to the model','Lỗi quay lại cho model'), p:L('A failed tool is information. Return it with `is_error` so the model can adapt.','Tool lỗi cũng là thông tin. Trả về với `is_error` để model thích nghi.')},
    {h:L('Cap output','Giới hạn output'), tag:'senior', p:L('Truncate tool results so one big query cannot fill the context window.','Cắt ngắn kết quả tool để một query lớn không làm đầy context window.')},
    {h:L('Add before production','Thêm trước khi lên production'), tag:'senior', p:L('Token budget, timeout, parallel tool calls, logging, retries on API errors and an allowlist of tools.','Ngân sách token, timeout, gọi tool song song, logging, retry khi API lỗi và allowlist tool.')}
   ],
   n:L('`client`, `tools` and `TOOL_REGISTRY` come from the previous slide and your own code. This is intentionally the smallest loop that is honest about errors and limits.','`client`, `tools` và `TOOL_REGISTRY` lấy từ slide trước và code của bạn. Đây cố ý là vòng lặp nhỏ nhất vẫn xử lý trung thực lỗi và giới hạn.') },

 { k:'html', t:L('The harness: everything around the model','Harness: mọi thứ bao quanh model'),
   lead:L('Two teams with the same model get very different results. The difference is the harness: prompts, tools, context handling, permissions, limits and observability.','Hai đội dùng cùng một model cho kết quả rất khác nhau. Khác biệt là harness: prompt, tool, xử lý ngữ cảnh, quyền, giới hạn và khả năng quan sát.'),
   html:function(){
     var g = [
      [L('Context management','Quản lý ngữ cảnh'), L('Decide what enters the window: retrieved chunks, summaries of old turns, memory notes. Compaction keeps long tasks inside the limit.','Quyết định cái gì vào cửa sổ: chunk truy xuất, tóm tắt các lượt cũ, ghi chú bộ nhớ. Nén ngữ cảnh giữ tác vụ dài trong giới hạn.')],
      [L('Tool design','Thiết kế tool'), L('Few, well-named tools with clear schemas beat many overlapping ones. Tool errors should teach the model what to do next.','Ít tool, tên rõ, schema rõ tốt hơn nhiều tool chồng chéo. Lỗi của tool nên chỉ cho model biết bước tiếp theo.')],
      [L('Safety layer','Lớp an toàn'), L('Least-privilege credentials, sandboxed execution, approvals for writes, and treating retrieved text as untrusted input.','Credential đặc quyền tối thiểu, thực thi trong sandbox, phê duyệt cho thao tác ghi, và coi văn bản truy xuất là đầu vào không đáng tin.')],
      [L('Observability and evals','Observability và đánh giá'), L('Trace every step (prompt, tool call, result, tokens, latency). Replay failures and run regression evals on every change.','Trace mọi bước (prompt, gọi tool, kết quả, token, độ trễ). Phát lại lỗi và chạy eval hồi quy cho mỗi thay đổi.')]
     ];
     return '<div class="fig">' + harnessSVG() + '</div><div class="grid c2" style="margin-top:14px">' +
       g.map(function(x){ return cardHTML({h:x[0], p:x[1]}, true); }).join('') + '</div>';
   },
   n:L('Define harness plainly: the runtime that wraps the model and runs the loop. Coding agents such as Claude Code are examples of a harness: the model plus tools, permissions, context handling and a loop. Model upgrades help, but harness changes are often the bigger lever.','Định nghĩa harness đơn giản: runtime bao quanh model và chạy vòng lặp. Các coding agent như Claude Code là ví dụ về harness: model cộng tool, quyền, xử lý ngữ cảnh và một vòng lặp. Nâng cấp model có ích, nhưng thay đổi harness thường là đòn bẩy lớn hơn.') },

 { k:'html', t:L('MCP: a standard plug for tools and data','MCP: ổ cắm chuẩn cho tool và dữ liệu'),
   lead:L('The Model Context Protocol lets any host application talk to any server that exposes tools, resources and prompts. Write the integration once, use it from many clients.','Model Context Protocol cho phép mọi ứng dụng host nói chuyện với mọi server cung cấp tool, resource và prompt. Viết tích hợp một lần, dùng từ nhiều client.'),
   html:function(){
     var py = codeBlock({lang:'python', title:'server.py (Python MCP SDK)', code:`
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("warehouse")


@mcp.tool()
def run_sql(sql: str) -> str:
    """Run a read-only SQL query and return up to 100 rows as CSV."""
    if not sql.lstrip().lower().startswith("select"):
        raise ValueError("Only SELECT statements are allowed")
    return execute_readonly(sql, limit=100)  # your warehouse client


@mcp.resource("schema://{table}")
def table_schema(table: str) -> str:
    """Column names and types for a table."""
    return describe_table(table)


if __name__ == "__main__":
    mcp.run()  # stdio transport by default`});
     var js = codeBlock({lang:'json', title:'JSON-RPC messages on the wire', code:`
{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}

{"jsonrpc": "2.0", "id": 2, "method": "tools/call",
 "params": {"name": "run_sql", "arguments": {"sql": "select 1 as ok"}}}

{"jsonrpc": "2.0", "id": 2,
 "result": {"content": [{"type": "text", "text": "ok\\n1"}], "isError": false}}`});
     var cfg = codeBlock({lang:'json', title:'client config (how a host launches the server)', code:`
{
  "mcpServers": {
    "warehouse": {
      "command": "python",
      "args": ["server.py"]
    }
  }
}`});
     var pts = [
      [L('Three primitives','Ba primitive'), L('Tools (actions the model can request), resources (data it can read), prompts (reusable templates).','Tool (hành động model có thể yêu cầu), resource (dữ liệu nó đọc được), prompt (mẫu tái sử dụng).')],
      [L('Lifecycle','Vòng đời'), L('Connect, `initialize` and negotiate capabilities, `tools/list`, then `tools/call` as the model needs.','Kết nối, `initialize` và thương lượng capability, `tools/list`, rồi `tools/call` khi model cần.')],
      [L('Transports','Transport'), L('stdio for local servers, Streamable HTTP for remote ones, both carrying JSON-RPC 2.0.','stdio cho server cục bộ, Streamable HTTP cho server từ xa, cả hai mang JSON-RPC 2.0.')],
      [L('Security is yours','Bảo mật là việc của bạn'), L('Read-only roles, authentication on remote servers, allowlists, and no blind trust in tool descriptions or tool output.','Role chỉ đọc, xác thực cho server từ xa, allowlist, và không tin mù quáng mô tả hay output của tool.')]
     ];
     return '<div class="fig">' + mcpSVG() + '</div><div class="grid c2" style="margin:14px 0">' +
       pts.map(function(x){ return cardHTML({h:x[0], p:x[1]}, true); }).join('') + '</div>' +
       '<div class="split even"><div>' + py + '</div><div>' + js + cfg + '</div></div>';
   },
   n:L('MCP is to AI tools what a USB port is to peripherals: one connector, many devices. For data teams, typical servers expose the warehouse, dbt, the catalog and the orchestrator. Check the current specification for transport and authorization details, which have evolved.','MCP với công cụ AI giống cổng USB với thiết bị ngoại vi: một đầu nối, nhiều thiết bị. Với đội dữ liệu, server điển hình mở warehouse, dbt, catalog và orchestrator. Hãy kiểm tra đặc tả hiện hành về transport và ủy quyền, vì phần này đã thay đổi.') },

 { k:'svg', t:L('RAG: retrieval-augmented generation','RAG: retrieval-augmented generation'),
   lead:L('RAG replaces “the model remembers” with “the system looks it up”. Quality depends far more on retrieval than on the model.','RAG thay “model nhớ” bằng “hệ thống tra cứu”. Chất lượng phụ thuộc vào truy xuất nhiều hơn vào model.'),
   svg:ragSVG,
   cap:L('Most RAG failures are retrieval failures: the right chunk was never fetched. Measure retrieval separately from generation.','Phần lớn lỗi RAG là lỗi truy xuất: chunk đúng chưa bao giờ được lấy. Hãy đo truy xuất tách riêng khỏi sinh câu trả lời.'),
   n:L('Two lanes: indexing happens ahead of time, querying happens per question. The dashed arrow shows the index being searched. Then the evaluation bar: if you cannot measure recall@k you cannot improve it.','Hai làn: lập chỉ mục diễn ra trước, truy vấn diễn ra cho mỗi câu hỏi. Mũi tên đứt cho thấy chỉ mục được tìm kiếm. Rồi thanh đánh giá: không đo được recall@k thì không cải thiện được.') },

 { k:'html', t:L('RAG variables and a minimal implementation','Các biến của RAG và bản cài đặt tối giản'),
   lead:L('Every stage has parameters that change quality and cost. Tune them against a test set, not by feel.','Mỗi giai đoạn có tham số làm đổi chất lượng và chi phí. Hãy tinh chỉnh dựa trên bộ test, không theo cảm tính.'),
   html:function(){
     var rows = [
      [L('Chunk size','Kích thước chunk'), L('Characters or tokens per chunk','Số ký tự hoặc token mỗi chunk'), L('Small = precise but loses context; large = noisy and costly','Nhỏ = chính xác nhưng mất ngữ cảnh; lớn = nhiễu và tốn kém')],
      [L('Overlap','Overlap'), L('Shared text between neighbours','Phần văn bản chung giữa chunk liền kề'), L('Prevents cutting an answer in half; adds storage','Tránh cắt đôi câu trả lời; tốn thêm lưu trữ')],
      [L('Embedding model and dimension','Embedding model và số chiều'), L('Vector length, for example 768 or 1536','Độ dài vector, ví dụ 768 hoặc 1536'), L('Quality, language coverage, storage and speed','Chất lượng, phủ ngôn ngữ, lưu trữ và tốc độ')],
      [L('Similarity metric','Độ đo tương đồng'), L('Cosine, dot product or L2','Cosine, dot product hoặc L2'), L('Must match how the embedding model was trained','Phải khớp cách embedding model được huấn luyện')],
      [L('k (top-k)','k (top-k)'), L('Chunks returned','Số chunk trả về'), L('Higher k raises recall but dilutes the prompt','k cao tăng recall nhưng làm loãng prompt')],
      [L('Hybrid weight','Trọng số hybrid'), L('Mix of keyword (BM25) and vector scores','Trộn điểm từ khóa (BM25) và vector'), L('Keywords catch exact IDs and names that vectors miss','Từ khóa bắt ID và tên chính xác mà vector bỏ sót')],
      [L('Reranker','Reranker'), L('Second-stage model that rescores candidates','Model giai đoạn hai chấm lại ứng viên'), L('Better precision at extra latency','Độ chính xác tốt hơn, thêm độ trễ')]
     ];
     var code = codeBlock({lang:'python', title:'rag_min.py', code:`
import numpy as np


def chunk(text: str, size: int = 800, overlap: int = 100) -> list[str]:
    step = size - overlap
    return [text[i:i + size] for i in range(0, max(len(text) - overlap, 1), step)]


def cosine_top_k(query_vec: np.ndarray, doc_vecs: np.ndarray, k: int = 5) -> np.ndarray:
    q = query_vec / np.linalg.norm(query_vec)
    d = doc_vecs / np.linalg.norm(doc_vecs, axis=1, keepdims=True)
    scores = d @ q                      # (n_chunks,)
    return np.argsort(-scores)[:k]      # indices of the best chunks


# doc_vecs: (n_chunks, d_embed) from your embedding model; query_vec: (d_embed,)
top = cosine_top_k(query_vec, doc_vecs, k=5)
context = "\\n\\n".join(f"[{i}] {chunks[i]}" for i in top)
prompt = (
    "Answer using only the context below and cite chunk numbers like [3].\\n\\n"
    f"{context}\\n\\nQuestion: {question}"
)`});
     return tableHTML(['Variable','Meaning','Effect'].map(function(x){ return L(x, {Variable:'Biến', Meaning:'Ý nghĩa', Effect:'Tác động'}[x]); }), rows) + '<div style="margin-top:14px">' + code + '</div>';
   },
   n:L('Spend time on chunking and hybrid search before touching the model. For structured data, retrieve schemas and metric definitions rather than raw rows: that is RAG over your semantic layer.','Hãy dành thời gian cho chunking và tìm kiếm hybrid trước khi đụng tới model. Với dữ liệu có cấu trúc, truy xuất schema và định nghĩa metric thay vì dòng thô: đó là RAG trên semantic layer của bạn.') },

 { k:'html', t:L('Graphs: knowledge graphs and GraphRAG','Graph: knowledge graph và GraphRAG'),
   lead:L('Vector search finds similar text. A graph answers questions about relationships: what feeds this table, who owns it, what breaks if it changes.','Vector search tìm văn bản tương tự. Graph trả lời câu hỏi về quan hệ: cái gì nuôi bảng này, ai sở hữu, thay đổi thì cái gì hỏng.'),
   html:function(){
     var cy = codeBlock({lang:'cypher', title:'lineage.cypher (Neo4j / Cypher)', code:`
// Everything downstream of raw.orders within 4 hops, with owners
MATCH (src:Table {name: 'raw.orders'})-[:FEEDS*1..4]->(d)
OPTIONAL MATCH (d)-[:OWNED_BY]->(t:Team)
RETURN d.name AS asset, labels(d) AS kind, t.name AS owner
ORDER BY asset`});
     var pts = [
      [L('Build','Xây dựng'), L('Extract entities and relations from documents with an LLM or take them from metadata (lineage, ownership), then store nodes and edges.','Trích xuất thực thể và quan hệ từ tài liệu bằng LLM hoặc lấy từ metadata (lineage, ownership), rồi lưu node và edge.')],
      [L('Local query','Truy vấn cục bộ'), L('Find entities in the question, walk their neighbourhood, and pass those facts and linked text to the model.','Tìm thực thể trong câu hỏi, duyệt vùng lân cận của chúng, rồi đưa các sự kiện và văn bản liên kết cho model.')],
      [L('Global query','Truy vấn toàn cục'), L('Cluster the graph into communities, summarize each, and answer broad questions from the summaries.','Gom graph thành các community, tóm tắt từng cái, rồi trả lời câu hỏi rộng từ các bản tóm tắt.')],
      [L('When it wins','Khi nào graph thắng'), L('Multi-hop and aggregation questions. For plain lookups, vector or keyword search is cheaper.','Câu hỏi nhiều bước và tổng hợp. Với tra cứu đơn giản, vector hoặc từ khóa rẻ hơn.')]
     ];
     return '<div class="fig">' + kgSVG() + '</div><div class="grid c2" style="margin:14px 0">' +
       pts.map(function(x){ return cardHTML({h:x[0], p:x[1]}, true); }).join('') + '</div>' + cy;
   },
   n:L('Data lineage is already a graph, which makes this a natural fit for analytics engineers: a lineage graph plus an LLM answers impact-analysis questions that vector search cannot. Extraction by LLM is costly and imperfect, so prefer structured metadata when you have it.','Data lineage vốn đã là graph, nên rất hợp với analytics engineer: graph lineage cộng LLM trả lời được câu hỏi phân tích tác động mà vector search không làm được. Trích xuất bằng LLM tốn kém và không hoàn hảo, nên ưu tiên metadata có cấu trúc nếu có.') },

 { k:'code', t:L('Graphs for control flow: agent workflows','Graph cho luồng điều khiển: workflow agent'),
   lead:L('A workflow graph makes the agent’s steps explicit: nodes do work, edges decide what runs next, and a shared state travels along. This is the structured alternative to a free-form loop.','Workflow graph làm rõ các bước của agent: node làm việc, edge quyết định bước tiếp theo, và một state chung đi cùng. Đây là lựa chọn có cấu trúc thay cho vòng lặp tự do.'),
   blocks:[{lang:'python', title:'sql_agent_graph.py (LangGraph style)', code:`
from typing import TypedDict

from langgraph.graph import END, START, StateGraph


class State(TypedDict):
    question: str
    sql: str
    result: str
    error: str
    attempts: int


def write_sql(state: State) -> dict:
    sql = llm_write_sql(state["question"], state.get("error", ""))  # your LLM call
    return {"sql": sql, "attempts": state["attempts"] + 1}


def run_sql(state: State) -> dict:
    try:
        return {"result": execute_readonly(state["sql"]), "error": ""}
    except Exception as exc:
        return {"error": str(exc)}


def route(state: State) -> str:
    if not state["error"]:
        return "done"
    return "retry" if state["attempts"] < 3 else "give_up"


graph = StateGraph(State)
graph.add_node("write_sql", write_sql)
graph.add_node("run_sql", run_sql)
graph.add_edge(START, "write_sql")
graph.add_edge("write_sql", "run_sql")
graph.add_conditional_edges("run_sql", route, {"done": END, "retry": "write_sql", "give_up": END})
app = graph.compile()

final = app.invoke({"question": "Revenue by month in 2026", "attempts": 0, "error": ""})`}],
   points:[
    {h:L('Nodes, edges, state','Node, edge, state'), p:L('Each node reads and updates the shared state. Conditional edges are the only place control flow branches.','Mỗi node đọc và cập nhật state chung. Conditional edge là nơi duy nhất luồng điều khiển rẽ nhánh.')},
    {h:L('Predictable and testable','Dự đoán được và test được'), p:L('You can unit-test each node and assert which path a failure takes.','Bạn có thể unit test từng node và khẳng định lỗi đi theo nhánh nào.')},
    {h:L('Checkpoints','Checkpoint'), tag:'senior', p:L('Persisting state per step allows resume after failure and human approval pauses.','Lưu state mỗi bước cho phép tiếp tục sau lỗi và tạm dừng chờ con người duyệt.')},
    {h:L('Loop or graph?','Vòng lặp hay graph?'), tag:'senior', p:L('Open-ended tasks suit a free loop. Repeatable business processes suit a graph with explicit gates.','Tác vụ mở hợp với vòng lặp tự do. Quy trình nghiệp vụ lặp lại hợp với graph có cổng rõ ràng.')}
   ],
   n:L('Mention that the library API is an example and may change between versions. The design point stands in any framework: make the allowed paths explicit, cap retries, and keep state inspectable.','Lưu ý API thư viện chỉ là ví dụ và có thể đổi giữa các phiên bản. Ý thiết kế vẫn đúng ở mọi framework: làm rõ các nhánh được phép, giới hạn retry và giữ state kiểm tra được.') },

 { k:'cards', cols:3, t:L('Evaluation, safety and cost','Đánh giá, an toàn và chi phí'),
   lead:L('Demos hide the failure cases. Production needs measurement, containment and a budget.','Demo che giấu các ca lỗi. Production cần đo lường, kiềm chế rủi ro và ngân sách.'),
   cards:[
    {h:L('Golden test set','Bộ test vàng'), tag:'must', p:L('Real questions with known answers (or known SQL results). Run it on every prompt, model or tool change.','Câu hỏi thật với đáp án đã biết (hoặc kết quả SQL đã biết). Chạy mỗi khi đổi prompt, model hoặc tool.')},
    {h:L('LLM as judge, with care','LLM làm giám khảo, thận trọng'), tag:'senior', p:L('Useful for scale, but calibrate against human labels and watch for bias toward verbose answers.','Hữu ích khi cần quy mô, nhưng phải hiệu chuẩn với nhãn của con người và coi chừng thiên vị câu dài dòng.')},
    {h:L('Tracing','Tracing'), tag:'must', p:L('Log prompts, tool calls, results, tokens and latency per run so any bad answer can be replayed.','Log prompt, lệnh gọi tool, kết quả, token và độ trễ mỗi lần chạy để phát lại bất kỳ câu trả lời sai nào.')},
    {h:L('Prompt injection','Prompt injection'), tag:'must', p:L('Retrieved documents and tool outputs can contain instructions. Treat them as data, restrict tools, and require approval for writes.','Tài liệu truy xuất và output tool có thể chứa chỉ dẫn. Coi chúng là dữ liệu, giới hạn tool và yêu cầu duyệt cho thao tác ghi.')},
    {h:L('Privacy','Quyền riêng tư'), tag:'senior', p:L('Mask PII before it reaches a model, check vendor data-retention terms, and log access.','Che PII trước khi tới model, kiểm tra điều khoản lưu giữ dữ liệu của nhà cung cấp và log truy cập.')},
    {h:L('Cost and latency','Chi phí và độ trễ'), tag:'senior', p:L('Cache prompts and results, route easy tasks to smaller models, cap steps and context size.','Cache prompt và kết quả, chuyển việc dễ sang model nhỏ hơn, giới hạn số bước và kích thước ngữ cảnh.')}
   ],
   n:L('If there is no evaluation set, the team is guessing. Start with 30 to 50 real questions and grow it from production failures.','Không có bộ đánh giá thì đội đang đoán mò. Bắt đầu với 30 đến 50 câu hỏi thật và mở rộng từ các lỗi ở production.') },

 { k:'pit', t:L('Common pitfalls and anti-patterns','Lỗi thường gặp và anti-pattern'), rows:[
   {bad:L('Shipping on a demo.','Phát hành chỉ vì demo đẹp.'), why:L('Happy-path examples hide failures.','Ví dụ thuận lợi che giấu lỗi.'), fix:L('Build a golden test set first and track it over time.','Xây bộ test vàng trước và theo dõi theo thời gian.')},
   {bad:L('Stuffing everything into the prompt.','Nhồi mọi thứ vào prompt.'), why:L('Cost rises and answers get worse as the context fills.','Chi phí tăng và câu trả lời tệ đi khi ngữ cảnh đầy.'), fix:L('Retrieve only what is needed and compact old turns.','Chỉ truy xuất thứ cần thiết và nén các lượt cũ.')},
   {bad:L('Too many overlapping tools.','Quá nhiều tool chồng chéo.'), why:L('The model picks the wrong one or loops.','Model chọn sai hoặc lặp.'), fix:L('Few tools, clear names, precise schemas.','Ít tool, tên rõ, schema chính xác.')},
   {bad:L('Letting the agent write to production.','Cho agent ghi vào production.'), why:L('One bad step is irreversible.','Một bước sai không thể hoàn tác.'), fix:L('Read-only by default, approvals and sandboxes for writes.','Mặc định chỉ đọc, duyệt và sandbox cho thao tác ghi.')},
   {bad:L('Trusting retrieved text.','Tin văn bản truy xuất.'), why:L('Injected instructions hijack the agent.','Chỉ dẫn bị chèn chiếm quyền agent.'), fix:L('Treat it as untrusted data and limit what tools can do.','Coi là dữ liệu không đáng tin và giới hạn khả năng của tool.')},
   {bad:L('No stopping rules.','Không có quy tắc dừng.'), why:L('Runaway loops burn budget.','Vòng lặp chạy mãi đốt ngân sách.'), fix:L('Step, token and time limits owned by the controller.','Giới hạn bước, token và thời gian do bộ điều khiển nắm.')}
  ], n:L('The first row is the root of the others: without measurement you cannot even see these failures.','Hàng đầu là gốc của các hàng còn lại: không đo lường thì thậm chí không thấy được các lỗi này.') },

 { k:'cards', cols:3, t:L('What senior looks like: AI engineering','Senior trông như thế nào: kỹ thuật AI'),
   cards:[
    {h:L('Decisions','Quyết định'), tag:'senior', list:[L('Loop or workflow graph','Vòng lặp hay workflow graph'), L('RAG, fine-tuning or neither','RAG, fine-tuning hay không cần'), L('Which tools to expose, and with what permissions','Mở tool nào, với quyền gì')]},
    {h:L('Trade-offs','Đánh đổi'), tag:'senior', list:[L('Autonomy versus control','Tự chủ và kiểm soát'), L('Quality versus cost and latency','Chất lượng và chi phí, độ trễ'), L('Vendor platform versus own harness','Nền tảng nhà cung cấp và harness tự xây')]},
    {h:L('Responsibilities','Trách nhiệm'), tag:'senior', list:[L('Own the eval set and the release gate','Nắm bộ eval và cổng phát hành'), L('Set security rules for tools and data','Đặt quy tắc bảo mật cho tool và dữ liệu'), L('Make cost and failures visible','Làm chi phí và lỗi nhìn thấy được')]}
   ],
   n:L('The senior contribution is judgment about where AI belongs and the engineering that makes it measurable and safe.','Đóng góp của senior là phán đoán AI nên đặt ở đâu và kỹ thuật làm nó đo được và an toàn.') },

 { k:'check', t:L('Checklist and interview questions','Checklist và câu hỏi phỏng vấn'),
   left:{h:L('Self-check','Tự kiểm tra'), items:[L('I can explain the tool-calling message format','Tôi giải thích được định dạng message của tool calling'), L('I can write an agent loop with limits','Tôi viết được vòng lặp agent có giới hạn'), L('I can describe MCP hosts, clients and servers','Tôi mô tả được host, client, server của MCP'), L('I can tune a RAG pipeline against a test set','Tôi tinh chỉnh được pipeline RAG dựa trên bộ test'), L('I know when a graph beats vector search','Tôi biết khi nào graph hơn vector search'), L('I treat tool output as untrusted','Tôi coi output của tool là không đáng tin')]},
   right:{h:L('Interview-style questions','Câu hỏi kiểu phỏng vấn'), items:[L('Walk through one full tool call, including what the API returns.','Mô tả một lần tool call đầy đủ, gồm cả những gì API trả về.'), L('The agent loops forever. What do you check and change?','Agent lặp mãi. Bạn kiểm tra và đổi gì?'), L('Why can RAG answers be wrong even when the model is strong?','Vì sao câu trả lời RAG có thể sai dù model mạnh?'), L('Design a safe natural-language interface to the warehouse using MCP.','Thiết kế giao diện ngôn ngữ tự nhiên an toàn tới warehouse bằng MCP.'), L('When would you choose a workflow graph over a free agent loop?','Khi nào chọn workflow graph thay vì vòng lặp agent tự do?')]},
   n:L('Strong answers to the safe-interface question combine read-only roles, governed metrics, validation, evals and logging.','Câu trả lời tốt cho câu hỏi giao diện an toàn kết hợp role chỉ đọc, metric được quản trị, validation, eval và logging.') }
]);

"use strict";

/* one uniform slide per model: how it works, input/output format, variables, use and limits, code */
function modelSlide(o){
  return {
    k:'html', t:o.t, lead:o.lead, n:o.n,
    html:function(){
      var lab = {
        how:X('How it works','Cách hoạt động'), io:X('Input / output format','Định dạng đầu vào / đầu ra'), vars:X('Variables','Các biến'),
        inp:X('Input','Đầu vào'), out:X('Output','Đầu ra'), learned:X('Learned parameters','Tham số học được'),
        hyper:X('Hyperparameters (you choose)','Siêu tham số (bạn chọn)'), use:X('Use and limits','Khi dùng và giới hạn')
      };
      return '<div class="split even"><div><div class="card"><h4>' + lab.how + '</h4><ol class="qs">' +
        o.how.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ol></div>' +
        '<div class="card plain" style="margin-top:12px"><h4>' + lab.use + '</h4><p>' + inl(o.use) + '</p></div></div><div>' +
        '<div class="card plain"><h4>' + lab.io + '</h4><p><b>' + lab.inp + ':</b> ' + inl(o.input) + '</p><p><b>' + lab.out + ':</b> ' + inl(o.output) + '</p></div>' +
        '<div class="card plain" style="margin-top:12px"><h4>' + lab.vars + '</h4><p><b>' + lab.learned + ':</b> ' + inl(o.learned) + '</p><p><b>' + lab.hyper + ':</b> ' + inl(o.hyper) + '</p></div></div></div>' +
        '<div style="margin-top:14px">' + codeBlock(o.code) + '</div>';
    }
  };
}

SEC(16, [
 { k:'cards', cols:3, t:L('ML and deep learning: the models behind the tools','ML và deep learning: các model đứng sau công cụ'),
   lead:L('You do not need to derive every algorithm, but you should know how each famous model works, what data format it expects, and which variables you control. That is what lets you choose, debug and explain.','Bạn không cần tự suy ra mọi thuật toán, nhưng nên biết từng model nổi tiếng hoạt động thế nào, nhận dữ liệu định dạng gì và bạn điều khiển những biến nào. Đó là điều giúp bạn chọn, debug và giải thích.'),
   cards:[
    {h:L('Supervised, classical','Có giám sát, cổ điển'), tag:'must', p:L('Linear and logistic regression, trees, random forest, gradient boosting. Best default for tabular data.','Hồi quy tuyến tính và logistic, cây, random forest, gradient boosting. Mặc định tốt nhất cho dữ liệu dạng bảng.')},
    {h:L('Unsupervised','Không giám sát'), tag:'must', p:L('k-means for clusters, PCA for compression and visualization. No labels needed.','k-means để gom cụm, PCA để nén và trực quan. Không cần nhãn.')},
    {h:L('Neural networks','Mạng nơ-ron'), tag:'must', p:L('MLP, CNN, RNN and LSTM: layers of learned transformations trained by gradient descent.','MLP, CNN, RNN và LSTM: các tầng biến đổi học được, huấn luyện bằng gradient descent.')},
    {h:L('Transformers and LLMs','Transformer và LLM'), tag:'must', p:L('Attention-based models: BERT-style encoders and GPT-style decoders power search, chat and agents.','Model dựa trên attention: encoder kiểu BERT và decoder kiểu GPT chạy phía sau tìm kiếm, chat và agent.')},
    {h:L('Generative','Sinh dữ liệu'), tag:'nice', p:L('Autoencoders, VAEs, GANs and diffusion models create or reconstruct data.','Autoencoder, VAE, GAN và diffusion tạo hoặc tái tạo dữ liệu.')},
    {h:L('Graph models','Model trên graph'), tag:'nice', p:L('Graph neural networks learn from relationships: fraud rings, recommendations, lineage.','Graph neural network học từ quan hệ: vòng gian lận, gợi ý, lineage.')}
   ],
   n:L('Each model slide that follows uses the same layout: how it works, input and output format, learned parameters versus hyperparameters, use and limits, and a short code sample. Notation: n samples, d features, B batch size, T sequence length.','Mỗi slide model phía sau dùng cùng bố cục: cách hoạt động, định dạng vào ra, tham số học được so với siêu tham số, khi dùng và giới hạn, và một đoạn code ngắn. Ký hiệu: n mẫu, d đặc trưng, B batch size, T độ dài chuỗi.') },

 { k:'table', t:L('Model families at a glance','Các họ model trong một bảng'),
   head:[L('Model','Model'), L('Task','Bài toán'), L('Input format','Định dạng đầu vào'), L('Strength','Điểm mạnh'), L('Limit','Hạn chế')], rows:[
   [L('Linear / logistic regression','Hồi quy tuyến tính / logistic'), L('Regression, classification','Hồi quy, phân loại'), L('(n, d) numeric matrix','Ma trận số (n, d)'), L('Fast, interpretable baseline','Nhanh, dễ giải thích, baseline tốt'), L('Only linear relations','Chỉ quan hệ tuyến tính')],
   [L('Decision tree, random forest','Cây quyết định, random forest'), L('Regression, classification','Hồi quy, phân loại'), L('(n, d) mixed, no scaling','(n, d) hỗn hợp, không cần chuẩn hóa'), L('Non-linear, robust','Phi tuyến, bền vững'), L('Large forests are slow, weaker extrapolation','Rừng lớn chậm, ngoại suy kém')],
   [L('Gradient boosting (XGBoost, LightGBM)','Gradient boosting (XGBoost, LightGBM)'), L('Regression, classification, ranking','Hồi quy, phân loại, xếp hạng'), L('(n, d) tabular, NaN allowed','(n, d) dạng bảng, cho phép NaN'), L('Often best on tabular data','Thường tốt nhất với dữ liệu bảng'), L('Needs tuning, can overfit','Cần tinh chỉnh, dễ overfit')],
   [L('SVM, k-NN, Naive Bayes','SVM, k-NN, Naive Bayes'), L('Classification','Phân loại'), L('(n, d) scaled / text counts','(n, d) đã chuẩn hóa / đếm từ'), L('Small data, simple ideas','Dữ liệu nhỏ, ý tưởng đơn giản'), L('Scale poorly (SVM, k-NN)','Mở rộng kém (SVM, k-NN)')],
   [L('k-means, PCA','k-means, PCA'), L('Clustering, compression','Gom cụm, nén'), L('(n, d) scaled floats','(n, d) số thực đã chuẩn hóa'), L('No labels, quick insight','Không cần nhãn, thấy nhanh'), L('Assumes spherical / linear structure','Giả định cấu trúc cầu / tuyến tính')],
   [L('MLP','MLP'), L('Any supervised task','Mọi bài toán có giám sát'), L('(B, d) float32','(B, d) float32'), L('Flexible function approximator','Xấp xỉ hàm linh hoạt'), L('Needs data and tuning; weak on plain tabular vs trees','Cần dữ liệu và tinh chỉnh; yếu hơn cây trên dữ liệu bảng thường')],
   [L('CNN','CNN'), L('Images, signals','Ảnh, tín hiệu'), L('(B, C, H, W)','(B, C, H, W)'), L('Spatial patterns, weight sharing','Mẫu không gian, chia sẻ trọng số'), L('Fixed receptive field','Trường nhìn cố định')],
   [L('RNN, LSTM, GRU','RNN, LSTM, GRU'), L('Sequences, time series','Chuỗi, chuỗi thời gian'), L('(B, T, d)','(B, T, d)'), L('Natural for ordered data','Tự nhiên với dữ liệu có thứ tự'), L('Sequential, long-range memory is hard','Tuần tự, khó nhớ xa')],
   [L('Transformer (BERT, GPT)','Transformer (BERT, GPT)'), L('Text, code, multimodal','Văn bản, code, đa phương thức'), L('(B, T) token ids','(B, T) id token'), L('Parallel, scales, long context','Song song, mở rộng tốt, ngữ cảnh dài'), L('Cost grows with T squared','Chi phí tăng theo T bình phương')],
   [L('Autoencoder, VAE, GAN, diffusion','Autoencoder, VAE, GAN, diffusion'), L('Generation, anomaly detection','Sinh dữ liệu, phát hiện bất thường'), L('(B, d) or (B, C, H, W)','(B, d) hoặc (B, C, H, W)'), L('Learn data distributions','Học phân phối dữ liệu'), L('Hard to train and evaluate','Khó huấn luyện và đánh giá')],
   [L('GNN','GNN'), L('Node, edge, graph tasks','Bài toán node, edge, graph'), L('node features + edge_index','đặc trưng node + edge_index'), L('Uses relations directly','Dùng trực tiếp quan hệ'), L('Over-smoothing, scaling large graphs','Over-smoothing, khó mở rộng graph lớn')]
  ], cap:L('Starting point for tabular analytics data: a linear baseline, then gradient boosting. Reach for deep learning when the data is images, text, audio, sequences or graphs.','Điểm khởi đầu cho dữ liệu bảng: baseline tuyến tính, rồi gradient boosting. Dùng deep learning khi dữ liệu là ảnh, văn bản, âm thanh, chuỗi hoặc graph.'),
   n:L('Use this table as a map; the next slides open each family. The caption is the practical rule most analytics teams should internalize.','Dùng bảng này như bản đồ; các slide sau mở từng họ. Dòng chú thích là quy tắc thực dụng mà hầu hết đội analytics nên thuộc.') },

 { k:'table', t:L('Training anatomy: the variables every model shares','Giải phẫu huấn luyện: các biến mọi model đều có'),
   lead:L('Whatever the model, training follows one loop: predict, measure the loss, update parameters, repeat.','Dù model nào, huấn luyện đều theo một vòng: dự đoán, đo loss, cập nhật tham số, lặp lại.'),
   head:[L('Term','Thuật ngữ'), L('Meaning','Ý nghĩa'), L('Example','Ví dụ')], rows:[
   [L('Parameter','Tham số'), L('Value learned from data during training','Giá trị được học từ dữ liệu khi huấn luyện'), L('weights w and bias b','trọng số w và bias b')],
   [L('Hyperparameter','Siêu tham số'), L('Setting you choose before training; tuned on validation data','Cài đặt bạn chọn trước khi huấn luyện; tinh chỉnh trên dữ liệu validation'), L('learning rate, tree depth, k','learning rate, độ sâu cây, k')],
   [L('Loss function','Hàm loss'), L('Number the training tries to minimize','Con số mà huấn luyện cố gắng giảm'), L('MSE = mean((y − ŷ)²); log loss','MSE = mean((y − ŷ)²); log loss')],
   [L('Optimizer','Optimizer'), L('Rule that updates parameters from gradients','Quy tắc cập nhật tham số từ gradient'), L('SGD: w ← w − η·∇L; Adam','SGD: w ← w − η·∇L; Adam')],
   [L('Learning rate η','Learning rate η'), L('Step size of each update','Kích thước bước mỗi lần cập nhật'), L('1e-3 is a common start for Adam','1e-3 là điểm bắt đầu phổ biến cho Adam')],
   [L('Batch, epoch','Batch, epoch'), L('Samples per update; one full pass over the data','Số mẫu mỗi lần cập nhật; một lượt qua toàn bộ dữ liệu'), L('batch 64, 20 epochs','batch 64, 20 epoch')],
   [L('Regularization','Regularization'), L('Penalty or trick that limits complexity','Phạt hoặc mẹo giới hạn độ phức tạp'), L('L2 weight decay, dropout, early stopping','L2 weight decay, dropout, early stopping')],
   [L('Train / validation / test','Train / validation / test'), L('Fit, tune, and finally estimate real performance','Khớp, tinh chỉnh, và cuối cùng ước lượng hiệu năng thật'), L('time-based split for time series','chia theo thời gian cho chuỗi thời gian')],
   [L('Overfitting','Overfitting'), L('Great on train, poor on new data','Tốt trên train, kém trên dữ liệu mới'), L('train loss falls while validation loss rises','train loss giảm trong khi validation loss tăng')],
   [L('Metrics','Chỉ số đánh giá'), L('Business-facing measures of quality','Thước đo chất lượng hướng nghiệp vụ'), L('RMSE, AUC, precision, recall, F1','RMSE, AUC, precision, recall, F1')]
  ],
   n:L('Fix this vocabulary first: every later slide separates learned parameters from hyperparameters. The loop of predict, loss, update is identical from linear regression to GPT.','Hãy cố định bộ từ vựng này trước: mọi slide sau đều tách tham số học được và siêu tham số. Vòng dự đoán, loss, cập nhật giống nhau từ hồi quy tuyến tính đến GPT.') },

 modelSlide({
   t:L('Linear and logistic regression','Hồi quy tuyến tính và logistic'),
   lead:L('The simplest models and still the right first baseline: a weighted sum of the features.','Model đơn giản nhất và vẫn là baseline đầu tiên đúng đắn: tổng có trọng số của các đặc trưng.'),
   how:[L('Linear: ŷ = w·x + b. Fit w and b by minimizing MSE (closed form: w = (XᵀX)⁻¹Xᵀy, or gradient descent).','Tuyến tính: ŷ = w·x + b. Tìm w, b bằng cách giảm MSE (công thức đóng w = (XᵀX)⁻¹Xᵀy, hoặc gradient descent).'),
        L('Logistic: p = σ(w·x + b) with σ(z) = 1 / (1 + e^−z). Fit by minimizing log loss.','Logistic: p = σ(w·x + b) với σ(z) = 1 / (1 + e^−z). Tìm bằng cách giảm log loss.'),
        L('Predict class 1 when p exceeds a threshold (0.5 by default; choose by business cost).','Dự đoán lớp 1 khi p vượt ngưỡng (mặc định 0.5; chọn theo chi phí nghiệp vụ).'),
        L('Ridge (L2) and Lasso (L1) add a penalty on w to fight overfitting; Lasso also zeroes weights.','Ridge (L2) và Lasso (L1) thêm phạt lên w để chống overfitting; Lasso còn đưa một số trọng số về 0.')],
   input:L('X of shape (n, d), numeric floats (encode categories, scale features); y of shape (n,).','X dạng (n, d), số thực (mã hóa biến phân loại, chuẩn hóa đặc trưng); y dạng (n,).'),
   output:L('Linear: continuous ŷ (n,). Logistic: probabilities (n,) or (n, k) with softmax.','Tuyến tính: ŷ liên tục (n,). Logistic: xác suất (n,) hoặc (n, k) với softmax.'),
   learned:L('w (d values) and b (1 value).','w (d giá trị) và b (1 giá trị).'),
   hyper:L('regularization strength (alpha, or C = 1/alpha in scikit-learn), penalty type, class_weight, decision threshold.','độ mạnh regularization (alpha, hoặc C = 1/alpha trong scikit-learn), loại penalty, class_weight, ngưỡng quyết định.'),
   use:L('Interpretable, fast, strong baseline. Assumes linear effects, independent errors; sensitive to outliers and correlated features.','Dễ giải thích, nhanh, baseline mạnh. Giả định tác động tuyến tính, sai số độc lập; nhạy với outlier và đặc trưng tương quan.'),
   code:{lang:'python', title:'linear_models.py', code:`
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

reg = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
reg.fit(X_train, y_train)                # X: (n, d) floats, y: (n,)
y_hat = reg.predict(X_test)              # (n,)

clf = make_pipeline(StandardScaler(), LogisticRegression(C=1.0, class_weight="balanced"))
clf.fit(X_train, y_class)
p = clf.predict_proba(X_test)[:, 1]      # P(class = 1), shape (n,)`},
   n:L('Always start here. If a linear model is within a few points of a complex one, ship the linear model: it is cheaper to run, explain and monitor.','Luôn bắt đầu từ đây. Nếu model tuyến tính chỉ kém vài điểm so với model phức tạp, hãy phát hành model tuyến tính: rẻ hơn để chạy, giải thích và giám sát.') }),

 modelSlide({
   t:L('Decision tree and random forest','Cây quyết định và random forest'),
   lead:L('Trees split the data with yes/no questions. A forest averages many different trees to cancel their errors.','Cây chia dữ liệu bằng các câu hỏi có/không. Rừng lấy trung bình nhiều cây khác nhau để triệt tiêu sai số của chúng.'),
   how:[L('Tree: at each node pick the feature and threshold that most reduce impurity (Gini = 1 − Σp², or entropy; MSE for regression).','Cây: ở mỗi node chọn đặc trưng và ngưỡng giảm impurity nhiều nhất (Gini = 1 − Σp², hoặc entropy; MSE cho hồi quy).'),
        L('Recurse until a stopping rule (max depth, min samples per leaf). A leaf predicts the majority class or mean.','Đệ quy đến khi gặp điều kiện dừng (độ sâu tối đa, số mẫu tối thiểu mỗi lá). Lá dự đoán lớp đa số hoặc trung bình.'),
        L('Forest: train B trees on bootstrap samples, and consider only a random subset of features at each split.','Rừng: huấn luyện B cây trên các mẫu bootstrap, và mỗi lần chia chỉ xét một tập con ngẫu nhiên của đặc trưng.'),
        L('Predict by majority vote (classification) or average (regression). Out-of-bag samples give a free validation score.','Dự đoán bằng bỏ phiếu đa số (phân loại) hoặc trung bình (hồi quy). Mẫu out-of-bag cho điểm validation miễn phí.')],
   input:L('X of shape (n, d); numeric or encoded categories; no scaling needed; y of shape (n,).','X dạng (n, d); số hoặc phân loại đã mã hóa; không cần chuẩn hóa; y dạng (n,).'),
   output:L('Class labels or probabilities (n, k); or numeric predictions (n,). Feature importances (d,).','Nhãn lớp hoặc xác suất (n, k); hoặc giá trị số (n,). Độ quan trọng đặc trưng (d,).'),
   learned:L('Split features and thresholds, leaf values (stored in the trees).','Đặc trưng và ngưỡng chia, giá trị ở lá (lưu trong các cây).'),
   hyper:L('n_estimators, max_depth, min_samples_leaf, max_features (sqrt of d is a common default for classification), bootstrap.','n_estimators, max_depth, min_samples_leaf, max_features (căn bậc hai của d là mặc định phổ biến cho phân loại), bootstrap.'),
   use:L('A single deep tree overfits; the forest is robust and needs little tuning. It cannot extrapolate beyond the training range.','Một cây sâu bị overfit; rừng bền vững và ít cần tinh chỉnh. Không ngoại suy được ngoài miền huấn luyện.'),
   code:{lang:'python', title:'random_forest.py', code:`
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=300, max_features="sqrt", min_samples_leaf=5,
    oob_score=True, n_jobs=-1, random_state=42,
)
rf.fit(X_train, y_train)                 # X: (n, d), y: (n,)
print(rf.oob_score_)                     # validation estimate from out-of-bag rows
proba = rf.predict_proba(X_test)         # (n, n_classes)
importance = rf.feature_importances_     # (d,)`},
   n:L('Contrast bagging (random forest: reduce variance with independent trees) with boosting on the next slide (reduce bias with sequential trees).','So sánh bagging (random forest: giảm variance bằng các cây độc lập) với boosting ở slide sau (giảm bias bằng các cây nối tiếp).') }),

 modelSlide({
   t:L('Gradient boosting: XGBoost and LightGBM','Gradient boosting: XGBoost và LightGBM'),
   lead:L('Build trees one after another, each correcting the errors of the sum so far. Usually the strongest default for tabular data.','Xây các cây nối tiếp nhau, mỗi cây sửa sai số của tổng hiện tại. Thường là lựa chọn mạnh nhất cho dữ liệu dạng bảng.'),
   how:[L('Start with a constant prediction F₀.','Bắt đầu với dự đoán hằng F₀.'),
        L('Each round compute the gradient of the loss for every row (for squared error this is the residual y − F).','Mỗi vòng tính gradient của loss cho từng dòng (với bình phương sai số là phần dư y − F).'),
        L('Fit a small tree h_m to those gradients, then update F_m = F_(m−1) + η·h_m, where η is the learning rate.','Khớp một cây nhỏ h_m với các gradient đó, rồi cập nhật F_m = F_(m−1) + η·h_m, với η là learning rate.'),
        L('XGBoost also uses second-order information and penalizes leaf weights (λ) and tree size (γ). LightGBM uses histograms and leaf-wise growth for speed.','XGBoost còn dùng thông tin bậc hai và phạt trọng số lá (λ) và kích thước cây (γ). LightGBM dùng histogram và mọc cây theo lá để nhanh.')],
   input:L('Tabular (n, d) as numpy, pandas or DMatrix; missing values allowed; categoricals via encoding or native support.','Dạng bảng (n, d) kiểu numpy, pandas hoặc DMatrix; cho phép thiếu giá trị; biến phân loại qua mã hóa hoặc hỗ trợ sẵn.'),
   output:L('Predictions (n,) or class probabilities; feature importances and SHAP values.','Dự đoán (n,) hoặc xác suất lớp; độ quan trọng đặc trưng và SHAP value.'),
   learned:L('The trees: split features, thresholds and leaf weights.','Các cây: đặc trưng chia, ngưỡng và trọng số lá.'),
   hyper:L('n_estimators, learning_rate η, max_depth (or num_leaves), subsample, colsample_bytree, min_child_weight, reg_lambda, early_stopping_rounds.','n_estimators, learning_rate η, max_depth (hoặc num_leaves), subsample, colsample_bytree, min_child_weight, reg_lambda, early_stopping_rounds.'),
   use:L('Top accuracy on tabular data with modest tuning. Can overfit; use early stopping on a validation set. Not suited to raw images or text.','Độ chính xác hàng đầu trên dữ liệu bảng với ít tinh chỉnh. Có thể overfit; dùng early stopping trên tập validation. Không hợp với ảnh hay văn bản thô.'),
   code:{lang:'python', title:'xgboost_model.py', code:`
import xgboost as xgb

model = xgb.XGBClassifier(
    n_estimators=2000, learning_rate=0.03, max_depth=4,
    subsample=0.8, colsample_bytree=0.8, reg_lambda=1.0,
    eval_metric="auc", early_stopping_rounds=50,
)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
print(model.best_iteration)              # rounds actually needed
p = model.predict_proba(X_test)[:, 1]    # (n,)`},
   n:L('Learning rate and number of trees trade off: a smaller η needs more trees. Early stopping on a validation set picks the number of trees automatically.','Learning rate và số cây đánh đổi nhau: η nhỏ cần nhiều cây hơn. Early stopping trên tập validation tự chọn số cây.') }),

 modelSlide({
   t:L('k-means clustering','Gom cụm k-means'),
   lead:L('Group similar rows without labels by repeatedly moving k centers to the middle of their points.','Gom các dòng giống nhau mà không cần nhãn bằng cách lặp lại việc dời k tâm về giữa các điểm của chúng.'),
   how:[L('Choose k and initialize centroids (k-means++ spreads them out).','Chọn k và khởi tạo centroid (k-means++ rải chúng ra xa nhau).'),
        L('Assignment: give every point to its nearest centroid (Euclidean distance).','Gán: đưa mỗi điểm về centroid gần nhất (khoảng cách Euclid).'),
        L('Update: move each centroid to the mean of its assigned points.','Cập nhật: dời mỗi centroid về trung bình các điểm được gán.'),
        L('Repeat until assignments stop changing. Objective: minimize inertia = Σ ‖x − μ_cluster‖².','Lặp đến khi việc gán không đổi. Mục tiêu: giảm inertia = Σ ‖x − μ_cluster‖².')],
   input:L('X of shape (n, d), numeric and scaled (distance-based, so scale matters).','X dạng (n, d), số và đã chuẩn hóa (dựa trên khoảng cách nên thang đo quan trọng).'),
   output:L('labels (n,) integers in 0..k−1; centers (k, d); inertia (a number).','labels (n,) số nguyên 0..k−1; centers (k, d); inertia (một số).'),
   learned:L('The k centroids (k × d numbers).','k centroid (k × d số).'),
   hyper:L('n_clusters k, init, n_init (restarts), max_iter. Pick k with the elbow method or the silhouette score.','n_clusters k, init, n_init (số lần chạy lại), max_iter. Chọn k bằng elbow hoặc silhouette score.'),
   use:L('Customer segmentation, quick exploration. Assumes round, similar-size clusters; sensitive to outliers and to k.','Phân khúc khách hàng, khám phá nhanh. Giả định cụm tròn, kích thước gần nhau; nhạy với outlier và k.'),
   code:{lang:'python', title:'kmeans.py', code:`
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

Xs = StandardScaler().fit_transform(X)            # (n, d), scaled
km = KMeans(n_clusters=5, n_init="auto", random_state=42).fit(Xs)
labels = km.labels_                               # (n,)
centers = km.cluster_centers_                     # (5, d)
print(km.inertia_, silhouette_score(Xs, labels))`},
   n:L('Always scale features first; otherwise the feature with the largest range decides the clusters. Profile each cluster afterwards, since the algorithm gives numbers, not meaning.','Luôn chuẩn hóa đặc trưng trước; nếu không, đặc trưng có biên độ lớn nhất sẽ quyết định cụm. Sau đó mô tả từng cụm, vì thuật toán cho ra con số, không cho ra ý nghĩa.') }),

 modelSlide({
   t:L('Principal component analysis (PCA)','Phân tích thành phần chính (PCA)'),
   lead:L('Rotate the data onto new axes ordered by how much variance they capture, then keep only the first few.','Xoay dữ liệu sang các trục mới xếp theo lượng variance chúng giữ được, rồi chỉ giữ vài trục đầu.'),
   how:[L('Center each feature (subtract the mean) and usually scale it.','Căn giữa từng đặc trưng (trừ trung bình) và thường chuẩn hóa.'),
        L('Compute the covariance matrix C = XᵀX / (n − 1) and its eigenvectors (in practice via SVD).','Tính ma trận hiệp phương sai C = XᵀX / (n − 1) và các vector riêng (thực tế dùng SVD).'),
        L('Sort eigenvectors by eigenvalue. These are the principal components; eigenvalues are the variances.','Sắp xếp vector riêng theo trị riêng. Đó là các thành phần chính; trị riêng là các variance.'),
        L('Project: Z = X_centered · W_k, keeping k components that explain enough variance (for example 95 percent).','Chiếu: Z = X_centered · W_k, giữ k thành phần giải thích đủ variance (ví dụ 95 phần trăm).')],
   input:L('X of shape (n, d), numeric, centered and scaled.','X dạng (n, d), số, đã căn giữa và chuẩn hóa.'),
   output:L('Z of shape (n, k); components_ (k, d); explained_variance_ratio_ (k,).','Z dạng (n, k); components_ (k, d); explained_variance_ratio_ (k,).'),
   learned:L('The component matrix W (k × d) and the feature means (d).','Ma trận thành phần W (k × d) và trung bình đặc trưng (d).'),
   hyper:L('n_components (an integer, or a variance fraction such as 0.95), whiten.','n_components (số nguyên, hoặc tỷ lệ variance như 0.95), whiten.'),
   use:L('Compression, denoising, visualization, decorrelating features. Linear only; components are mixtures and hard to interpret.','Nén, khử nhiễu, trực quan hóa, loại tương quan giữa đặc trưng. Chỉ tuyến tính; thành phần là hỗn hợp, khó giải thích.'),
   code:{lang:'python', title:'pca.py', code:`
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

Xs = StandardScaler().fit_transform(X)            # (n, d)
pca = PCA(n_components=0.95).fit(Xs)              # keep 95 percent of variance
Z = pca.transform(Xs)                             # (n, k)
print(pca.n_components_, pca.explained_variance_ratio_.cumsum())`},
   n:L('Fit PCA on training data only and reuse the same transform on test data, otherwise information leaks. PCA is also the intuition behind embeddings: dense, low-dimensional representations.','Chỉ fit PCA trên dữ liệu train và dùng lại cùng phép biến đổi cho test, nếu không sẽ rò rỉ thông tin. PCA cũng là trực giác đằng sau embedding: biểu diễn dày, ít chiều.') }),

 modelSlide({
   t:L('Multilayer perceptron (MLP) and backpropagation','Perceptron nhiều tầng (MLP) và backpropagation'),
   lead:L('Stacked layers of weighted sums and non-linear activations. The building block of nearly all deep learning.','Các tầng chồng lên nhau gồm tổng có trọng số và hàm kích hoạt phi tuyến. Khối xây dựng của gần như mọi deep learning.'),
   how:[L('Each layer computes h = φ(W·x + b), where φ is an activation such as ReLU or GELU.','Mỗi tầng tính h = φ(W·x + b), với φ là hàm kích hoạt như ReLU hoặc GELU.'),
        L('Forward pass: pass a batch through all layers to get predictions (logits).','Lan truyền tiến: đưa một batch qua mọi tầng để có dự đoán (logit).'),
        L('Compute the loss (for example cross-entropy) against the labels.','Tính loss (ví dụ cross-entropy) so với nhãn.'),
        L('Backpropagation applies the chain rule to get ∂loss/∂W for every layer; the optimizer updates W ← W − η·∇ (Adam adapts η per parameter).','Backpropagation dùng quy tắc chuỗi để có ∂loss/∂W cho mọi tầng; optimizer cập nhật W ← W − η·∇ (Adam điều chỉnh η cho từng tham số).')],
   input:L('Batch tensor (B, d_in) of float32; labels (B,) or (B, k).','Tensor batch (B, d_in) float32; nhãn (B,) hoặc (B, k).'),
   output:L('Logits (B, d_out); apply softmax or sigmoid for probabilities.','Logit (B, d_out); áp dụng softmax hoặc sigmoid để có xác suất.'),
   learned:L('W and b of every layer. A layer with i inputs and o outputs has i·o + o parameters.','W và b của mọi tầng. Một tầng có i đầu vào và o đầu ra có i·o + o tham số.'),
   hyper:L('number of layers, hidden units, activation, learning rate, batch size, epochs, dropout, weight decay, optimizer.','số tầng, số đơn vị ẩn, hàm kích hoạt, learning rate, batch size, epoch, dropout, weight decay, optimizer.'),
   use:L('Flexible, but on plain tabular data it often loses to gradient boosting. Needs scaling, enough data and tuning.','Linh hoạt, nhưng trên dữ liệu bảng thường thua gradient boosting. Cần chuẩn hóa, đủ dữ liệu và tinh chỉnh.'),
   code:{lang:'python', title:'mlp.py (PyTorch)', code:`
import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(32, 64), nn.ReLU(), nn.Dropout(0.2), nn.Linear(64, 1))
loss_fn = nn.BCEWithLogitsLoss()
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)

for xb, yb in loader:             # xb: (B, 32) float32, yb: (B, 1) float32
    opt.zero_grad()
    loss = loss_fn(model(xb), yb)  # forward pass + loss
    loss.backward()                # backpropagation: gradients for every parameter
    opt.step()                     # update`},
   n:L('Walk the four-line training loop: it is the same for every neural network in the following slides, only the model changes.','Đi qua vòng huấn luyện bốn dòng: nó giống nhau cho mọi mạng nơ-ron ở các slide sau, chỉ có model thay đổi.') }),

 modelSlide({
   t:L('Convolutional neural network (CNN)','Mạng nơ-ron tích chập (CNN)'),
   lead:L('Slide small learned filters over an image so the same pattern detector is reused everywhere.','Trượt các bộ lọc nhỏ học được trên ảnh để cùng một bộ dò mẫu được dùng lại ở mọi nơi.'),
   how:[L('A convolution slides a k×k kernel over the input and computes dot products, producing a feature map.','Phép tích chập trượt kernel k×k trên đầu vào và tính tích vô hướng, tạo ra feature map.'),
        L('Output size = floor((H + 2p − k) / s) + 1 for padding p and stride s. Many kernels give many channels.','Kích thước đầu ra = floor((H + 2p − k) / s) + 1 với padding p và stride s. Nhiều kernel cho nhiều kênh.'),
        L('Pooling shrinks the map; early layers learn edges, deeper layers learn shapes and objects.','Pooling thu nhỏ map; tầng đầu học cạnh, tầng sâu học hình dạng và vật thể.'),
        L('ResNet adds skip connections y = F(x) + x so very deep networks train without degrading.','ResNet thêm kết nối tắt y = F(x) + x để mạng rất sâu huấn luyện được mà không suy giảm.')],
   input:L('Tensor (B, C, H, W): batch, channels, height, width (PyTorch layout), normalized floats.','Tensor (B, C, H, W): batch, kênh, cao, rộng (bố cục PyTorch), số thực đã chuẩn hóa.'),
   output:L('Class logits (B, n_classes), or feature maps (B, C_out, H′, W′) for detection and segmentation.','Logit lớp (B, n_classes), hoặc feature map (B, C_out, H′, W′) cho detection và segmentation.'),
   learned:L('Kernel weights: (k·k·C_in + 1)·C_out per conv layer; plus the final linear layer.','Trọng số kernel: (k·k·C_in + 1)·C_out cho mỗi tầng conv; cộng tầng tuyến tính cuối.'),
   hyper:L('kernel size, stride, padding, channels per layer, depth, pooling, batch norm, dropout, data augmentation.','kích thước kernel, stride, padding, số kênh mỗi tầng, độ sâu, pooling, batch norm, dropout, data augmentation.'),
   use:L('Images, audio spectrograms, some time series. Vision transformers now compete on large datasets.','Ảnh, spectrogram âm thanh, một số chuỗi thời gian. Vision transformer nay cạnh tranh trên dữ liệu lớn.'),
   code:{lang:'python', title:'cnn.py (PyTorch)', code:`
import torch.nn as nn

cnn = nn.Sequential(
    nn.Conv2d(3, 32, kernel_size=3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
    nn.MaxPool2d(2),                          # (B, 32, H/2, W/2)
    nn.Conv2d(32, 64, kernel_size=3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
    nn.AdaptiveAvgPool2d(1),                  # (B, 64, 1, 1)
    nn.Flatten(),                             # (B, 64)
    nn.Linear(64, 10),                        # (B, 10) logits
)
# input x: (B, 3, 32, 32) float32  ->  cnn(x): (B, 10)`},
   n:L('Weight sharing is the key idea: one filter has few parameters yet scans the whole image, and translation of the object does not change the response much.','Chia sẻ trọng số là ý chính: một bộ lọc có ít tham số nhưng quét toàn bộ ảnh, và việc vật thể dịch chuyển không làm phản hồi đổi nhiều.') }),

 modelSlide({
   t:L('Recurrent networks: RNN, LSTM and GRU','Mạng hồi quy: RNN, LSTM và GRU'),
   lead:L('Process a sequence one step at a time while carrying a hidden state that summarizes the past.','Xử lý chuỗi từng bước một trong khi mang theo trạng thái ẩn tóm tắt quá khứ.'),
   how:[L('RNN: h_t = tanh(W_x·x_t + W_h·h_(t−1) + b). The same weights are reused at every step.','RNN: h_t = tanh(W_x·x_t + W_h·h_(t−1) + b). Cùng một bộ trọng số dùng lại ở mỗi bước.'),
        L('Gradients flow back through many steps and tend to vanish or explode; clip gradients.','Gradient chảy ngược qua nhiều bước và dễ biến mất hoặc bùng nổ; hãy cắt gradient.'),
        L('LSTM adds a cell state c_t with gates: c_t = f⊙c_(t−1) + i⊙g_t and h_t = o⊙tanh(c_t), with forget f, input i and output o gates.','LSTM thêm cell state c_t với các cổng: c_t = f⊙c_(t−1) + i⊙g_t và h_t = o⊙tanh(c_t), gồm cổng quên f, cổng vào i và cổng ra o.'),
        L('GRU merges gates into update and reset gates: fewer parameters, similar results.','GRU gộp cổng thành cổng cập nhật và cổng reset: ít tham số hơn, kết quả tương tự.')],
   input:L('Tensor (B, T, d) with batch_first: batch, time steps, features. Pad shorter sequences.','Tensor (B, T, d) với batch_first: batch, bước thời gian, đặc trưng. Đệm các chuỗi ngắn.'),
   output:L('outputs (B, T, hidden) and final states h_n (layers, B, hidden), plus c_n for LSTM.','outputs (B, T, hidden) và trạng thái cuối h_n (số tầng, B, hidden), thêm c_n cho LSTM.'),
   learned:L('Gate and state weight matrices. An LSTM layer has 4·(d + hidden + 1)·hidden parameters.','Các ma trận trọng số của cổng và trạng thái. Một tầng LSTM có 4·(d + hidden + 1)·hidden tham số.'),
   hyper:L('hidden_size, num_layers, bidirectional, dropout, sequence length, gradient clipping, learning rate.','hidden_size, num_layers, bidirectional, dropout, độ dài chuỗi, cắt gradient, learning rate.'),
   use:L('Time series and sequence labeling. Sequential steps limit speed; transformers and gradient boosting often win now.','Chuỗi thời gian và gán nhãn chuỗi. Các bước tuần tự giới hạn tốc độ; nay transformer và gradient boosting thường thắng.'),
   code:{lang:'python', title:'lstm.py (PyTorch)', code:`
import torch.nn as nn

lstm = nn.LSTM(input_size=8, hidden_size=64, num_layers=2, batch_first=True, dropout=0.2)
head = nn.Linear(64, 1)

# x: (B, T, 8) float32
out, (h_n, c_n) = lstm(x)         # out: (B, T, 64); h_n, c_n: (2, B, 64)
y_hat = head(out[:, -1, :])       # use the last time step -> (B, 1)`},
   n:L('Explain vanishing gradients as the motivation for gates: the cell state gives gradients a short, mostly additive path through time.','Giải thích gradient biến mất là động lực cho các cổng: cell state cho gradient một đường ngắn, chủ yếu là phép cộng, xuyên qua thời gian.') }),

 modelSlide({
   t:L('Transformer and self-attention','Transformer và self-attention'),
   lead:L('Let every token look at every other token at once, and learn which ones matter. The core of modern language models.','Cho mỗi token nhìn mọi token khác cùng lúc và học xem token nào quan trọng. Lõi của các mô hình ngôn ngữ hiện đại.'),
   how:[L('Tokens become embeddings of size d_model, plus positional information.','Token thành embedding kích thước d_model, cộng thông tin vị trí.'),
        L('Self-attention: Q = XW_Q, K = XW_K, V = XW_V, then Attention(Q, K, V) = softmax(QKᵀ / √d_k)·V.','Self-attention: Q = XW_Q, K = XW_K, V = XW_V, rồi Attention(Q, K, V) = softmax(QKᵀ / √d_k)·V.'),
        L('Multi-head: h heads in parallel, each with d_k = d_model / h, concatenated and projected by W_O.','Multi-head: h head song song, mỗi head có d_k = d_model / h, nối lại và chiếu bằng W_O.'),
        L('Each block: attention, then a feed-forward network, each with a residual connection and layer norm. Stack N blocks.','Mỗi khối: attention, rồi mạng feed-forward, mỗi phần có kết nối residual và layer norm. Chồng N khối.')],
   input:L('Token ids (B, T) → embeddings X (B, T, d_model). Attention scores are (B, h, T, T).','Id token (B, T) → embedding X (B, T, d_model). Điểm attention có dạng (B, h, T, T).'),
   output:L('Hidden states (B, T, d_model); a head maps them to logits (B, T, vocab) or a class.','Trạng thái ẩn (B, T, d_model); một head ánh xạ sang logit (B, T, vocab) hoặc một lớp.'),
   learned:L('W_Q, W_K, W_V, W_O and feed-forward weights: roughly 12·d_model² parameters per block (with d_ff = 4·d_model), plus embeddings.','W_Q, W_K, W_V, W_O và trọng số feed-forward: khoảng 12·d_model² tham số mỗi khối (với d_ff = 4·d_model), cộng embedding.'),
   hyper:L('d_model, n_heads, n_layers, d_ff, context length T, vocabulary size, dropout, learning-rate schedule.','d_model, n_heads, n_layers, d_ff, độ dài ngữ cảnh T, kích thước từ vựng, dropout, lịch learning rate.'),
   use:L('Parallel over tokens and scales well. Attention cost grows with T², which drives long-context engineering and KV caching.','Song song theo token và mở rộng tốt. Chi phí attention tăng theo T², thúc đẩy kỹ thuật ngữ cảnh dài và KV cache.'),
   code:{lang:'python', title:'attention.py (PyTorch)', code:`
import math
import torch


def attention(q, k, v, mask=None):                  # q, k, v: (B, H, T, d_k)
    scores = q @ k.transpose(-2, -1) / math.sqrt(q.size(-1))   # (B, H, T, T)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    weights = torch.softmax(scores, dim=-1)         # each row sums to 1
    return weights @ v                              # (B, H, T, d_k)`},
   n:L('Dividing by √d_k keeps the dot products from growing with dimension, which would push softmax into saturation. The mask is what separates encoders (no mask) from decoders (causal mask).','Chia cho √d_k giữ tích vô hướng không tăng theo số chiều, tránh đẩy softmax vào bão hòa. Mask là thứ phân biệt encoder (không mask) với decoder (mask nhân quả).') }),

 modelSlide({
   t:L('BERT: the encoder-only transformer','BERT: transformer chỉ có encoder'),
   lead:L('Reads the whole sentence in both directions to build context-aware representations. Strong for classification, search and embeddings.','Đọc cả câu theo hai chiều để tạo biểu diễn hiểu ngữ cảnh. Mạnh cho phân loại, tìm kiếm và embedding.'),
   how:[L('Stack of transformer encoder blocks with full (bidirectional) attention.','Chồng các khối encoder transformer với attention đầy đủ (hai chiều).'),
        L('Pretraining by masked language modeling: hide about 15 percent of tokens and predict them from both sides.','Tiền huấn luyện bằng masked language modeling: che khoảng 15 phần trăm token và dự đoán từ cả hai phía.'),
        L('A special [CLS] token at the start gathers a summary of the sequence.','Token đặc biệt [CLS] ở đầu gom bản tóm tắt của chuỗi.'),
        L('Fine-tune by adding a small head (for example a linear layer on [CLS]) and training on labeled data.','Fine-tune bằng cách thêm head nhỏ (ví dụ tầng tuyến tính trên [CLS]) và huấn luyện trên dữ liệu có nhãn.')],
   input:L('input_ids (B, T) integers from a WordPiece tokenizer, attention_mask (B, T), optional token_type_ids (B, T). T up to 512.','input_ids (B, T) số nguyên từ tokenizer WordPiece, attention_mask (B, T), tùy chọn token_type_ids (B, T). T tối đa 512.'),
   output:L('last_hidden_state (B, T, 768 for BERT-base); pooled [CLS] vector (B, 768); task head logits.','last_hidden_state (B, T, 768 với BERT-base); vector [CLS] gộp (B, 768); logit của head tác vụ.'),
   learned:L('Around 110 million parameters for BERT-base (12 layers, 12 heads, hidden size 768).','Khoảng 110 triệu tham số với BERT-base (12 tầng, 12 head, hidden size 768).'),
   hyper:L('learning rate (about 2e-5 to 5e-5 is common for fine-tuning), batch size, epochs, max sequence length, warmup steps, weight decay.','learning rate (khoảng 2e-5 đến 5e-5 phổ biến khi fine-tune), batch size, epoch, độ dài chuỗi tối đa, warmup steps, weight decay.'),
   use:L('Classification, named entity recognition, semantic search and embedding models. It does not generate free text.','Phân loại, nhận diện thực thể, tìm kiếm ngữ nghĩa và embedding model. Không sinh văn bản tự do.'),
   code:{lang:'python', title:'bert_classify.py (Hugging Face)', code:`
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

name = "bert-base-uncased"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForSequenceClassification.from_pretrained(name, num_labels=2)

batch = tok(["refund not received", "great service"], padding=True, truncation=True,
            max_length=128, return_tensors="pt")     # input_ids, attention_mask: (2, T)
with torch.no_grad():
    logits = model(**batch).logits                   # (2, 2)
probs = logits.softmax(dim=-1)`},
   n:L('Many embedding models used in RAG are BERT-style encoders trained so that similar sentences have nearby vectors. The classification head above is randomly initialized until you fine-tune it.','Nhiều embedding model dùng trong RAG là encoder kiểu BERT, được huấn luyện để câu giống nhau có vector gần nhau. Head phân loại ở trên được khởi tạo ngẫu nhiên cho đến khi bạn fine-tune.') }),

 modelSlide({
   t:L('GPT: decoder-only language models (LLMs)','GPT: mô hình ngôn ngữ chỉ có decoder (LLM)'),
   lead:L('Predict the next token given everything before it. Scaled up and aligned, this single objective powers chat models and agents.','Dự đoán token tiếp theo dựa trên mọi thứ phía trước. Khi mở rộng và căn chỉnh, mục tiêu duy nhất này vận hành model chat và agent.'),
   how:[L('Stack of transformer decoder blocks with a causal mask: each token attends only to earlier tokens.','Chồng các khối decoder transformer với mask nhân quả: mỗi token chỉ chú ý các token trước nó.'),
        L('Pretraining loss: −Σ log p(x_t | x_<t) over a huge text corpus (next-token prediction).','Loss tiền huấn luyện: −Σ log p(x_t | x_<t) trên kho văn bản khổng lồ (dự đoán token kế tiếp).'),
        L('Post-training: supervised instruction tuning, then preference optimization (RLHF or DPO) to follow instructions.','Hậu huấn luyện: instruction tuning có giám sát, rồi tối ưu theo ưu tiên (RLHF hoặc DPO) để làm theo chỉ dẫn.'),
        L('Generation: sample a token from the softmax, append it, repeat. A KV cache avoids recomputing past tokens.','Sinh: lấy mẫu một token từ softmax, nối vào, lặp lại. KV cache tránh tính lại các token trước.')],
   input:L('input_ids (B, T) from a BPE tokenizer, bounded by the context window.','input_ids (B, T) từ tokenizer BPE, bị giới hạn bởi context window.'),
   output:L('logits (B, T, vocab_size); the last position gives the distribution of the next token.','logits (B, T, vocab_size); vị trí cuối cho phân phối của token kế tiếp.'),
   learned:L('Billions of parameters: embeddings, attention and feed-forward weights.','Hàng tỷ tham số: embedding, trọng số attention và feed-forward.'),
   hyper:L('At training: model size, data, learning-rate schedule. At inference: temperature, top_p, top_k, max_tokens, stop sequences.','Khi huấn luyện: kích thước model, dữ liệu, lịch learning rate. Khi suy luận: temperature, top_p, top_k, max_tokens, stop sequence.'),
   use:L('Chat, code, summarization, agents. Can state falsehoods fluently, so ground it with retrieval, tools and evaluation.','Chat, code, tóm tắt, agent. Có thể nói sai một cách trôi chảy, nên cần neo bằng truy xuất, tool và đánh giá.'),
   code:{lang:'python', title:'generate.py (Hugging Face)', code:`
from transformers import AutoModelForCausalLM, AutoTokenizer

tok = AutoTokenizer.from_pretrained("gpt2")
model = AutoModelForCausalLM.from_pretrained("gpt2")

ids = tok("A window function in SQL", return_tensors="pt")   # input_ids: (1, T)
out = model.generate(
    **ids, max_new_tokens=30, do_sample=True, temperature=0.8, top_p=0.9,
)
print(tok.decode(out[0], skip_special_tokens=True))`},
   n:L('Temperature rescales logits before softmax: lower is more deterministic, higher is more varied. top_p keeps the smallest set of tokens whose probabilities sum to p. The small GPT-2 here is only for demonstration.','Temperature co giãn logit trước softmax: thấp thì tất định hơn, cao thì đa dạng hơn. top_p giữ tập token nhỏ nhất có tổng xác suất đạt p. GPT-2 nhỏ ở đây chỉ để minh họa.') }),

 modelSlide({
   t:L('Autoencoder and VAE','Autoencoder và VAE'),
   lead:L('Squeeze data through a narrow bottleneck and learn to rebuild it. The bottleneck becomes a compact representation.','Nén dữ liệu qua một nút cổ chai hẹp và học tái tạo nó. Nút cổ chai trở thành biểu diễn gọn.'),
   how:[L('Encoder maps x to a code z of low dimension; decoder maps z back to x̂.','Encoder ánh xạ x thành mã z ít chiều; decoder ánh xạ z về x̂.'),
        L('Autoencoder loss: reconstruction error, for example ‖x − x̂‖². Large error on new data signals an anomaly.','Loss của autoencoder: sai số tái tạo, ví dụ ‖x − x̂‖². Sai số lớn trên dữ liệu mới là dấu hiệu bất thường.'),
        L('VAE: the encoder outputs a mean μ and log-variance; sample z = μ + σ⊙ε with ε ~ N(0, I) (reparameterization trick).','VAE: encoder xuất trung bình μ và log-variance; lấy mẫu z = μ + σ⊙ε với ε ~ N(0, I) (mẹo reparameterization).'),
        L('VAE loss = reconstruction + β·KL(q(z|x) ‖ N(0, I)). Sampling z from N(0, I) then decoding generates new data.','Loss của VAE = tái tạo + β·KL(q(z|x) ‖ N(0, I)). Lấy mẫu z từ N(0, I) rồi decode sẽ sinh dữ liệu mới.')],
   input:L('x of shape (B, d) or images (B, C, H, W), scaled to a stable range.','x dạng (B, d) hoặc ảnh (B, C, H, W), đã đưa về khoảng ổn định.'),
   output:L('Reconstruction x̂ (same shape as x); latent z (B, d_z); for VAE also μ and logvar (B, d_z).','Bản tái tạo x̂ (cùng dạng với x); latent z (B, d_z); với VAE còn có μ và logvar (B, d_z).'),
   learned:L('Encoder and decoder weights.','Trọng số encoder và decoder.'),
   hyper:L('latent dimension d_z, layer sizes, β (KL weight), learning rate, noise or masking for denoising variants.','chiều latent d_z, kích thước tầng, β (trọng số KL), learning rate, nhiễu hoặc che cho biến thể khử nhiễu.'),
   use:L('Anomaly detection, compression, representation learning, synthetic data. VAE samples tend to be blurry compared with GANs and diffusion.','Phát hiện bất thường, nén, học biểu diễn, dữ liệu tổng hợp. Mẫu VAE thường mờ hơn GAN và diffusion.'),
   code:{lang:'python', title:'vae_loss.py (PyTorch)', code:`
import torch
import torch.nn.functional as F

mu, logvar = enc(x)                                   # (B, d_z) each
z = mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)   # reparameterization
x_hat = dec(z)                                        # same shape as x

recon = F.mse_loss(x_hat, x, reduction="sum")
kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
loss = recon + kl                                     # add a beta factor to tune`},
   n:L('For anomaly detection on tabular or sensor data, train on normal data only and flag rows whose reconstruction error exceeds a threshold chosen on validation data.','Để phát hiện bất thường trên dữ liệu bảng hoặc cảm biến, chỉ huấn luyện trên dữ liệu bình thường và đánh dấu dòng có sai số tái tạo vượt ngưỡng chọn trên dữ liệu validation.') }),

 modelSlide({
   t:L('GAN: generative adversarial network','GAN: mạng sinh đối kháng'),
   lead:L('Two networks compete: a generator forges data, a discriminator tries to spot the forgeries.','Hai mạng cạnh tranh: generator làm giả dữ liệu, discriminator cố phát hiện hàng giả.'),
   how:[L('Generator G maps random noise z ~ N(0, I) to a fake sample G(z).','Generator G ánh xạ nhiễu ngẫu nhiên z ~ N(0, I) thành mẫu giả G(z).'),
        L('Discriminator D outputs the probability that a sample is real.','Discriminator D xuất xác suất một mẫu là thật.'),
        L('Minimax game: min_G max_D E[log D(x)] + E[log(1 − D(G(z)))]. In practice G uses the non-saturating loss −log D(G(z)).','Trò chơi minimax: min_G max_D E[log D(x)] + E[log(1 − D(G(z)))]. Thực tế G dùng loss không bão hòa −log D(G(z)).'),
        L('Alternate updates of D and G. Training is delicate: mode collapse and instability are common.','Luân phiên cập nhật D và G. Huấn luyện mong manh: mode collapse và bất ổn thường gặp.')],
   input:L('G takes noise (B, d_z); D takes real or fake samples (B, d) or (B, C, H, W).','G nhận nhiễu (B, d_z); D nhận mẫu thật hoặc giả (B, d) hoặc (B, C, H, W).'),
   output:L('G: synthetic samples. D: a probability or score (B, 1).','G: mẫu tổng hợp. D: xác suất hoặc điểm (B, 1).'),
   learned:L('Weights of both G and D.','Trọng số của cả G và D.'),
   hyper:L('latent dimension d_z, learning rates (about 2e-4 with Adam β₁ = 0.5 is a classic setting), D/G update ratio, batch size, architecture.','chiều latent d_z, learning rate (khoảng 2e-4 với Adam β₁ = 0.5 là cài đặt kinh điển), tỷ lệ cập nhật D/G, batch size, kiến trúc.'),
   use:L('Realistic images and synthetic tabular data (for example CTGAN). Hard to evaluate and train; diffusion models have largely replaced GANs for images.','Ảnh chân thật và dữ liệu bảng tổng hợp (ví dụ CTGAN). Khó đánh giá và huấn luyện; diffusion đã phần lớn thay GAN cho ảnh.'),
   code:{lang:'python', title:'gan_step.py (PyTorch)', code:`
import torch
import torch.nn.functional as F

# real: (B, d) batch of real samples; G, D, opt_g, opt_d already defined
z = torch.randn(real.size(0), d_z)
fake = G(z)

# discriminator step: real -> 1, fake -> 0
d_loss = (F.binary_cross_entropy_with_logits(D(real), torch.ones(real.size(0), 1))
          + F.binary_cross_entropy_with_logits(D(fake.detach()), torch.zeros(real.size(0), 1)))
opt_d.zero_grad(); d_loss.backward(); opt_d.step()

# generator step: try to make D say "real"
g_loss = F.binary_cross_entropy_with_logits(D(fake), torch.ones(real.size(0), 1))
opt_g.zero_grad(); g_loss.backward(); opt_g.step()`},
   n:L('The detach() call stops the discriminator step from sending gradients into the generator. For synthetic data in analytics, always validate that statistics and privacy properties of the synthetic set are acceptable.','Lệnh detach() ngăn bước discriminator gửi gradient vào generator. Với dữ liệu tổng hợp trong analytics, luôn kiểm chứng thống kê và tính riêng tư của tập tổng hợp là chấp nhận được.') }),

 modelSlide({
   t:L('Diffusion models','Mô hình diffusion'),
   lead:L('Learn to remove noise step by step. Generation starts from pure noise and denoises it into data.','Học cách khử nhiễu từng bước. Việc sinh bắt đầu từ nhiễu thuần và khử nhiễu thành dữ liệu.'),
   how:[L('Forward process: add Gaussian noise over T steps. In closed form x_t = √ᾱ_t·x₀ + √(1 − ᾱ_t)·ε, with ε ~ N(0, I).','Quá trình thuận: thêm nhiễu Gauss qua T bước. Dạng đóng x_t = √ᾱ_t·x₀ + √(1 − ᾱ_t)·ε, với ε ~ N(0, I).'),
        L('Train a network ε_θ(x_t, t) to predict the added noise: loss = ‖ε − ε_θ(x_t, t)‖².','Huấn luyện mạng ε_θ(x_t, t) dự đoán nhiễu đã thêm: loss = ‖ε − ε_θ(x_t, t)‖².'),
        L('Sampling: start from x_T ~ N(0, I) and repeatedly subtract predicted noise down to x₀ (DDPM uses many steps; DDIM and others use fewer).','Lấy mẫu: bắt đầu từ x_T ~ N(0, I) và liên tục trừ nhiễu dự đoán đến x₀ (DDPM dùng nhiều bước; DDIM và các cách khác dùng ít hơn).'),
        L('Conditioning (for example text embeddings) and classifier-free guidance steer the result. Latent diffusion works in a VAE’s compressed space.','Điều kiện hóa (ví dụ text embedding) và classifier-free guidance định hướng kết quả. Latent diffusion hoạt động trong không gian nén của VAE.')],
   input:L('Training: image x₀ (B, C, H, W), timestep t (B,), noise ε (same shape as x₀). Optional condition embedding.','Huấn luyện: ảnh x₀ (B, C, H, W), timestep t (B,), nhiễu ε (cùng dạng x₀). Có thể thêm embedding điều kiện.'),
   output:L('Predicted noise (B, C, H, W) per step; the final sample is an image of the same shape.','Nhiễu dự đoán (B, C, H, W) mỗi bước; mẫu cuối là ảnh cùng dạng.'),
   learned:L('Weights of the denoiser (typically a U-Net or a transformer).','Trọng số của bộ khử nhiễu (thường là U-Net hoặc transformer).'),
   hyper:L('number of steps T, noise schedule β_t (linear or cosine), guidance scale, sampler and number of sampling steps, learning rate.','số bước T, lịch nhiễu β_t (tuyến tính hoặc cosine), guidance scale, sampler và số bước lấy mẫu, learning rate.'),
   use:L('High-quality image, audio and video generation. Sampling is slow compared with a GAN, though faster samplers reduce this.','Sinh ảnh, âm thanh, video chất lượng cao. Lấy mẫu chậm hơn GAN, dù các sampler nhanh hơn giảm bớt điều này.'),
   code:{lang:'python', title:'diffusion_step.py (PyTorch)', code:`
import torch
import torch.nn.functional as F

# x0: (B, C, H, W); alpha_bar: (T,) cumulative product of (1 - beta_t)
t = torch.randint(0, T, (x0.size(0),))
eps = torch.randn_like(x0)
ab = alpha_bar[t].view(-1, 1, 1, 1)
xt = ab.sqrt() * x0 + (1 - ab).sqrt() * eps      # noised sample at step t

loss = F.mse_loss(model(xt, t), eps)             # the network predicts the noise
loss.backward()`},
   n:L('The training step is just regression on noise. That simplicity is a big reason diffusion trains more stably than a GAN.','Bước huấn luyện chỉ là hồi quy trên nhiễu. Sự đơn giản đó là lý do lớn khiến diffusion huấn luyện ổn định hơn GAN.') }),

 modelSlide({
   t:L('Graph neural network (GNN)','Mạng nơ-ron đồ thị (GNN)'),
   lead:L('Learn from nodes and their connections by repeatedly letting each node gather information from its neighbours.','Học từ node và các kết nối của chúng bằng cách liên tục để mỗi node thu thập thông tin từ hàng xóm.'),
   how:[L('Each node starts with a feature vector h_v⁰ = x_v.','Mỗi node bắt đầu bằng vector đặc trưng h_v⁰ = x_v.'),
        L('Message passing: h_v^(l+1) = σ(W · AGG({h_u : u ∈ N(v)} ∪ {h_v})), where AGG is a sum, mean, max or attention.','Truyền thông điệp: h_v^(l+1) = σ(W · AGG({h_u : u ∈ N(v)} ∪ {h_v})), với AGG là tổng, trung bình, max hoặc attention.'),
        L('GCN: H′ = σ(D^−½ (A + I) D^−½ · H · W) using the normalized adjacency matrix. GraphSAGE samples neighbours; GAT learns attention weights.','GCN: H′ = σ(D^−½ (A + I) D^−½ · H · W) dùng ma trận kề đã chuẩn hóa. GraphSAGE lấy mẫu hàng xóm; GAT học trọng số attention.'),
        L('After L layers a node knows its L-hop neighbourhood. Read out node, edge or whole-graph predictions.','Sau L tầng, node biết vùng lân cận L bước. Đọc ra dự đoán cho node, cạnh hoặc cả graph.')],
   input:L('Node features x (N, F); edge_index (2, E) listing source and target node ids; optional edge features and labels.','Đặc trưng node x (N, F); edge_index (2, E) liệt kê id node nguồn và đích; có thể thêm đặc trưng cạnh và nhãn.'),
   output:L('Node embeddings or logits (N, n_classes); for link prediction, a score per node pair.','Embedding hoặc logit của node (N, n_classes); với dự đoán liên kết, một điểm cho mỗi cặp node.'),
   learned:L('Weight matrices W per layer (shared across nodes).','Ma trận trọng số W mỗi tầng (chia sẻ giữa các node).'),
   hyper:L('number of layers (depth), hidden size, aggregator, neighbour sampling size, dropout, learning rate.','số tầng (độ sâu), hidden size, aggregator, kích thước lấy mẫu hàng xóm, dropout, learning rate.'),
   use:L('Fraud rings, recommendations, molecules, lineage and knowledge graphs. Too many layers over-smooth node features; very large graphs need sampling.','Vòng gian lận, gợi ý, phân tử, lineage và knowledge graph. Quá nhiều tầng làm đặc trưng node bị over-smoothing; graph rất lớn cần lấy mẫu.'),
   code:{lang:'python', title:'gcn.py (PyTorch Geometric)', code:`
import torch
from torch_geometric.nn import GCNConv


class GCN(torch.nn.Module):
    def __init__(self, f_in: int, f_hidden: int, n_classes: int):
        super().__init__()
        self.conv1 = GCNConv(f_in, f_hidden)
        self.conv2 = GCNConv(f_hidden, n_classes)

    def forward(self, x, edge_index):             # x: (N, F), edge_index: (2, E)
        x = torch.relu(self.conv1(x, edge_index))  # (N, f_hidden)
        return self.conv2(x, edge_index)           # (N, n_classes) logits`},
   n:L('Connect this to section 15: a lineage or knowledge graph is the input structure, and a GNN is one way to learn from it. Many problems are solved well enough by graph features fed into gradient boosting.','Nối với phần 15: graph lineage hoặc knowledge graph là cấu trúc đầu vào, và GNN là một cách học từ nó. Nhiều bài toán đã giải đủ tốt bằng đặc trưng graph đưa vào gradient boosting.') }),

 { k:'table', t:L('Decision guide: which model for which problem?','Hướng dẫn quyết định: model nào cho bài toán nào?'),
   head:[L('Problem and data','Bài toán và dữ liệu'), L('Start with','Bắt đầu với'), L('Then try','Sau đó thử'), L('Avoid when','Tránh khi')], rows:[
   [L('Tabular prediction (churn, price, risk)','Dự đoán dữ liệu bảng (churn, giá, rủi ro)'), L('Logistic or linear baseline','Baseline logistic hoặc tuyến tính'), L('Gradient boosting (XGBoost, LightGBM)','Gradient boosting (XGBoost, LightGBM)'), L('Using a deep network without a strong reason','Dùng mạng sâu mà không có lý do mạnh')],
   [L('Segmenting customers, no labels','Phân khúc khách hàng, không nhãn'), L('Scaled features, k-means','Đặc trưng đã chuẩn hóa, k-means'), L('PCA first, then clustering','PCA trước, rồi gom cụm'), L('Skipping scaling or cluster profiling','Bỏ qua chuẩn hóa hoặc mô tả cụm')],
   [L('Text classification or semantic search','Phân loại văn bản hoặc tìm kiếm ngữ nghĩa'), L('TF-IDF + logistic regression','TF-IDF + hồi quy logistic'), L('BERT-style encoder or embedding model','Encoder kiểu BERT hoặc embedding model'), L('Training a transformer from scratch','Huấn luyện transformer từ đầu')],
   [L('Free-form text generation, assistants','Sinh văn bản tự do, trợ lý'), L('A hosted LLM with RAG and tools','LLM được host cùng RAG và tool'), L('Fine-tuning only after evals show a gap','Chỉ fine-tune sau khi eval cho thấy khoảng trống'), L('Relying on the model’s memory for facts','Dựa vào trí nhớ của model cho sự kiện')],
   [L('Images, audio','Ảnh, âm thanh'), L('Pretrained CNN or vision transformer','CNN hoặc vision transformer đã huấn luyện sẵn'), L('Fine-tune on your labeled data','Fine-tune trên dữ liệu có nhãn của bạn'), L('Tiny datasets without augmentation','Dữ liệu rất nhỏ không có augmentation')],
   [L('Time series forecasting','Dự báo chuỗi thời gian'), L('Seasonal naive and simple baselines','Seasonal naive và baseline đơn giản'), L('Gradient boosting on lag features, then sequence models','Gradient boosting trên đặc trưng lag, rồi model chuỗi'), L('Random train/test splits (leaks the future)','Chia train/test ngẫu nhiên (rò rỉ tương lai)')],
   [L('Anomaly detection','Phát hiện bất thường'), L('Statistical thresholds, isolation forest','Ngưỡng thống kê, isolation forest'), L('Autoencoder on normal data','Autoencoder trên dữ liệu bình thường'), L('Labels are unreliable and unvalidated','Nhãn không đáng tin và chưa kiểm chứng')],
   [L('Relationship-heavy data (fraud, recommendations)','Dữ liệu nhiều quan hệ (gian lận, gợi ý)'), L('Graph features into gradient boosting','Đặc trưng graph đưa vào gradient boosting'), L('GNN when relations are the signal','GNN khi quan hệ là tín hiệu chính'), L('A graph so sparse it adds no information','Graph quá thưa, không thêm thông tin')]
  ], cap:L('Rule: earn the right to complexity. Each step up must beat the previous baseline on held-out data and justify its cost to run, explain and monitor.','Quy tắc: phải “xứng đáng” mới được phức tạp hơn. Mỗi bước nâng cấp phải thắng baseline trước trên dữ liệu giữ lại và biện minh được chi phí chạy, giải thích và giám sát.'),
   n:L('Use this as the decision guide in design reviews. The rightmost column is where real projects go wrong.','Dùng làm hướng dẫn quyết định trong buổi review thiết kế. Cột phải là nơi các dự án thật hay sai.') },

 { k:'pit', t:L('Common pitfalls and anti-patterns','Lỗi thường gặp và anti-pattern'), rows:[
   {bad:L('Data leakage.','Rò rỉ dữ liệu.'), why:L('Future or label-derived features inflate offline scores.','Đặc trưng từ tương lai hoặc suy ra từ nhãn làm điểm offline phồng lên.'), fix:L('Split by time or entity first, then build features using only past data.','Chia theo thời gian hoặc thực thể trước, rồi tạo đặc trưng chỉ từ dữ liệu quá khứ.')},
   {bad:L('Tuning on the test set.','Tinh chỉnh trên tập test.'), why:L('Test performance becomes optimistic.','Hiệu năng test trở nên lạc quan.'), fix:L('Tune on validation or cross-validation; touch the test set once.','Tinh chỉnh trên validation hoặc cross-validation; chỉ chạm tập test một lần.')},
   {bad:L('Accuracy on imbalanced data.','Dùng accuracy với dữ liệu mất cân bằng.'), why:L('A model that predicts the majority class looks great.','Model luôn đoán lớp đa số trông rất tốt.'), fix:L('Use precision, recall, PR-AUC and a threshold chosen by cost.','Dùng precision, recall, PR-AUC và ngưỡng chọn theo chi phí.')},
   {bad:L('Skipping the simple baseline.','Bỏ qua baseline đơn giản.'), why:L('You cannot tell if the complex model helps.','Không biết model phức tạp có giúp được không.'), fix:L('Always report a linear or naive baseline next to the model.','Luôn báo cáo baseline tuyến tính hoặc naive bên cạnh model.')},
   {bad:L('Forgetting to scale or encode.','Quên chuẩn hóa hoặc mã hóa.'), why:L('Distance-based and gradient-based models misbehave.','Model dựa trên khoảng cách và gradient hoạt động sai.'), fix:L('Put scaling and encoding inside a pipeline fitted on train only.','Đưa chuẩn hóa và mã hóa vào pipeline chỉ fit trên train.')},
   {bad:L('Ignoring drift after deployment.','Bỏ qua drift sau khi triển khai.'), why:L('Data changes and quality decays silently.','Dữ liệu đổi và chất lượng giảm âm thầm.'), fix:L('Monitor input distributions and outcomes; retrain on a schedule or trigger.','Giám sát phân phối đầu vào và kết quả; huấn luyện lại theo lịch hoặc điều kiện.')}
  ], n:L('Leakage is the most common and most expensive mistake: it makes a useless model look excellent until production.','Rò rỉ dữ liệu là lỗi phổ biến và đắt giá nhất: nó khiến model vô dụng trông xuất sắc cho đến khi lên production.') },

 { k:'cards', cols:3, t:L('What senior looks like: models and ML','Senior trông như thế nào: model và ML'),
   cards:[
    {h:L('Decisions','Quyết định'), tag:'senior', list:[L('Simple model or complex model','Model đơn giản hay phức tạp'), L('Build, fine-tune or call a hosted model','Tự xây, fine-tune hay gọi model được host'), L('Which metric reflects the business cost','Chỉ số nào phản ánh chi phí nghiệp vụ')]},
    {h:L('Trade-offs','Đánh đổi'), tag:'senior', list:[L('Accuracy versus interpretability','Độ chính xác và khả năng giải thích'), L('Training cost versus serving cost','Chi phí huấn luyện và chi phí phục vụ'), L('Fresh models versus stability','Model mới và sự ổn định')]},
    {h:L('Responsibilities','Trách nhiệm'), tag:'senior', list:[L('Prevent leakage with sound splits and pipelines','Ngăn rò rỉ bằng cách chia và pipeline đúng'), L('Provide reliable features and labels','Cung cấp đặc trưng và nhãn đáng tin'), L('Monitor models in production','Giám sát model ở production')]}
   ],
   n:L('An analytics engineer is rarely the one inventing models. The value is trustworthy data, correct evaluation, and a team that knows when a simpler model is enough.','Analytics engineer hiếm khi là người phát minh model. Giá trị nằm ở dữ liệu đáng tin, đánh giá đúng, và một đội biết khi nào model đơn giản là đủ.') },

 { k:'check', t:L('Checklist and interview questions','Checklist và câu hỏi phỏng vấn'),
   left:{h:L('Self-check','Tự kiểm tra'), items:[L('I can state the loss and update rule for linear regression','Tôi nêu được loss và quy tắc cập nhật của hồi quy tuyến tính'), L('I can explain bagging versus boosting','Tôi giải thích được bagging và boosting'), L('I know the tensor shapes entering a CNN, LSTM and transformer','Tôi biết hình dạng tensor đi vào CNN, LSTM và transformer'), L('I can write scaled dot-product attention','Tôi viết được scaled dot-product attention'), L('I can separate parameters from hyperparameters','Tôi phân biệt được tham số và siêu tham số'), L('I split data to avoid leakage','Tôi chia dữ liệu để tránh rò rỉ')]},
   right:{h:L('Interview-style questions','Câu hỏi kiểu phỏng vấn'), items:[L('Why does a random forest reduce variance while boosting reduces bias?','Vì sao random forest giảm variance còn boosting giảm bias?'), L('Why divide attention scores by √d_k?','Vì sao chia điểm attention cho √d_k?'), L('What is the difference between BERT and GPT, in training objective and in use?','BERT và GPT khác nhau thế nào về mục tiêu huấn luyện và cách dùng?'), L('How would you detect anomalies in sensor data with an autoencoder?','Bạn phát hiện bất thường trong dữ liệu cảm biến bằng autoencoder thế nào?'), L('Your model scores 0.98 AUC offline and fails in production. What do you check first?','Model đạt AUC 0.98 offline nhưng thất bại ở production. Bạn kiểm tra gì đầu tiên?')]},
   n:L('For the last question, strong candidates start with leakage and train/serve skew before touching the model.','Với câu hỏi cuối, ứng viên giỏi bắt đầu từ rò rỉ dữ liệu và lệch train/serve trước khi đụng đến model.') }
]);

"use strict";

/* ---------- diagrams ---------- */
function netSVG(){
  var s = bx(10, 60, 150, 70, L('Users, SaaS','Người dùng, SaaS'), L('internet','internet'), '#7A869F');
  s += bx(10, 260, 150, 70, L('Corporate network','Mạng công ty'), L('VPN / Direct Connect','VPN / Direct Connect'), '#7A869F');
  s += '<rect class="bx2" x="200" y="20" width="790" height="350" rx="12"/>' + txt(216, 44, L('Cloud account: one VPC, several subnets','Tài khoản cloud: một VPC, nhiều subnet'), 'b');
  s += bx(230, 60, 230, 110, L('Public subnet','Subnet công khai'), L('WAF, load balancer,|NAT gateway for egress','WAF, load balancer,|NAT gateway cho egress'), '#B91C1C');
  s += bx(230, 200, 230, 140, L('Private subnet: compute','Subnet riêng: compute'), L('Airflow, Spark, dbt jobs|no public IPs|egress only to the data tier','Airflow, Spark, dbt job|không có IP công khai|egress chỉ tới tầng dữ liệu'), '#B91C1C');
  s += bx(510, 200, 210, 140, L('Private subnet: data','Subnet riêng: dữ liệu'), L('databases, Kafka brokers|security group: only|compute may connect','database, Kafka broker|security group: chỉ|compute được kết nối'), '#B91C1C');
  s += bx(760, 60, 210, 110, L('Private endpoints','Private endpoint'), L('object storage, KMS,|secrets, warehouse|via PrivateLink','object storage, KMS,|secrets, warehouse|qua PrivateLink'), '#B91C1C');
  s += bx(760, 200, 210, 140, L('Managed services','Dịch vụ managed'), L('warehouse, KMS,|secrets manager|private DNS names','warehouse, KMS,|secrets manager|tên DNS riêng'), '#475569');
  s += arrow(162, 95, 228, 95) + arrow(345, 172, 345, 198) + arrow(462, 270, 508, 270) + arrow(162, 295, 228, 295) + arrow(462, 225, 758, 130) + arrow(865, 172, 865, 198);
  s += txt(500, 120, L('TLS everywhere; flow logs and audit logs go to a central account','TLS ở mọi nơi; flow log và audit log gửi về tài khoản trung tâm'), 'sm');
  return svg(1000, 384, s, 'Network architecture');
}
function quorumSVG(){
  var s = bx(10, 70, 110, 80, L('Client','Client'), L('write','ghi'), '#0E7490');
  s += bx(190, 40, 150, 80, L('Leader','Leader'), L('orders all writes','sắp xếp mọi lệnh ghi'), '#0E7490');
  s += bx(420, 10, 150, 60, L('Follower 1','Follower 1'), '', '#475569') + bx(420, 90, 150, 60, L('Follower 2','Follower 2'), '', '#475569');
  s += arrow(122, 100, 188, 90) + arrow(342, 75, 418, 45) + arrow(342, 90, 418, 120);
  s += txt(350, 14, L('replicate log','sao chép log'), 'sm');
  s += bx(620, 10, 370, 140, L('Quorum rule','Quy tắc quorum'), L('N replicas, write quorum W, read quorum R|R + W > N: a read overlaps the latest write|majority quorum: W = R = floor(N / 2) + 1|3 replicas tolerate 1 failure; 5 tolerate 2','N bản sao, quorum ghi W, quorum đọc R|R + W > N: lần đọc luôn gặp lần ghi mới nhất|quorum đa số: W = R = floor(N / 2) + 1|3 bản sao chịu 1 lỗi; 5 bản sao chịu 2'), '#0E7490', 'bx2');
  s += txt(10, 214, L('Leader election (Raft style)','Bầu leader (kiểu Raft)'), 'lg');
  s += bx(10, 230, 220, 90, L('Follower','Follower'), L('hears leader heartbeats','nghe heartbeat của leader'), '#475569');
  s += bx(300, 230, 220, 90, L('Candidate','Candidate'), L('heartbeat timeout: term + 1,|asks for votes','hết hạn heartbeat: term + 1,|xin phiếu bầu'), '#0E7490');
  s += bx(590, 230, 220, 90, L('Leader','Leader'), L('wins a majority of votes,|sends heartbeats','thắng đa số phiếu,|gửi heartbeat'), '#0E7490');
  s += arrow(232, 275, 298, 275) + arrow(522, 275, 588, 275);
  s += txt(840, 270, L('a higher term seen:','thấy term cao hơn:'), 'sm') + txt(840, 288, L('step down to follower','hạ xuống follower'), 'sm');
  return svg(1000, 344, s, 'Replication and leader election');
}

/* ---------- 17. SECURITY AND NETWORKING ---------- */
SEC(17, [
 { k:'cards', cols:3, t:L('Security and networking: protect the platform and its data','Bảo mật và mạng: bảo vệ nền tảng và dữ liệu'),
   lead:L('A data platform concentrates the most valuable data in the company. Security is not a final review: identity, network, encryption and audit are designed in from the start.','Data platform tập trung dữ liệu quý nhất của công ty. Bảo mật không phải bước review cuối: danh tính, mạng, mã hóa và audit phải được thiết kế từ đầu.'),
   cards:[
    {h:L('Identity and access','Danh tính và truy cập'), tag:'must', p:L('IAM, RBAC and ABAC, service accounts and workload identity. Humans use SSO; workloads use short-lived credentials.','IAM, RBAC và ABAC, service account và workload identity. Con người dùng SSO; workload dùng credential ngắn hạn.')},
    {h:L('Network isolation','Cô lập mạng'), tag:'must', p:L('VPC, subnets, routing, DNS, firewalls and private endpoints keep data off the public internet.','VPC, subnet, routing, DNS, firewall và private endpoint giữ dữ liệu khỏi internet công cộng.')},
    {h:L('Encryption','Mã hóa'), tag:'must', p:L('TLS in transit, encryption at rest with keys in a KMS, and key rotation.','TLS khi truyền, mã hóa khi lưu với khóa trong KMS, và xoay khóa.')},
    {h:L('Secrets management','Quản lý secret'), tag:'must', p:L('No secrets in Git or images. Use a secrets manager, rotation and short-lived tokens.','Không để secret trong Git hay image. Dùng secrets manager, xoay vòng và token ngắn hạn.')},
    {h:L('Data-level controls','Kiểm soát cấp dữ liệu'), tag:'senior', p:L('Row-level and column-level security, masking, tokenization and classification tags.','Row-level và column-level security, masking, tokenization và tag phân loại.')},
    {h:L('Zero trust, audit, compliance','Zero trust, audit, tuân thủ'), tag:'senior', p:L('Verify every request, log access, threat-model pipelines, and honour GDPR, residency, retention and deletion.','Xác minh mọi yêu cầu, log truy cập, threat model cho pipeline, và tuân thủ GDPR, residency, retention, xóa dữ liệu.')}
   ],
   n:L('Frame security as layers: who you are, where you can connect from, what you can read, and what is recorded. Weakness in any one layer is the one attackers use.','Trình bày bảo mật như các lớp: bạn là ai, kết nối từ đâu, đọc được gì và điều gì được ghi lại. Lớp yếu nhất là lớp kẻ tấn công dùng.') },

 { k:'table', t:L('Tool landscape: identity, keys, secrets and private connectivity','Bức tranh công cụ: danh tính, khóa, secret và kết nối riêng'),
   head:['Tool','Type','Best for','Strengths','Limitations','Pricing model'],
   rows:[
   ['AWS IAM / IAM Identity Center',L('Cloud identity and access','Danh tính và truy cập cloud'),L('AWS-centric platforms with SSO','Nền tảng thiên về AWS có SSO'),L('Fine-grained policies, roles, short-lived credentials','Policy chi tiết, role, credential ngắn hạn'),L('Policy language is complex; easy to over-permit','Ngôn ngữ policy phức tạp; dễ cấp quá quyền'),L('IAM is free; you pay for used services','IAM miễn phí; trả tiền cho dịch vụ dùng')],
   ['Microsoft Entra ID',L('Identity provider and managed identities','Identity provider và managed identity'),L('Microsoft and Azure estates','Hệ sinh thái Microsoft và Azure'),L('SSO, conditional access, managed identities for workloads','SSO, conditional access, managed identity cho workload'),L('Licensing tiers gate advanced features','Gói license giới hạn tính năng nâng cao'),L('Per-user licensing tiers','Theo gói license mỗi người dùng')],
   ['GCP IAM / Workload Identity Federation',L('Cloud identity and access','Danh tính và truy cập cloud'),L('GCP and multi-cloud CI/CD','GCP và CI/CD đa cloud'),L('Federation removes long-lived keys','Federation loại bỏ khóa dài hạn'),L('Many predefined roles; custom roles need care','Nhiều role dựng sẵn; role tùy biến cần cẩn thận'),L('IAM is free; you pay for used services','IAM miễn phí; trả tiền cho dịch vụ dùng')],
   ['HashiCorp Vault / cloud secrets managers',L('Secrets management','Quản lý secret'),L('Central secrets, dynamic credentials','Secret tập trung, credential động'),L('Rotation, leases, audit; dynamic database credentials','Xoay vòng, lease, audit; credential database động'),L('Vault needs operating; cloud managers are cloud-specific','Vault cần vận hành; managed của cloud gắn với từng cloud'),L('Open source or enterprise; cloud managers priced per secret and call','Mã nguồn mở hoặc enterprise; managed của cloud tính theo secret và lượt gọi')],
   ['AWS KMS / Azure Key Vault / Cloud KMS',L('Key management','Quản lý khóa'),L('Encryption keys, envelope encryption','Khóa mã hóa, envelope encryption'),L('Managed, audited, integrated with storage and warehouses','Managed, có audit, tích hợp storage và warehouse'),L('Key policy mistakes can lock you out','Sai key policy có thể khóa chính bạn'),L('Per key and per request','Theo khóa và theo request')],
   ['PrivateLink / Private Link / Private Service Connect',L('Private connectivity','Kết nối riêng'),L('Reaching managed services without public internet','Truy cập dịch vụ managed không qua internet công cộng'),L('Traffic stays on the provider network','Lưu lượng ở lại mạng của nhà cung cấp'),L('DNS and routing setup is error-prone','Cấu hình DNS và routing dễ sai'),L('Per endpoint-hour and per GB','Theo giờ endpoint và theo GB')],
   ['OPA / policy as code',L('Policy engine','Policy engine'),L('Consistent rules in CI and Kubernetes admission','Quy tắc nhất quán trong CI và Kubernetes admission'),L('Policies are versioned and testable','Policy có version và test được'),L('Another language and service to run','Thêm ngôn ngữ và dịch vụ phải vận hành'),L('Open source; managed options exist','Mã nguồn mở; có bản managed')]
  ], cap:L('Pick one identity provider and one secrets approach and use them everywhere. Mixed approaches are where audits fail.','Chọn một identity provider và một cách quản lý secret rồi dùng ở mọi nơi. Cách làm lẫn lộn là nơi audit thất bại.'),
   n:L('Do not read every row. The point: identity, keys, secrets and private connectivity each have a managed option in every cloud, so the decision is consistency, not capability.','Đừng đọc từng dòng. Ý chính: danh tính, khóa, secret và kết nối riêng đều có lựa chọn managed ở mọi cloud, nên quyết định nằm ở sự nhất quán, không phải khả năng.') },

 { k:'svg', t:L('Network architecture for a data platform','Kiến trúc mạng cho data platform'),
   lead:L('Put compute and data in private subnets, reach managed services through private endpoints, and expose only what must be public.','Đặt compute và dữ liệu trong subnet riêng, truy cập dịch vụ managed qua private endpoint, và chỉ công khai thứ bắt buộc.'),
   svg:netSVG,
   cap:L('Security groups act as per-tier firewalls: allow compute to reach data, never the reverse, and never data to the internet.','Security group là firewall theo từng tầng: cho compute truy cập dữ liệu, không bao giờ ngược lại, và không bao giờ cho dữ liệu ra internet.'),
   n:L('Trace a request: a user hits the load balancer in the public subnet, jobs run in private compute, they read data in the private data tier, and talk to the warehouse or storage only through private endpoints. DNS must resolve those names to private addresses, a frequent source of outages.','Theo dấu một yêu cầu: người dùng vào load balancer ở subnet công khai, job chạy ở compute riêng, đọc dữ liệu ở tầng dữ liệu riêng và chỉ nói chuyện với warehouse hoặc storage qua private endpoint. DNS phải phân giải các tên đó ra địa chỉ riêng, nguồn gây sự cố thường gặp.') },

 { k:'code', t:L('Least-privilege access in code','Quyền tối thiểu bằng code'),
   lead:L('Grant exactly the prefix and key a job needs, force TLS, and give pods a role instead of a key.','Chỉ cấp đúng prefix và khóa mà job cần, ép dùng TLS, và cho pod một role thay vì một khóa.'),
   blocks:[
    {lang:'json', title:'iam-policy.json (read curated data only)', code:`
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadCuratedObjects",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::example-lake/curated/*"
    },
    {
      "Sid": "ListCuratedPrefix",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::example-lake",
      "Condition": {"StringLike": {"s3:prefix": ["curated/*"]}}
    },
    {
      "Sid": "DecryptWithLakeKey",
      "Effect": "Allow",
      "Action": ["kms:Decrypt"],
      "Resource": "arn:aws:kms:ap-southeast-1:111122223333:key/EXAMPLE-KEY-ID"
    }
  ]
}`},
    {lang:'json', title:'bucket-policy.json (deny non-TLS access)', code:`
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::example-lake", "arn:aws:s3:::example-lake/*"],
      "Condition": {"Bool": {"aws:SecureTransport": "false"}}
    }
  ]
}`},
    {lang:'yaml', title:'serviceaccount.yaml (workload identity on EKS)', code:`
apiVersion: v1
kind: ServiceAccount
metadata:
  name: spark-etl
  namespace: data-jobs
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::111122223333:role/spark-etl-curated-read`}
   ],
   points:[
    {h:L('Allow lists, not wildcards','Allow list, không dùng wildcard'), p:L('Name the actions, the resource prefix and the key. `s3:*` on `*` is a finding waiting to happen.','Nêu rõ hành động, prefix tài nguyên và khóa. `s3:*` trên `*` là một phát hiện lỗi đang chờ xảy ra.')},
    {h:L('Roles over keys','Role thay vì khóa'), tag:'senior', p:L('Pods and CI jobs assume a role with short-lived credentials. No access keys on disk.','Pod và job CI assume một role với credential ngắn hạn. Không để access key trên đĩa.')},
    {h:L('Separate read and write roles','Tách role đọc và ghi'), p:L('Analysts and agents read curated data. Only pipelines write, and only to their own prefix.','Analyst và agent đọc dữ liệu curated. Chỉ pipeline được ghi, và chỉ vào prefix của riêng nó.')},
    {h:L('Test the policy','Test policy'), tag:'senior', p:L('Use a policy simulator or access analyzer and review changes in pull requests.','Dùng policy simulator hoặc access analyzer và review thay đổi trong pull request.')}
   ],
   n:L('The account ID, bucket and key ARN are placeholders. The ideas port to any cloud: narrow actions, narrow resources, workload identity, and enforced TLS.','Account ID, bucket và key ARN chỉ là chỗ giữ chỗ. Ý tưởng áp dụng cho mọi cloud: hành động hẹp, tài nguyên hẹp, workload identity và ép TLS.') },

 { k:'html', t:L('Encryption and secrets management','Mã hóa và quản lý secret'),
   lead:L('Encrypt in transit and at rest, keep keys separate from data, and never let a long-lived secret reach a repository.','Mã hóa khi truyền và khi lưu, giữ khóa tách khỏi dữ liệu, và không để secret dài hạn lọt vào repository.'),
   html:function(){
     var c = [
      [L('Envelope encryption','Envelope encryption'), L('Data is encrypted with a data key. The data key is encrypted by a master key in the KMS. Rotating the master key does not require re-encrypting all data.','Dữ liệu được mã hóa bằng data key. Data key được mã hóa bằng master key trong KMS. Xoay master key không cần mã hóa lại toàn bộ dữ liệu.')],
      [L('In transit','Khi truyền'), L('TLS between every pair of components, including Kafka brokers, databases and BI connections. Verify certificates.','TLS giữa mọi cặp thành phần, kể cả Kafka broker, database và kết nối BI. Hãy xác minh chứng chỉ.')],
      [L('Customer-managed keys','Khóa do khách hàng quản lý'), L('Use them where policy requires control over revocation. They add operational risk: a deleted key means unreadable data.','Dùng khi chính sách yêu cầu quyền thu hồi. Chúng thêm rủi ro vận hành: xóa khóa nghĩa là dữ liệu không đọc được.')],
      [L('Rotation and expiry','Xoay vòng và hết hạn'), L('Rotate secrets and keys on a schedule and on suspected exposure. Prefer credentials that expire in minutes or hours.','Xoay secret và khóa theo lịch và khi nghi bị lộ. Ưu tiên credential hết hạn sau vài phút hoặc vài giờ.')]
     ];
     var code = codeBlock({lang:'python', title:'read_secret.py (AWS Secrets Manager)', code:`
import json

import boto3

client = boto3.client("secretsmanager", region_name="ap-southeast-1")
response = client.get_secret_value(SecretId="prod/warehouse/dbt")
secret = json.loads(response["SecretString"])

# Use the values in memory. Never print them, log them or write them to disk.
connection = {"user": secret["user"], "password": secret["password"]}`});
     return '<div class="grid c2" style="margin-bottom:14px">' + c.map(function(x){ return cardHTML({h:x[0], p:x[1]}, true); }).join('') + '</div>' + code;
   },
   n:L('Add a scanning step (secret scanning in the repository host and a pre-commit hook) so that accidental commits are blocked before they leave a laptop. Rotation after a leak is mandatory, even if the commit is later deleted.','Thêm bước quét (secret scanning ở nơi host repo và pre-commit hook) để commit nhầm bị chặn trước khi rời máy. Xoay secret sau khi lộ là bắt buộc, kể cả khi commit đã bị xóa.') },

 { k:'table', t:L('Data-level controls and privacy by layer','Kiểm soát cấp dữ liệu và quyền riêng tư theo lớp'),
   head:[L('Control','Kiểm soát'), L('Where it is enforced','Thực thi ở đâu'), L('Example','Ví dụ'), L('Watch out for','Cần lưu ý')], rows:[
   [L('Row-level security','Row-level security'), L('Warehouse or catalog policy','Policy của warehouse hoặc catalog'), L('Regional analysts see only their region','Analyst theo khu vực chỉ thấy khu vực của mình'), L('Policy joins slow queries; test performance','Policy có join làm chậm query; hãy test hiệu năng')],
   [L('Column-level security and masking','Column-level security và masking'), L('Warehouse or catalog policy','Policy của warehouse hoặc catalog'), L('Email masked unless role has PII access','Email bị che trừ khi role có quyền PII'), L('Copies of the column elsewhere bypass the policy','Bản sao của cột ở nơi khác sẽ vượt qua policy')],
   [L('Tokenization / pseudonymization','Tokenization / pseudonymization'), L('Ingestion or a token service','Ingestion hoặc dịch vụ token'), L('Replace customer ID with a keyed hash','Thay customer ID bằng hash có khóa'), L('Linkable data may still count as personal data','Dữ liệu liên kết được vẫn có thể là dữ liệu cá nhân')],
   [L('Classification tags','Tag phân loại'), L('Catalog, propagated by lineage','Catalog, lan truyền theo lineage'), L('PII tag flows to downstream columns','Tag PII chảy tới các cột phía sau'), L('Manual tagging drifts; automate detection','Tag thủ công sẽ lệch; hãy tự động hóa phát hiện')],
   [L('Retention and deletion','Lưu giữ và xóa'), L('Lifecycle rules, deletion jobs','Lifecycle rule, job xóa'), L('Delete a user across tables, backups and logs','Xóa một người dùng khỏi bảng, backup và log'), L('Backups and derived tables are forgotten','Backup và bảng dẫn xuất bị quên')],
   [L('Residency','Residency'), L('Region and replication choices','Lựa chọn vùng và replication'), L('EU data stays in EU regions','Dữ liệu EU ở lại vùng EU'), L('Cross-region replication and support access','Replication liên vùng và truy cập hỗ trợ')]
  ], cap:L('This is engineering orientation, not legal advice. Work with security and legal teams for obligations in your jurisdiction.','Đây là định hướng kỹ thuật, không phải tư vấn pháp lý. Hãy làm việc với đội bảo mật và pháp chế về nghĩa vụ tại nơi bạn hoạt động.'),
   n:L('Connect to section 9 (governance): tags drive policies, policies enforce controls, and audit logs prove it. Deletion is the hardest because derived data and backups are easy to miss.','Nối với phần 9 (quản trị): tag điều khiển policy, policy thực thi kiểm soát, và audit log chứng minh. Xóa dữ liệu là khó nhất vì dữ liệu dẫn xuất và backup dễ bị bỏ sót.') },

 { k:'table', t:L('Threat modeling a pipeline with STRIDE','Threat modeling một pipeline bằng STRIDE'),
   lead:L('Draw the data flow, mark trust boundaries, and ask the six STRIDE questions at each boundary.','Vẽ luồng dữ liệu, đánh dấu ranh giới tin cậy, và hỏi sáu câu STRIDE tại mỗi ranh giới.'),
   head:[L('Threat','Mối đe dọa'), L('In a data platform','Trong data platform'), L('Mitigation','Biện pháp')], rows:[
   [L('Spoofing','Giả mạo'), L('A stolen token calls the warehouse API','Token bị đánh cắp gọi API warehouse'), L('SSO, MFA, short-lived tokens, workload identity','SSO, MFA, token ngắn hạn, workload identity')],
   [L('Tampering','Làm sai lệch'), L('Someone edits raw files or a model definition','Ai đó sửa file raw hoặc định nghĩa model'), L('Immutable raw, versioned code, review, checksums','Raw bất biến, code có version, review, checksum')],
   [L('Repudiation','Chối bỏ'), L('No record of who exported a table','Không có bản ghi ai đã xuất bảng'), L('Audit logs, query history, retained centrally','Audit log, lịch sử query, lưu tập trung')],
   [L('Information disclosure','Lộ thông tin'), L('PII appears in logs, notebooks or an LLM prompt','PII xuất hiện trong log, notebook hoặc prompt LLM'), L('Masking, redaction, least privilege, egress controls','Masking, che dữ liệu, quyền tối thiểu, kiểm soát egress')],
   [L('Denial of service','Từ chối dịch vụ'), L('A runaway query or a flood exhausts capacity','Query chạy mãi hoặc lưu lượng tràn làm cạn năng lực'), L('Quotas, timeouts, workload isolation, rate limits','Quota, timeout, cô lập workload, rate limit')],
   [L('Elevation of privilege','Leo thang đặc quyền'), L('A job role can edit IAM or read all buckets','Role của job sửa được IAM hoặc đọc mọi bucket'), L('Permission boundaries, separation of duties, policy checks','Permission boundary, tách nhiệm vụ, kiểm tra policy')]
  ], cap:L('Zero trust in practice: authenticate and authorize every request, assume breach, log everything that matters, and limit blast radius.','Zero trust trong thực tế: xác thực và phân quyền mọi yêu cầu, giả định đã bị xâm nhập, log mọi thứ quan trọng và giới hạn phạm vi ảnh hưởng.'),
   n:L('Run this as a one-hour workshop on a single pipeline. The output is a short list of mitigations with owners, not a long report.','Chạy như một workshop một giờ cho một pipeline. Kết quả là danh sách ngắn các biện pháp có người chịu trách nhiệm, không phải báo cáo dài.') },

 { k:'pit', t:L('Common pitfalls and anti-patterns','Lỗi thường gặp và anti-pattern'), rows:[
   {bad:L('Shared admin credentials.','Dùng chung credential admin.'), why:L('No accountability and no revocation path.','Không quy được trách nhiệm và không có đường thu hồi.'), fix:L('Individual SSO identities and role-based access.','Danh tính SSO riêng từng người và truy cập theo role.')},
   {bad:L('Public endpoints for convenience.','Mở endpoint công khai cho tiện.'), why:L('The attack surface grows and data leaks via misconfiguration.','Bề mặt tấn công tăng và dữ liệu rò rỉ do cấu hình sai.'), fix:L('Private endpoints, allowlisted IPs and no public IPs on data.','Private endpoint, IP allowlist và không IP công khai cho dữ liệu.')},
   {bad:L('Secrets in notebooks and CI variables nobody rotates.','Secret trong notebook và biến CI không ai xoay.'), why:L('Leaks live for years.','Rò rỉ tồn tại nhiều năm.'), fix:L('Secrets manager, OIDC and expiring credentials.','Secrets manager, OIDC và credential có hạn.')},
   {bad:L('Production data copied to dev.','Sao dữ liệu production sang dev.'), why:L('Weaker controls guard real PII.','Kiểm soát yếu bảo vệ PII thật.'), fix:L('Masked or synthetic data in non-production.','Dữ liệu che hoặc tổng hợp ở môi trường non-production.')},
   {bad:L('Encryption without key governance.','Mã hóa mà không quản trị khóa.'), why:L('A deleted or mispermissioned key breaks everything.','Khóa bị xóa hoặc sai quyền làm hỏng mọi thứ.'), fix:L('Key policies in code, deletion protection, access reviews.','Key policy bằng code, bảo vệ chống xóa, review quyền truy cập.')},
   {bad:L('No audit trail review.','Không bao giờ xem lại audit log.'), why:L('Logs exist but nobody notices abuse.','Log có nhưng không ai nhận ra lạm dụng.'), fix:L('Alerts on unusual access and scheduled access reviews.','Cảnh báo truy cập bất thường và review quyền định kỳ.')}
  ], n:L('Most real incidents come from over-broad permissions and leaked credentials, not from exotic exploits.','Phần lớn sự cố thật đến từ quyền quá rộng và credential bị lộ, không phải từ kỹ thuật tấn công lạ.') },

 { k:'check', t:L('Checklist and interview questions','Checklist và câu hỏi phỏng vấn'),
   left:{h:L('Senior self-check','Tự kiểm tra cấp senior'), items:[L('No long-lived keys in code, images or CI','Không có khóa dài hạn trong code, image hay CI'), L('Compute and data live in private subnets with private endpoints','Compute và dữ liệu nằm trong subnet riêng với private endpoint'), L('Every role is least-privilege and reviewed','Mọi role đều quyền tối thiểu và được review'), L('PII is tagged, masked and traceable by lineage','PII được gắn tag, che và truy vết bằng lineage'), L('I can describe a deletion workflow across backups','Tôi mô tả được quy trình xóa dữ liệu kể cả backup'), L('I have threat-modelled at least one pipeline','Tôi đã threat model ít nhất một pipeline')]},
   right:{h:L('Interview-style questions','Câu hỏi kiểu phỏng vấn'), items:[L('Design access so analysts see only their region and mask emails.','Thiết kế quyền để analyst chỉ thấy khu vực của mình và email bị che.'), L('How does a Spark job on Kubernetes authenticate to object storage without keys?','Job Spark trên Kubernetes xác thực tới object storage thế nào mà không dùng khóa?'), L('A secret was committed to Git. What do you do, in order?','Một secret bị commit lên Git. Bạn làm gì, theo thứ tự?'), L('How do you honour a deletion request across a lake, a warehouse and backups?','Bạn xử lý yêu cầu xóa dữ liệu qua lake, warehouse và backup thế nào?'), L('What does zero trust change in a data platform?','Zero trust thay đổi điều gì trong data platform?')]},
   n:L('Senior expectation: design the secure default, make it the easy path, and prove it with audit evidence. Staff expectation: set the platform-wide security architecture and review model.','Kỳ vọng senior: thiết kế mặc định an toàn, biến nó thành con đường dễ đi và chứng minh bằng bằng chứng audit. Kỳ vọng staff: đặt kiến trúc bảo mật và quy trình review toàn nền tảng.') }
]);

/* ---------- 18. DISTRIBUTED SYSTEMS AND RELIABILITY ---------- */
SEC(18, [
 { k:'cards', cols:3, t:L('Distributed systems and reliability: why things fail and how to survive it','Hệ thống phân tán và độ tin cậy: vì sao hỏng và cách sống sót'),
   lead:L('Kafka, Spark, Flink, Iceberg and warehouses are all distributed systems. Their behaviour under failure follows a small set of ideas worth learning once.','Kafka, Spark, Flink, Iceberg và warehouse đều là hệ thống phân tán. Hành vi của chúng khi lỗi theo một tập ý tưởng nhỏ, đáng học một lần cho chắc.'),
   cards:[
    {h:L('CAP and consistency','CAP và tính nhất quán'), tag:'must', p:L('During a network partition you choose consistency or availability. Consistency models range from strong to eventual.','Khi mạng bị chia cắt, bạn chọn nhất quán hoặc sẵn sàng. Mô hình nhất quán trải từ mạnh đến cuối cùng.')},
    {h:L('Replication and quorum','Replication và quorum'), tag:'must', p:L('Copies survive failures. Quorums and a single leader keep the copies in agreement.','Các bản sao sống sót qua lỗi. Quorum và một leader giữ các bản sao thống nhất.')},
    {h:L('Delivery semantics','Ngữ nghĩa giao nhận'), tag:'must', p:L('At-most-once, at-least-once and exactly-once. Idempotency turns at-least-once into effectively once.','At-most-once, at-least-once và exactly-once. Idempotency biến at-least-once thành gần như một lần.')},
    {h:L('Failure handling','Xử lý lỗi'), tag:'must', p:L('Timeouts, retries with backoff, circuit breakers, bulkheads, backpressure and dead-letter queues.','Timeout, retry có backoff, circuit breaker, bulkhead, backpressure và dead-letter queue.')},
    {h:L('HA and DR','HA và DR'), tag:'senior', p:L('High availability handles component failure; disaster recovery handles loss of a site. Define RPO and RTO.','High availability xử lý lỗi thành phần; disaster recovery xử lý mất cả site. Định nghĩa RPO và RTO.')},
    {h:L('Time and ordering','Thời gian và thứ tự'), tag:'senior', p:L('Clocks drift, events arrive late and out of order. Use event time, watermarks and monotonic offsets.','Đồng hồ lệch, sự kiện đến muộn và sai thứ tự. Dùng event time, watermark và offset đơn điệu.')}
   ],
   n:L('This layer is the one that explains why a pipeline duplicated rows after a retry, or why a consumer processed an event twice after a rebalance.','Lớp này giải thích vì sao pipeline nhân đôi dòng sau retry, hoặc vì sao consumer xử lý một sự kiện hai lần sau rebalance.') },

 { k:'table', t:L('CAP and consistency in the data stack','CAP và tính nhất quán trong data stack'),
   lead:L('CAP is a simplification (see also PACELC), but it frames the right question: what happens to reads and writes when parts of the system cannot talk?','CAP là sự đơn giản hóa (xem thêm PACELC), nhưng nó đặt đúng câu hỏi: đọc và ghi sẽ ra sao khi các phần của hệ thống không nói chuyện được với nhau?'),
   head:[L('System','Hệ thống'), L('Typical leaning','Thiên hướng điển hình'), L('Behaviour under partition','Hành vi khi bị chia cắt'), L('What you control','Bạn điều khiển được gì')], rows:[
   ['etcd / ZooKeeper / Raft-based metadata', L('Consistency first','Ưu tiên nhất quán'), L('The minority side stops accepting writes','Phía thiểu số ngừng nhận ghi'), L('Cluster size (odd numbers) and timeouts','Kích thước cluster (số lẻ) và timeout')],
   ['Kafka', L('Tunable','Tinh chỉnh được'), L('With `acks=all` and `min.insync.replicas`, writes fail rather than lose data','Với `acks=all` và `min.insync.replicas`, ghi thất bại thay vì mất dữ liệu'), L('acks, min.insync.replicas, unclean leader election','acks, min.insync.replicas, unclean leader election')],
   ['Cassandra-style stores', L('Availability first, tunable','Ưu tiên sẵn sàng, tinh chỉnh được'), L('Both sides accept writes; conflicts are reconciled later','Cả hai phía nhận ghi; xung đột được hòa giải sau'), L('Consistency level per query','Mức nhất quán theo từng query')],
   [L('Object storage (S3-style)','Object storage (kiểu S3)'), L('Strong read-after-write for objects','Đọc sau ghi nhất quán mạnh cho object'), L('Operations either succeed or fail; listing semantics vary by provider','Thao tác thành công hoặc thất bại; ngữ nghĩa liệt kê khác nhau theo nhà cung cấp'), L('Table formats add atomic commits on top','Table format thêm commit nguyên tử ở trên')],
   [L('Iceberg / Delta commits','Commit của Iceberg / Delta'), L('Consistency first','Ưu tiên nhất quán'), L('Concurrent writers: one commit wins, the other retries','Nhiều writer đồng thời: một commit thắng, cái còn lại retry'), L('Isolation level, retry and conflict policy','Mức isolation, chính sách retry và xung đột')],
   [L('Managed warehouses','Warehouse managed'), L('ACID transactions inside the service','Giao dịch ACID bên trong dịch vụ'), L('Provider handles replication and failover','Nhà cung cấp lo replication và failover'), L('Region and failover configuration','Cấu hình vùng và failover')]
  ], cap:L('Eventual consistency is acceptable for analytics counters and unacceptable for balances. Decide per data set.','Nhất quán cuối cùng chấp nhận được cho bộ đếm analytics và không chấp nhận được cho số dư. Hãy quyết định theo từng tập dữ liệu.'),
   n:L('Emphasize that most modern data systems are tunable, so the engineer’s job is to choose settings that match the business requirement. Storage-provider guarantees evolve, so confirm them in current documentation.','Nhấn mạnh rằng hầu hết hệ thống dữ liệu hiện đại đều tinh chỉnh được, nên việc của engineer là chọn cấu hình khớp yêu cầu nghiệp vụ. Bảo đảm của nhà cung cấp lưu trữ thay đổi theo thời gian, hãy xác nhận trong tài liệu hiện hành.') },

 { k:'svg', t:L('Replication, quorum and leader election','Replication, quorum và bầu leader'),
   lead:L('Replication gives durability; a single leader or a quorum gives agreement; elections replace a failed leader.','Replication cho độ bền; một leader hoặc một quorum cho sự đồng thuận; bầu cử thay thế leader bị hỏng.'),
   svg:quorumSVG,
   cap:L('Why odd cluster sizes: 3 nodes tolerate 1 failure and 4 nodes still tolerate only 1, so the fourth node adds cost, not safety.','Vì sao cluster cỡ lẻ: 3 node chịu 1 lỗi và 4 node vẫn chỉ chịu 1, nên node thứ tư tăng chi phí chứ không tăng an toàn.'),
   n:L('Kafka (ISR and KRaft), Flink (JobManager HA), Iceberg catalogs and etcd all rely on these ideas. The formula R + W > N is the cleanest way to explain why a quorum read sees the latest quorum write.','Kafka (ISR và KRaft), Flink (JobManager HA), catalog Iceberg và etcd đều dựa trên các ý này. Công thức R + W > N là cách giải thích gọn nhất vì sao đọc quorum thấy lần ghi quorum mới nhất.') },

 { k:'code', t:L('Retries, idempotency and delivery semantics','Retry, idempotency và ngữ nghĩa giao nhận'),
   lead:L('Retries make a system reliable and also create duplicates. Idempotent writes make retries safe.','Retry làm hệ thống tin cậy và cũng tạo ra bản trùng. Ghi idempotent làm retry an toàn.'),
   blocks:[
    {lang:'python', title:'retry.py (exponential backoff with jitter)', code:`
import random
import time


class TransientError(Exception):
    """Timeouts, 429s and 5xx responses: safe to retry."""


def with_retries(fn, attempts=5, base=0.5, cap=30.0):
    for n in range(attempts):
        try:
            return fn()
        except TransientError:
            if n == attempts - 1:
                raise
            delay = min(cap, base * 2 ** n)
            time.sleep(delay * random.uniform(0.5, 1.0))  # jitter avoids retry storms`},
    {lang:'sql', title:'idempotent_insert.sql (PostgreSQL)', code:`
-- Safe to run twice: duplicate event_ids are ignored
insert into fct_events (event_id, user_id, event_name, event_ts)
values (:event_id, :user_id, :event_name, :event_ts)
on conflict (event_id) do nothing;`}
   ],
   points:[
    {h:L('At-most-once','At-most-once'), p:L('Send once, never retry. Data can be lost. Acceptable for lossy metrics only.','Gửi một lần, không retry. Có thể mất dữ liệu. Chỉ chấp nhận cho metric cho phép mất.')},
    {h:L('At-least-once','At-least-once'), tag:'must', p:L('Retry until acknowledged. Nothing is lost, but duplicates happen. The common default.','Retry đến khi được xác nhận. Không mất gì nhưng có thể trùng. Mặc định phổ biến.')},
    {h:L('Exactly-once','Exactly-once'), tag:'senior', p:L('At-least-once delivery plus idempotent or transactional processing. It is an end-to-end property, not a switch.','Giao ít nhất một lần cộng xử lý idempotent hoặc giao dịch. Đó là thuộc tính đầu-cuối, không phải công tắc bật tắt.')},
    {h:L('Dedupe key','Khóa chống trùng'), tag:'senior', p:L('A stable business or event ID makes duplicates detectable anywhere in the pipeline.','Một ID nghiệp vụ hoặc sự kiện ổn định giúp phát hiện bản trùng ở bất kỳ đâu trong pipeline.')}
   ],
   n:L('Jitter matters: without it all clients retry at the same instant and overload a recovering service. The SQL upsert is the simplest idempotent sink; Kafka transactions and Flink two-phase commits are the heavy-duty versions.','Jitter quan trọng: không có nó mọi client retry cùng lúc và làm quá tải dịch vụ đang hồi phục. Upsert SQL là sink idempotent đơn giản nhất; transaction của Kafka và two-phase commit của Flink là phiên bản hạng nặng.') },

 { k:'cards', cols:3, t:L('Resilience patterns for data pipelines','Các mẫu chịu lỗi cho data pipeline'),
   cards:[
    {h:L('Timeouts and retries','Timeout và retry'), p:L('Every network call has a timeout. Retry only transient errors, with backoff, jitter and a cap.','Mọi lời gọi mạng đều có timeout. Chỉ retry lỗi tạm thời, có backoff, jitter và giới hạn.')},
    {h:L('Circuit breaker','Circuit breaker'), p:L('After repeated failures stop calling the dependency (open), probe occasionally (half-open), then resume (closed).','Sau nhiều lần lỗi liên tiếp thì ngừng gọi phụ thuộc (open), thỉnh thoảng thử (half-open), rồi tiếp tục (closed).')},
    {h:L('Bulkheads','Bulkhead'), p:L('Isolate pools, queues and warehouses per workload so one failure cannot consume everything.','Cô lập pool, queue và warehouse theo workload để một lỗi không nuốt hết mọi thứ.')},
    {h:L('Backpressure','Backpressure'), p:L('Slow producers or buffer boundedly when consumers cannot keep up, instead of growing queues without limit.','Làm chậm producer hoặc đệm có giới hạn khi consumer không theo kịp, thay vì để hàng đợi phình vô hạn.')},
    {h:L('Dead-letter queues','Dead-letter queue'), p:L('Park records that fail repeatedly with the reason, so the stream keeps moving and humans can inspect them.','Đưa các bản ghi lỗi lặp lại sang nơi riêng kèm lý do, để luồng chạy tiếp và con người kiểm tra sau.')},
    {h:L('Graceful degradation','Giảm cấp có kiểm soát'), p:L('Serve stale but labelled data rather than nothing when a source is late. Show freshness to users.','Phục vụ dữ liệu cũ nhưng có gắn nhãn thay vì không gì cả khi nguồn đến trễ. Hiển thị độ mới cho người dùng.')}
   ],
   n:L('These patterns come from service engineering and apply directly to Kafka consumers, API ingestion and reverse ETL syncs.','Các mẫu này đến từ kỹ thuật dịch vụ và áp dụng trực tiếp cho Kafka consumer, ingestion qua API và sync của reverse ETL.') },

 { k:'table', t:L('High availability and disaster recovery strategies','Chiến lược high availability và disaster recovery'),
   lead:L('RPO is how much data you can lose; RTO is how long you can be down. Stronger targets cost more.','RPO là lượng dữ liệu bạn có thể mất; RTO là thời gian bạn có thể ngừng. Mục tiêu càng chặt càng tốn kém.'),
   head:[L('Strategy','Chiến lược'), L('Typical RPO','RPO điển hình'), L('Typical RTO','RTO điển hình'), L('Relative cost','Chi phí tương đối'), L('Example','Ví dụ')], rows:[
   [L('Backup and restore','Backup và restore'), L('Hours','Hàng giờ'), L('Hours to days','Giờ đến ngày'), L('Lowest','Thấp nhất'), L('Snapshots to another region; restore on demand','Snapshot sang vùng khác; restore khi cần')],
   [L('Pilot light','Pilot light'), L('Minutes to hours','Phút đến giờ'), L('Hours','Hàng giờ'), L('Low','Thấp'), L('Data replicated; compute started only during a disaster','Dữ liệu được replicate; compute chỉ bật khi có thảm họa')],
   [L('Warm standby','Warm standby'), L('Minutes','Phút'), L('Minutes to an hour','Phút đến một giờ'), L('Medium','Trung bình'), L('Scaled-down copy kept running in another region','Bản thu nhỏ luôn chạy ở vùng khác')],
   [L('Active-active','Active-active'), L('Near zero','Gần bằng không'), L('Near zero','Gần bằng không'), L('Highest','Cao nhất'), L('Multi-region writes with conflict handling','Ghi đa vùng có xử lý xung đột')]
  ], cap:L('A backup that has never been restored is a hope, not a backup. Schedule restore tests and measure the real RTO.','Backup chưa từng được restore chỉ là hy vọng, không phải backup. Lên lịch test restore và đo RTO thật.'),
   n:L('The ranges are qualitative on purpose. Real numbers depend on data size, tooling and rehearsal. Also separate HA (survive a node or zone failure) from DR (survive losing a whole region or a bad deployment).','Các khoảng này cố ý mang tính định tính. Con số thật phụ thuộc kích thước dữ liệu, công cụ và diễn tập. Cũng cần tách HA (sống sót khi mất node hoặc zone) khỏi DR (sống sót khi mất cả vùng hoặc deploy hỏng).') },

 { k:'table', t:L('Failure scenarios and recovery drills','Kịch bản lỗi và diễn tập khôi phục'),
   head:[L('Failure','Sự cố'), L('Symptom','Triệu chứng'), L('First checks','Kiểm tra đầu tiên'), L('Recovery','Khôi phục')], rows:[
   [L('Kafka broker lost','Mất một Kafka broker'), L('Under-replicated partitions, producer errors','Partition thiếu bản sao, producer lỗi'), L('Broker health, ISR, disk and network','Sức khỏe broker, ISR, đĩa và mạng'), L('Restart or replace the broker; let replicas catch up','Khởi động lại hoặc thay broker; để replica bắt kịp')],
   [L('Consumer lag grows','Consumer lag tăng'), L('Dashboards go stale','Dashboard cũ dần'), L('Slow handler, hot partition, rebalance loops','Handler chậm, partition nóng, vòng lặp rebalance'), L('Scale consumers up to partition count; fix the slow step','Tăng consumer đến số partition; sửa bước chậm')],
   [L('Bad deploy corrupts a table','Deploy lỗi làm hỏng bảng'), L('Wrong numbers, failed tests','Số liệu sai, test fail'), L('Which commit and which run changed it','Commit nào và lần chạy nào đã đổi nó'), L('Time travel or snapshot rollback; revert and rerun','Time travel hoặc rollback snapshot; revert rồi chạy lại')],
   [L('Upstream schema change','Nguồn đổi schema'), L('Load fails or silently drops a column','Load lỗi hoặc âm thầm mất cột'), L('Schema diff, contract checks','So sánh schema, kiểm tra contract'), L('Quarantine batch, update mapping, backfill','Cách ly batch, cập nhật mapping, backfill')],
   [L('Credential expired','Credential hết hạn'), L('Authentication errors at a fixed time','Lỗi xác thực vào giờ cố định'), L('Secret expiry and rotation logs','Hạn secret và log xoay vòng'), L('Rotate, redeploy, add expiry alerts','Xoay secret, deploy lại, thêm cảnh báo hết hạn')],
   [L('Region outage','Sự cố cả vùng'), L('Provider status shows a regional failure','Trang trạng thái nhà cung cấp báo lỗi vùng'), L('DR runbook and replication state','Runbook DR và trạng thái replication'), L('Fail over per the documented plan, then reconcile','Failover theo kế hoạch đã ghi, sau đó đối soát')]
  ], cap:L('Rehearse these as game days. The first time you read the runbook should not be during the incident.','Hãy diễn tập như game day. Lần đầu bạn đọc runbook không nên là trong lúc xảy ra sự cố.'),
   n:L('Pick two scenarios and walk the audience through detection, diagnosis and recovery. Link each to the monitoring that would have caught it.','Chọn hai kịch bản và dẫn khán giả đi qua phát hiện, chẩn đoán và khôi phục. Gắn mỗi kịch bản với giám sát lẽ ra phải bắt được nó.') },

 { k:'check', t:L('Checklist and interview questions','Checklist và câu hỏi phỏng vấn'),
   left:{h:L('Senior self-check','Tự kiểm tra cấp senior'), items:[L('I can explain quorum and R + W > N','Tôi giải thích được quorum và R + W > N'), L('Every write path is idempotent or deduplicated','Mọi đường ghi đều idempotent hoặc có chống trùng'), L('Retries have backoff, jitter and caps','Retry có backoff, jitter và giới hạn'), L('Each critical data set has an RPO and RTO','Mỗi tập dữ liệu quan trọng có RPO và RTO'), L('Restores are tested, not assumed','Restore được test, không chỉ giả định'), L('I have run a failure drill','Tôi đã chạy một buổi diễn tập sự cố')]},
   right:{h:L('Interview-style questions','Câu hỏi kiểu phỏng vấn'), items:[L('Explain how Kafka avoids losing acknowledged writes.','Giải thích Kafka tránh mất các lần ghi đã xác nhận thế nào.'), L('A consumer processed the same event twice. Why, and how do you make it harmless?','Một consumer xử lý cùng một sự kiện hai lần. Vì sao, và làm sao để vô hại?'), L('Why is “exactly-once” an end-to-end property?','Vì sao “exactly-once” là thuộc tính đầu-cuối?'), L('Design DR for a warehouse with RPO 15 minutes and RTO 1 hour.','Thiết kế DR cho warehouse với RPO 15 phút và RTO 1 giờ.'), L('What does a circuit breaker protect, and what can go wrong with it?','Circuit breaker bảo vệ cái gì, và nó có thể sai ở đâu?')]},
   n:L('Senior expectation: reason about failure before it happens. Staff expectation: define reliability targets and error budgets across the platform.','Kỳ vọng senior: suy luận về lỗi trước khi nó xảy ra. Kỳ vọng staff: định nghĩa mục tiêu độ tin cậy và error budget cho cả nền tảng.') }
]);

/* ---------- 19. FINOPS AND PERFORMANCE ---------- */
SEC(19, [
 { k:'cards', cols:3, t:L('FinOps and performance engineering: make the platform fast and affordable','FinOps và kỹ thuật hiệu năng: làm nền tảng nhanh và hợp túi tiền'),
   lead:L('Cost and performance are two views of the same thing: work done per unit of resource. Seniors measure them, attribute them and design for them.','Chi phí và hiệu năng là hai góc nhìn của cùng một thứ: lượng việc làm được trên mỗi đơn vị tài nguyên. Senior đo, quy gán và thiết kế cho chúng.'),
   cards:[
    {h:L('Cost model','Mô hình chi phí'), tag:'must', p:L('Compute, storage, network and egress, and managed-service fees. Know which dominates your bill.','Compute, storage, network và egress, cùng phí dịch vụ managed. Biết khoản nào chiếm nhiều nhất trong hóa đơn.')},
    {h:L('Attribution','Quy gán chi phí'), tag:'must', p:L('Tags and labels per team, product and environment, so cost has an owner.','Tag và label theo đội, sản phẩm và môi trường để chi phí có người chịu trách nhiệm.')},
    {h:L('Guardrails','Hàng rào bảo vệ'), tag:'must', p:L('Budgets, alerts, quotas, timeouts and auto-suspend stop runaway spend.','Ngân sách, cảnh báo, quota, timeout và auto-suspend chặn chi tiêu mất kiểm soát.')},
    {h:L('Query and job tuning','Tối ưu query và job'), tag:'must', p:L('Scan less, shuffle less, spill less. Measure before and after.','Quét ít hơn, shuffle ít hơn, spill ít hơn. Đo trước và sau.')},
    {h:L('Streaming performance','Hiệu năng streaming'), tag:'senior', p:L('Kafka throughput and latency, batching, partitions and consumer lag.','Throughput và độ trễ của Kafka, batching, partition và consumer lag.')},
    {h:L('Capacity planning','Hoạch định năng lực'), tag:'senior', p:L('Forecast growth, keep headroom, isolate workloads and test before the peak.','Dự báo tăng trưởng, giữ dư địa, cô lập workload và test trước đỉnh tải.')}
   ],
   n:L('Introduce unit economics early: cost per query, per pipeline run, per customer or per gigabyte. Absolute spend alone says little about efficiency.','Giới thiệu unit economics sớm: chi phí mỗi query, mỗi lần chạy pipeline, mỗi khách hàng hoặc mỗi gigabyte. Chỉ riêng tổng chi tiêu không nói nhiều về hiệu quả.') },

 { k:'table', t:L('Where the money goes: cost drivers and levers','Tiền đi đâu: nguồn chi phí và đòn bẩy'),
   head:[L('Cost driver','Nguồn chi phí'), L('What drives it','Điều gì quyết định'), L('Levers','Đòn bẩy'), L('Warning sign','Dấu hiệu cảnh báo')], rows:[
   [L('Compute','Compute'), L('Cluster or warehouse size times running time, or bytes scanned','Kích thước cluster hoặc warehouse nhân thời gian chạy, hoặc số byte quét'), L('Right-size, auto-suspend, partition pruning, incremental models','Chọn cỡ hợp lý, auto-suspend, partition pruning, model incremental'), L('Warehouses idle but running; full-table scans','Warehouse rảnh nhưng vẫn chạy; quét toàn bảng')],
   [L('Storage','Storage'), L('Data volume, retention, copies, small files','Khối lượng dữ liệu, thời gian lưu, số bản sao, file nhỏ'), L('Retention policies, compression, compaction, tiering','Chính sách lưu giữ, nén, compaction, phân tầng'), L('Every table kept forever; many scratch copies','Mọi bảng đều giữ mãi; nhiều bản sao nháp')],
   [L('Network and egress','Network và egress'), L('Cross-region and cross-cloud transfer, NAT gateways','Truyền liên vùng và liên cloud, NAT gateway'), L('Co-locate compute and data, private endpoints, cache','Đặt compute gần dữ liệu, private endpoint, cache'), L('Data pulled out to another cloud for each query','Dữ liệu bị kéo sang cloud khác cho mỗi query')],
   [L('Managed service fees','Phí dịch vụ managed'), L('Per row, event, seat or credit','Theo dòng, sự kiện, seat hoặc credit'), L('Choose plans by usage shape; negotiate commitments','Chọn gói theo hình dạng sử dụng; thương lượng cam kết'), L('Usage grows faster than value','Mức dùng tăng nhanh hơn giá trị')],
   [L('Idle and orphaned resources','Tài nguyên rảnh và bị bỏ rơi'), L('Dev clusters, old snapshots, unused dashboards','Cluster dev, snapshot cũ, dashboard không dùng'), L('Schedules, TTLs, owner tags, cleanup jobs','Lịch tắt, TTL, tag chủ sở hữu, job dọn dẹp'), L('Resources with no owner tag','Tài nguyên không có tag chủ sở hữu')]
  ], cap:L('Track unit costs (for example cost per pipeline run) and review the top ten spenders monthly.','Theo dõi chi phí đơn vị (ví dụ chi phí mỗi lần chạy pipeline) và review mười khoản chi lớn nhất hằng tháng.'),
   n:L('Prices change, so this table deliberately lists drivers rather than numbers. The habit to teach: find the top spenders first, then decide which lever applies.','Giá thay đổi, nên bảng cố ý liệt kê nguồn chi phí thay vì con số. Thói quen cần dạy: tìm các khoản chi lớn nhất trước, rồi chọn đòn bẩy phù hợp.') },

 { k:'code', t:L('Find the expensive queries first','Tìm các query đắt tiền trước tiên'),
   lead:L('Every warehouse exposes query history. Rank by cost drivers, then fix the top few.','Warehouse nào cũng có lịch sử query. Xếp hạng theo nguồn chi phí rồi sửa vài cái đứng đầu.'),
   blocks:[
    {lang:'sql', title:'snowflake_top_scans.sql', code:`
select
    query_id,
    user_name,
    warehouse_name,
    total_elapsed_time / 1000 as seconds,
    bytes_scanned,
    partitions_scanned,
    partitions_total
from snowflake.account_usage.query_history
where start_time >= dateadd(day, -7, current_timestamp())
order by bytes_scanned desc
limit 20;`},
    {lang:'sql', title:'bigquery_top_jobs.sql', code:`
select
    user_email,
    job_id,
    total_bytes_billed / pow(1024, 4) as tib_billed,
    total_slot_ms / 1000 as slot_seconds
from \`region-us\`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
where creation_time >= timestamp_sub(current_timestamp(), interval 7 day)
  and job_type = 'QUERY'
order by total_bytes_billed desc
limit 20;`}
   ],
   points:[
    {h:L('Partitions scanned versus total','Partition quét so với tổng'), p:L('A high ratio means pruning is failing. Check filters on the partition or clustering columns.','Tỷ lệ cao nghĩa là pruning đang thất bại. Kiểm tra bộ lọc trên cột partition hoặc clustering.')},
    {h:L('Bytes billed','Byte bị tính phí'), p:L('On bytes-billed engines, select fewer columns and filter by partition.','Với engine tính theo byte, chọn ít cột hơn và lọc theo partition.')},
    {h:L('Attribute to an owner','Gán cho người chịu trách nhiệm'), tag:'senior', p:L('Join with user, role or tag so each expensive query has someone who can fix it.','Join với người dùng, role hoặc tag để mỗi query đắt có người sửa được.')},
    {h:L('Change, then re-measure','Đổi rồi đo lại'), tag:'senior', p:L('Verify the saving with the same query history, not with a guess.','Xác minh khoản tiết kiệm bằng chính lịch sử query đó, không phải phỏng đoán.')}
   ],
   n:L('View names and region qualifiers vary by account and platform. The pattern is the same everywhere: rank by bytes, time or slots, then drill into the plan.','Tên view và vùng thay đổi theo tài khoản và nền tảng. Mô hình thì giống nhau: xếp hạng theo byte, thời gian hoặc slot, rồi đào vào plan.') },

 { k:'table', t:L('Spark and Kafka performance: symptoms, causes, fixes','Hiệu năng Spark và Kafka: triệu chứng, nguyên nhân, cách sửa'),
   head:[L('Symptom','Triệu chứng'), L('Likely cause','Nguyên nhân có thể'), L('Where to look','Nhìn ở đâu'), L('Fix','Cách sửa')], rows:[
   [L('One Spark task runs far longer','Một task Spark chạy lâu hơn hẳn'), L('Data skew on a key','Lệch dữ liệu theo một khóa'), L('Spark UI stage task-time distribution','Phân phối thời gian task của stage trong Spark UI'), L('Adaptive skew join, salting, different key','Adaptive skew join, salting, khóa khác')],
   [L('Huge shuffle read and write','Shuffle đọc và ghi rất lớn'), L('Large join or wide aggregation','Join lớn hoặc aggregation rộng'), L('Stage shuffle metrics, query plan','Số liệu shuffle của stage, query plan'), L('Broadcast small side, filter earlier, pre-aggregate','Broadcast bảng nhỏ, lọc sớm hơn, tổng hợp trước')],
   [L('Disk spill and executor OOM','Spill ra đĩa và executor OOM'), L('Partitions too large for memory','Partition quá lớn so với bộ nhớ'), L('Spill metrics, GC time','Số liệu spill, thời gian GC'), L('More partitions, more memory per task, fewer cores per executor','Nhiều partition hơn, nhiều bộ nhớ mỗi task, ít core hơn mỗi executor')],
   [L('Thousands of tiny files','Hàng nghìn file nhỏ'), L('Over-partitioning or frequent small writes','Chia partition quá mức hoặc ghi nhỏ thường xuyên'), L('File counts and sizes per partition','Số lượng và kích thước file mỗi partition'), L('Compaction, coalesce before write, target file size','Compaction, coalesce trước khi ghi, kích thước file mục tiêu')],
   [L('Kafka consumer lag grows','Consumer lag của Kafka tăng'), L('Slow processing or too few partitions or consumers','Xử lý chậm hoặc quá ít partition hay consumer'), L('Lag per partition, handler time, rebalances','Lag theo partition, thời gian handler, rebalance'), L('Speed up the handler, add consumers up to partition count, raise partitions','Tăng tốc handler, thêm consumer đến số partition, tăng partition')],
   [L('Producer throughput is low','Throughput của producer thấp'), L('Tiny batches, no compression, sync sends','Batch quá nhỏ, không nén, gửi đồng bộ'), L('Producer metrics: batch size, request rate','Số liệu producer: kích thước batch, tốc độ request'), L('Increase `linger.ms` and `batch.size`, enable compression','Tăng `linger.ms` và `batch.size`, bật nén')]
  ], cap:L('Always change one thing at a time and keep the before and after metrics.','Luôn chỉ đổi một thứ mỗi lần và giữ số liệu trước và sau.'),
   n:L('This is a diagnostic cheat sheet: start from the symptom, not from a favorite setting. Connect it to the Spark and Kafka internals in the appendix.','Đây là bảng chẩn đoán nhanh: bắt đầu từ triệu chứng, không phải từ cấu hình yêu thích. Nối với nội bộ Spark và Kafka trong phụ lục.') },

 { k:'code', t:L('Attribution, budgets and Spark tuning in code','Quy gán, ngân sách và tinh chỉnh Spark bằng code'),
   lead:L('Make cost visible to owners and make the common tuning decisions explicit.','Làm chi phí hiển thị với người chịu trách nhiệm và làm rõ các quyết định tinh chỉnh phổ biến.'),
   blocks:[
    {lang:'hcl', title:'budget.tf (AWS monthly budget with alert)', code:`
resource "aws_budgets_budget" "data_platform" {
  name         = "data-platform-monthly"
  budget_type  = "COST"
  limit_amount = "5000"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:team$analytics"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = ["data-platform@example.com"]
  }
}`},
    {lang:'python', title:'spark_tuning.py', code:`
from pyspark.sql import functions as F

spark.conf.set("spark.sql.adaptive.enabled", "true")            # re-plan at runtime
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")   # split skewed partitions
spark.conf.set("spark.sql.shuffle.partitions", "400")           # size to your data; AQE can coalesce

orders = spark.table("curated.orders")
customers = spark.table("curated.dim_customers")               # small dimension

joined = orders.join(F.broadcast(customers), "customer_id")    # avoid shuffling the big side
joined.write.mode("overwrite").partitionBy("order_date").parquet("s3://example-lake/marts/orders/")`}
   ],
   points:[
    {h:L('Tag first, then budget','Gắn tag trước, rồi đặt ngân sách'), p:L('A budget filtered by a team tag gives each owner a number they can act on.','Ngân sách lọc theo tag của đội cho mỗi chủ sở hữu một con số họ hành động được.')},
    {h:L('Showback, then chargeback','Showback, rồi chargeback'), tag:'senior', p:L('Report cost to teams first. Charge it back only when the attribution is trusted.','Báo cáo chi phí cho các đội trước. Chỉ tính phí ngược khi việc quy gán đã đáng tin.')},
    {h:L('Broadcast small tables','Broadcast bảng nhỏ'), p:L('It replaces a shuffle with a copy of the small table to each executor.','Nó thay shuffle bằng việc gửi bản sao bảng nhỏ tới từng executor.')},
    {h:L('Numbers are starting points','Con số chỉ là điểm xuất phát'), tag:'senior', p:L('Budget and partition values are placeholders. Size them from your own data and spend.','Giá trị ngân sách và partition chỉ là chỗ giữ chỗ. Hãy định cỡ từ dữ liệu và chi tiêu của bạn.')}
   ],
   n:L('Show how both snippets tie to ownership: tags identify the team, budgets notify it, and tuning reduces the bill. The AWS provider schema can change between versions, so check the provider documentation.','Cho thấy cả hai đoạn code gắn với quyền sở hữu: tag xác định đội, ngân sách thông báo cho đội, và tinh chỉnh giảm hóa đơn. Schema của provider AWS có thể đổi giữa các phiên bản, hãy xem tài liệu provider.') },

 { k:'cards', cols:3, t:L('Capacity planning and workload isolation','Hoạch định năng lực và cô lập workload'),
   cards:[
    {h:L('Measure the workload','Đo workload'), tag:'must', p:L('Peak concurrency, data growth per month, job durations and spikes such as month-end close.','Đỉnh đồng thời, tăng trưởng dữ liệu mỗi tháng, thời lượng job và các đỉnh như chốt sổ cuối tháng.')},
    {h:L('Forecast and keep headroom','Dự báo và giữ dư địa'), tag:'must', p:L('Project growth and keep margin for spikes and failures. Plan for N−1 capacity.','Dự phóng tăng trưởng và giữ biên cho đỉnh tải và lỗi. Hoạch định cho năng lực N−1.')},
    {h:L('Load test','Test tải'), tag:'senior', p:L('Replay realistic traffic or data volume in a staging environment before a launch or migration.','Phát lại lưu lượng hoặc khối lượng dữ liệu thực tế ở staging trước khi ra mắt hoặc di chuyển.')},
    {h:L('Isolate workloads','Cô lập workload'), tag:'must', p:L('Separate ELT, BI and ad hoc compute so a heavy job cannot starve dashboards.','Tách compute cho ELT, BI và ad hoc để job nặng không làm đói dashboard.')},
    {h:L('Autoscale with limits','Autoscale có giới hạn'), tag:'senior', p:L('Scale on real signals and cap maximums so a bug cannot create a huge bill.','Co giãn theo tín hiệu thật và đặt mức tối đa để một lỗi không tạo hóa đơn khổng lồ.')},
    {h:L('Size Kafka deliberately','Định cỡ Kafka có chủ đích'), tag:'senior', p:L('Partitions ≥ target throughput ÷ per-partition throughput, for both producers and consumers. Disk ≈ ingest rate × retention × replication factor.','Partition ≥ throughput mục tiêu ÷ throughput mỗi partition, cho cả producer và consumer. Đĩa ≈ tốc độ nạp × thời gian lưu × hệ số replication.')}
   ],
   n:L('The Kafka sizing rules are standard back-of-the-envelope formulas. Validate them with a benchmark on your own hardware and message sizes.','Quy tắc định cỡ Kafka là các công thức ước lượng tiêu chuẩn. Hãy kiểm chứng bằng benchmark trên phần cứng và kích thước message của bạn.') },

 { k:'pit', t:L('Common pitfalls and anti-patterns','Lỗi thường gặp và anti-pattern'), rows:[
   {bad:L('Optimizing without measuring.','Tối ưu mà không đo.'), why:L('Effort goes to the wrong queries.','Công sức dồn vào sai query.'), fix:L('Rank by cost or time from query history first.','Xếp hạng theo chi phí hoặc thời gian từ lịch sử query trước.')},
   {bad:L('No tags, so no owner.','Không có tag nên không có chủ.'), why:L('Nobody feels responsible for the bill.','Không ai thấy mình chịu trách nhiệm về hóa đơn.'), fix:L('Enforce tags in IaC and CI.','Bắt buộc tag trong IaC và CI.')},
   {bad:L('One big shared cluster.','Một cluster chung khổng lồ.'), why:L('Noisy neighbours and unclear costs.','Hàng xóm ồn ào và chi phí không rõ.'), fix:L('Isolate by workload and team.','Cô lập theo workload và đội.')},
   {bad:L('Scaling up to hide a bad query.','Tăng cỡ để che một query tồi.'), why:L('Cost doubles and the cause remains.','Chi phí gấp đôi và nguyên nhân vẫn còn.'), fix:L('Read the plan and fix scans, joins and skew first.','Đọc plan và sửa quét, join và lệch trước.')},
   {bad:L('Ignoring egress.','Bỏ qua egress.'), why:L('Cross-region and cross-cloud transfer surprises the bill.','Truyền liên vùng và liên cloud làm hóa đơn bất ngờ.'), fix:L('Co-locate compute and data; watch transfer cost.','Đặt compute gần dữ liệu; theo dõi chi phí truyền.')},
   {bad:L('One-off savings with no guardrails.','Tiết kiệm một lần không có hàng rào.'), why:L('Spend creeps back within months.','Chi tiêu quay lại trong vài tháng.'), fix:L('Budgets, alerts, quotas and a monthly review.','Ngân sách, cảnh báo, quota và review hằng tháng.')}
  ], n:L('The strongest habit is a monthly top-spenders review with owners present.','Thói quen mạnh nhất là buổi review các khoản chi lớn nhất hằng tháng với sự có mặt của các chủ sở hữu.') },

 { k:'check', t:L('Checklist and interview questions','Checklist và câu hỏi phỏng vấn'),
   left:{h:L('Senior self-check','Tự kiểm tra cấp senior'), items:[L('I know our top cost drivers and their owners','Tôi biết các nguồn chi phí lớn nhất và chủ sở hữu của chúng'), L('Every resource carries owner and environment tags','Mọi tài nguyên đều mang tag chủ sở hữu và môi trường'), L('Budgets and alerts exist for each team','Mỗi đội đều có ngân sách và cảnh báo'), L('I can diagnose skew, spill and small files','Tôi chẩn đoán được lệch dữ liệu, spill và file nhỏ'), L('I can size Kafka partitions and disk','Tôi định cỡ được partition và đĩa của Kafka'), L('Workloads are isolated','Các workload được cô lập')]},
   right:{h:L('Interview-style questions','Câu hỏi kiểu phỏng vấn'), items:[L('Cut a warehouse bill by 30 percent without hurting users. What are your first three moves?','Cắt 30 phần trăm hóa đơn warehouse mà không hại người dùng. Ba bước đầu của bạn là gì?'), L('A Spark job has one task that runs 20 times longer. Diagnose it.','Một job Spark có một task chạy lâu gấp 20 lần. Hãy chẩn đoán.'), L('Consumer lag keeps growing. What do you check and in what order?','Consumer lag cứ tăng. Bạn kiểm tra gì và theo thứ tự nào?'), L('How would you attribute shared platform cost to teams?','Bạn quy gán chi phí nền tảng dùng chung cho các đội thế nào?'), L('How do you plan capacity for a month-end peak?','Bạn hoạch định năng lực cho đỉnh tải cuối tháng thế nào?')]},
   n:L('Senior expectation: tie every optimization to a measurement and an owner. Staff expectation: build the cost and performance feedback loop for the whole platform.','Kỳ vọng senior: gắn mỗi tối ưu với một phép đo và một chủ sở hữu. Kỳ vọng staff: xây vòng phản hồi chi phí và hiệu năng cho cả nền tảng.') }
]);
