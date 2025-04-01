CREATE TABLE tattachfile (
  attachid varchar(50) NOT NULL,
  attachno varchar(50) NOT NULL,
  attachtype varchar(10) NOT NULL,
  attachfile varchar(150) NOT NULL,
  sourcefile varchar(150) NOT NULL,
  attachdate date NOT NULL,
  attachtime time NOT NULL,
  attachmillis bigint NOT NULL,
  attachuser varchar(50) DEFAULT NULL,
  attachremark varchar(250) DEFAULT NULL,
  mimetype varchar(50) DEFAULT NULL,
  attachgroup varchar(50) DEFAULT NULL,
  attachpath varchar(350) DEFAULT NULL,
  attachurl varchar(250) DEFAULT NULL,
  attachsize bigint DEFAULT NULL,
  attachstream text DEFAULT NULL,
  PRIMARY KEY (attachid)
);
CREATE INDEX attachno ON tattachfile (attachno);
CREATE TABLE tdialect (
  dialectid varchar(10) NOT NULL,
  dialectalias varchar(10) NOT NULL,
  dialecttitle varchar(50) NOT NULL,
  dialectname varchar(50) NOT NULL,
  drivername varchar(50) DEFAULT NULL,
  providedflag varchar(1) NOT NULL DEFAULT '0',
  urlflag varchar(1) NOT NULL DEFAULT '1',
  seqno int NOT NULL DEFAULT (0),
  dialectoptions varchar(200) DEFAULT NULL,
  PRIMARY KEY (dialectid)
);
INSERT INTO tdialect (dialectid, dialectalias, dialecttitle, dialectname, drivername, providedflag, urlflag, seqno, dialectoptions) VALUES
	('INFORMIX', 'ODBC', 'INFORMIX', 'INFORMIX', '', '0', '1', 4, NULL),
	('MSSQL', 'MSSQL', 'Microsoft SQL Server', 'SQL Server', '', '1', '1', 2, NULL),
	('MYSQL', 'MYSQL2', 'MySQL', 'MySQL', '', '1', '0', 1, '{ "charset": "utf8", "connectionLimit": 100, "dateStrings": true }'),
	('ORACLE', 'ORACLE', 'ORACLE Database', 'ORACLE', '', '0', '1', 5, NULL),
	('POSTGRES', 'POSTGRES', 'PostgreSQL', 'PostgreSQL', '', '0', '1', 3, NULL);
CREATE TABLE tmigrate (
  field1 varchar(50) DEFAULT NULL,
  field2 decimal(20,6) DEFAULT NULL,
  field3 int DEFAULT NULL,
  field4 date DEFAULT NULL,
  field5 time DEFAULT NULL,
  field6 datetime DEFAULT NULL,
  field7 varchar(50) DEFAULT NULL,
  field8 varchar(50) DEFAULT NULL,
  field9 varchar(50) DEFAULT NULL,
  field10 varchar(50) DEFAULT NULL,
  field11 varchar(50) DEFAULT NULL,
  field12 varchar(50) DEFAULT NULL,
  curtime datetime DEFAULT NULL,
  remark varchar(100) DEFAULT NULL
);
CREATE TABLE tmigrateconnect (
  connectid varchar(50) NOT NULL,
  connectname varchar(150) NOT NULL,
  connecttype varchar(10) NOT NULL,
  connectdialect varchar(10) DEFAULT NULL,
  connectapi varchar(250) DEFAULT NULL,
  connecturl varchar(250) DEFAULT NULL,
  connectuser varchar(50) DEFAULT NULL,
  connectpassword varchar(50) DEFAULT NULL,
  connectdatabase varchar(50) DEFAULT NULL,
  connecthost varchar(50) DEFAULT NULL,
  connectport int DEFAULT NULL,
  connectfieldname varchar(50) DEFAULT NULL,
  connectfieldvalue varchar(50) DEFAULT NULL,
  connectmapper varchar(100) DEFAULT NULL,
  connectsetting text DEFAULT NULL,
  connectbody text DEFAULT NULL,
  connecthandler text DEFAULT NULL,
  connectquery text DEFAULT NULL,
  createdate date DEFAULT NULL,
  createtime time DEFAULT NULL,
  createmillis bigint DEFAULT NULL,
  createuser varchar(50) DEFAULT NULL,
  editdate date DEFAULT NULL,
  edittime time DEFAULT NULL,
  editmillis bigint DEFAULT NULL,
  edituser varchar(50) DEFAULT NULL,
  PRIMARY KEY (connectid)
);
INSERT INTO tmigrateconnect (connectid, connectname, connecttype, connectdialect, connectapi, connecturl, connectuser, connectpassword, connectdatabase, connecthost, connectport, connectfieldname, connectfieldvalue, connectmapper, connectsetting, connectbody, connecthandler, connectquery, createdate, createtime, createmillis, createuser, editdate, edittime, editmillis, edituser) VALUES
	('PROMPTDB', 'Prompt Database', 'DB', 'MYSQL', NULL, NULL, 'root', 'root', 'migratedb', 'localhost', 3306, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

CREATE TABLE tmigratefile (
  migrateid varchar(50) NOT NULL,
  processid varchar(50) NOT NULL,
  notename varchar(200) NOT NULL,
	createdate DATE NULL DEFAULT NULL,
	createtime TIME NULL DEFAULT NULL,
	createmillis BIGINT NULL DEFAULT NULL,
  createuser varchar(50) DEFAULT NULL,
  datafile text DEFAULT NULL,
  PRIMARY KEY (migrateid)
);

CREATE TABLE tmigratelog (
  migrateid varchar(50) NOT NULL,
  taskid varchar(50) NOT NULL,
  processid varchar(50) NOT NULL,
  processdate date NOT NULL,
  processtime time NOT NULL,
  processmillis bigint NOT NULL,
  processtype varchar(50) DEFAULT NULL,
  processstatus varchar(50) DEFAULT NULL,
  processflag varchar(1) DEFAULT NULL,
  processfile varchar(200) DEFAULT NULL,
  sourcefile varchar(200) DEFAULT NULL,
  filesize bigint DEFAULT '0',
  logfile varchar(200) DEFAULT NULL,
  errorfile varchar(200) DEFAULT NULL,
  notefile varchar(200) DEFAULT NULL,
  logname varchar(200) DEFAULT NULL,
  errorname varchar(200) DEFAULT NULL,
  notename varchar(200) DEFAULT NULL,
  tablename varchar(50) DEFAULT NULL,
  totalrecords bigint DEFAULT '0',
  records bigint DEFAULT '0',
  errorrecords bigint DEFAULT '0',
  skiprecords bigint DEFAULT '0',
  startdate date DEFAULT NULL,
  starttime time DEFAULT NULL,
  startmillis bigint DEFAULT NULL,
  enddate date DEFAULT NULL,
  endtime time DEFAULT NULL,
  endmillis bigint DEFAULT NULL,
  site varchar(50) DEFAULT NULL,
  userid varchar(50) DEFAULT NULL,
  useruuid varchar(50) DEFAULT NULL,
  authtoken varchar(350) DEFAULT NULL,
  tokentype varchar(10) DEFAULT NULL,
  errormessage text DEFAULT NULL,
  errorcontents text DEFAULT NULL,
  remarks text DEFAULT NULL,
  PRIMARY KEY (migrateid)
);
CREATE INDEX processid ON tmigratelog (processid);
CREATE TABLE tmigratemodel (
  modelid varchar(50) NOT NULL,
  modelname varchar(150) NOT NULL,
  tablename varchar(50) NOT NULL,
  tablefields text DEFAULT NULL,
  tablesettings text DEFAULT NULL,
  createdate date DEFAULT NULL,
  createtime time DEFAULT NULL,
  createmillis bigint DEFAULT NULL,
  createuser varchar(50) DEFAULT NULL,
  editdate date DEFAULT NULL,
  edittime time DEFAULT NULL,
  editmillis bigint DEFAULT NULL,
  edituser varchar(50) DEFAULT NULL,
  PRIMARY KEY (modelid)
);
INSERT INTO tmigratemodel (modelid, modelname, tablename, tablefields, tablesettings, createdate, createtime, createmillis, createuser, editdate, edittime, editmillis, edituser) VALUES
	('tmigrate', 'Migrate', 'tmigrate', '{\r\n"field1": { "type": "STRING", "key": true },\r\n"field2": { "type": "DECIMAL" },\r\n"field3": { "type": "INTEGER" },\r\n"field4": { "type": "DATE" },\r\n"field5": { "type": "TIME" },\r\n"field6": { "type": "DATETIME" },\r\n"field7": { "type": "STRING" , "options": {\r\n          "handler": "function handler(data,dataset,model,context) { console.log(''model'',model,data,dataset); switch(data.field7) { case ''A'': data.field8 = ''Anonymous''; break; case ''B'': data.field8 = ''Bad Request''; break; case ''C'': data.field8 = ''Counter Attack''; break; } }"\r\n          }\r\n          },\r\n"field8": { "type": "STRING" },\r\n"field9": { "type": "STRING" },\r\n"curtime": { "type": "DATETIME", "defaultValue": "#current_timestamp" }\r\n}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
CREATE TABLE tmigratetask (
  taskid varchar(50) NOT NULL,
  taskname varchar(150) NOT NULL,
  tasktype varchar(10) NOT NULL DEFAULT 'IMPORT',
  connectid varchar(50) DEFAULT NULL,
  taskconfigs text DEFAULT NULL,
  createdate date DEFAULT NULL,
  createtime time DEFAULT NULL,
  createmillis bigint DEFAULT NULL,
  createuser varchar(50) DEFAULT NULL,
  editdate date DEFAULT NULL,
  edittime time DEFAULT NULL,
  editmillis bigint DEFAULT NULL,
  edituser varchar(50) DEFAULT NULL,
  PRIMARY KEY (taskid)
);
INSERT INTO tmigratetask (taskid, taskname, tasktype, connectid, taskconfigs, createdate, createtime, createmillis, createuser, editdate, edittime, editmillis, edituser) VALUES
	('tmigrate', 'Migrate Testing', 'IMPORT', 'PROMPTDB', NULL, '2024-12-17', '15:35:23', NULL, NULL, '2024-12-17', '15:35:28', NULL, NULL);
CREATE TABLE tmigratetaskmodel (
  taskid varchar(50) NOT NULL,
  modelid varchar(50) NOT NULL,
  seqno int NOT NULL DEFAULT (0),
  PRIMARY KEY (taskid,modelid)
);
INSERT INTO tmigratetaskmodel (taskid, modelid, seqno) VALUES
	('tmigrate', 'tmigrate', 0);
CREATE TABLE tmigratetest (
  field1 varchar(50) DEFAULT NULL,
  field2 decimal(20,6) DEFAULT NULL,
  field3 int DEFAULT NULL,
  field4 date DEFAULT NULL,
  field5 time DEFAULT NULL,
  field6 datetime DEFAULT NULL,
  field7 varchar(50) DEFAULT NULL,
  field8 varchar(50) DEFAULT NULL,
  field9 varchar(50) DEFAULT NULL,
  field10 varchar(50) DEFAULT NULL,
  field11 varchar(50) DEFAULT NULL,
  field12 varchar(50) DEFAULT NULL,
  curtime datetime DEFAULT NULL,
  remark varchar(100) DEFAULT NULL
);
CREATE TABLE tmigratetestdate (
  date1 datetime DEFAULT NULL,
  date2 datetime DEFAULT NULL,
  date3 datetime DEFAULT NULL,
  date4 datetime DEFAULT NULL,
  date5 datetime DEFAULT NULL,
  date6 datetime DEFAULT NULL,
  date7 datetime DEFAULT NULL,
  date8 datetime DEFAULT NULL,
  date9 datetime DEFAULT NULL,
  date10 datetime DEFAULT NULL,
  date11 datetime DEFAULT NULL,
  date12 datetime DEFAULT NULL,
  date13 datetime DEFAULT NULL,
  date14 datetime DEFAULT NULL,
  date15 datetime DEFAULT NULL,
  date16 datetime DEFAULT NULL,
  remarks varchar(50) DEFAULT NULL
);
CREATE TABLE tso (
  mktid varchar(10) NOT NULL DEFAULT '',
  share varchar(10) DEFAULT NULL,
  unit decimal(10,0) DEFAULT NULL,
  price decimal(10,2) DEFAULT '0.00',
  yield int DEFAULT NULL,
  effdate date DEFAULT NULL,
  efftime time DEFAULT NULL,
  edittime datetime DEFAULT NULL,
  sharename varchar(30) DEFAULT NULL,
  defvalue varchar(50) DEFAULT NULL,
  message varchar(50) DEFAULT NULL,
  remarks varchar(200) DEFAULT NULL,
  defdatetime datetime DEFAULT NULL
);
CREATE TABLE ttso (
  mktid varchar(10) NOT NULL DEFAULT '',
  share varchar(10) DEFAULT NULL,
  unit decimal(10,0) DEFAULT NULL,
  price decimal(10,2) DEFAULT '0.00',
  yield int DEFAULT NULL,
  effdate date DEFAULT NULL,
  efftime time DEFAULT NULL,
  edittime datetime DEFAULT NULL,
  sharename varchar(30) DEFAULT NULL,
  defvalue varchar(50) DEFAULT NULL,
  message varchar(50) DEFAULT NULL,
  remarks varchar(200) DEFAULT NULL,
  defdatetime datetime DEFAULT NULL
);