"use strict";
/* ============ CONTENT REGISTRY ============
   Content files register slides through LAYER, TECH, PRACTICE_GROUP and CLOSING_SLIDES.
   Every call appends, so one topic can be spread over as many files as it needs. */
var DATA = [];        // DATA[n - 1] = { slides: [...] } for learning layer n
var ARCH = [];        // technology deep dives: { id, name, color, refs, slides }
var PRACTICE = [];    // scenarios, incidents, competency, governance: { id, name, color, slides }
var CLOSING = [];     // closing slides
var CODES = [];       // raw code for copy buttons
function LAYER(n, slides){
  var d = DATA[n - 1] || (DATA[n - 1] = { slides: [] });
  slides.forEach(function(s){ d.slides.push(s); });
}
function registerGroup(list, kind, def){
  if(!def || !def.id) throw new Error(kind + ' needs an id');
  var g = list.filter(function(x){ return x.id === def.id; })[0];
  if(!g){
    if(!def.name || !def.color) throw new Error(kind + ' "' + def.id + '" is not defined yet: the first file that registers it must set name and color');
    g = { id: def.id, name: def.name, color: def.color, refs: def.refs || null, slides: [] };
    list.push(g);
  } else if(def.refs){ g.refs = (g.refs || []).concat(def.refs); }
  (def.slides || []).forEach(function(s){ g.slides.push(s); });
  return g;
}
function TECH(def){ return registerGroup(ARCH, 'TECH', def); }
function PRACTICE_GROUP(def){ return registerGroup(PRACTICE, 'PRACTICE_GROUP', def); }
function CLOSING_SLIDES(slides){ slides.forEach(function(s){ CLOSING.push(s); }); }
var META = [], PATHS = [], GRAPH_NODES = [], GRAPH_EDGES = [], CONCEPTS = [];
/* Register the parsed YAML documents the build embeds. Each doc is { file, data }. */
function LOAD_CONTENT(docs){
  docs.forEach(function(doc){
    var d = doc.data;
    try {
      if(d.curriculum){
        META = d.curriculum.layers.map(function(l){ return { name: l.name, color: l.color, short: l.short }; });
        PATHS = d.curriculum.paths.map(function(p){ return { name: p.name, layers: p.layers.map(function(n){ return n - 1; }) }; });
      } else if(d.graph){
        (d.graph.nodes || []).forEach(function(n){ GRAPH_NODES.push({ id: n.id, sec: n.layer - 1, label: n.label, description: n.description }); });
        (d.graph.edges || []).forEach(function(e){ GRAPH_EDGES.push(e); });
        (d.graph.concepts || []).forEach(function(c){ CONCEPTS.push(c); });
      } else if(d.layer){ LAYER(d.layer, d.slides || []); }
      else if(d.tech){ TECH(Object.assign({}, d.tech, { slides: d.slides || [] })); }
      else if(d.practice){ PRACTICE_GROUP(Object.assign({}, d.practice, { slides: d.slides || [] })); }
      else if(d.closing){ CLOSING_SLIDES(d.slides || []); }
      else throw new Error('expected one of: curriculum, graph, layer, tech, practice, closing');
    } catch(err){ throw new Error(doc.file + ': ' + err.message); }
  });
}
var LANG = 'en';
function tx(v){
  if(v == null) return '';
  if(typeof v === 'object' && v.en !== undefined) return (LANG === 'vi' && v.vi !== undefined) ? v.vi : v.en;
  return v;
}
function L(en, vi){ return { en: en, vi: vi }; }      // bilingual value, resolved at render time
function X(en, vi){ return LANG === 'vi' ? vi : en; }  // bilingual string, resolved immediately

var ICONS = [
 '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
 '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
 '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 '<path d="M3 7h13M12 3l4 4-4 4M21 17H8M12 13l-4 4 4 4"/>',
 '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7l3 9M16 7l-3 9"/>',
 '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
 '<path d="M4 20V4M4 20h16M8 16v-5M12 16V7M16 16v-8"/>',
 '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 '<path d="M12 21V9M7 14l5-5 5 5M4 4h16"/>',
 '<circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 7.5v9M18 11.5c0 4-12 2-12 5"/>',
 '<rect x="9" y="9" width="6" height="6"/><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><rect x="16" y="16" width="5" height="5"/>',
 '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
 '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2.5.6 4 2.5 4 5.5"/>',
 '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4M9 13h.01M15 13h.01M9 16.5h6"/>',
 '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6.5l3.2 4.2M7 17.5l3.2-4.2M14 11l3.2-3.8M14 13l3.2 3.8"/>',
 '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9.5a2 2 0 0 1 4 0V11"/>',
 '<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M11 7l-5 9M13 7l5 9M7.2 18h9.6"/>',
 '<circle cx="12" cy="12" r="9"/><path d="M14.5 9a2.5 2 0 0 0-2.5-1.5c-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2A2.7 2 0 0 1 9.5 15M12 6v1.5M12 16.5V18"/>',
 '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 9l3 3-3 3M12 15h5M8 21h8"/>',
 '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h6M8 11h6"/>',
 '<rect x="4" y="4" width="4" height="16"/><rect x="10" y="4" width="4" height="16"/><rect x="16" y="4" width="4" height="16"/>',
 '<path d="M3 12h5l2-7 4 14 2-7h5"/>'
];
function icon(i){ return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[i] + '</svg>'; }

/* ============ TEXT HELPERS ============ */
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function inl(s){
  return esc(tx(s))
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
}
var TAGS = { must:'Must-know', nice:'Nice-to-have', senior:'Senior-level' };
function badge(t){ return t ? '<span class="badge ' + t + '">' + esc(tx(TAGS[t])) + '</span>' : ''; }

/* ============ SYNTAX HIGHLIGHTER (vanilla) ============ */
var KW = {
 sql:'select from where group by order having join left right inner outer full cross on as with recursive union all intersect except case when then else end and or not in is null like ilike between exists distinct limit offset over partition rows range unbounded preceding following current row insert into values update set delete create table view replace merge using matched qualify cluster materialized if lateral unnest filter within asc desc true false interval date timestamp int integer varchar string float boolean primary key references grant revoke to returns policy masking temporary temp transient clone add column alter drop schema database warehouse explain analyze',
 python:'import from as def class return if elif else for while in not and or is None True False with try except finally raise lambda yield pass break continue assert global nonlocal async await del',
 yaml:'true false null yes no',
 bash:'if then else elif fi for do done while case esac function in set export echo cd source exit return local trap',
 hcl:'resource variable module data provider output locals terraform for_each count depends_on true false null',
 docker:'FROM RUN CMD COPY ADD ENV WORKDIR ENTRYPOINT ARG USER EXPOSE AS',
 json:'true false null',
 md:''
};
var RX = {
 dash:/--[^\n]*/.source, hash:/#[^\n]*/.source, slash:/\/\/[^\n]*/.source, block:/\/\*[\s\S]*?\*\//.source,
 sqS:/'(?:[^'\n]|'')*'/.source, bsS:/'(?:[^'\\\n]|\\.)*'/.source, dqS:/"(?:[^"\\\n]|\\.)*"/.source,
 tq:/"""[\s\S]*?"""|'''[\s\S]*?'''/.source,
 jinja:/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\{#[\s\S]*?#\}/.source,
 num:/\b\d+(?:\.\d+)?\b/.source,
 fn:/\b[A-Za-z_][\w]*(?=\()/.source,
 key:/^[ \t]*-?[ \t]*[A-Za-z_][\w.\-]*(?=:)/.source,
 mdh:/^#{1,6} [^\n]*/.source,
 bashv:/\$\{?[A-Za-z_][\w]*\}?/.source,
 deco:/@[A-Za-z_][\w.]*/.source,
 flag:/(?<=\s)--?[A-Za-z][\w\-]*/.source
};
function langRules(lang){
  // each rule: [regex source, css class]
  var kwRe = function(l, ci){ var w = (KW[l]||'').trim().split(/\s+/).join('|'); return w ? '\\b(?:' + w + ')\\b' : null; };
  var R = [];
  var add = function(src, cls){ if(src) R.push([src, cls]); };
  switch(lang){
    case 'sql': add(RX.dash,'c'); add(RX.block,'c'); add(RX.jinja,'t'); add(RX.sqS,'s'); add(RX.dqS,'s'); add(RX.num,'n'); add(kwRe('sql'),'k'); add(RX.fn,'f'); break;
    case 'python': add(RX.hash,'c'); add(RX.tq,'s'); add(RX.bsS,'s'); add(RX.dqS,'s'); add(RX.deco,'f'); add(RX.num,'n'); add(kwRe('python'),'k'); add(RX.fn,'f'); break;
    case 'yaml': add(RX.hash,'c'); add(RX.jinja,'t'); add(RX.key,'y'); add(RX.bsS,'s'); add(RX.dqS,'s'); add(RX.num,'n'); add(kwRe('yaml'),'k'); break;
    case 'bash': add(RX.hash,'c'); add(RX.dqS,'s'); add(RX.bsS,'s'); add(RX.bashv,'v'); add(RX.flag,'n'); add(kwRe('bash'),'k'); break;
    case 'hcl': add(RX.hash,'c'); add(RX.slash,'c'); add(RX.dqS,'s'); add(RX.num,'n'); add(kwRe('hcl'),'k'); add(/^[ \t]*[A-Za-z_][\w]*(?=[ \t]*=)/.source,'y'); break;
    case 'docker': add(RX.hash,'c'); add(RX.dqS,'s'); add(RX.num,'n'); add('^(?:' + KW.docker.split(' ').join('|') + ')\\b','k'); break;
    case 'json': add(RX.dqS + '(?=\\s*:)','y'); add(RX.dqS,'s'); add(RX.num,'n'); add(kwRe('json'),'k'); break;
    case 'lookml': add(RX.hash,'c'); add(RX.dqS,'s'); add(/\$\{[^}]*\}/.source,'t'); add('\\b(?:view|explore|join|dimension|dimension_group|measure|sql_table_name|primary_key|type|sql|filters|timeframes|yes|no)\\b(?=\\s*[:{])','k'); add(RX.num,'n'); break;
    case 'ini': add(/^[;#][^\n]*/.source,'c'); add(/^\[[^\]\n]+\]/.source,'k'); add(/^[A-Za-z_][\w.\-]*(?=[ \t]*=)/.source,'y'); add(RX.num,'n'); break;
    case 'cypher': add(RX.slash,'c'); add(RX.sqS,'s'); add(RX.num,'n'); add('\\b(?:MATCH|OPTIONAL|WHERE|RETURN|ORDER|BY|AS|LIMIT|WITH|CREATE|MERGE|DISTINCT)\\b','k'); add(RX.fn,'f'); break;
    case 'md': add(RX.mdh,'k'); add(/`[^`\n]+`/.source,'s'); break;
    default: break;
  }
  return R;
}
var RULE_CACHE = {};
function hl(code, lang){
  var rules = RULE_CACHE[lang] || (RULE_CACHE[lang] = langRules(lang));
  if(!rules.length) return esc(code);
  var flags = (lang === 'sql' ? 'gmi' : 'gm');
  var re = new RegExp(rules.map(function(r){ return '(' + r[0] + ')'; }).join('|'), flags);
  var out = '', last = 0, m;
  while((m = re.exec(code))){
    if(m[0] === ''){ re.lastIndex++; continue; }
    var idx = -1;
    for(var i = 1; i <= rules.length; i++){ if(m[i] !== undefined){ idx = i - 1; break; } }
    out += esc(code.slice(last, m.index));
    out += '<span class="tk-' + rules[idx][1] + '">' + esc(m[0]) + '</span>';
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}
function codeBlock(b){
  var raw = b.code.replace(/^\n/, '').replace(/\s+$/, '');
  CODES.push(raw);
  return '<figure class="code"><figcaption><span class="t">' + esc(b.title || '') + '</span><span>' + esc(b.lang || 'text') +
    '</span><button class="copy" data-i="' + (CODES.length - 1) + '" aria-label="Copy code">Copy</button></figcaption><pre tabindex="0"><code>' +
    hl(raw, b.lang) + '</code></pre></figure>';
}

/* ============ SVG HELPERS ============ */
function lines(txt, x, y, cls, dy){
  var parts = String(tx(txt)).split('|'), s = '';
  for(var i = 0; i < parts.length; i++){
    s += '<text class="' + cls + '" x="' + x + '" y="' + (y + i * (dy || 15)) + '" text-anchor="middle">' + esc(parts[i]) + '</text>';
  }
  return s;
}
// box with colored top strip; title | sub lines separated by "|"
function bx(x, y, w, h, title, sub, col, cls){
  title = tx(title); sub = tx(sub);
  var s = '<rect class="' + (cls || 'bx') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"/>';
  if(col) s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="6" rx="3" fill="' + col + '"/>';
  var ty = y + (col ? 26 : 22);
  s += lines(title, x + w / 2, ty, 'b', 15);
  if(sub) s += lines(sub, x + w / 2, ty + 5 + (String(title).split('|').length) * 14, 'sm', 13);
  return s;
}
function arrow(x1, y1, x2, y2, dashed){
  return '<path class="ln' + (dashed ? ' dash' : '') + '" d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" marker-end="url(#arr)"/>';
}
function elbow(x1, y1, xm, y2, x2){
  return '<path class="ln" d="M' + x1 + ' ' + y1 + 'H' + xm + 'V' + y2 + 'H' + x2 + '" marker-end="url(#arr)"/>';
}
function svg(w, h, inner, label){
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(tx(label || 'diagram')) + '">' + inner + '</svg>';
}
function txt(x, y, s, cls, anchor){
  return '<text class="' + (cls || '') + '" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'start') + '">' + esc(tx(s)) + '</text>';
}

/* ============ SLIDE RENDERERS ============ */
function cardHTML(c, plain){
  var s = '<div class="card' + (plain ? ' plain' : '') + '"><h4><span>' + inl(c.h) + '</span>' + badge(c.tag) + '</h4>';
  if(c.p) s += '<p>' + inl(c.p) + '</p>';
  if(c.list) s += '<ul>' + c.list.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ul>';
  return s + '</div>';
}
function listHTML(items){
  return '<ul class="list">' + items.map(function(it){
    if(typeof it === 'string') return '<li><div>' + inl(it) + '</div></li>';
    return '<li><div>' + (it.h ? '<b>' + inl(it.h) + '</b> ' : '') + inl(it.p || '') + '</div>' + badge(it.tag) + '</li>';
  }).join('') + '</ul>';
}
function tableHTML(head, rows){
  return '<div class="tw"><table><thead><tr>' + head.map(function(h){ return '<th>' + esc(tx(h)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    rows.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + inl(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
    '</tbody></table></div>';
}
/* A diagram is a function name, { fn, args }, a function, or raw SVG markup. */
function figure(v){
  if(typeof v === 'function') return v();
  if(typeof v === 'string'){
    if(v.charAt(0) === '<') return v;
    if(typeof globalThis[v] !== 'function') throw new Error('Unknown diagram: ' + v);
    return globalThis[v]();
  }
  if(v && v.fn){
    if(typeof globalThis[v.fn] !== 'function') throw new Error('Unknown diagram: ' + v.fn);
    return globalThis[v.fn].apply(null, v.args || []);
  }
  throw new Error('Invalid diagram reference');
}
/* Composable blocks for slides that mix a table, code, cards and a diagram. */
function partHTML(p){
  if(p.table) return tableHTML(p.table.head, p.table.rows);
  if(p.code) return codeBlock(p.code);
  if(p.cards) return '<div class="grid ' + (p.cols ? 'c' + p.cols : '') + '">' + p.cards.map(function(c){ return cardHTML(c, p.plain !== false); }).join('') + '</div>';
  if(p.svg) return '<div class="fig">' + figure(p.svg) + '</div>';
  if(p.split) return '<div class="split even">' + p.split.map(function(col){ return '<div>' + partsHTML(col) + '</div>'; }).join('') + '</div>';
  if(p.links) return '<p class="refs">' + p.links.map(function(r){ return '<a href="' + esc(r[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(r[0]) + '</a>'; }).join('') + '</p>';
  if(p.list) return listHTML(p.list);
  if(p.text) return '<p>' + inl(p.text) + '</p>';
  if(p.note) return '<p class="note">' + inl(p.note) + '</p>';
  throw new Error('Unknown part: ' + Object.keys(p).join(','));
}
function partsHTML(parts){ return '<div class="stack">' + parts.map(partHTML).join('') + '</div>'; }
function labHTML(o){
  var lab = { scn:X('Scenario','Kịch bản'), inp:X('Input and setup','Đầu vào và thiết lập'), tasks:X('Tasks','Nhiệm vụ'), exp:X('Expected output','Kết quả mong đợi'), rub:X('Evaluation criteria','Tiêu chí đánh giá'), des:X('Production design question','Câu hỏi thiết kế production') };
  var ol = function(a){ return '<ol class="qs">' + a.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ol>'; };
  var ul = function(a){ return '<ul class="checks">' + a.map(function(x){ return '<li><span>' + inl(x) + '</span></li>'; }).join('') + '</ul>'; };
  return '<div class="grid c2">' +
    '<div class="card"><h4>' + lab.scn + '</h4><p>' + inl(o.scenario) + '</p></div>' +
    '<div class="card plain"><h4>' + lab.inp + '</h4><p>' + inl(o.input) + '</p></div>' +
    '<div class="card plain"><h4>' + lab.tasks + '</h4>' + ol(o.tasks) + '</div>' +
    '<div class="card plain"><h4>' + lab.exp + '</h4><p>' + inl(o.expected) + '</p><h4 style="margin-top:12px">' + lab.rub + '</h4>' + ul(o.rubric) + '</div></div>' +
    '<div class="card plain" style="margin-top:14px"><h4>' + lab.des + '</h4><p>' + inl(o.design) + '</p></div>';
}
/* one uniform slide per ML model: how it works, input/output format, variables, use and limits, code */
function modelHTML(o){
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
var INCIDENT_STEPS = [
  ['sym', L('1. Symptoms','1. Triệu chứng')], ['impact', L('2. Business impact','2. Tác động nghiệp vụ')], ['causes', L('3. Possible root causes','3. Nguyên nhân gốc có thể')],
  ['evidence', L('4. Evidence to collect','4. Bằng chứng cần thu thập')], ['diag', L('5. Diagnostic procedure','5. Quy trình chẩn đoán')], ['fix', L('6. Resolution options and trade-offs','6. Phương án xử lý và đánh đổi')],
  ['prev', L('7. Prevention','7. Phòng ngừa')], ['post', L('8. Postmortem','8. Postmortem')]
];
function renderBody(s){
  var h = '';
  switch(s.k){
    case 'cards':
      h = '<div class="grid ' + (s.cols ? 'c' + s.cols : '') + '">' + s.cards.map(function(c){ return cardHTML(c, s.plain); }).join('') + '</div>';
      break;
    case 'list':
      h = listHTML(s.items);
      break;
    case 'table':
      h = tableHTML(s.head, s.rows);
      break;
    case 'code':
      var blocks = s.blocks.map(codeBlock);
      if(s.points){
        h = '<div class="split"><div>' + blocks.join('') + '</div><div class="grid" style="grid-template-columns:1fr">' +
            s.points.map(function(c){ return cardHTML(c, true); }).join('') + '</div></div>';
      } else if(blocks.length === 2){
        h = '<div class="split even"><div>' + blocks[0] + '</div><div>' + blocks[1] + '</div></div>';
      } else {
        h = blocks.join('');
      }
      break;
    case 'svg':
      h = '<div class="fig">' + figure(s.svg) + '</div>';
      break;
    case 'stack':
      h = partsHTML(s.parts);
      break;
    case 'lab':
      h = labHTML(s);
      break;
    case 'model':
      h = modelHTML(s);
      break;
    case 'lifecycle':
      h = '<div class="lc" style="margin-top:22px">' + s.steps.map(function(x){
        return '<div><h4>' + inl(x[0]) + '</h4><p>' + inl(x[1]) + '</p><small>' + esc(X('observe: ', 'quan sát: ')) + inl(x[2]) + '</small></div>';
      }).join('') + '</div>';
      break;
    case 'components':
      h = '<div class="split even"><div>' + tableHTML(['Component','Role'], s.comps) + '</div><div>' +
        '<div class="card plain"><h4>' + esc(tx('Typical workflow')) + '</h4><ol class="qs">' + s.flow.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ol></div>' +
        '<div class="card plain" style="margin-top:14px"><h4>' + esc(tx('Operating notes')) + '</h4><ul>' + s.ops.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ul></div></div></div>';
      break;
    case 'incident':
      h = tableHTML([L('Step','Bước'), L('Content','Nội dung')], INCIDENT_STEPS.map(function(st){ return [st[1], s[st[0]]]; }));
      break;
    case 'check':
      h = '<div class="split even"><div class="card"><h4>' + inl(s.left.h) + '</h4><ul class="checks">' +
          s.left.items.map(function(x){ return '<li><span>' + inl(x) + '</span></li>'; }).join('') + '</ul></div>' +
          '<div class="card"><h4>' + inl(s.right.h) + '</h4><ol class="qs">' +
          s.right.items.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ol></div></div>';
      break;
    case 'pit':
      h = '<div class="pit">' + s.rows.map(function(r){
        return '<div class="row"><div class="bad"><h5>' + esc(tx('Anti-pattern')) + '</h5><p><b>' + inl(r.bad) + '</b> ' + inl(r.why || '') + '</p></div>' +
               '<div class="fix"><h5>' + esc(tx('Instead')) + '</h5><p>' + inl(r.fix) + '</p></div></div>';
      }).join('') + '</div>';
      break;
    case 'html':
      h = (typeof s.html === 'function') ? s.html() : s.html;
      break;
  }
  if(s.after) h += '<div style="margin-top:12px">' + partsHTML(s.after) + '</div>';
  if(s.cap) h += '<p class="cap">' + inl(s.cap) + '</p>';
  return h;
}
function slideHTML(s, sec){
  var head = '';
  if(sec) head += '<div class="chip">' + icon(sec.icon) + '<span>' + esc(sec.name) + '</span></div>';
  if(s.t) head += '<h2>' + inl(s.t) + '</h2>';
  if(s.lead) head += '<p class="lead">' + inl(s.lead) + '</p>';
  var notes = s.n ? '<aside class="notes"><b>' + esc(tx('Speaker notes.')) + '</b> ' + inl(s.n) + '</aside>' : '';
  var refs = '';
  if(s.refs){ refs = '<p class="refs">' + esc(tx('Official documentation:')) + ' ' + s.refs.map(function(r){ return '<a href="' + r[1] + '" target="_blank" rel="noopener noreferrer">' + esc(r[0]) + '</a>'; }).join('') + '</p>'; }
  return '<div class="slide-in">' + head + renderBody(s) + refs + notes + '</div>';
}
