"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function pyramidSVG(){
  var cx = 500, levels = [
    [L('Business reconciliation','Đối soát nghiệp vụ'), L('Totals match finance and source systems','Tổng khớp với tài chính và hệ thống nguồn'), 320, '#DC2626'],
    [L('Logic tests and data diff in CI','Logic test và data diff trong CI'), L('Unit tests on risky models; compare PR output to production','Unit test cho model rủi ro; so sánh output PR với production'), 460, '#EA580C'],
    [L('Monitors on key tables','Monitor trên các bảng chính'), L('Freshness, volume, schema and distribution checks','Kiểm tra freshness, volume, schema và phân phối'), 600, '#CA8A04'],
    [L('Generic tests on every model','Generic test cho mọi model'), L('unique, not null, relationships, accepted values','unique, not null, relationships, giá trị được chấp nhận'), 740, '#16A34A']
  ];
  var s = '', y = 16, h = 66;
  levels.forEach(function(l, i){
    var w = l[2], x = cx - w / 2;
    s += '<rect class="bx" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"/><rect x="' + x + '" y="' + y + '" width="8" height="' + h + '" rx="4" fill="' + l[3] + '"/>';
    s += txt(cx, y + 28, l[0], 'b', 'middle') + txt(cx, y + 48, l[1], 'sm', 'middle');
    y += h + 8;
  });
  s += '<path class="ln" d="M976 300V40" marker-end="url(#arr)"/>' + txt(966, 80, L('fewer, costlier,','ít hơn, đắt hơn,'), 'sm', 'end') + txt(966, 96, L('more targeted','nhắm đích hơn'), 'sm', 'end');
  s += '<path class="ln" d="M24 40V300" marker-end="url(#arr)"/>' + txt(36, 250, L('more, cheaper,','nhiều hơn, rẻ hơn,'), 'sm') + txt(36, 266, L('broader','rộng hơn'), 'sm');
  return svg(1000, 310, s, L('Data test pyramid from generic tests at the base to business reconciliation at the top','Kim tự tháp data test: từ generic test ở đáy đến đối soát nghiệp vụ ở đỉnh'));
}
