"use strict";
(function(){
  var CLOSE_COLOR = '#64748B', INTRO_COLOR = '#2563EB', CLOSE_SEC = 99;
  var SLIDES = [], els = [], firstIdx = {}, N = 0, cur = 0;
  var stage = document.getElementById('stage'), bar = document.getElementById('bar'), count = document.getElementById('count');
  var secname = document.getElementById('secname'), toc = document.getElementById('toc'), ov = document.getElementById('ov'), body = document.body;
  var graphPanel = document.getElementById('graph'), graphSvg = document.getElementById('graph-svg'), graphInspector = document.getElementById('graph-inspector');
  var selectedGraphId = null, graphReturnFocus = null;

  var REFMAP = {
    Kafka:[['Apache Kafka','https://kafka.apache.org/documentation/'],['Debezium','https://debezium.io/documentation/']],
    Spark:[['Apache Spark','https://spark.apache.org/docs/latest/']], Flink:[['Apache Flink','https://nightlies.apache.org/flink/flink-docs-stable/']],
    Iceberg:[['Apache Iceberg','https://iceberg.apache.org/docs/latest/']], Airflow:[['Apache Airflow','https://airflow.apache.org/docs/']],
    dbt:[['dbt','https://docs.getdbt.com/']], Snowflake:[['Snowflake','https://docs.snowflake.com/']], BigQuery:[['BigQuery','https://cloud.google.com/bigquery/docs']],
    Databricks:[['Databricks','https://docs.databricks.com/']], Kubernetes:[['Kubernetes','https://kubernetes.io/docs/']], Terraform:[['Terraform','https://developer.hashicorp.com/terraform/docs']],
    'AWS data stack':[['AWS','https://docs.aws.amazon.com/']], 'Azure data stack':[['Azure','https://learn.microsoft.com/azure/']], 'Microsoft Fabric':[['Microsoft Fabric','https://learn.microsoft.com/fabric/']]
  };
  var searchIdx = [], rawText = [];
  function loadSet(key){ try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(err){ return []; } }
  function saveSet(key, arr){ try { localStorage.setItem(key, JSON.stringify(arr)); } catch(err){} }
  var seen = loadSet('deck-seen'), bookmarks = loadSet('deck-bm');
  function plain(s){ return String(tx(s) || '').replace(/`/g, ''); }
  function secStart(i){ return firstIdx[i] !== undefined ? firstIdx[i] : 0; }
  function translateSvg(el){
    if(LANG !== 'vi') return;
    var ts = el.querySelectorAll('svg text');
    for(var i = 0; i < ts.length; i++){ var v = DICT[ts[i].textContent]; if(v !== undefined) ts[i].textContent = v; }
  }

  function build(){
    CODES.length = 0; SLIDES = []; firstIdx = {};
    var introName = tx('Introduction');
    [titleSlide(), agendaSlide(), bigPictureSlide()].forEach(function(s){
      var inner = (s.k === 'html' && s.title === 'Title')
        ? s.html + (s.n ? '<div class="slide-in"><aside class="notes"><b>' + esc(tx('Speaker notes.')) + '</b> ' + inl(s.n) + '</aside></div>' : '')
        : slideHTML(s, null);
      SLIDES.push({ html: inner, sec: -1, color: INTRO_COLOR, group: introName, title: s.t ? plain(s.t) : X('Title', 'Tiêu đề'), kind: s.k });
    });
    PATHS.forEach(function(path){ path.layers.forEach(function(i){
      var sec = DATA[i];
      var meta = META[i], secObj = { name: (i + 1) + '. ' + tx(meta.name), icon: i };
      sec.slides.forEach(function(s, j){
        SLIDES.push({ html: slideHTML(s, secObj), sec: i, color: meta.color, group: secObj.name, title: plain(s.t), kind: s.k });
      });
    }); });
    ARCH.forEach(function(g, gi){
      var secObj = { name: X('Appendix: ', 'Phụ lục: ') + tx(g.name), icon: 5 };
      g.slides.forEach(function(sl0){
        var sl = REFMAP[g.name] ? Object.assign({}, sl0, { refs: REFMAP[g.name] }) : sl0;
        SLIDES.push({ html: slideHTML(sl, secObj), sec: 30 + gi, color: g.color, group: secObj.name, title: plain(sl.t), kind: sl.k });
      });
    });
    PRACTICE.forEach(function(g, gi){
      var secObj = { name: X('Practice: ', 'Thực hành: ') + tx(g.name), icon: 5 };
      g.slides.forEach(function(sl){
        SLIDES.push({ html: slideHTML(sl, secObj), sec: 50 + gi, color: g.color, group: secObj.name, title: plain(sl.t), kind: sl.k });
      });
    });
    var closeObj = { name: tx('Roadmap and resources'), icon: 5 };
    CLOSING.forEach(function(s){
      SLIDES.push({ html: slideHTML(s, closeObj), sec: CLOSE_SEC, color: CLOSE_COLOR, group: closeObj.name, title: plain(s.t), kind: s.k });
    });
    N = SLIDES.length;
    stage.innerHTML = ''; els = [];
    SLIDES.forEach(function(s, i){
      var el = document.createElement('section');
      el.className = 'slide'; el.setAttribute('data-i', i);
      el.style.setProperty('--accent', s.color);
      el.setAttribute('aria-label', (i + 1) + ' / ' + N + ': ' + s.title);
      el.innerHTML = s.html; translateSvg(el);
      stage.appendChild(el); els.push(el);
    });
    SLIDES.forEach(function(s, i){ if(firstIdx[s.sec] === undefined) firstIdx[s.sec] = i; });
    buildToc(); buildOv(); buildSearch(); buildGraph();
  }

  function kindLabel(k){
    return tx({ cards:'Overview / cards', table:'Table', code:'Code', svg:'Diagram', check:'Checklist', pit:'Pitfalls', html:'Components / table', list:'List' }[k] || '');
  }
  function buildToc(){
    var h = '<div class="prog" id="prog"></div>';
    if(bookmarks.length){
      h += '<h3>' + esc(tx('Bookmarks')) + '</h3>';
      bookmarks.forEach(function(i){ if(SLIDES[i]) h += '<a class="bmk" href="#s' + (i + 1) + '" data-go="' + i + '" style="--accent:' + SLIDES[i].color + '"><span>' + esc(SLIDES[i].title) + '</span><span class="num">' + (i + 1) + '</span></a>'; });
    }
    h += '<h3>' + esc(tx('Introduction')) + '</h3>';
    [X('Title', 'Tiêu đề'), X('Agenda', 'Chương trình'), X('Big picture', 'Bức tranh tổng thể')].forEach(function(n, i){
      h += '<a href="#s' + (i + 1) + '" data-go="' + i + '" style="--accent:' + INTRO_COLOR + '"><span>' + esc(n) + '</span><span class="num">' + (i + 1) + '</span></a>';
    });
    h += '<h3>' + esc(X('Learning paths', 'Lộ trình học')) + '</h3>';
    PATHS.forEach(function(path){
      h += '<h3>' + esc(tx(path.name)) + '</h3>';
      path.layers.forEach(function(i){
        var m = META[i];
        h += '<a href="#s' + (secStart(i) + 1) + '" data-go="' + secStart(i) + '" data-s="' + i + '" style="--accent:' + m.color + '">' + icon(i).replace('<svg ', '<svg class="ico" ') + '<span>' + (i + 1) + '. ' + esc(tx(m.name)) + '</span><span class="num">' + (secStart(i) + 1) + '</span></a>';
      });
    });
    h += '<h3>' + esc(tx('Appendix: how the tools work inside')) + '</h3>';
    ARCH.forEach(function(g, gi){
      var idx = secStart(30 + gi);
      h += '<a href="#s' + (idx + 1) + '" data-go="' + idx + '" data-s="' + (30 + gi) + '" style="--accent:' + g.color + '"><span>' + esc(tx(g.name)) + '</span><span class="num">' + (idx + 1) + '</span></a>';
    });
    h += '<h3>' + esc(tx('Engineering practice: scenarios, incidents, competency, governance')) + '</h3>';
    PRACTICE.forEach(function(g, gi){
      var idx = secStart(50 + gi);
      h += '<a href="#s' + (idx + 1) + '" data-go="' + idx + '" data-s="' + (50 + gi) + '" style="--accent:' + g.color + '"><span>' + esc(tx(g.name)) + '</span><span class="num">' + (idx + 1) + '</span></a>';
    });
    h += '<h3>' + esc(tx('Closing')) + '</h3>';
    var cs = secStart(CLOSE_SEC);
    CLOSING.forEach(function(s, j){
      h += '<a href="#s' + (cs + j + 1) + '" data-go="' + (cs + j) + '" style="--accent:' + CLOSE_COLOR + '"><span>' + esc(plain(s.t)) + '</span><span class="num">' + (cs + j + 1) + '</span></a>';
    });
    toc.innerHTML = h;
  }
  function buildOv(){
    var h = '', last = null;
    SLIDES.forEach(function(s, i){
      if(s.group !== last){ if(last !== null) h += '</div>'; h += '<h3>' + esc(s.group) + '</h3><div class="og">'; last = s.group; }
      h += '<button data-go="' + i + '" style="--c:' + s.color + '"><span class="on">' + (i + 1) + '</span><span class="ot">' + esc(s.title) + '</span><span class="os">' + esc(kindLabel(s.kind)) + '</span></button>';
    });
    ov.innerHTML = h + '</div>';
  }

  function copyCode(btn){
    var text = CODES[parseInt(btn.getAttribute('data-i'), 10)] || '';
    var done = function(){ var o = btn.textContent; btn.textContent = X('Copied', 'Đã chép'); setTimeout(function(){ btn.textContent = o; }, 1400); };
    var fallback = function(){
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch(err){ btn.textContent = 'Ctrl+C'; }
      document.body.removeChild(ta);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
  }

  stage.addEventListener('click', function(e){
    var a = e.target.closest('[data-sec]');
    if(a){ e.preventDefault(); go(secStart(parseInt(a.getAttribute('data-sec'), 10))); return; }
    var c = e.target.closest('.copy'); if(c) copyCode(c);
  });
  toc.addEventListener('click', function(e){
    var a = e.target.closest('a[data-go]'); if(!a) return;
    e.preventDefault(); go(parseInt(a.getAttribute('data-go'), 10));
    if(window.innerWidth < 1200) setToc(false);
  });
  ov.addEventListener('click', function(e){
    var b = e.target.closest('button[data-go]'); if(!b) return;
    go(parseInt(b.getAttribute('data-go'), 10)); setOv(false);
  });

  function go(i, noHash){
    i = Math.max(0, Math.min(N - 1, i));
    if(els[cur]) els[cur].classList.remove('active');
    cur = i;
    var el = els[cur]; el.classList.add('active'); el.scrollTop = 0;
    var s = SLIDES[cur];
    bar.style.width = (N > 1 ? (cur / (N - 1)) * 100 : 100) + '%';
    document.documentElement.style.setProperty('--accent', s.color);
    count.textContent = (cur + 1) + ' / ' + N;
    secname.textContent = s.group;
    document.title = s.title + ' | Modern Data Engineering';
    var links = toc.querySelectorAll('a');
    for(var k = 0; k < links.length; k++){ links[k].classList.toggle('cur', parseInt(links[k].getAttribute('data-go'), 10) === cur); }
    var cc = toc.querySelector('a.cur'); if(cc && body.classList.contains('toc-open')) cc.scrollIntoView({ block:'nearest' });
    var obs = ov.querySelectorAll('button'); for(var q = 0; q < obs.length; q++){ obs[q].classList.toggle('cur', q === cur); }
    if(seen.indexOf(cur) < 0){ seen.push(cur); saveSet('deck-seen', seen); }
    updateProgress(); updateBm();
    document.getElementById('status').textContent = (cur + 1) + ' / ' + N + ': ' + s.title;
    if(!noHash){ try { history.replaceState(null, '', '#s' + (cur + 1)); } catch(err){} }
  }
  function updateProgress(){
    var tot = {}, got = {}, seenSet = {};
    seen.forEach(function(i){ seenSet[i] = 1; });
    SLIDES.forEach(function(s, i){ tot[s.sec] = (tot[s.sec] || 0) + 1; if(seenSet[i]) got[s.sec] = (got[s.sec] || 0) + 1; });
    var links = toc.querySelectorAll('a[data-s]');
    for(var k = 0; k < links.length; k++){
      var sec = links[k].getAttribute('data-s'), n = links[k].querySelector('.num');
      if(n) n.textContent = (got[sec] || 0) + '/' + (tot[sec] || 0);
    }
    var p = document.getElementById('prog');
    var done = 0; for(var key in seenSet){ if(SLIDES[key]) done++; }
    if(p) p.textContent = tx('Progress') + ': ' + done + ' / ' + N;
  }
  function updateBm(){
    var on = bookmarks.indexOf(cur) >= 0, b = document.getElementById('btn-bm');
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function toggleBm(){
    var i = bookmarks.indexOf(cur);
    if(i >= 0) bookmarks.splice(i, 1); else bookmarks.push(cur);
    saveSet('deck-bm', bookmarks);
    buildToc(); updateProgress(); updateBm();
    var cc = toc.querySelectorAll('a'); for(var k = 0; k < cc.length; k++){ cc[k].classList.toggle('cur', parseInt(cc[k].getAttribute('data-go'), 10) === cur && !cc[k].classList.contains('bmk')); }
  }
  function buildSearch(){
    rawText = els.map(function(el){ return el.textContent.replace(/\s+/g, ' '); });
    searchIdx = rawText.map(function(t){ return t.toLowerCase(); });
  }
  function graphLines(value, maxLength){
    var words = String(value).split(/\s+/), lines = [], line = '';
    words.forEach(function(word){
      if(line && (line + ' ' + word).length > maxLength){ lines.push(line); line = word; }
      else line += (line ? ' ' : '') + word;
    });
    if(line) lines.push(line);
    return lines.slice(0, 2);
  }
  function buildGraph(){
    var positions = {}, nodesBySection = {};
    var parts = ['<defs><marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>'];
    graphSvg.setAttribute('viewBox', '0 0 1440 690');
    graphSvg.setAttribute('aria-label', tx('Knowledge graph'));
    PATHS.forEach(function(path, pathIndex){
      var x = 14 + pathIndex * 238;
      var pathLabel = graphLines(tx(path.name), 27);
      parts.push('<text class="graph-path-label" x="' + (x + 104) + '" y="24" text-anchor="middle">' + pathLabel.map(function(line, i){ return '<tspan x="' + (x + 104) + '" dy="' + (i ? 15 : 0) + '">' + esc(line) + '</tspan>'; }).join('') + '</text>');
      path.layers.forEach(function(section, row){
        var node = GRAPH_NODES.filter(function(item){ return item.sec === section; })[0];
        if(!node) return;
        var point = {x:x, y:68 + row * 116, width:208, height:62};
        positions[node.id] = point; nodesBySection[section] = node;
      });
    });
    GRAPH_EDGES.forEach(function(edge){
      var from = positions[edge.from], to = positions[edge.to];
      if(!from || !to) return;
      parts.push('<path class="graph-edge" data-from="' + edge.from + '" data-to="' + edge.to + '" d="M' + (from.x + from.width / 2) + ' ' + (from.y + from.height / 2) + 'L' + (to.x + to.width / 2) + ' ' + (to.y + to.height / 2) + '" marker-end="url(#graph-arrow)"><title>' + esc(tx(edge.relation)) + '</title></path>');
    });
    GRAPH_NODES.forEach(function(node, index){
      var point = positions[node.id]; if(!point) return;
      var labelLines = graphLines(tx(node.label), 25);
      var label = labelLines.map(function(line, i){ return '<tspan x="' + (point.x + 116) + '" dy="' + (i ? 14 : 0) + '">' + esc(line) + '</tspan>'; }).join('');
      parts.push('<g class="graph-node" data-graph-node="' + node.id + '" data-color="' + META[node.sec].color + '" style="--node-color:' + META[node.sec].color + '" role="button" tabindex="0" aria-pressed="false" aria-label="' + esc(tx(node.label)) + '"><title>' + esc(tx(node.description)) + '</title><rect x="' + point.x + '" y="' + point.y + '" width="' + point.width + '" height="' + point.height + '"/><text class="graph-node-number" x="' + (point.x + 12) + '" y="' + (point.y + 19) + '">' + (index + 1) + '</text><text x="' + (point.x + 116) + '" y="' + (point.y + (labelLines.length > 1 ? 25 : 33)) + '" text-anchor="middle">' + label + '</text></g>');
    });
    graphSvg.innerHTML = parts.join('');
    applyGraphFilter();
    if(selectedGraphId) selectGraphNode(selectedGraphId); else renderGraphInspector(null);
  }
  function applyGraphFilter(){
    var query = document.getElementById('graph-q').value.trim().toLowerCase();
    GRAPH_NODES.forEach(function(node){
      var match = !query || tx(node.label).toLowerCase().indexOf(query) >= 0;
      var el = graphSvg.querySelector('[data-graph-node="' + node.id + '"]');
      if(el) el.classList.toggle('filtered', !match);
    });
  }
  function graphNeighbors(node){
    return GRAPH_EDGES.filter(function(edge){ return edge.from === node.id || edge.to === node.id; }).map(function(edge){
      var outgoing = edge.from === node.id;
      return {node:GRAPH_NODES.filter(function(item){ return item.id === (outgoing ? edge.to : edge.from); })[0], relation:edge.relation, outgoing:outgoing};
    }).filter(function(item){ return !!item.node; });
  }
  function renderGraphInspector(node){
    if(!node){ graphInspector.innerHTML = '<p class="graph-empty">' + esc(tx('Select a concept to inspect its connections.')) + '</p>'; return; }
    var neighbors = graphNeighbors(node);
    var rows = neighbors.map(function(item){
      return '<button class="graph-relation" data-graph-select="' + item.node.id + '">' +
        (item.outgoing ? esc(tx(node.label)) : esc(tx(item.node.label))) +
        '<span>' + esc(tx(item.outgoing ? 'Outgoing' : 'Incoming')) + ': ' + esc(tx(item.relation)) + '</span>' +
        (item.outgoing ? esc(tx(item.node.label)) : esc(tx(node.label))) + '</button>';
    }).join('');
    graphInspector.innerHTML = '<h3>' + esc(tx(node.label)) + '</h3><p>' + esc(tx(node.description)) + '</p>' +
      '<button class="graph-open" data-graph-go="' + secStart(node.sec) + '">' + esc(tx('Open layer')) + ' ' + (node.sec + 1) + '</button>' +
      '<h4>' + esc(tx('Connected concepts')) + '</h4>' + (rows || '<p class="graph-empty">' + esc(tx('No concepts match this search.')) + '</p>');
  }
  function selectGraphNode(id){
    var node = GRAPH_NODES.filter(function(item){ return item.id === id; })[0];
    if(!node) return;
    selectedGraphId = id;
    var related = {};
    graphNeighbors(node).forEach(function(item){ related[item.node.id] = true; });
    graphSvg.querySelectorAll('.graph-node').forEach(function(el){
      var selected = el.getAttribute('data-graph-node') === id;
      var neighbor = !!related[el.getAttribute('data-graph-node')];
      el.classList.toggle('selected', selected);
      el.classList.toggle('neighbor', neighbor);
      el.classList.toggle('faded', !selected && !neighbor);
      el.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    graphSvg.querySelectorAll('.graph-edge').forEach(function(el){
      var active = el.getAttribute('data-from') === id || el.getAttribute('data-to') === id;
      el.classList.toggle('active', active);
      el.classList.toggle('faded', !active);
    });
    renderGraphInspector(node);
  }
  function setGraph(on){
    body.classList.toggle('graph-on', on);
    graphPanel.setAttribute('aria-hidden', on ? 'false' : 'true');
    document.getElementById('btn-graph').setAttribute('aria-pressed', on ? 'true' : 'false');
    if(on){
      setSearch(false); setOv(false); setToc(false);
      graphReturnFocus = document.activeElement;
      document.getElementById('graph-q').focus();
    } else if(graphReturnFocus && graphReturnFocus.focus){
      graphReturnFocus.focus(); graphReturnFocus = null;
    }
  }
  function setSearch(on){
    body.classList.toggle('search-on', on);
    if(on){ var q = document.getElementById('q'); q.placeholder = tx('Search slides and code'); q.focus(); q.select(); }
  }
  function runSearch(){
    var q = document.getElementById('q').value.trim().toLowerCase(), box = document.getElementById('results');
    if(!q){ box.innerHTML = ''; return; }
    var toks = q.split(/\s+/), out = [];
    for(var i = 0; i < searchIdx.length && out.length < 40; i++){
      var ok = true; for(var t = 0; t < toks.length; t++){ if(searchIdx[i].indexOf(toks[t]) < 0){ ok = false; break; } }
      if(ok) out.push(i);
    }
    if(!out.length){ box.innerHTML = '<p class="note">' + esc(tx('No results')) + '</p>'; return; }
    var re = new RegExp('(' + toks.map(function(x){ return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
    box.innerHTML = out.map(function(i){
      var pos = searchIdx[i].indexOf(toks[0]), start = Math.max(0, pos - 50);
      var snip = esc(rawText[i].substr(start, 150)).replace(re, '<mark>$1</mark>');
      return '<button data-go="' + i + '" style="--c:' + SLIDES[i].color + '"><b>' + (i + 1) + '. ' + esc(SLIDES[i].title) + '</b><small>' + esc(SLIDES[i].group) + '</small><small>…' + snip + '…</small></button>';
    }).join('');
  }
  function validate(){
    var saved = LANG;
    function texts(l){ LANG = l; build(); return els.map(function(e){ return e.textContent; }); }
    var en = texts('en'), vi = texts('vi'), titles = SLIDES.map(function(s){ return s.title; });
    var word = /[A-Za-zÀ-ỹ]{4,}/g, untranslated = [], shareSum = 0;
    for(var i = 0; i < en.length; i++){
      var set = {}; (en[i].toLowerCase().match(word) || []).forEach(function(w){ set[w] = 1; });
      var v = vi[i].toLowerCase().match(word) || [], diff = 0;
      v.forEach(function(w){ if(!set[w]) diff++; });
      var share = v.length ? diff / v.length : 1;
      shareSum += share;
      if(share < 0.05) untranslated.push(titles[i]);
    }
    LANG = saved; build(); go(Math.min(cur, N - 1), true);
    var noNotes = els.filter(function(e){ return !e.querySelector('.notes'); }).length;
    return { slides: N, withoutNotes: noNotes, avgTranslatedShare: Math.round(shareSum / en.length * 100) + '%', slidesWithNoTranslation: untranslated.length, withOfficialLinks: els.filter(function(e){ return e.querySelector('.refs'); }).length };
  }
  function setToc(on){ body.classList.toggle('toc-open', on); document.getElementById('btn-toc').setAttribute('aria-pressed', on ? 'true' : 'false'); }
  function setOv(on){
    body.classList.toggle('ov-on', on);
    document.getElementById('btn-ov').setAttribute('aria-pressed', on ? 'true' : 'false');
    if(on){ var c = ov.querySelector('button.cur'); if(c) c.scrollIntoView({ block:'center' }); }
  }
  function setNotes(on){ body.classList.toggle('show-notes', on); document.getElementById('btn-notes').setAttribute('aria-pressed', on ? 'true' : 'false'); }
  function setTheme(t){
    var root = document.documentElement;
    if(t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    try { if(t) localStorage.setItem('deck-theme', t); } catch(err){}
  }
  function isDark(){
    var t = document.documentElement.getAttribute('data-theme');
    if(t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function applyStatic(){
    var a = document.querySelectorAll('[data-i18n]');
    for(var i = 0; i < a.length; i++) a[i].textContent = tx(a[i].getAttribute('data-i18n'));
    var b = document.querySelectorAll('[data-i18n-title]');
    for(var j = 0; j < b.length; j++){ var t = tx(b[j].getAttribute('data-i18n-title')); b[j].title = t; b[j].setAttribute('aria-label', t); }
    var c = document.querySelectorAll('[data-i18n-placeholder]');
    for(var k = 0; k < c.length; k++) c[k].placeholder = tx(c[k].getAttribute('data-i18n-placeholder'));
    document.getElementById('lang-label').textContent = LANG === 'vi' ? 'VI' : 'EN';
  }
  function setLang(l){
    LANG = l; document.documentElement.lang = (l === 'vi') ? 'vi' : 'en';
    try { localStorage.setItem('deck-lang', l); } catch(err){}
    applyStatic(); build(); go(Math.min(cur, N - 1), true);
  }

  document.getElementById('prev').addEventListener('click', function(){ go(cur - 1); });
  document.getElementById('next').addEventListener('click', function(){ go(cur + 1); });
  document.getElementById('btn-toc').addEventListener('click', function(){ setToc(!body.classList.contains('toc-open')); });
  document.getElementById('scrim').addEventListener('click', function(){ setToc(false); });
  document.getElementById('btn-ov').addEventListener('click', function(){ setOv(!body.classList.contains('ov-on')); });
  document.getElementById('btn-graph').addEventListener('click', function(){ setGraph(!body.classList.contains('graph-on')); });
  document.getElementById('graph-close').addEventListener('click', function(){ setGraph(false); });
  document.getElementById('graph-q').addEventListener('input', applyGraphFilter);
  graphSvg.addEventListener('click', function(e){ var node = e.target.closest('[data-graph-node]'); if(node) selectGraphNode(node.getAttribute('data-graph-node')); });
  graphSvg.addEventListener('keydown', function(e){ if((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-graph-node]')){ e.preventDefault(); selectGraphNode(e.target.getAttribute('data-graph-node')); } });
  graphInspector.addEventListener('click', function(e){
    var node = e.target.closest('[data-graph-select]');
    if(node){ selectGraphNode(node.getAttribute('data-graph-select')); return; }
    var target = e.target.closest('[data-graph-go]');
    if(target){ setGraph(false); go(parseInt(target.getAttribute('data-graph-go'), 10)); }
  });
  graphPanel.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var items = graphPanel.querySelectorAll('input,button,[data-graph-node]');
    var focusable = Array.prototype.filter.call(items, function(el){ return !el.disabled && el.getAttribute('aria-hidden') !== 'true'; });
    if(!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
  document.getElementById('btn-notes').addEventListener('click', function(){ setNotes(!body.classList.contains('show-notes')); });
  document.getElementById('btn-theme').addEventListener('click', function(){ setTheme(isDark() ? 'light' : 'dark'); });
  document.getElementById('btn-search').addEventListener('click', function(){ setSearch(!body.classList.contains('search-on')); });
  document.getElementById('btn-bm').addEventListener('click', toggleBm);
  document.getElementById('q').addEventListener('input', runSearch);
  document.getElementById('results').addEventListener('click', function(e){ var b = e.target.closest('button[data-go]'); if(!b) return; go(parseInt(b.getAttribute('data-go'), 10)); setSearch(false); });
  document.getElementById('btn-lang').addEventListener('click', function(){ setLang(LANG === 'vi' ? 'en' : 'vi'); });
  document.getElementById('btn-print').addEventListener('click', function(){ window.print(); });

  document.addEventListener('keydown', function(e){
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '', k0 = e.key;
    if(k0 === 'Escape' && body.classList.contains('graph-on')){ setGraph(false); return; }
    if(k0 === 'Escape' && body.classList.contains('search-on')){ setSearch(false); return; }
    if(tag === 'INPUT' || tag === 'TEXTAREA') return;
    if(k0 === '/' && tag !== 'INPUT'){ e.preventDefault(); setSearch(true); return; }
    var onBtn = e.target && e.target.closest && e.target.closest('button,a');
    var k = e.key;
    if((k === ' ' || k === 'Enter') && onBtn) return;
    if(k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey)){ e.preventDefault(); if(body.classList.contains('ov-on')) return; go(cur + 1); }
    else if(k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey)){ e.preventDefault(); if(body.classList.contains('ov-on')) return; go(cur - 1); }
    else if(k === 'Home'){ e.preventDefault(); go(0); }
    else if(k === 'End'){ e.preventDefault(); go(N - 1); }
    else if(k === 'o' || k === 'O'){ setOv(!body.classList.contains('ov-on')); }
    else if(k === 'n' || k === 'N'){ setNotes(!body.classList.contains('show-notes')); }
    else if(k === 'g' || k === 'G'){ setGraph(!body.classList.contains('graph-on')); }
    else if(k === 'm' || k === 'M'){ setToc(!body.classList.contains('toc-open')); }
    else if(k === 't' || k === 'T'){ setTheme(isDark() ? 'light' : 'dark'); }
    else if(k === 'b' || k === 'B'){ toggleBm(); }
    else if(k === 'l' || k === 'L'){ setLang(LANG === 'vi' ? 'en' : 'vi'); }
    else if(k === 'Escape'){ if(body.classList.contains('ov-on')) setOv(false); else if(body.classList.contains('toc-open')) setToc(false); }
  });

  var sx = null, sy = null;
  stage.addEventListener('touchstart', function(e){ if(e.touches.length === 1){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive:true });
  stage.addEventListener('touchend', function(e){
    if(sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if(Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8){
      var t = e.target.closest && e.target.closest('.tw,pre,.fig');
      if(t && t.scrollWidth > t.clientWidth) return;
      go(cur + (dx < 0 ? 1 : -1));
    }
  }, { passive:true });
  window.addEventListener('hashchange', function(){ var m = /^#s(\d+)$/.exec(location.hash); if(m) go(parseInt(m[1], 10) - 1, true); });

  // init
  var savedLang = null;
  try { savedLang = localStorage.getItem('deck-lang'); var th = localStorage.getItem('deck-theme'); if(th) setTheme(th); } catch(err){}
  if(!savedLang && navigator.language && /^vi/i.test(navigator.language)) savedLang = 'vi';
  LANG = (savedLang === 'vi') ? 'vi' : 'en';
  document.documentElement.lang = LANG;
  applyStatic(); build();
  if(window.innerWidth >= 1200) setToc(true);
  var m0 = /^#s(\d+)$/.exec(location.hash);
  go(m0 ? parseInt(m0[1], 10) - 1 : 0, true);
  window.__DECK = { get N(){ return N; }, get slides(){ return SLIDES; }, go: go, setLang: setLang, validate: validate };
})();
