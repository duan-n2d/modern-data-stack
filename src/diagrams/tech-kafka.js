"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function kafkaSVG(){
  var s = bx(10, 150, 140, 110, 'Producers', L('key picks partition|acks, idempotence|batching, compression','key chọn partition|acks, idempotence|batching, nén'), '#0891B2');
  s += '<rect class="bx2" x="190" y="30" width="540" height="330" rx="10"/>' + txt(210, 54, L('Kafka cluster: topic “orders”, 3 partitions, replication factor 3','Kafka cluster: topic “orders”, 3 partition, replication factor 3'), 'b');
  s += bx(210, 70, 150, 150, 'Broker 1', 'P0 leader|P1 follower|P2 follower', '#0891B2');
  s += bx(380, 70, 150, 150, 'Broker 2', 'P1 leader|P2 follower|P0 follower', '#0891B2');
  s += bx(550, 70, 150, 150, 'Broker 3', 'P2 leader|P0 follower|P1 follower', '#0891B2');
  s += bx(210, 250, 490, 90, 'Controller quorum (KRaft)', L('stores cluster metadata, elects partition leaders|replaces ZooKeeper in current releases','lưu metadata cluster, bầu partition leader|thay thế ZooKeeper ở bản hiện tại'), '#475569');
  s += bx(770, 40, 220, 120, 'Consumer group A', L('one reader per partition|offsets in __consumer_offsets|scale out up to partition count','một reader mỗi partition|offset trong __consumer_offsets|scale out tối đa bằng số partition'), '#0891B2');
  s += bx(770, 190, 220, 100, 'Consumer group B', L('independent offsets|reads the same topic again','offset độc lập|đọc lại cùng topic'), '#0891B2');
  s += bx(770, 310, 220, 70, 'Connect, Streams', 'Schema Registry', '#475569');
  s += arrow(152, 205, 188, 205) + arrow(732, 100, 768, 100) + arrow(732, 240, 768, 240);
  return svg(1000, 384, s, L('Kafka architecture: producers, broker cluster with partition leaders and followers, controller quorum, consumer groups','Kiến trúc Kafka: producer, broker cluster với partition leader và follower, controller quorum, consumer group'));
}

function partitionSVG(){
  var s = bx(10, 120, 130, 100, L('Producer','Producer'), L('key = customer_id','key = customer_id'), '#0891B2');
  s += bx(180, 120, 170, 100, L('Partitioner','Partitioner'), L('hash(key) mod N|null key: sticky batch','hash(key) mod N|key rỗng: batch dính'), '#0891B2');
  for(var i = 0; i < 4; i++){
    s += bx(400, 20 + i * 92, 170, 76, 'Partition ' + i, X('leader on broker ','leader trên broker ') + (i % 3 + 1) + '|log segments, offsets', '#475569');
    s += arrow(352, 170, 398, 58 + i * 92);
  }
  s += bx(640, 50, 190, 120, L('Consumer 1','Consumer 1'), L('reads P0 and P1|in order per partition','đọc P0 và P1|đúng thứ tự mỗi partition'), '#0891B2');
  s += bx(640, 210, 190, 120, L('Consumer 2','Consumer 2'), L('reads P2 and P3','đọc P2 và P3'), '#0891B2');
  s += arrow(572, 58, 638, 100) + arrow(572, 150, 638, 120) + arrow(572, 242, 638, 260) + arrow(572, 334, 638, 290);
  s += txt(860, 150, L('one consumer per','mỗi partition một'), 'sm') + txt(860, 166, L('partition per group','consumer trong group'), 'sm');
  return svg(1000, 392, s, L('Kafka partitioning','Phân vùng Kafka'));
}
