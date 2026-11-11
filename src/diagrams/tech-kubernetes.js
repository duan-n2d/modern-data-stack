"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function k8sSVG(){
  var s = bx(10, 30, 430, 340, 'Control plane', '', '#475569', 'bx2');
  s += bx(30, 76, 190, 80, 'kube-apiserver', L('front door, auth, validation','cổng vào, auth, validation'), '#475569');
  s += bx(230, 76, 190, 80, 'etcd', L('all cluster state','toàn bộ state cluster'), '#475569');
  s += bx(30, 176, 190, 80, 'Scheduler', L('assigns pods to nodes','gán pod cho node'), '#475569');
  s += bx(230, 176, 190, 80, 'Controller manager', L('reconciliation loops','vòng lặp reconciliation'), '#475569');
  s += bx(130, 276, 190, 72, 'Cloud controller', L('load balancers, volumes','load balancer, volume'), '#475569');
  s += bx(480, 30, 240, 200, 'Worker node 1', L('kubelet runs pods|kube-proxy / CNI: networking|container runtime|Pods: app containers','kubelet chạy pod|kube-proxy / CNI: mạng|container runtime|Pod: container ứng dụng'), '#2563EB');
  s += bx(750, 30, 250, 200, 'Worker node 2', L('kubelet runs pods|kube-proxy / CNI: networking|container runtime|Pods: app containers','kubelet chạy pod|kube-proxy / CNI: mạng|container runtime|Pod: container ứng dụng'), '#2563EB');
  s += bx(480, 270, 160, 100, 'Deployment', L('ReplicaSet, Pods|rolling updates','ReplicaSet, Pod|rolling update'), '#2563EB');
  s += bx(660, 270, 160, 100, 'Service, Ingress', L('stable address,|HTTP routing','địa chỉ ổn định,|định tuyến HTTP'), '#2563EB');
  s += bx(840, 270, 160, 100, L('Config and storage','Cấu hình và lưu trữ'), L('ConfigMap, Secret,|PV and PVC','ConfigMap, Secret,|PV và PVC'), '#2563EB');
  s += arrow(442, 110, 478, 110) + arrow(442, 160, 478, 160);
  return svg(1010, 384, s, L('Kubernetes architecture: control plane components, worker nodes with kubelet and pods, core objects','Kiến trúc Kubernetes: thành phần control plane, worker node với kubelet và pod, các object cốt lõi'));
}
