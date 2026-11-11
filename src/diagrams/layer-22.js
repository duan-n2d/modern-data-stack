"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function parquetSVG(){
  var s = bx(10, 50, 80, 130, 'PAR1', L('magic|bytes','magic|bytes'), '#475569');
  s += '<rect class="bx2" x="110" y="20" width="380" height="190" rx="10"/>' + txt(126, 42, L('Row group 1 (about a million rows)','Row group 1 (khoảng một triệu dòng)'), 'b');
  [['user_id', 120], ['country', 238], ['amount', 356]].forEach(function(c){ s += bx(c[1], 56, 112, 140, c[0], L('column chunk|pages: dictionary,|RLE, bit-packing|min/max stats','column chunk|page: dictionary,|RLE, bit-packing|thống kê min/max'), '#1D4ED8'); });
  s += bx(510, 20, 180, 190, L('Row group 2, 3, …','Row group 2, 3, …'), L('same layout:|one column chunk|per column','cùng bố cục:|mỗi cột một|column chunk'), '#64748B', 'bx2');
  s += bx(710, 20, 190, 190, L('Footer','Footer'), L('schema|row group offsets|column statistics|(min, max, nulls)|read first','schema|offset row group|thống kê cột|(min, max, null)|đọc đầu tiên'), '#CA8A04');
  s += bx(920, 50, 70, 130, 'PAR1', L('magic|bytes','magic|bytes'), '#475569');
  s += arrow(805, 212, 805, 250) + txt(805, 268, L('a reader starts at the footer, skips row groups by statistics,','reader bắt đầu từ footer, bỏ qua row group nhờ thống kê,'), 'sm', 'middle') + txt(805, 284, L('then reads only the needed column chunks','rồi chỉ đọc các column chunk cần thiết'), 'sm', 'middle');
  return svg(1000, 300, s, L('Parquet file layout','Bố cục file Parquet'));
}
