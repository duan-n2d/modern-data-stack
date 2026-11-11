"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function starSVG(){
  var s = '';
  var dim = function(x, y, t, sub, c){ return bx(x, y, 210, 96, t, sub, c); };
  // connectors first (behind boxes)
  s += '<path class="ln" d="M220 108 L360 180" marker-end="url(#arr)"/>';
  s += '<path class="ln" d="M680 108 L540 180" marker-end="url(#arr)"/>';
  s += '<path class="ln" d="M220 312 L360 250" marker-end="url(#arr)"/>';
  s += '<path class="ln" d="M680 312 L540 250" marker-end="url(#arr)"/>';
  s += bx(340, 130, 220, 170, 'fct_order_lines', L('grain: one row per order line|order_line_id (PK)|order_date_key (FK)|customer_key (FK)|product_key (FK)|store_key (FK)|quantity, net_amount','grain: một dòng mỗi order line|order_line_id (PK)|order_date_key (FK)|customer_key (FK)|product_key (FK)|store_key (FK)|quantity, net_amount'), '#4D7C0F');
  s += dim(10, 40, 'dim_date', L('date_key (PK)|date, week, month|quarter, year, is_holiday','date_key (PK)|ngày, tuần, tháng|quý, năm, is_holiday'), '#2563EB');
  s += dim(680, 40, 'dim_customer', L('customer_key (PK)|customer_id (natural key)|segment, region, valid_from|valid_to, is_current','customer_key (PK)|customer_id (khóa tự nhiên)|segment, vùng, valid_from|valid_to, is_current'), '#7C3AED');
  s += dim(10, 250, 'dim_product', 'product_key (PK)|sku, name, category|brand', '#EA580C');
  s += dim(680, 250, 'dim_store', 'store_key (PK)|store_id, city, country|channel', '#0891B2');
  s += txt(450, 22, L('Fact table in the middle, descriptive dimensions around it','Bảng fact ở giữa, các dimension mô tả xung quanh'), 'lg', 'middle');
  s += txt(450, 358, L('Dimensions are conformed: the same dim_date and dim_customer are reused by every fact table.','Dimension được conformed: dim_date và dim_customer dùng chung cho mọi bảng fact.'), 'sm', 'middle');
  return svg(900, 372, s, L('Star schema with a central order-line fact table and four dimension tables','Star schema với bảng fact order-line ở trung tâm và bốn bảng dimension'));
}

function medallionSVG(){
  var s = '', Y = 40, H = 150;
  s += txt(10, 24, L('Layers of increasing quality and business meaning','Các tầng có chất lượng và ý nghĩa nghiệp vụ tăng dần'), 'lg');
  s += bx(10, Y, 140, H, L('Sources','Nguồn'), L('apps, databases|events, files','app, database|event, file'), '#7A869F');
  s += bx(200, Y, 190, H, 'Bronze', L('raw, as landed|append-only|keeps full history|audit and replay','thô, như khi nạp|append-only|giữ toàn bộ lịch sử|audit và replay'), '#B45309');
  s += bx(440, Y, 190, H, 'Silver', L('cleaned, typed|deduplicated|conformed keys|joined entities','đã làm sạch, ép kiểu|khử trùng lặp|conformed key|join các entity'), '#64748B');
  s += bx(680, Y, 190, H, 'Gold', L('business-ready marts|dimensional models|metrics, aggregates|serves BI and ML','mart sẵn sàng cho nghiệp vụ|mô hình dimensional|metric, aggregate|phục vụ BI và ML'), '#CA8A04');
  s += bx(920, Y, 170, H, 'Consumers', L('BI, apps, ML|reverse ETL|AI assistants','BI, app, ML|reverse ETL|trợ lý AI'), '#475569');
  [[152, 198], [392, 438], [632, 678], [872, 918]].forEach(function(a){ s += arrow(a[0], Y + H / 2, a[1], Y + H / 2); });
  s += txt(295, Y + H + 28, 'schema on read,', 'sm', 'middle') + txt(295, Y + H + 43, L('cheap to reprocess from here','xử lý lại từ đây rất rẻ'), 'sm', 'middle');
  s += txt(535, Y + H + 28, L('tests: keys, types,','test: key, kiểu,'), 'sm', 'middle') + txt(535, Y + H + 43, L('nulls, relationships','null, relationship'), 'sm', 'middle');
  s += txt(775, Y + H + 28, L('tests: business rules,','test: quy tắc nghiệp vụ,'), 'sm', 'middle') + txt(775, Y + H + 43, L('reconciliation, contracts','đối soát, contract'), 'sm', 'middle');
  s += '<rect class="bx2" x="10" y="266" width="1080" height="44" rx="8"/>';
  s += txt(26, 285, L('Medallion is a layering pattern, not a modeling method.','Medallion là mẫu phân tầng, không phải phương pháp mô hình hóa.'), 'b') + txt(26, 302, L('Gold layers still need a modeling choice, such as Kimball dimensional models, Data Vault feeding marts, or wide tables.','Tầng Gold vẫn cần chọn cách mô hình hóa, như Kimball dimensional, Data Vault cấp dữ liệu cho mart, hoặc wide table.'), 'sm');
  return svg(1100, 322, s, L('Medallion architecture: sources to bronze to silver to gold to consumers','Kiến trúc Medallion: nguồn đến bronze, silver, gold rồi đến consumer'));
}
