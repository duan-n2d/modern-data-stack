"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function hadoopSVG(){
  var s = '';
  var top = [['MapReduce', 'map, shuffle, reduce'], ['Hive', L('SQL on files, Metastore','SQL trên file, Metastore')], ['Spark / Tez', L('DAG engines on YARN','Engine DAG trên YARN')], ['HBase', L('wide-column store','kho wide-column')]];
  top.forEach(function(t, i){ s += bx(10 + i * 247, 20, 230, 70, t[0], t[1], '#B45309'); });
  s += '<rect class="bx2" x="10" y="120" width="980" height="120" rx="10"/>' + txt(26, 144, L('YARN: cluster resource management','YARN: quản lý tài nguyên cluster'), 'b');
  s += bx(30, 156, 270, 72, 'ResourceManager', L('cluster-wide scheduler','scheduler toàn cluster'), '#B45309');
  s += bx(330, 156, 300, 72, L('NodeManager (on each node)','NodeManager (trên mỗi node)'), L('launches containers with CPU and RAM','khởi chạy container với CPU và RAM'), '#B45309');
  s += bx(660, 156, 310, 72, L('ApplicationMaster (per job)','ApplicationMaster (mỗi job)'), L('negotiates containers, tracks tasks','thương lượng container, theo dõi task'), '#B45309');
  s += '<rect class="bx2" x="10" y="270" width="980" height="130" rx="10"/>' + txt(26, 294, L('HDFS: distributed storage','HDFS: lưu trữ phân tán'), 'b');
  s += bx(30, 304, 240, 86, 'NameNode (active + standby)', L('namespace, block map|edit log via JournalNodes','namespace, block map|edit log qua JournalNode'), '#7C3AED');
  [[300, 'DataNode 1'], [530, 'DataNode 2'], [760, 'DataNode 3']].forEach(function(d){ s += bx(d[0], 304, 210, 86, d[1], L('blocks, 128 MB default|replicated 3 times','block, mặc định 128 MB|nhân bản 3 lần'), '#7C3AED'); });
  s += arrow(500, 92, 500, 118) + arrow(500, 242, 500, 268);
  return svg(1000, 410, s, L('Hadoop architecture: processing engines on YARN on HDFS','Kiến trúc Hadoop: engine xử lý trên YARN trên HDFS'));
}
