-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.3.0 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for migratedb
CREATE DATABASE IF NOT EXISTS `migratedb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `migratedb`;

-- Dumping structure for table migratedb.tattachfile
CREATE TABLE IF NOT EXISTS `tattachfile` (
  `attachid` varchar(50) NOT NULL,
  `attachno` varchar(50) NOT NULL,
  `attachtype` varchar(10) NOT NULL,
  `attachfile` varchar(150) NOT NULL,
  `sourcefile` varchar(150) NOT NULL,
  `attachdate` date NOT NULL,
  `attachtime` time NOT NULL,
  `attachmillis` bigint NOT NULL,
  `attachuser` varchar(50) DEFAULT NULL,
  `attachremark` varchar(250) DEFAULT NULL,
  `mimetype` varchar(50) DEFAULT NULL,
  `attachgroup` varchar(50) DEFAULT NULL,
  `attachpath` varchar(350) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `attachurl` varchar(250) DEFAULT NULL,
  `attachsize` bigint DEFAULT NULL,
  `attachstream` longtext,
  PRIMARY KEY (`attachid`),
  KEY `attachno` (`attachno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep attach file';

-- Dumping data for table migratedb.tattachfile: ~0 rows (approximately)

-- Dumping structure for table migratedb.tdialect
CREATE TABLE IF NOT EXISTS `tdialect` (
  `dialectid` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialectalias` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialecttitle` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialectname` varchar(50) NOT NULL,
  `drivername` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `providedflag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '0',
  `urlflag` varchar(1) NOT NULL DEFAULT '1',
  `seqno` int NOT NULL DEFAULT (0),
  `dialectoptions` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  PRIMARY KEY (`dialectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep database dialect info';

-- Dumping data for table migratedb.tdialect: ~5 rows (approximately)
INSERT INTO `tdialect` (`dialectid`, `dialectalias`, `dialecttitle`, `dialectname`, `drivername`, `providedflag`, `urlflag`, `seqno`, `dialectoptions`) VALUES
	('INFORMIX', 'ODBC', 'INFORMIX', 'INFORMIX', '', '0', '1', 4, NULL),
	('MSSQL', 'MSSQL', 'Microsoft SQL Server', 'SQL Server', '', '1', '1', 2, NULL),
	('MYSQL', 'MYSQL2', 'MySQL', 'MySQL', '', '1', '0', 1, '{ "charset": "utf8", "connectionLimit": 100, "dateStrings": true }'),
	('ORACLE', 'ORACLE', 'ORACLE Database', 'ORACLE', '', '0', '1', 5, NULL),
	('POSTGRES', 'POSTGRES', 'PostgreSQL', 'PostgreSQL', '', '0', '1', 3, NULL);

-- Dumping structure for table migratedb.tmigrate
CREATE TABLE IF NOT EXISTS `tmigrate` (
  `field1` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field2` decimal(20,6) DEFAULT NULL,
  `field3` int DEFAULT NULL,
  `field4` date DEFAULT NULL,
  `field5` time DEFAULT NULL,
  `field6` datetime DEFAULT NULL,
  `field7` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field8` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field9` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field10` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field11` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field12` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `curtime` datetime DEFAULT NULL,
  `remark` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table migratedb.tmigrate: ~0 rows (approximately)

-- Dumping structure for table migratedb.tmigrateconnect
CREATE TABLE IF NOT EXISTS `tmigrateconnect` (
  `connectid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `connectname` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `connecttype` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'DB,API',
  `connectdialect` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connectapi` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connecturl` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connectuser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connectpassword` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connectdatabase` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connecthost` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connectport` int DEFAULT NULL,
  `connectfieldname` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connectfieldvalue` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connectmapper` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `connectsetting` text COLLATE utf8mb4_general_ci,
  `connectbody` text COLLATE utf8mb4_general_ci,
  `connecthandler` text COLLATE utf8mb4_general_ci,
  `connectquery` text COLLATE utf8mb4_general_ci,
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`connectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='table keep migrate connector';

-- Dumping data for table migratedb.tmigrateconnect: ~1 rows (approximately)
INSERT INTO `tmigrateconnect` (`connectid`, `connectname`, `connecttype`, `connectdialect`, `connectapi`, `connecturl`, `connectuser`, `connectpassword`, `connectdatabase`, `connecthost`, `connectport`, `connectfieldname`, `connectfieldvalue`, `connectmapper`, `connectsetting`, `connectbody`, `connecthandler`, `connectquery`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('PROMPTDB', 'Prompt Database', 'DB', 'MYSQL', NULL, NULL, 'root', 'root', 'migratedb', 'localhost', 3306, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Dumping structure for table migratedb.tmigratefile
CREATE TABLE IF NOT EXISTS `tmigratefile` (
  `migrateid` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `processid` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `notename` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
	`createdate` DATE NULL DEFAULT NULL,
	`createtime` TIME NULL DEFAULT NULL,
	`createmillis` BIGINT(19) NULL DEFAULT NULL,
  `createuser` VARCHAR(50) NULL DEFAULT NULL COLLATE utf8mb4_general_ci,
  `datafile` longtext COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`migrateid`),
  KEY `processid` (`processid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='table keep extract data file';

-- Dumping structure for table migratedb.tmigratelog
CREATE TABLE IF NOT EXISTS `tmigratelog` (
  `migrateid` varchar(50) NOT NULL,
  `taskid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `processid` varchar(50) NOT NULL,
  `processdate` date NOT NULL,
  `processtime` time NOT NULL,
  `processmillis` bigint NOT NULL,
  `processtype` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `processstatus` varchar(50) DEFAULT NULL,
  `processflag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '0=Initial,1=Process,2=Completed',
  `processfile` varchar(200) DEFAULT NULL,
  `sourcefile` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `filesize` bigint DEFAULT '0',
  `logfile` varchar(200) DEFAULT NULL,
  `errorfile` varchar(200) DEFAULT NULL,
  `notefile` varchar(200) DEFAULT NULL,
  `logname` varchar(200) DEFAULT NULL,
  `errorname` varchar(200) DEFAULT NULL,
  `notename` varchar(200) DEFAULT NULL,
  `tablename` varchar(50) DEFAULT NULL,
  `totalrecords` bigint DEFAULT '0',
  `records` bigint DEFAULT '0',
  `errorrecords` bigint DEFAULT '0',
  `skiprecords` bigint DEFAULT '0',
  `startdate` date DEFAULT NULL,
  `starttime` time DEFAULT NULL,
  `startmillis` bigint DEFAULT NULL,
  `enddate` date DEFAULT NULL,
  `endtime` time DEFAULT NULL,
  `endmillis` bigint DEFAULT NULL,
  `site` varchar(50) DEFAULT NULL,
  `userid` varchar(50) DEFAULT NULL,
  `useruuid` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `authtoken` varchar(350) DEFAULT NULL,
  `tokentype` varchar(10) DEFAULT NULL,
  `errormessage` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `errorcontents` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `remarks` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  PRIMARY KEY (`migrateid`),
  KEY `processid` (`processid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep migrate log history';

-- Dumping data for table migratedb.tmigratelog: ~196 rows (approximately)

-- Dumping structure for table migratedb.tmigratemodel
CREATE TABLE IF NOT EXISTS `tmigratemodel` (
  `modelid` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `modelname` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tablename` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `tablefields` text COLLATE utf8mb4_general_ci,
  `tablesettings` text COLLATE utf8mb4_general_ci,
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`modelid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='table keep migrate model';

-- Dumping data for table migratedb.tmigratemodel: ~1 rows (approximately)
INSERT INTO `tmigratemodel` (`modelid`, `modelname`, `tablename`, `tablefields`, `tablesettings`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('tmigrate', 'Migrate', 'tmigrate', '{\r\n"field1": { "type": "STRING", "key": true },\r\n"field2": { "type": "DECIMAL" },\r\n"field3": { "type": "INTEGER" },\r\n"field4": { "type": "DATE" },\r\n"field5": { "type": "TIME" },\r\n"field6": { "type": "DATETIME" },\r\n"field7": { "type": "STRING" , "options": {\r\n          "handler": "function handler(data,dataset,model,context) { console.log(\'model\',model,data,dataset); switch(data.field7) { case \'A\': data.field8 = \'Anonymous\'; break; case \'B\': data.field8 = \'Bad Request\'; break; case \'C\': data.field8 = \'Counter Attack\'; break; } }"\r\n          }\r\n          },\r\n"field8": { "type": "STRING" },\r\n"field9": { "type": "STRING" },\r\n"curtime": { "type": "DATETIME", "defaultValue": "#current_timestamp" }\r\n}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Dumping structure for table migratedb.tmigratetask
CREATE TABLE IF NOT EXISTS `tmigratetask` (
  `taskid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `taskname` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tasktype` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'IMPORT',
  `connectid` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'tmigrateconnect.connectid',
  `taskconfigs` text COLLATE utf8mb4_general_ci,
  `shareflag` VARCHAR(1) NULL DEFAULT '0' COMMENT '1=Sharing' COLLATE 'utf8mb4_general_ci',
  `createdate` date DEFAULT NULL,
  `createtime` time DEFAULT NULL,
  `createmillis` bigint DEFAULT NULL,
  `createuser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `editdate` date DEFAULT NULL,
  `edittime` time DEFAULT NULL,
  `editmillis` bigint DEFAULT NULL,
  `edituser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`taskid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='table keep migrate task info';

-- Dumping data for table migratedb.tmigratetask: ~1 rows (approximately)
INSERT INTO `tmigratetask` (`taskid`, `taskname`, `tasktype`, `connectid`, `taskconfigs`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('tmigrate', 'Migrate Testing', 'IMPORT', 'PROMPTDB', NULL, '2024-12-17', '15:35:23', NULL, NULL, '2024-12-17', '15:35:28', NULL, NULL);

-- Dumping structure for table migratedb.tmigratetaskmodel
CREATE TABLE IF NOT EXISTS `tmigratetaskmodel` (
  `taskid` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'tmigratetask.taskid',
  `modelid` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'tmigratemodel.modelid',
  `seqno` int NOT NULL DEFAULT (0),
  PRIMARY KEY (`taskid`,`modelid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='table keep model in task';

-- Dumping data for table migratedb.tmigratetaskmodel: ~1 rows (approximately)
INSERT INTO `tmigratetaskmodel` (`taskid`, `modelid`, `seqno`) VALUES
	('tmigrate', 'tmigrate', 0);

-- Dumping structure for table migratedb.tmigratetest
CREATE TABLE IF NOT EXISTS `tmigratetest` (
  `field1` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field2` decimal(20,6) DEFAULT NULL,
  `field3` int DEFAULT NULL,
  `field4` date DEFAULT NULL,
  `field5` time DEFAULT NULL,
  `field6` datetime DEFAULT NULL,
  `field7` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field8` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field9` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field10` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field11` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field12` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `curtime` datetime DEFAULT NULL,
  `remark` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table migratedb.tmigratetest: ~0 rows (approximately)

-- Dumping structure for table migratedb.tmigratetestdate
CREATE TABLE IF NOT EXISTS `tmigratetestdate` (
  `date1` datetime DEFAULT NULL,
  `date2` datetime DEFAULT NULL,
  `date3` datetime DEFAULT NULL,
  `date4` datetime DEFAULT NULL,
  `date5` datetime DEFAULT NULL,
  `date6` datetime DEFAULT NULL,
  `date7` datetime DEFAULT NULL,
  `date8` datetime DEFAULT NULL,
  `date9` datetime DEFAULT NULL,
  `date10` datetime DEFAULT NULL,
  `date11` datetime DEFAULT NULL,
  `date12` datetime DEFAULT NULL,
  `date13` datetime DEFAULT NULL,
  `date14` datetime DEFAULT NULL,
  `date15` datetime DEFAULT NULL,
  `date16` datetime DEFAULT NULL,
  `remarks` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table migratedb.tmigratetestdate: ~0 rows (approximately)

-- Dumping structure for table migratedb.tso
CREATE TABLE IF NOT EXISTS `tso` (
  `mktid` varchar(10) NOT NULL DEFAULT '',
  `share` varchar(10) DEFAULT NULL,
  `unit` decimal(10,0) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `yield` int DEFAULT NULL,
  `effdate` date DEFAULT NULL,
  `efftime` time DEFAULT NULL,
  `edittime` datetime DEFAULT NULL,
  `sharename` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `defvalue` varchar(50) DEFAULT NULL,
  `message` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `remarks` mediumtext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `defdatetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table migratedb.tso: ~0 rows (approximately)

-- Dumping structure for table migratedb.ttso
CREATE TABLE IF NOT EXISTS `ttso` (
  `mktid` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `share` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `unit` decimal(10,0) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `yield` int DEFAULT NULL,
  `effdate` date DEFAULT NULL,
  `efftime` time DEFAULT NULL,
  `edittime` datetime DEFAULT NULL,
  `sharename` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `defvalue` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `message` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `remarks` mediumtext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `defdatetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table migratedb.ttso: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
