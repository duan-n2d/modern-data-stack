"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function snowflakeSVG(){
  var s = bx(10, 20, 980, 100, L('Cloud services layer','Tầng dịch vụ cloud'), L('authentication, metadata, query parsing and optimization, transactions, access control, result cache','xác thực, metadata, phân tích và tối ưu query, transaction, kiểm soát truy cập, result cache'), '#7C3AED', 'bx2');
  s += bx(10, 160, 300, 100, 'Virtual warehouse A: ELT', L('MPP cluster, local SSD cache|auto-suspend and resume','cluster MPP, cache SSD cục bộ|tự tạm dừng và tiếp tục'), '#7C3AED');
  s += bx(350, 160, 300, 100, 'Virtual warehouse B: BI', L('independent compute|scale up or multi-cluster','compute độc lập|scale up hoặc multi-cluster'), '#7C3AED');
  s += bx(690, 160, 300, 100, 'Virtual warehouse C: ad hoc', L('no contention with A or B|billed per second while running','không tranh chấp với A hay B|tính phí theo giây khi chạy'), '#7C3AED');
  s += bx(10, 300, 980, 100, 'Storage layer', L('micro-partitions: immutable, compressed columnar files with min and max metadata|managed object storage; time travel and zero-copy clones reuse the same files','micro-partition: file columnar nén, bất biến, kèm metadata min và max|object storage được quản lý; time travel và zero-copy clone dùng lại cùng các file'), '#475569', 'bx2');
  s += arrow(160, 122, 160, 158) + arrow(500, 122, 500, 158) + arrow(840, 122, 840, 158) + arrow(160, 262, 160, 298) + arrow(500, 262, 500, 298) + arrow(840, 262, 840, 298);
  return svg(1000, 416, s, L('Snowflake architecture: cloud services, virtual warehouses, storage layer','Kiến trúc Snowflake: dịch vụ cloud, virtual warehouse, tầng lưu trữ'));
}
