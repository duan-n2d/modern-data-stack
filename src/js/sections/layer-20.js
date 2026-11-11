"use strict";
SEC(20, [
 { k:'cards', cols:3, t:L('Engineering foundations: what every tool sits on','Nền tảng kỹ thuật: thứ mà mọi công cụ đứng trên'),
   lead:L('Kafka, Spark and Airflow all fail in the same few places: the network, the operating system, the release process and the database transaction. If you cannot diagnose those, you cannot diagnose the tools.','Kafka, Spark và Airflow đều hỏng ở cùng vài chỗ: mạng, hệ điều hành, quy trình phát hành và transaction của database. Nếu không chẩn đoán được những thứ đó thì không chẩn đoán được công cụ.'),
   cards:[
    {h:L('Networking','Mạng'), tag:'must', p:L('DNS, TCP, TLS, HTTP, proxies, load balancers and connection pooling. Most “the job hangs” incidents are network incidents.','DNS, TCP, TLS, HTTP, proxy, load balancer và connection pooling. Phần lớn sự cố “job bị treo” là sự cố mạng.')},
    {h:L('Linux and the OS','Linux và hệ điều hành'), tag:'must', p:L('Processes, threads, memory, file descriptors, disk I/O and signals explain OOM kills, “too many open files” and slow disks.','Process, thread, bộ nhớ, file descriptor, I/O đĩa và signal giải thích OOM kill, “too many open files” và đĩa chậm.')},
    {h:L('Git and CI/CD','Git và CI/CD'), tag:'must', p:L('Branching, review, test strategy, release management and rollback turn changes into safe, reversible events.','Branching, review, chiến lược test, quản lý phát hành và rollback biến thay đổi thành sự kiện an toàn, hoàn tác được.')},
    {h:L('Transactions and isolation','Transaction và isolation'), tag:'must', p:L('What concurrent readers and writers see. Explains lost updates, duplicate keys and inconsistent reports.','Reader và writer đồng thời thấy gì. Giải thích lost update, trùng khóa và báo cáo không nhất quán.')},
    {h:L('Indexing and plans','Index và plan'), tag:'senior', p:L('How a database finds rows, and how to read an execution plan to know why it was slow.','Database tìm dòng thế nào, và cách đọc execution plan để biết vì sao nó chậm.')},
    {h:L('Observe, then fix','Quan sát rồi mới sửa'), tag:'senior', p:L('For each concept learn what happens inside, why, how to observe it and how to fix it.','Với mỗi khái niệm, học điều gì xảy ra bên trong, vì sao, cách quan sát và cách sửa.')}
   ],
   n:L('This layer is deliberately tool-free. Each slide pairs a concept with the command that makes it visible.','Layer này cố ý không gắn với công cụ. Mỗi slide ghép một khái niệm với lệnh làm nó hiện ra.') },

 { k:'table', t:L('Networking you must be able to diagnose','Mạng bạn phải chẩn đoán được'),
   head:[L('Concept','Khái niệm'), L('What goes wrong in a data platform','Chuyện gì sai trong data platform'), L('Observe','Quan sát'), L('Typical fix','Cách sửa điển hình')], rows:[
   ['DNS', L('Name resolves to a public IP instead of a private endpoint, or a stale cached record','Tên phân giải ra IP công khai thay vì private endpoint, hoặc bản ghi cache cũ'), '`dig host`, `nslookup host`', L('Fix the private DNS zone and TTLs; clear caches','Sửa private DNS zone và TTL; xóa cache')],
   ['TCP', L('Connection timeouts, resets, or exhausted ports','Timeout kết nối, bị reset, hoặc cạn port'), '`nc -zv host 5432`, `ss -tan`', L('Check security groups and routes; tune keepalive and timeouts','Kiểm tra security group và route; chỉnh keepalive và timeout')],
   ['TLS', L('Certificate expired, wrong hostname, missing CA, handshake failures','Chứng chỉ hết hạn, sai hostname, thiếu CA, lỗi handshake'), '`openssl s_client -connect host:443 -servername host`', L('Renew or fix the chain; trust the right CA','Gia hạn hoặc sửa chuỗi; tin đúng CA')],
   ['HTTP', L('429 rate limits, 5xx, slow responses, redirects','Giới hạn 429, 5xx, phản hồi chậm, redirect'), '`curl -v https://api.example.com/health`', L('Backoff with jitter, pagination, timeouts','Backoff có jitter, phân trang, timeout')],
   [L('Proxy and firewall','Proxy và firewall'), L('Egress blocked; only some hosts reachable','Egress bị chặn; chỉ vài host truy cập được'), '`traceroute host`, `curl -v --proxy`', L('Allow-list required endpoints; configure proxy variables','Cho phép các endpoint cần thiết; cấu hình biến proxy')],
   [L('Load balancing and pooling','Load balancing và pooling'), L('Idle connections dropped by the balancer; “too many connections” on the database','Kết nối rảnh bị load balancer cắt; “too many connections” trên database'), L('Database connection count; balancer idle timeout','Số kết nối database; idle timeout của load balancer'), L('Connection pooler, keepalives shorter than the idle timeout','Connection pooler, keepalive ngắn hơn idle timeout')]
  ], cap:L('When something “hangs”, test layer by layer: name, route, port, TLS, then the application protocol.','Khi thứ gì đó “treo”, hãy kiểm tra từng tầng: tên, đường đi, cổng, TLS, rồi giao thức ứng dụng.'),
   n:L('Teach the layered method: DNS, then TCP, then TLS, then HTTP. It localizes most problems in minutes.','Dạy phương pháp theo tầng: DNS, rồi TCP, rồi TLS, rồi HTTP. Nó khoanh vùng hầu hết vấn đề trong vài phút.') },

 { k:'table', t:L('Linux and OS resources behind data-tool failures','Tài nguyên Linux và OS đứng sau lỗi công cụ dữ liệu'),
   head:[L('Resource','Tài nguyên'), L('Failure you see','Lỗi bạn thấy'), L('Observe','Quan sát'), L('Fix','Cách sửa')], rows:[
   [L('Memory','Bộ nhớ'), L('Process killed with no error; container OOMKilled','Process bị giết không có lỗi; container OOMKilled'), '`free -m`, `dmesg | grep -i oom`', L('Right-size memory; reduce data per task; fix leaks','Chọn lại cỡ bộ nhớ; giảm dữ liệu mỗi task; sửa rò rỉ')],
   ['CPU', L('High load, throttling in containers','Tải cao, bị throttle trong container'), '`top`, `pidstat 1`', L('Profile; raise limits; scale out','Profile; tăng giới hạn; mở rộng ngang')],
   [L('Disk I/O','I/O đĩa'), L('Slow writes, high iowait, spill slowness','Ghi chậm, iowait cao, spill chậm'), '`iostat -x 1`', L('Faster volumes; fewer small writes; separate spill disks','Volume nhanh hơn; ít ghi nhỏ hơn; đĩa spill riêng')],
   [L('Disk space and inodes','Dung lượng đĩa và inode'), L('“No space left on device” while df shows free space','“No space left on device” dù df báo còn chỗ'), '`df -h`, `df -i`', L('Clean temp and logs; fix retention; lower file counts','Dọn tạm và log; sửa retention; giảm số file')],
   [L('File descriptors','File descriptor'), L('“Too many open files”','“Too many open files”'), '`ulimit -n`, `lsof -p <pid> | wc -l`', L('Raise limits; close handles; reduce connections','Tăng giới hạn; đóng handle; giảm kết nối')],
   [L('Signals and shutdown','Signal và tắt máy'), L('Jobs lose work when a container stops','Job mất việc khi container dừng'), '`docker stop`, `kill -TERM`', L('Handle SIGTERM: finish or checkpoint, then exit','Xử lý SIGTERM: hoàn tất hoặc checkpoint rồi thoát')]
  ], cap:L('`strace -p <pid>` and `/proc/<pid>/` show what a stuck process is actually doing.','`strace -p <pid>` và `/proc/<pid>/` cho thấy process bị kẹt đang thật sự làm gì.'),
   n:L('Connect each row to a tool: Spark executors die from memory, Kafka brokers from disk and file descriptors, Airflow workers from SIGTERM handling.','Nối mỗi hàng với một công cụ: executor Spark chết vì bộ nhớ, broker Kafka vì đĩa và file descriptor, worker Airflow vì xử lý SIGTERM.') },

 { k:'code', t:L('Git and CI/CD: safe changes and fast rollback','Git và CI/CD: thay đổi an toàn và rollback nhanh'),
   lead:L('Every production change should be small, reviewed, tested and reversible.','Mọi thay đổi production nên nhỏ, được review, được test và hoàn tác được.'),
   blocks:[
    {lang:'bash', title:'rollback_and_bisect.sh', code:`
# Undo a merged pull request with a new commit (history stays intact)
git revert -m 1 <merge_commit_sha>

# Find the commit that introduced a bug
git bisect start
git bisect bad HEAD
git bisect good v2026.10.1
# run your test at each step, then mark: git bisect good | git bisect bad
git bisect reset

# Tag a release so a deploy is reproducible
git tag -a v2026.11.0 -m "Release 2026.11.0"
git push origin v2026.11.0`}
   ],
   points:[
    {h:L('Trunk-based, small PRs','Trunk-based, PR nhỏ'), p:L('Merge small changes often behind tests. Long-lived branches turn into risky releases.','Merge thay đổi nhỏ thường xuyên sau các test. Nhánh sống lâu biến thành bản phát hành rủi ro.')},
    {h:L('Test pyramid','Kim tự tháp test'), tag:'senior', p:L('Many fast unit tests, fewer integration tests, a few end-to-end checks, plus data tests in the pipeline.','Nhiều unit test nhanh, ít integration test hơn, vài kiểm tra end-to-end, cộng test dữ liệu trong pipeline.')},
    {h:L('Release management','Quản lý phát hành'), p:L('Tag releases, keep a changelog, and promote the same artifact from staging to production.','Gắn tag phát hành, giữ changelog và đưa cùng một artifact từ staging lên production.')},
    {h:L('Rollback options','Các cách rollback'), tag:'senior', p:L('Code: `git revert`. Data: time travel, snapshots or a schema swap. Behaviour: feature flags. Know which one applies before you deploy.','Code: `git revert`. Dữ liệu: time travel, snapshot hoặc hoán đổi schema. Hành vi: feature flag. Biết cái nào áp dụng trước khi deploy.')}
   ],
   n:L('Rolling back code does not roll back data. Pair every deployment that changes data with a data-level rollback plan.','Rollback code không rollback dữ liệu. Với mỗi lần deploy làm đổi dữ liệu, hãy kèm kế hoạch rollback ở mức dữ liệu.') },

 { k:'html', t:L('Transactions, isolation levels and indexes','Transaction, isolation level và index'),
   lead:L('Isolation decides what concurrent work can see. Indexes decide how fast a row is found.','Isolation quyết định công việc đồng thời thấy gì. Index quyết định tìm một dòng nhanh đến đâu.'),
   html:function(){
     var tb = tableHTML([L('Isolation level','Mức isolation'), L('Prevents','Ngăn chặn'), L('Still allows','Vẫn cho phép'), L('Notes','Ghi chú')], [
      ['READ COMMITTED', L('Dirty reads','Dirty read'), L('Non-repeatable reads, phantoms, lost updates','Non-repeatable read, phantom, lost update'), L('Common default in PostgreSQL','Mặc định phổ biến trong PostgreSQL')],
      ['REPEATABLE READ / SNAPSHOT', L('Dirty and non-repeatable reads; usually phantoms','Dirty read và non-repeatable read; thường cả phantom'), L('Write skew in some systems','Write skew ở một số hệ thống'), L('Each transaction sees a consistent snapshot','Mỗi transaction thấy một snapshot nhất quán')],
      ['SERIALIZABLE', L('All of the above anomalies','Mọi bất thường trên'), L('Transactions may abort and need retry','Transaction có thể bị hủy và cần retry'), L('Strongest and costliest','Mạnh nhất và tốn nhất')]
     ]);
     var cd = codeBlock({lang:'sql', title:'transactions_and_indexes.sql (PostgreSQL)', code:`
-- Prevent a lost update by locking the row you will change
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- Add an index without blocking writes, then confirm the plan uses it
CREATE INDEX CONCURRENTLY idx_orders_customer ON orders (customer_id);
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42;`});
     return tb + '<p class="note">' + inl(X('Warehouses usually offer snapshot-style isolation inside the service; check your platform’s documentation for exact guarantees.','Warehouse thường cung cấp isolation kiểu snapshot trong dịch vụ; hãy xem tài liệu nền tảng của bạn để biết bảo đảm chính xác.')) + '</p><div style="margin-top:12px">' + cd + '</div>';
   },
   n:L('Tie this to data work: concurrent loads into the same table, a report running during a load, and CDC consumers all depend on these rules. Indexes help point lookups; analytical engines rely on partition pruning and column statistics instead.','Gắn với công việc dữ liệu: các lần load đồng thời vào cùng một bảng, báo cáo chạy trong lúc load và consumer CDC đều phụ thuộc các quy tắc này. Index giúp tra cứu điểm; engine phân tích dựa vào partition pruning và thống kê cột.') },

 { k:'check', t:L('Checklist and interview questions','Checklist và câu hỏi phỏng vấn'),
   left:{h:L('Self-check','Tự kiểm tra'), items:[L('I can localize a network problem by layer','Tôi khoanh vùng được sự cố mạng theo tầng'), L('I can find why a process was killed','Tôi tìm được lý do một process bị giết'), L('I can roll back code and data separately','Tôi rollback được code và dữ liệu một cách riêng biệt'), L('I can name the anomalies each isolation level allows','Tôi nêu được các bất thường mà mỗi isolation level cho phép'), L('I can read an execution plan and justify an index','Tôi đọc được execution plan và biện minh cho một index')]},
   right:{h:L('Interview-style questions','Câu hỏi kiểu phỏng vấn'), items:[L('A job connects fine from your laptop but times out in production. What do you check, in order?','Job kết nối tốt từ laptop nhưng timeout ở production. Bạn kiểm tra gì, theo thứ tự?'), L('A container disappears with no error in its logs. What happened?','Một container biến mất mà log không có lỗi. Chuyện gì đã xảy ra?'), L('How do you roll back a deployment that already changed a warehouse table?','Bạn rollback thế nào một lần deploy đã làm đổi bảng warehouse?'), L('Two jobs update the same row at once. What can go wrong and how do you prevent it?','Hai job cập nhật cùng một dòng cùng lúc. Có thể sai gì và ngăn thế nào?')]},
   n:L('Strong answers name the observation tool before proposing a fix.','Câu trả lời tốt nêu công cụ quan sát trước khi đề xuất cách sửa.') }
]);
