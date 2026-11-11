"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

/* generic left-to-right cloud flow with cross-cutting bars */
function cloudSVG(stages, bars, label, accent){
  var W = [120, 170, 140, 170, 150, 190], X = [], x = 10, G = 22, Y = 34, H = 120, s = txt(10, 22, L('Data flow, left to right','Luồng dữ liệu, trái sang phải'), 'lg');
  for(var i = 0; i < 6; i++){ X.push(x); x += W[i] + G; }
  for(var j = 0; j < 6; j++){
    s += bx(X[j], Y, W[j], H, stages[j][0], stages[j][1], stages[j][2] || accent);
    if(j < 5) s += arrow(X[j] + W[j] + 2, Y + H / 2, X[j + 1] - 3, Y + H / 2);
  }
  var by = Y + H + 24;
  s += txt(10, by, 'Cross-cutting services', 'lg');
  bars.forEach(function(b, i){
    var y = by + 12 + i * 46;
    s += '<rect class="bx" x="10" y="' + y + '" width="1090" height="38" rx="8"/><rect x="10" y="' + y + '" width="8" height="38" rx="4" fill="' + accent + '"/>';
    s += txt(30, y + 16, b[0], 'b') + txt(30, y + 31, b[1], 'sm');
  });
  return svg(1110, by + 12 + bars.length * 46 + 4, s, label);
}

function flowRow(list, y, h, x0, x1, gap){
  var n = list.length, w = (x1 - x0 - (n - 1) * gap) / n, s = '';
  list.forEach(function(b, i){
    var x = x0 + i * (w + gap);
    s += bx(x, y, w, h, b[0], b[1], b[2]);
    if(i < n - 1) s += arrow(x + w + 2, y + h / 2, x + w + gap - 3, y + h / 2);
  });
  return s;
}

function bar(y, title, sub, color){
  return '<rect class="bx" x="10" y="' + y + '" width="980" height="44" rx="8"/><rect x="10" y="' + y + '" width="8" height="44" rx="4" fill="' + color + '"/>' + txt(30, y + 19, title, 'b') + txt(30, y + 35, sub, 'sm');
}
