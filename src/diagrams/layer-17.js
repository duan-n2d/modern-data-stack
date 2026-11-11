"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

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
  return svg(1000, 384, s, L('Network architecture','Kiến trúc mạng'));
}
