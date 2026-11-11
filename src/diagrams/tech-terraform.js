"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function tfSVG(){
  var s = bx(10, 30, 160, 100, 'Configuration', L('.tf files (HCL)|modules, variables','file .tf (HCL)|module, biến'), '#475569');
  s += bx(220, 30, 170, 100, 'Terraform Core', L('dependency graph|plan and apply engine','đồ thị phụ thuộc|engine plan và apply'), '#475569');
  s += bx(440, 30, 170, 100, L('Providers','Provider'), L('plugins: aws, google,|azurerm, snowflake','plugin: aws, google,|azurerm, snowflake'), '#475569');
  s += bx(660, 30, 160, 100, L('Cloud APIs','Cloud API'), L('create, update,|delete resources','tạo, cập nhật,|xóa resource'), '#7A869F');
  s += bx(860, 30, 130, 100, L('Real infra','Hạ tầng thật'), L('buckets, roles,|warehouses','bucket, role,|warehouse'), '#7A869F');
  s += bx(220, 170, 170, 90, L('State','Trạng thái'), L('IDs and attributes|remote backend + lock','ID và thuộc tính|remote backend + lock'), '#475569');
  s += arrow(172, 80, 218, 80) + arrow(392, 80, 438, 80) + arrow(612, 80, 658, 80) + arrow(822, 80, 858, 80) + arrow(305, 132, 305, 168) + arrow(305, 168, 305, 132);
  var c = [['init', L('download providers and modules, configure backend','tải provider và module, cấu hình backend')], ['plan', L('refresh state, diff config against state, show changes','refresh state, so sánh config với state, hiển thị thay đổi')], ['apply', L('execute in dependency order, update state','thực thi theo thứ tự phụ thuộc, cập nhật state')], ['drift check', L('plan again later; import or reconcile differences','plan lại sau; import hoặc đối soát chênh lệch')]];
  c.forEach(function(x, i){ s += bx(10 + i * 250, 300, 235, 80, 'terraform ' + x[0], x[1], '#2563EB'); if(i < 3) s += arrow(247 + i * 250, 340, 258 + i * 250, 340); });
  return svg(1000, 394, s, L('Terraform architecture: configuration, core, providers, cloud APIs, state, and command workflow','Kiến trúc Terraform: cấu hình, core, provider, cloud API, state và quy trình lệnh'));
}
