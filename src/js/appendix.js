"use strict";
var ARCH = [];

function compSlide(name, comps, flow, ops, n){
  var html = function(){
    return '<div class="split even"><div>' + tableHTML(['Component','Role'], comps) + '</div><div>' +
    '<div class="card plain"><h4>' + esc(tx('Typical workflow')) + '</h4><ol class="qs">' + flow.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ol></div>' +
    '<div class="card plain" style="margin-top:14px"><h4>' + esc(tx('Operating notes')) + '</h4><ul>' + ops.map(function(x){ return '<li>' + inl(x) + '</li>'; }).join('') + '</ul></div></div></div>';
  };
  return { k:'html', t:name + ': components and workflow', html:html, n:n };
}
function archTool(name, color, lead, svgStr, cap, comps, flow, ops, notesA, notesB){
  ARCH.push({ name:name, color:color, slides:[
    { k:'svg', t:name + ': architecture', lead:lead, svg:svgStr, cap:cap, n:notesA },
    compSlide(name, comps, flow, ops, notesB)
  ]});
}

/* ---------- overview table ---------- */
ARCH.push({ name:'Overview', color:'#334155', slides:[
 { k:'table', t:'Appendix: how the tools work inside',
   lead:'Every tool has its own components, state and failure modes. Knowing them is what lets you size, debug and choose, instead of copying configuration.',
   head:['Tool','Layer','Mental model in one line','Core pieces'], rows:[
   ['Kafka','Streaming','A replicated, partitioned commit log that consumers read at their own pace','Brokers, topics, partitions, consumer groups, KRaft'],
   ['Flink','Stream processing','Stateful, event-time dataflows with periodic distributed snapshots','JobManager, TaskManagers, slots, state, checkpoints'],
   ['Spark','Batch and micro-batch','A driver that turns a lazy plan into stages and tasks run by executors','Driver, cluster manager, executors, shuffle'],
   ['Hadoop','Legacy big data','Storage (HDFS) plus resource manager (YARN) plus batch engines on the same nodes','NameNode, DataNodes, YARN, MapReduce, Hive Metastore'],
   ['Iceberg','Table format','A tree of metadata files that turns Parquet files into transactional tables','Catalog, metadata, manifests, data and delete files'],
   ['Airflow','Orchestration','A scheduler that turns DAG files into runs, queues tasks and tracks state in a database','Scheduler, executor, workers, metadata DB'],
   ['dbt','Transformation','A compiler that turns SQL and Jinja into a dependency graph executed in the warehouse','Project, manifest, adapter, materializations'],
   ['Snowflake','Warehouse','Shared storage, independent compute clusters, and a metadata brain','Cloud services, virtual warehouses, micro-partitions'],
   ['BigQuery','Warehouse','Serverless slots reading columnar storage through a shuffle tier','Dremel, slots, Colossus, Capacitor'],
   ['Databricks','Lakehouse','A managed control plane launching compute over Delta tables in your storage','Control plane, compute plane, Delta, Unity Catalog'],
   ['AWS data stack','Cloud','S3 as the lake, a catalog, and many engines that read it','S3, Glue, Athena, Redshift, EMR, Lake Formation'],
   ['Azure data stack','Cloud','ADLS as the lake with Data Factory, Databricks or Synapse, and Purview governing','ADLS Gen2, Event Hubs, Data Factory, Synapse, Purview'],
   ['Microsoft Fabric','Cloud SaaS','One capacity, one lake, several workloads on the same Delta files','Capacity, OneLake, workloads, Direct Lake'],
   ['Kubernetes','Infrastructure','A control loop that keeps declared state and actual state equal','API server, etcd, scheduler, kubelet, pods'],
   ['Terraform','Infrastructure as code','A planner that diffs declared config against recorded state and calls provider APIs','Core, providers, state, backends, modules']
  ], cap:'Each tool below gets two slides: an architecture diagram, then components, a typical workflow and operating notes.',
   n:'This appendix answers the question “what is actually inside each tool?”. For each one, look for three things: where state lives, what coordinates work, and what happens when a node fails.' }
]});

/* ---------- KAFKA ---------- */
function kafkaSVG(){
  var s = bx(10, 150, 140, 110, 'Producers', 'key picks partition|acks, idempotence|batching, compression', '#0891B2');
  s += '<rect class="bx2" x="190" y="30" width="540" height="330" rx="10"/>' + txt(210, 54, 'Kafka cluster: topic “orders”, 3 partitions, replication factor 3', 'b');
  s += bx(210, 70, 150, 150, 'Broker 1', 'P0 leader|P1 follower|P2 follower', '#0891B2');
  s += bx(380, 70, 150, 150, 'Broker 2', 'P1 leader|P2 follower|P0 follower', '#0891B2');
  s += bx(550, 70, 150, 150, 'Broker 3', 'P2 leader|P0 follower|P1 follower', '#0891B2');
  s += bx(210, 250, 490, 90, 'Controller quorum (KRaft)', 'stores cluster metadata, elects partition leaders|replaces ZooKeeper in current releases', '#475569');
  s += bx(770, 40, 220, 120, 'Consumer group A', 'one reader per partition|offsets in __consumer_offsets|scale out up to partition count', '#0891B2');
  s += bx(770, 190, 220, 100, 'Consumer group B', 'independent offsets|reads the same topic again', '#0891B2');
  s += bx(770, 310, 220, 70, 'Connect, Streams', 'Schema Registry', '#475569');
  s += arrow(152, 205, 188, 205) + arrow(732, 100, 768, 100) + arrow(732, 240, 768, 240);
  return svg(1000, 384, s, 'Kafka architecture: producers, broker cluster with partition leaders and followers, controller quorum, consumer groups');
}
archTool('Kafka', '#0891B2',
 'A topic is a set of partitions. Each partition is an ordered log that is replicated across brokers and read by consumer groups.',
 kafkaSVG(), 'Ordering is guaranteed only inside one partition. Parallelism is capped by the partition count.',
 [['Broker','Server that stores partitions and serves producers and consumers'],
  ['Topic and partition','Topic is a named stream; each partition is an ordered, append-only log and the unit of parallelism'],
  ['Leader, follower, ISR','The leader handles reads and writes; followers replicate; in-sync replicas are eligible to take over'],
  ['Controller (KRaft)','Quorum that holds cluster metadata and elects leaders. Recent releases no longer use ZooKeeper'],
  ['Consumer group','Members divide a topic’s partitions; each partition has one reader per group'],
  ['Offset','Position in a partition, committed per group so work resumes after failure'],
  ['Kafka Connect','Framework for source and sink connectors, such as Debezium for CDC'],
  ['Kafka Streams / ksqlDB','Stream processing built on producers and consumers'],
  ['Schema Registry','Separate service (Confluent ecosystem) storing Avro, Protobuf or JSON schemas with compatibility rules']],
 ['Producer serializes the record and picks a partition from the key hash (or round-robin).','The partition leader appends it to a log segment on disk.','Followers fetch and replicate. The leader acknowledges according to `acks` and `min.insync.replicas`.','Consumers in a group poll their assigned partitions and process records.','Consumers commit offsets. After a crash or rebalance they resume from the last committed offset.','Retention (time or size) or compaction (latest value per key) removes old data.'],
 ['Choose the key so related events share a partition and stay ordered.','Partition count is easy to raise and hard to lower, and it caps consumer parallelism.','For durability combine `acks=all`, `min.insync.replicas=2` and an idempotent producer.','Watch consumer lag, under-replicated partitions and disk usage.','Exactly-once needs idempotent producers, transactions and a compatible sink.'],
 'Start from the left: producers choose a partition, brokers replicate, consumers track offsets. Point out that the log is not deleted on read, which is why several groups can read the same data independently and why replay is possible.',
 'Walk the six workflow steps. The most important operational ideas are partition key choice, replication settings and consumer lag. Check the current Kafka docs for version-specific defaults.');

/* ---------- AIRFLOW ---------- */
function airflowSVG(){
  var s = bx(10, 30, 150, 80, 'DAG files', 'Python, synced from Git', '#16A34A');
  s += bx(210, 30, 170, 80, 'DAG processor', 'parses files|serializes DAGs', '#16A34A');
  s += bx(430, 30, 170, 100, 'Metadata database', 'Postgres or MySQL|runs, tasks, state', '#475569');
  s += bx(210, 170, 170, 100, 'Scheduler', 'creates DAG runs|checks dependencies|queues ready tasks', '#16A34A');
  s += bx(430, 170, 170, 100, 'Triggerer', 'async triggers for|deferrable operators', '#16A34A');
  s += bx(210, 310, 170, 70, 'Executor', 'Local, Celery, Kubernetes', '#16A34A');
  s += bx(430, 310, 170, 70, 'Workers', 'run task code', '#16A34A');
  s += bx(700, 30, 220, 100, 'API server and UI', 'REST API, web UI|task execution API (v3)', '#16A34A');
  s += bx(700, 310, 220, 70, 'External systems', 'warehouse, S3, dbt, Spark, APIs', '#7A869F');
  s += arrow(162, 70, 208, 70) + arrow(382, 70, 428, 70) + arrow(382, 195, 450, 132) + arrow(515, 168, 515, 132);
  s += arrow(295, 272, 295, 308) + arrow(382, 345, 428, 345) + arrow(602, 345, 698, 345) + arrow(698, 80, 602, 80);
  return svg(960, 394, s, 'Airflow architecture: DAG files, processor, scheduler, metadata database, executor, workers, triggerer, API server');
}
archTool('Airflow', '#16A34A',
 'The scheduler and the metadata database are the core. Everything else (workers, triggerer, UI) reads or writes the same state.',
 airflowSVG(), 'Airflow 3 adds an API server and task SDK, so workers no longer need direct metadata database access.',
 [['DAG file','Python that declares tasks and dependencies'],
  ['DAG processor','Parses DAG files and stores serialized DAGs (a separate component in newer versions)'],
  ['Scheduler','Creates DAG runs on schedule or events, resolves dependencies, queues ready tasks'],
  ['Executor','Decides where tasks run: Local, Celery workers, or a Kubernetes pod per task'],
  ['Worker','Process or pod that executes task code and reports state'],
  ['Metadata database','State of DAG runs, task instances, connections and variables'],
  ['Triggerer','Runs async triggers so deferrable operators do not hold worker slots'],
  ['Webserver / API server','UI and REST API'],
  ['Operators, hooks, providers','Reusable integrations to external systems']],
 ['DAG files arrive on the scheduler and processor (usually via Git sync).','They are parsed and serialized into the metadata database.','The scheduler creates a DAG run at the scheduled time (or when an asset or event fires).','Task instances whose dependencies are met are queued to the executor.','A worker runs the task, then writes state, logs and any XCom value.','On failure the scheduler applies retry rules while downstream tasks wait.'],
 ['Top-level code in DAG files runs on every parse. Keep it light.','The metadata database is the contention point. Size it and clean old data.','XCom is for small values. Pass references to data, not the data.','Celery gives warm workers; Kubernetes gives isolation per task. Choose by workload.','Pools and concurrency limits protect downstream systems.'],
 'Trace one task: file to processor to database, scheduler queues it, executor hands it to a worker, state returns to the database. Everything is coordinated through that database, which is why it matters operationally.',
 'Go through the workflow, then the notes. The slow-parse problem and an overloaded metadata database are the two most common causes of a sluggish Airflow. Check version-specific component names in the docs.');

/* ---------- SPARK ---------- */
function sparkSVG(){
  var s = bx(10, 90, 210, 150, 'Driver', 'SparkSession|logical plan, Catalyst|DAG scheduler|task scheduler', '#EA580C');
  s += bx(300, 20, 200, 80, 'Cluster manager', 'YARN, Kubernetes, Standalone', '#475569');
  s += bx(600, 30, 190, 80, 'Executor 1', 'tasks, cache, shuffle files', '#EA580C');
  s += bx(600, 130, 190, 80, 'Executor 2', 'tasks, cache, shuffle files', '#EA580C');
  s += bx(600, 230, 190, 80, 'Executor 3', 'tasks, cache, shuffle files', '#EA580C');
  s += bx(840, 90, 150, 150, 'Storage', 'S3, ADLS, HDFS|Parquet, Iceberg,|Delta', '#7C3AED');
  s += arrow(222, 120, 298, 70) + '<path class="ln dash" d="M502 70L598 70" marker-end="url(#arr)"/>' + arrow(222, 190, 598, 170) + txt(400, 168, 'tasks and results', 'sm', 'middle');
  s += arrow(792, 70, 838, 130) + arrow(792, 170, 838, 165) + arrow(792, 270, 838, 200);
  s += bx(10, 340, 300, 56, 'Action starts a job', '', '#EA580C') + bx(345, 340, 310, 56, 'Job splits into stages at shuffles', '', '#EA580C') + bx(690, 340, 300, 56, 'Stage runs one task per partition', '', '#EA580C');
  s += arrow(312, 368, 343, 368) + arrow(657, 368, 688, 368);
  return svg(1000, 410, s, 'Spark architecture: driver, cluster manager, executors, storage, and job to stage to task hierarchy');
}
archTool('Spark', '#EA580C',
 'The driver plans the work; executors do it. Shuffles are where plans split into stages and where most of the cost lives.',
 sparkSVG(), 'Transformations are lazy. Nothing runs until an action such as write, count or collect.',
 [['Driver','Runs your program, builds the plan, schedules tasks, collects results'],
  ['Cluster manager','Allocates resources: YARN, Kubernetes or Standalone'],
  ['Executor','JVM on a worker that runs tasks, caches data and writes shuffle files'],
  ['Job, stage, task','Action starts a job; stages are split at shuffles; one task per partition'],
  ['Catalyst','Optimizer for DataFrames and SQL (rule-based and cost-based)'],
  ['Tungsten','Efficient memory layout and whole-stage code generation'],
  ['Shuffle','Redistribution of rows by key between stages. Usually the dominant cost'],
  ['Adaptive Query Execution','Re-optimizes at runtime: coalesces partitions, switches join strategy, handles skew'],
  ['Structured Streaming','Micro-batch streaming on the same engine']],
 ['Transformations build a logical plan lazily.','An action triggers execution and Catalyst optimizes the plan.','The physical plan becomes a DAG of stages, cut at shuffle boundaries.','The driver sends tasks to executors through the cluster manager.','Executors read partitions, process them and write shuffle output.','The next stage fetches shuffle data. Final results are written or returned.'],
 ['Skew (one huge key) stalls a whole stage. Use AQE, salting or a different key.','Broadcast small tables to avoid shuffling the large side.','Too few partitions underuses the cluster; too many adds scheduling overhead.','`collect()` on big data crashes the driver.','Spill to disk signals memory pressure. The Spark UI shows skew, spill and slow stages.'],
 'The key idea: lazy plan, optimizer, stages cut at shuffles, tasks per partition. When a job is slow, the question is almost always which shuffle or which skewed key.',
 'Walk the six steps, then tie the notes to the Spark UI: stages tab for skew, storage tab for caching. Defaults change between versions, so verify settings such as AQE.');

/* ---------- FLINK ---------- */
function flinkSVG(){
  var s = bx(10, 130, 130, 90, 'Client', 'submits JobGraph', '#0891B2');
  s += bx(190, 30, 330, 140, 'JobManager', 'Dispatcher, ResourceManager, JobMaster|schedules tasks, triggers checkpoints|restarts on failure', '#0891B2');
  s += bx(190, 230, 155, 130, 'TaskManager 1', 'task slots|operator chains|state: heap or RocksDB', '#0891B2');
  s += bx(365, 230, 155, 130, 'TaskManager 2', 'task slots|operator chains|state: heap or RocksDB', '#0891B2');
  s += bx(560, 30, 120, 80, 'Sources', 'Kafka, files, CDC', '#7A869F');
  s += bx(710, 30, 130, 80, 'Operators', 'keyBy, window, join', '#0891B2');
  s += bx(870, 30, 120, 80, 'Sinks', 'tables, topics, DBs', '#7A869F');
  s += bx(560, 230, 430, 130, 'Checkpoint storage', 'barriers flow with the data, state and source offsets snapshot asynchronously|after failure: restore the last checkpoint and replay sources|S3, HDFS, GCS, Azure Blob', '#475569');
  s += arrow(142, 175, 188, 120) + arrow(267, 172, 267, 228) + arrow(442, 172, 442, 228) + arrow(522, 295, 558, 295);
  s += arrow(682, 70, 708, 70) + arrow(842, 70, 868, 70) + '<path class="ln dash" d="M522 250L708 112" marker-end="url(#arr)"/>';
  return svg(1000, 376, s, 'Flink architecture: client, JobManager, TaskManagers with slots, dataflow from sources to sinks, checkpoint storage');
}
archTool('Flink', '#0E7490',
 'Flink runs a continuous dataflow with local state. Periodic, consistent snapshots make failures recoverable without losing correctness.',
 flinkSVG(), 'Checkpoint barriers travel with the records, so a snapshot is consistent without stopping the job.',
 [['JobManager','Coordinates a job: Dispatcher (submissions), ResourceManager (slots), JobMaster (one per job)'],
  ['TaskManager','Worker process with task slots that run chained operators'],
  ['Task slot','Unit of resource isolation inside a TaskManager'],
  ['State backend','Where keyed state lives: JVM heap or RocksDB (spills to disk, handles large state)'],
  ['Checkpoint','Automatic distributed snapshot of operator state and source positions, using barriers'],
  ['Savepoint','Manually triggered snapshot for upgrades, migrations and rollbacks'],
  ['Watermark','Marker of event-time progress; decides when windows can close'],
  ['Connectors','Kafka, files, JDBC, CDC and lakehouse tables such as Iceberg, Paimon and Delta'],
  ['Flink SQL / Table API','Declarative streaming and batch queries'],
  ['Deployment mode','Application mode (cluster per job) or session cluster, on Kubernetes or YARN']],
 ['Client compiles the program into a JobGraph and submits it.','JobMaster expands it into an ExecutionGraph and requests slots.','Sources read (for example Kafka partitions) and records flow through operators, which keep keyed state locally.','JobManager injects checkpoint barriers; operators snapshot state asynchronously to durable storage.','Transactional sinks commit when a checkpoint completes, giving end-to-end exactly-once.','On failure the job restarts from the last checkpoint and sources rewind to the saved offsets.'],
 ['Use event time with watermarks. Decide how to handle late data.','State size drives cost and recovery time. Set state TTL and use RocksDB for large state.','Checkpoint interval trades recovery time against overhead.','Take a savepoint before every upgrade.','Backpressure is the main health signal. Find the slow operator.'],
 'Contrast with Spark: Flink processes records continuously with local state, Spark Structured Streaming processes micro-batches. The checkpoint barrier idea is what gives Flink its fault tolerance.',
 'Walk the flow from submission to recovery. The two interview-grade ideas are event time with watermarks, and checkpoint barriers with replayable sources. Confirm current features, such as state options, in the Flink docs.');

/* ---------- HADOOP ---------- */
function hadoopSVG(){
  var s = '';
  var top = [['MapReduce', 'map, shuffle, reduce'], ['Hive', 'SQL on files, Metastore'], ['Spark / Tez', 'DAG engines on YARN'], ['HBase', 'wide-column store']];
  top.forEach(function(t, i){ s += bx(10 + i * 247, 20, 230, 70, t[0], t[1], '#B45309'); });
  s += '<rect class="bx2" x="10" y="120" width="980" height="120" rx="10"/>' + txt(26, 144, 'YARN: cluster resource management', 'b');
  s += bx(30, 156, 270, 72, 'ResourceManager', 'cluster-wide scheduler', '#B45309');
  s += bx(330, 156, 300, 72, 'NodeManager (on each node)', 'launches containers with CPU and RAM', '#B45309');
  s += bx(660, 156, 310, 72, 'ApplicationMaster (per job)', 'negotiates containers, tracks tasks', '#B45309');
  s += '<rect class="bx2" x="10" y="270" width="980" height="130" rx="10"/>' + txt(26, 294, 'HDFS: distributed storage', 'b');
  s += bx(30, 304, 240, 86, 'NameNode (active + standby)', 'namespace, block map|edit log via JournalNodes', '#7C3AED');
  [[300, 'DataNode 1'], [530, 'DataNode 2'], [760, 'DataNode 3']].forEach(function(d){ s += bx(d[0], 304, 210, 86, d[1], 'blocks, 128 MB default|replicated 3 times', '#7C3AED'); });
  s += arrow(500, 92, 500, 118) + arrow(500, 242, 500, 268);
  return svg(1000, 410, s, 'Hadoop architecture: processing engines on YARN on HDFS');
}
archTool('Hadoop', '#B45309',
 'Hadoop couples storage (HDFS), resources (YARN) and batch engines on the same machines. Its ideas live on even where the stack has been replaced.',
 hadoopSVG(), 'Today most new platforms use object storage plus Kubernetes or managed engines. HDFS and YARN remain common on-premises.',
 [['NameNode','Holds the file system namespace and block locations. Runs active and standby for high availability'],
  ['JournalNodes','Quorum that stores the shared edit log for NameNode failover'],
  ['DataNode','Stores blocks (128 MB default) and serves reads and writes'],
  ['Replication / erasure coding','Three copies by default; erasure coding lowers storage cost for cold data'],
  ['ResourceManager','Cluster-wide scheduler for YARN applications'],
  ['NodeManager','Per-node agent that launches and monitors containers'],
  ['ApplicationMaster','Per-application coordinator that requests containers'],
  ['MapReduce','Batch model: map, shuffle and sort, reduce'],
  ['Hive Metastore','Table metadata still used by Spark, Trino and Iceberg catalogs'],
  ['HBase','Wide-column store on top of HDFS']],
 ['Write: client asks the NameNode to create a file and receives DataNodes for each block.','The client streams a block through a pipeline of DataNodes, which replicate it and acknowledge.','Read: NameNode returns block locations and the client reads from a nearby DataNode.','Job: client submits to the ResourceManager, which starts an ApplicationMaster.','Map tasks run close to their data blocks (data locality), then shuffle and sort.','Reduce tasks write results back to HDFS.'],
 ['Many small files exhaust NameNode memory. Compact them.','Data locality mattered when compute and disks shared nodes. Object storage removed that coupling.','Migration path: keep Parquet or ORC and the Hive Metastore, decouple storage, replace YARN with Kubernetes or managed engines.','Know it for legacy estates and to understand why cloud lakehouses look the way they do.'],
 'The architectural lesson is coupling: storage and compute in the same box. Cloud platforms separate them, which is what changed cost and elasticity.',
 'Use the workflow to explain data locality. Then connect it to today: formats and the metastore survived, the coupling did not.');

/* ---------- ICEBERG ---------- */
function icebergSVG(){
  var s = '<rect class="bx2" x="10" y="20" width="980" height="44" rx="8"/>' + txt(500, 48, 'Engines: Spark, Flink, Trino, Snowflake, DuckDB and others read and write the same table', 'b', 'middle');
  s += bx(10, 130, 150, 100, 'Catalog', 'Glue, REST, Hive,|Nessie, JDBC', '#7C3AED');
  s += bx(210, 130, 160, 100, 'Metadata file', 'schema, partition spec,|list of snapshots', '#7C3AED');
  s += bx(420, 130, 160, 100, 'Manifest list', 'one per snapshot|partition summaries', '#7C3AED');
  s += bx(630, 90, 170, 80, 'Manifest A', 'file paths, column stats', '#7C3AED');
  s += bx(630, 200, 170, 80, 'Manifest B', 'file paths, column stats', '#7C3AED');
  s += bx(850, 90, 140, 80, 'Data files', 'Parquet, ORC, Avro', '#475569');
  s += bx(850, 200, 140, 80, 'Delete files', 'row-level deletes', '#475569');
  s += arrow(162, 180, 208, 180) + arrow(372, 180, 418, 180) + arrow(582, 165, 628, 130) + arrow(582, 195, 628, 240) + arrow(802, 130, 848, 130) + arrow(802, 240, 848, 240);
  s += txt(10, 112, 'pointer to current', 'sm') + txt(10, 126, 'metadata', 'sm');
  s += '<rect class="bx" x="10" y="310" width="980" height="86" rx="8"/>' + txt(26, 334, 'Commit', 'b');
  s += txt(26, 354, '1  write new data files    2  write new manifests and manifest list    3  write new metadata file', 'sm');
  s += txt(26, 374, '4  atomically swap the catalog pointer (optimistic concurrency: if another writer won, validate and retry)', 'sm');
  return svg(1000, 410, s, 'Iceberg architecture: catalog, metadata file, manifest list, manifests, data and delete files');
}
archTool('Iceberg', '#7C3AED',
 'A table is a tree of immutable metadata files over data files. A commit adds new files and moves one pointer.',
 icebergSVG(), 'Because files are immutable and the pointer swap is atomic, readers always see a consistent snapshot.',
 [['Catalog','Stores the pointer to the current metadata file and provides the atomic swap (Hive, Glue, REST, Nessie, JDBC)'],
  ['Metadata file','Schema, partition spec, snapshot list and table properties'],
  ['Snapshot','Immutable state of the table after one commit; basis for time travel'],
  ['Manifest list','Lists the manifests of a snapshot with partition summaries'],
  ['Manifest file','Lists data files with per-column statistics (min, max, null counts)'],
  ['Data files','Parquet, ORC or Avro files'],
  ['Delete files','Positional or equality deletes for row-level changes (merge-on-read)'],
  ['Hidden partitioning','Partitions defined as transforms such as `day(ts)` or `bucket(id)`; queries need no partition column']],
 ['Read: the engine asks the catalog for the current metadata file.','It reads the chosen snapshot’s manifest list.','It prunes manifests by partition summaries, then data files by column statistics.','It reads only the surviving data files (and applies delete files).','Write: new data files, new manifests and a new metadata file are created, then the catalog pointer swaps.','If another writer committed first, the writer validates for conflicts and retries.'],
 ['Run maintenance: compaction (`rewrite_data_files`), `expire_snapshots`, `remove_orphan_files`.','Copy-on-write costs more at write time; merge-on-read costs more at read time.','Schema and partition evolution work by column ID without rewriting data.','The catalog is the coordination and access-control point. Choose it deliberately.'],
 'Read bottom up: data files are plain Parquet, manifests index them, a snapshot is one consistent view, and the catalog says which snapshot is current. That is all “ACID on object storage” means here.',
 'Walk the read path to show why Iceberg prunes well: three levels of statistics before any data file is opened. Then the commit path to show why concurrent writers are safe.');

ARCH[ARCH.length - 1].slides.push(
 { k:'table', t:'Table formats compared: Iceberg, Delta Lake, Hudi',
   lead:'All three add transactions and schema evolution to files on object storage. They differ in how metadata is laid out and where they are strongest.',
   head:['Aspect','Iceberg','Delta Lake','Hudi'], rows:[
   ['Metadata layout','Tree: metadata file, manifest list, manifests','Ordered transaction log (`_delta_log`) with periodic checkpoints','Timeline of instants plus a metadata table'],
   ['Commit mechanism','Atomic catalog pointer swap','Atomic write of the next log entry','Timeline instants with locking'],
   ['Partitioning','Hidden partitioning and partition evolution','Partitioning plus newer clustering features','Partitioning with indexing options'],
   ['Row-level changes','Copy-on-write or merge-on-read with delete files','Copy-on-write, with deletion vectors in newer versions','Copy-on-write or merge-on-read (a core strength)'],
   ['Engine support','Broad: Spark, Flink, Trino, Snowflake, BigQuery, DuckDB','Strongest in Spark and Databricks; growing elsewhere','Spark, Flink, Trino, Presto'],
   ['Typical fit','Multi-engine lakehouse, avoiding lock-in','Databricks-centered lakehouse','Streaming upserts and CDC-heavy lakes']
  ], cap:'Feature gaps between formats are narrowing, and interoperability layers exist. Verify the current state before choosing.',
   n:'Do not declare a winner. The decision is about engine mix and workload: multi-engine reads favor Iceberg, Databricks favors Delta, heavy upsert streams are Hudi territory.' }
);

"use strict";

/* generic left-to-right cloud flow with cross-cutting bars */
function cloudSVG(stages, bars, label, accent){
  var W = [120, 170, 140, 170, 150, 190], X = [], x = 10, G = 22, Y = 34, H = 120, s = txt(10, 22, 'Data flow, left to right', 'lg');
  for(var i = 0; i < 6; i++){ X.push(x); x += W[i] + G; }
  for(var j = 0; j < 6; j++){
    s += bx(X[j], Y, W[j], H, stages[j][0], stages[j][1], stages[j][2] || accent);
    if(j < 5) s += arrow(X[j] + W[j] + 2, Y + H / 2, X[j + 1] - 3, Y + H / 2);
  }
  var by = Y + H + 24;
  s += txt(10, by, 'Cross-cutting services', 'lg');
  bars.forEach(function(b, i){
    var y = by + 12 + i * 46;
    s += '<rect class="bx" x="10" y="' + y + '" width="1090" height="38" rx="8"/><rect x="10" y="' + y + '" width="8" height="38" rx="4" fill="' + accent + '"/>';
    s += txt(30, y + 16, b[0], 'b') + txt(30, y + 31, b[1], 'sm');
  });
  return svg(1110, by + 12 + bars.length * 46 + 4, s, label);
}

/* ---------- KUBERNETES ---------- */
function k8sSVG(){
  var s = bx(10, 30, 430, 340, 'Control plane', '', '#475569', 'bx2');
  s += bx(30, 76, 190, 80, 'kube-apiserver', 'front door, auth, validation', '#475569');
  s += bx(230, 76, 190, 80, 'etcd', 'all cluster state', '#475569');
  s += bx(30, 176, 190, 80, 'Scheduler', 'assigns pods to nodes', '#475569');
  s += bx(230, 176, 190, 80, 'Controller manager', 'reconciliation loops', '#475569');
  s += bx(130, 276, 190, 72, 'Cloud controller', 'load balancers, volumes', '#475569');
  s += bx(480, 30, 240, 200, 'Worker node 1', 'kubelet runs pods|kube-proxy / CNI: networking|container runtime|Pods: app containers', '#2563EB');
  s += bx(750, 30, 250, 200, 'Worker node 2', 'kubelet runs pods|kube-proxy / CNI: networking|container runtime|Pods: app containers', '#2563EB');
  s += bx(480, 270, 160, 100, 'Deployment', 'ReplicaSet, Pods|rolling updates', '#2563EB');
  s += bx(660, 270, 160, 100, 'Service, Ingress', 'stable address,|HTTP routing', '#2563EB');
  s += bx(840, 270, 160, 100, 'Config and storage', 'ConfigMap, Secret,|PV and PVC', '#2563EB');
  s += arrow(442, 110, 478, 110) + arrow(442, 160, 478, 160);
  return svg(1010, 384, s, 'Kubernetes architecture: control plane components, worker nodes with kubelet and pods, core objects');
}
archTool('Kubernetes', '#2563EB',
 'You declare the desired state; controllers continuously make reality match it. Everything goes through the API server and is stored in etcd.',
 k8sSVG(), 'Managed services (EKS, GKE, AKS) run the control plane for you. You still own nodes, workloads and cost.',
 [['kube-apiserver','Front door of the cluster: authenticates, validates and persists objects'],
  ['etcd','Consistent key-value store holding all cluster state'],
  ['Scheduler','Places unscheduled pods on nodes by resources and constraints'],
  ['Controller manager','Control loops that move actual state toward desired state'],
  ['kubelet','Node agent that starts pods and reports status'],
  ['kube-proxy / CNI','Service routing and pod networking'],
  ['Pod','Smallest deployable unit: one or more containers sharing network and storage'],
  ['Deployment, StatefulSet, Job, CronJob','Stateless apps, stateful apps, batch runs, schedules'],
  ['Service, Ingress','Stable networking and external HTTP routing'],
  ['ConfigMap, Secret, PV, PVC','Configuration, credentials and storage']],
 ['`kubectl apply` sends a manifest to the API server.','The API server authenticates, authorizes (RBAC), runs admission checks and stores the object in etcd.','The Deployment controller creates a ReplicaSet, which creates Pods.','The scheduler assigns each Pod to a node.','The kubelet pulls the image, starts containers and runs health probes.','Services route traffic to ready Pods. Controllers replace failed Pods, and autoscalers adjust replicas.'],
 ['Keep desired state in Git (GitOps) and deploy by automation.','Set resource requests and limits. Without them, noisy neighbours and surprise evictions follow.','Data teams use it for Spark on Kubernetes, Airflow’s KubernetesExecutor and Flink operators.','Cost leaks: idle nodes and over-requested resources. Use autoscaling and right-size.','Use it when you run long-lived services; prefer managed services for the rest.'],
 'The core idea is the reconciliation loop. Ask the audience what happens when a node dies: controllers notice the pods are missing and the scheduler places replacements.',
 'Walk through `kubectl apply` to a running pod. Then link to data work: most data tools run on Kubernetes as pods, so resource requests decide both stability and cost.');

/* ---------- TERRAFORM ---------- */
function tfSVG(){
  var s = bx(10, 30, 160, 100, 'Configuration', '.tf files (HCL)|modules, variables', '#475569');
  s += bx(220, 30, 170, 100, 'Terraform Core', 'dependency graph|plan and apply engine', '#475569');
  s += bx(440, 30, 170, 100, 'Providers', 'plugins: aws, google,|azurerm, snowflake', '#475569');
  s += bx(660, 30, 160, 100, 'Cloud APIs', 'create, update,|delete resources', '#7A869F');
  s += bx(860, 30, 130, 100, 'Real infra', 'buckets, roles,|warehouses', '#7A869F');
  s += bx(220, 170, 170, 90, 'State', 'IDs and attributes|remote backend + lock', '#475569');
  s += arrow(172, 80, 218, 80) + arrow(392, 80, 438, 80) + arrow(612, 80, 658, 80) + arrow(822, 80, 858, 80) + arrow(305, 132, 305, 168) + arrow(305, 168, 305, 132);
  var c = [['init', 'download providers and modules, configure backend'], ['plan', 'refresh state, diff config against state, show changes'], ['apply', 'execute in dependency order, update state'], ['drift check', 'plan again later; import or reconcile differences']];
  c.forEach(function(x, i){ s += bx(10 + i * 250, 300, 235, 80, 'terraform ' + x[0], x[1], '#2563EB'); if(i < 3) s += arrow(247 + i * 250, 340, 258 + i * 250, 340); });
  return svg(1000, 394, s, 'Terraform architecture: configuration, core, providers, cloud APIs, state, and command workflow');
}
archTool('Terraform', '#7C3AED',
 'Terraform compares what you declared with what it recorded in state, then asks provider plugins to close the gap.',
 tfSVG(), 'State is the memory of Terraform. Protect it, lock it, and never edit it by hand.',
 [['Configuration (HCL)','Declares desired resources, variables and outputs'],
  ['Terraform Core','Builds the dependency graph, computes the plan and applies it in order'],
  ['Provider','Plugin that translates resources into cloud or SaaS API calls'],
  ['Resource and data source','Managed object versus read-only lookup'],
  ['State','Mapping from configuration to real object IDs and attributes. Can contain secrets'],
  ['Backend','Where state is stored and locked: remote object storage or a managed service'],
  ['Module','Reusable bundle of resources with inputs and outputs'],
  ['Workspace','Separate state per environment using the same configuration']],
 ['Write `.tf` files and open a pull request.','`terraform init` downloads providers and modules and configures the backend.','`terraform plan` refreshes state, compares it with the configuration and prints the changes.','The plan is reviewed in the pull request (and often posted by CI).','`terraform apply` executes changes in dependency order and updates state.','Later runs of `plan` reveal drift caused by manual changes.'],
 ['Use remote state with locking. Restrict who can read it, because it can hold secrets.','Keep blast radius small: separate state per environment and per domain.','Pin provider and module versions.','Terraform’s license changed to source-available; OpenTofu is an open-source fork. Check which you use.','Console edits cause drift. Make the pipeline the only way to change production.'],
 'Anchor on the three artifacts: configuration (what you want), state (what Terraform believes exists), and reality (what actually exists). Plan reconciles the first two and refresh reconciles the last two.',
 'Walk the commands in order. The two big incidents are state corruption or loss, and drift from manual changes. Both are prevented by remote locked state and a single deployment path.');

/* ---------- AWS ---------- */
archTool('AWS data stack', '#D97706',
 'S3 is the lake, a catalog describes it, and many engines (Athena, Glue, EMR, Redshift) read the same files.',
 cloudSVG(
  [['Sources', 'apps, databases|SaaS, IoT', '#7A869F'], ['Ingest', 'DMS (CDC)|Kinesis, MSK|Firehose, AppFlow'], ['S3 raw', 'landing zone|append-only'], ['Transform', 'Glue ETL, EMR|Athena CTAS, dbt'], ['S3 curated', 'Parquet or Iceberg|partitioned'], ['Serve', 'Athena, Redshift|QuickSight, SageMaker']],
  [['Glue Data Catalog and Lake Formation', 'table metadata, fine-grained permissions, tags'], ['IAM, KMS, VPC endpoints, CloudTrail', 'identity, encryption, private networking, audit'], ['MWAA, Step Functions, EventBridge', 'orchestration and event triggers'], ['CloudWatch, Cost Explorer, Budgets', 'observability and spend control']],
  'AWS data lake architecture from sources to serving with cross-cutting services', '#D97706'),
 'Choose the engine per workload: Athena for ad hoc, Redshift for steady BI, EMR or Glue for custom Spark and streaming.',
 [['S3','Object storage; the foundation of the lake'],
  ['Glue Data Catalog','Central, Hive-metastore-compatible metadata'],
  ['Glue ETL and crawlers','Serverless Spark jobs and schema discovery'],
  ['Lake Formation','Fine-grained permissions on catalog tables and columns'],
  ['Athena','Serverless SQL on S3 (Trino/Presto-based); billed by data scanned'],
  ['Redshift','MPP warehouse (provisioned or serverless); Spectrum reads S3'],
  ['EMR','Managed Spark, Hadoop and Flink clusters'],
  ['DMS, Kinesis, MSK, Firehose','CDC, streaming and delivery into S3'],
  ['MWAA','Managed Airflow'],
  ['IAM, KMS, VPC','Identity, encryption and networking']],
 ['Ingest with DMS (CDC), Kinesis or MSK (streams), AppFlow or Fivetran (SaaS) into S3 raw.','Transform with Glue, EMR, Athena or dbt into curated Parquet or Iceberg tables.','Register tables in the Glue Data Catalog and grant access through Lake Formation.','Serve SQL through Athena or Redshift; BI and ML tools connect to those.','MWAA or Step Functions orchestrates; CloudWatch monitors.'],
 ['Athena cost follows bytes scanned. Partition and use columnar formats.','Many small files hurt every engine. Compact them.','Prefer IAM roles over access keys, and use VPC endpoints for private access.','Hidden costs: cross-AZ and cross-region transfer, NAT gateways, idle clusters.','Pick one primary SQL engine to avoid duplicating logic.'],
 'The AWS pattern is “bring your own engine to shared storage”. The catalog and Lake Formation are what keep many engines consistent and governed.',
 'Walk the five steps, then ask when each engine fits. A typical interview answer compares Athena, Redshift and EMR by workload shape and cost model.');

/* ---------- AZURE ---------- */
archTool('Azure data stack', '#0078D4',
 'ADLS Gen2 is the lake. Data Factory moves data, Databricks or Synapse transform it, Purview governs it, Power BI serves it.',
 cloudSVG(
  [['Sources', 'SQL Server, SaaS|files, IoT', '#7A869F'], ['Ingest', 'Data Factory|Event Hubs|Azure Database Migration'], ['ADLS Gen2 raw', 'hierarchical|namespace'], ['Transform', 'Azure Databricks|Synapse Spark and SQL|Fabric'], ['ADLS curated', 'Delta or Parquet'], ['Serve', 'Power BI|Synapse SQL|Azure SQL']],
  [['Microsoft Purview', 'catalog, lineage, classification, policies'], ['Entra ID, Key Vault, Private Link', 'identity, secrets, private networking, managed identities'], ['Data Factory, Databricks Workflows, Fabric pipelines', 'orchestration'], ['Azure Monitor, Cost Management', 'observability and spend control']],
  'Azure data platform architecture from sources to serving with cross-cutting services', '#0078D4'),
 'Microsoft’s strategic direction is Fabric. Many estates still run Databricks and Synapse, so know how they fit together.',
 [['ADLS Gen2','Blob storage with hierarchical namespace and ACLs; the lake'],
  ['Event Hubs','Streaming ingest with a Kafka-compatible endpoint'],
  ['Data Factory','Pipelines and copy activities for ELT orchestration'],
  ['Synapse Analytics','Dedicated and serverless SQL plus Spark pools; Fabric is the successor direction'],
  ['Azure Databricks','Databricks lakehouse as a first-party Azure service'],
  ['Purview','Catalog, lineage and classification'],
  ['Entra ID, Key Vault, Private Link','Identity, secrets and private networking'],
  ['Power BI','Semantic models, reports and dashboards'],
  ['Azure Monitor, Cost Management','Telemetry and cost control']],
 ['Ingest with Data Factory copy activities or Event Hubs into ADLS raw.','Transform with Databricks, Synapse Spark or Fabric notebooks into curated Delta tables.','Purview scans and catalogs assets and tracks lineage.','Power BI and SQL endpoints serve the curated data.','Data Factory or workflow tools orchestrate; Monitor alerts.'],
 ['Choose one primary lakehouse engine (Databricks or Fabric) to avoid duplicated logic.','Use managed identities instead of keys or connection strings.','Hierarchical namespace enables folder-level ACLs and better rename performance.','Check the roadmap: Synapse and Data Factory features are moving into Fabric.'],
 'Azure resembles AWS conceptually (object storage, catalog, many engines). The differentiators are tight integration with Power BI, Entra ID and the move toward Fabric.',
 'Walk the five steps and then explain the Fabric transition. Make clear that service names and boundaries change, so verify with current Microsoft documentation.');

/* ---------- FABRIC ---------- */
function fabricSVG(){
  var s = '<rect class="bx2" x="10" y="20" width="980" height="44" rx="8"/>' + txt(500, 48, 'Capacity (F SKU): one shared compute budget, measured in capacity units, for every workload', 'b', 'middle');
  var w = [['Data Factory', 'pipelines|Dataflows Gen2'], ['Data Engineering', 'Lakehouse|Spark notebooks'], ['Data Warehouse', 'T-SQL|Delta tables'], ['Real-Time', 'Intelligence|Eventstream, Eventhouse'], ['Data Science', 'notebooks, ML|experiments'], ['Power BI', 'semantic models|Direct Lake']];
  w.forEach(function(x, i){ s += bx(10 + i * 163, 90, 152, 120, x[0], x[1], '#0078D4'); s += arrow(86 + i * 163, 212, 86 + i * 163, 250); });
  s += '<rect class="bx" x="10" y="252" width="980" height="66" rx="8"/><rect x="10" y="252" width="980" height="7" rx="3" fill="#0078D4"/>';
  s += txt(500, 282, 'OneLake: one logical lake per tenant, Delta Parquet files, shortcuts and mirroring', 'b', 'middle');
  s += txt(500, 302, 'every engine above reads and writes the same files', 'sm', 'middle');
  s += '<rect class="bx2" x="10" y="340" width="980" height="44" rx="8"/>' + txt(500, 368, 'Workspaces, roles, sensitivity labels and Purview govern items across workloads', 'b', 'middle');
  return svg(1000, 400, s, 'Microsoft Fabric architecture: capacity, six workloads, OneLake, governance');
}
archTool('Microsoft Fabric', '#0078D4',
 'Fabric is a SaaS platform: one capacity, one lake (OneLake) and several workloads that share the same Delta files.',
 fabricSVG(), 'Direct Lake lets Power BI read Delta files in OneLake without importing a copy.',
 [['Capacity (F SKUs)','Shared pool of compute for all workloads. Overuse is smoothed, then throttled'],
  ['OneLake','Single logical lake per tenant storing Delta Parquet'],
  ['Shortcuts','Virtual links to data in ADLS, S3 or other lakehouses without copying'],
  ['Mirroring','Replicates operational databases into OneLake as Delta tables'],
  ['Lakehouse','Tables and files with Spark; automatic SQL analytics endpoint'],
  ['Warehouse','T-SQL engine storing Delta tables in OneLake'],
  ['Data Factory','Pipelines and Dataflows Gen2 for ingestion'],
  ['Real-Time Intelligence','Eventstream and Eventhouse (KQL) for streaming data'],
  ['Power BI Direct Lake','Semantic models that read Delta directly'],
  ['Workspace and Purview','Boundary for items and access; governance integration']],
 ['Create a workspace attached to a capacity.','Ingest with pipelines, dataflows, mirroring or shortcuts into a lakehouse (Delta in OneLake).','Transform with Spark notebooks or warehouse T-SQL; dbt is available through adapters.','Build a semantic model over the Delta tables using Direct Lake.','Publish reports. All engines read the same underlying files.'],
 ['One shared capacity means a heavy job can throttle everyone. Separate production from development capacities.','Use the capacity metrics app to see which items consume units.','Apply sensitivity labels and workspace roles early.','The product evolves quickly. Verify feature availability before committing.'],
 'The key idea: unify storage (OneLake) and billing (capacity) so the workloads become interchangeable views over the same Delta data. The cost is a shared-capacity noisy-neighbour risk.',
 'Walk the five steps, then stress capacity planning. In interviews, the strong answer covers OneLake, Direct Lake and how capacity sharing affects isolation.');

"use strict";

/* ---------- DBT ---------- */
function dbtSVG(){
  var s = bx(10, 30, 180, 120, 'Project', 'models, tests, macros|seeds, snapshots|sources.yml', '#EA580C');
  s += bx(230, 30, 150, 120, 'Parse', 'Jinja and YAML|manifest.json|(nodes, refs)', '#EA580C');
  s += bx(420, 30, 150, 120, 'Compile', 'Jinja rendered to|plain SQL for|the adapter', '#EA580C');
  s += bx(610, 30, 170, 120, 'Execute', 'topological order|N threads|materialize, then test', '#EA580C');
  s += bx(820, 30, 170, 120, 'Warehouse', 'runs the SQL|dbt stores no data', '#7C3AED');
  s += arrow(192, 90, 228, 90) + arrow(382, 90, 418, 90) + arrow(572, 90, 608, 90) + arrow(782, 90, 818, 90);
  s += '<rect class="bx2" x="10" y="190" width="980" height="70" rx="8"/>' + txt(26, 214, 'target/ artifacts', 'b') + txt(26, 234, 'manifest.json, run_results.json, catalog.json, compiled SQL: used for docs, Slim CI state comparison and observability tools', 'sm');
  s += '<rect class="bx2" x="10" y="280" width="980" height="56" rx="8"/>' + txt(26, 304, 'Materializations', 'b') + txt(26, 322, 'view, table, incremental, ephemeral, snapshot, materialized view (adapter dependent)', 'sm');
  return svg(1000, 350, s, 'dbt architecture: project, parse, compile, execute against the warehouse, and artifacts');
}
archTool('dbt', '#EA580C',
 'dbt is a compiler and runner. It does not store or move data; it turns SQL and Jinja into a graph and runs it in your warehouse.',
 dbtSVG(), 'Every `ref()` and `source()` call becomes an edge in the dependency graph.',
 [['Project','Models, tests, macros, seeds, snapshots and sources in a directory'],
  ['Profile and adapter','Connection settings and dialect layer for each warehouse'],
  ['ref() and source()','Functions that declare dependencies and build the graph'],
  ['manifest.json','Parsed project: nodes, dependencies and configuration'],
  ['Materialization','How a model is persisted: view, table, incremental, ephemeral'],
  ['Tests','Generic and singular data tests, plus unit tests on mocked inputs'],
  ['Macros and packages','Reusable Jinja and shared libraries such as dbt_utils'],
  ['Artifacts','run_results.json, catalog.json and generated docs'],
  ['dbt Cloud (optional)','Hosted IDE, scheduler, CI, catalog and semantic layer']],
 ['`dbt build` parses Jinja and YAML into a manifest.','The graph is built from `ref()` and `source()` calls.','Selectors (`--select`) choose the nodes to run.','Selected models are compiled from Jinja into SQL for the adapter.','Models run in topological order across the configured threads. Each model’s tests run right after it.','A failing test blocks downstream models. Artifacts are written to `target/`.'],
 ['The warehouse does the work. dbt cost is warehouse cost.','Threads trade speed against warehouse concurrency.','Keep production artifacts so CI can use `state:modified+` and `--defer`.','Python models run on the platform’s Python runtime, not in dbt itself.','The engine is evolving (for example the Fusion engine). Check compatibility for your adapter and version.'],
 'Reinforce the mental model: dbt is a build tool for SQL, like make for data. It never touches data itself.',
 'Run through `dbt build` step by step. Then explain Slim CI as comparing two manifests: the one in production and the one in the pull request.');

/* ---------- SNOWFLAKE ---------- */
function snowflakeSVG(){
  var s = bx(10, 20, 980, 100, 'Cloud services layer', 'authentication, metadata, query parsing and optimization, transactions, access control, result cache', '#7C3AED', 'bx2');
  s += bx(10, 160, 300, 100, 'Virtual warehouse A: ELT', 'MPP cluster, local SSD cache|auto-suspend and resume', '#7C3AED');
  s += bx(350, 160, 300, 100, 'Virtual warehouse B: BI', 'independent compute|scale up or multi-cluster', '#7C3AED');
  s += bx(690, 160, 300, 100, 'Virtual warehouse C: ad hoc', 'no contention with A or B|billed per second while running', '#7C3AED');
  s += bx(10, 300, 980, 100, 'Storage layer', 'micro-partitions: immutable, compressed columnar files with min and max metadata|managed object storage; time travel and zero-copy clones reuse the same files', '#475569', 'bx2');
  s += arrow(160, 122, 160, 158) + arrow(500, 122, 500, 158) + arrow(840, 122, 840, 158) + arrow(160, 262, 160, 298) + arrow(500, 262, 500, 298) + arrow(840, 262, 840, 298);
  return svg(1000, 416, s, 'Snowflake architecture: cloud services, virtual warehouses, storage layer');
}
archTool('Snowflake', '#0284C7',
 'Three layers: a metadata brain, independent compute clusters, and shared storage. Compute scales without moving data.',
 snowflakeSVG(), 'Separate warehouses per workload prevent contention. They all read the same stored data.',
 [['Cloud services layer','Authentication, metadata, optimizer, transaction management, access control'],
  ['Virtual warehouse','Independent MPP compute cluster with T-shirt sizes and auto-suspend'],
  ['Micro-partitions','Immutable columnar files with min and max metadata per column'],
  ['Storage','Cloud object storage managed by Snowflake'],
  ['Caches','Result cache, warehouse local disk cache and metadata cache'],
  ['Time travel, fail-safe, clones','Retained history and zero-copy copies of data'],
  ['Snowpipe, streams, tasks, dynamic tables','Ingestion and incremental pipeline objects'],
  ['Secure data sharing','Share live data across accounts without copying']],
 ['A client submits SQL to cloud services.','Cloud services parse and optimize the query and check the result cache.','Micro-partition metadata prunes partitions that cannot match the filters.','Warehouse nodes scan only the remaining partitions in parallel, using the local cache when possible.','Results return to the client and are cached.','DML writes new micro-partitions; old ones are kept for time travel.'],
 ['Credits equal warehouse size times running time. Keep auto-suspend short.','A bigger warehouse is not always faster. Test sizes against real queries.','Multi-cluster warehouses add concurrency, not single-query speed.','Add clustering keys only to very large, frequently filtered tables.','Use separate warehouses and resource monitors per workload.'],
 'The key ideas: storage is shared, compute is separate and elastic, and metadata drives pruning. That combination explains both the speed and the cost behavior.',
 'Follow one query through the six steps. The senior takeaways are pruning (the cheapest query is the one that skips partitions) and workload isolation through multiple warehouses.');

/* ---------- BIGQUERY ---------- */
function bqSVG(){
  var s = bx(10, 150, 120, 90, 'Client', 'console, API, BI', '#0284C7');
  s += bx(170, 150, 180, 90, 'Job service', 'parse, plan, prune|reservation lookup', '#0284C7');
  s += bx(400, 30, 210, 110, 'Dremel execution', 'tree of stages|workers use slots|scales dynamically', '#0284C7');
  s += bx(400, 190, 210, 110, 'Shuffle tier', 'in-memory, distributed|moves data between stages', '#0284C7');
  s += bx(670, 100, 230, 150, 'Colossus storage', 'Capacitor columnar files|tables, partitions,|clustering metadata', '#7C3AED');
  s += '<rect class="bx2" x="10" y="330" width="980" height="52" rx="8"/>' + txt(26, 354, 'Borg schedules workers; a high-bandwidth network connects compute and storage, so they scale independently', 'sm');
  s += arrow(132, 195, 168, 195) + arrow(352, 180, 398, 100) + arrow(352, 210, 398, 240) + arrow(612, 85, 668, 150) + arrow(612, 245, 668, 200) + '<path class="ln" d="M505 142L505 188" marker-end="url(#arr)"/>';
  return svg(1000, 396, s, 'BigQuery architecture: job service, Dremel execution with slots, shuffle tier, Colossus storage');
}
archTool('BigQuery', '#1A73E8',
 'Serverless: your query becomes stages that run on slots, reading columnar files from storage that is separate from compute.',
 bqSVG(), 'You do not provision clusters. You choose how compute is billed: bytes scanned, or reserved slot capacity.',
 [['Dremel','Distributed SQL execution engine'],
  ['Slot','Unit of compute (virtual CPU) that runs pieces of a query stage'],
  ['Colossus','Google’s distributed file system that holds table storage'],
  ['Capacitor','Columnar storage format used by BigQuery'],
  ['Shuffle tier','In-memory distributed layer moving data between stages'],
  ['Borg and network','Cluster scheduler and high-bandwidth network under the service'],
  ['Reservations and editions','Capacity-based pricing as an alternative to on-demand'],
  ['Partitioning and clustering','Prune data so fewer bytes are scanned'],
  ['BigLake and external tables','Query Parquet and Iceberg data in object storage']],
 ['A query arrives at the job service.','The service parses and plans it, and prunes partitions and clusters.','The plan becomes a tree of stages; slots read only the referenced columns from storage.','Intermediate results move between stages through the shuffle tier.','The final stage produces the result. Deterministic results can be served from cache for a period.','On-demand billing counts bytes processed; capacity billing counts slot usage.'],
 ['Columnar storage means `select *` pays for every column. Select only what you need.','Use partitioning and `require_partition_filter` to avoid accidental full scans.','Slot contention shows up as slow queries when capacity is shared. Check the query plan in the console.','Materialized views and BI acceleration can cut repeated work.','Verify current pricing and editions in the official documentation.'],
 'BigQuery is the easiest to describe in one sentence: you submit SQL, Google runs it on a large pool of slots against columnar storage. Because nothing is provisioned, cost control comes from bytes scanned and reservations.',
 'Trace one query. The main cost lever is how much data it reads, which is why partitioning, clustering and column selection matter.');

/* ---------- DATABRICKS ---------- */
function dbxSVG(){
  var s = bx(10, 20, 980, 110, 'Control plane (managed by Databricks)', 'workspace and notebooks UI  ·  jobs and workflows scheduler  ·  cluster manager  ·  Unity Catalog service', '#EA580C', 'bx2');
  s += bx(10, 170, 980, 230, 'Compute plane: your cloud account (classic) or Databricks account (serverless)', '', '#475569', 'bx2');
  s += bx(30, 220, 290, 100, 'Clusters', 'Spark, Photon|job and all-purpose', '#EA580C');
  s += bx(345, 220, 290, 100, 'SQL warehouses', 'BI and ad hoc SQL|classic, pro, serverless', '#EA580C');
  s += bx(660, 220, 310, 100, 'Delta tables on object storage', 'Parquet files + _delta_log|S3, ADLS or GCS', '#7C3AED');
  s += txt(500, 360, 'Unity Catalog enforces permissions and lineage across all compute', 'sm', 'middle');
  s += arrow(170, 132, 170, 218) + arrow(490, 132, 490, 218) + arrow(322, 270, 343, 270) + arrow(637, 270, 658, 270);
  return svg(1000, 416, s, 'Databricks architecture: control plane, compute plane, Delta tables on object storage');
}
archTool('Databricks', '#EA580C',
 'A managed control plane launches Spark and SQL compute that reads and writes open Delta tables in your cloud storage.',
 dbxSVG(), 'Data stays in object storage in open formats. Compute is started and stopped on demand.',
 [['Control plane','Databricks-managed: UI, jobs scheduler, notebooks, cluster manager, Unity Catalog service'],
  ['Compute plane','Clusters and SQL warehouses, in your cloud account (classic) or Databricks’s (serverless)'],
  ['Delta Lake','Parquet files plus a transaction log, giving ACID tables on object storage'],
  ['Photon','Vectorized native query engine'],
  ['Unity Catalog','Governance for tables, files and models: permissions, lineage, audit'],
  ['Jobs and workflows','Orchestration of notebooks, SQL, dbt and pipelines'],
  ['Declarative pipelines','Managed streaming and batch pipelines (Delta Live Tables, now part of Lakeflow)'],
  ['Medallion layers','Common bronze, silver and gold convention']],
 ['A user or job request reaches the control plane.','The control plane starts compute (a cluster or a SQL warehouse).','Compute reads and writes Delta tables in object storage.','Unity Catalog checks permissions and records lineage.','Jobs orchestrate repeated runs; SQL warehouses serve BI tools.','Compute scales down or terminates when idle.'],
 ['Cost is Databricks units plus cloud VM cost. Use auto-termination and job clusters for scheduled work.','Run `OPTIMIZE` and `VACUUM`, and use clustering features, to keep Delta tables healthy.','Treat Unity Catalog as the single governance layer.','Product names and boundaries change often. Check current documentation.'],
 'The message: separate control from compute, keep data in open formats, and govern centrally. That is the lakehouse pitch in architectural terms.',
 'Trace one job: control plane starts compute, compute reads Delta, catalog enforces access. Make sure the audience knows where the money goes: compute hours, not storage.');
