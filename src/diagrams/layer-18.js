"use strict";
/* Diagram functions. Referenced from content YAML by name (svg: <functionName>). */

function quorumSVG(){
  var s = bx(10, 70, 110, 80, L('Client','Client'), L('write','ghi'), '#0E7490');
  s += bx(190, 40, 150, 80, L('Leader','Leader'), L('orders all writes','sắp xếp mọi lệnh ghi'), '#0E7490');
  s += bx(420, 10, 150, 60, L('Follower 1','Follower 1'), '', '#475569') + bx(420, 90, 150, 60, L('Follower 2','Follower 2'), '', '#475569');
  s += arrow(122, 100, 188, 90) + arrow(342, 75, 418, 45) + arrow(342, 90, 418, 120);
  s += txt(350, 14, L('replicate log','sao chép log'), 'sm');
  s += bx(620, 10, 370, 140, L('Quorum rule','Quy tắc quorum'), L('N replicas, write quorum W, read quorum R|R + W > N: a read overlaps the latest write|majority quorum: W = R = floor(N / 2) + 1|3 replicas tolerate 1 failure; 5 tolerate 2','N bản sao, quorum ghi W, quorum đọc R|R + W > N: lần đọc luôn gặp lần ghi mới nhất|quorum đa số: W = R = floor(N / 2) + 1|3 bản sao chịu 1 lỗi; 5 bản sao chịu 2'), '#0E7490', 'bx2');
  s += txt(10, 214, L('Leader election (Raft style)','Bầu leader (kiểu Raft)'), 'lg');
  s += bx(10, 230, 220, 90, L('Follower','Follower'), L('hears leader heartbeats','nghe heartbeat của leader'), '#475569');
  s += bx(300, 230, 220, 90, L('Candidate','Candidate'), L('heartbeat timeout: term + 1,|asks for votes','hết hạn heartbeat: term + 1,|xin phiếu bầu'), '#0E7490');
  s += bx(590, 230, 220, 90, L('Leader','Leader'), L('wins a majority of votes,|sends heartbeats','thắng đa số phiếu,|gửi heartbeat'), '#0E7490');
  s += arrow(232, 275, 298, 275) + arrow(522, 275, 588, 275);
  s += txt(840, 270, L('a higher term seen:','thấy term cao hơn:'), 'sm') + txt(840, 288, L('step down to follower','hạ xuống follower'), 'sm');
  return svg(1000, 344, s, L('Replication and leader election','Replication và bầu leader'));
}
