/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `migratedb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `migratedb`;

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


CREATE TABLE IF NOT EXISTS `tdialect` (
  `dialectid` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialectalias` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialecttitle` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `dialectname` varchar(50) NOT NULL,
  `providedflag` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '0',
  `urlflag` varchar(1) NOT NULL DEFAULT '1',
  `seqno` int NOT NULL DEFAULT (0),
  `dialectoptions` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  PRIMARY KEY (`dialectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='table keep database dialect info';

INSERT INTO `tdialect` (`dialectid`, `dialectalias`, `dialecttitle`, `dialectname`, `providedflag`, `urlflag`, `seqno`, `dialectoptions`) VALUES
	('INFORMIX', 'ODBC', 'INFORMIX', 'INFORMIX', '0', '1', 4, NULL),
	('MSSQL', 'MSSQL', 'Microsoft SQL Server', 'SQL Server', '1', '1', 2, NULL),
	('MYSQL', 'MYSQL2', 'MySQL', 'MySQL', '1', '0', 1, '{ "charset": "utf8", "connectionLimit": 100, "dateStrings": true }'),
	('ORACLE', 'ORACLE', 'ORACLE Database', 'ORACLE', '0', '1', 5, NULL),
	('POSTGRES', 'POSTGRES', 'PostgreSQL', 'PostgreSQL', '0', '1', 3, NULL);

CREATE TABLE IF NOT EXISTS `tmigrateconnect` (
  `conectid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
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
  PRIMARY KEY (`conectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='table keep migrate connector';

INSERT INTO `tmigrateconnect` (`conectid`, `connectname`, `connecttype`, `connectdialect`, `connectapi`, `connecturl`, `connectuser`, `connectpassword`, `connectdatabase`, `connecthost`, `connectport`, `connectfieldname`, `connectfieldvalue`, `connectmapper`, `connectsetting`, `connectbody`, `connecthandler`, `connectquery`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('PROMPDB', '', 'DB', 'MYSQL', NULL, NULL, 'root', 'root', 'migratedb', 'localhost', 3306, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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

INSERT INTO `tmigratemodel` (`modelid`, `modelname`, `tablename`, `tablefields`, `tablesettings`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('tmigrate', 'Migrate', 'tmigrate', '{\r\n"field1": { "type": "STRING", "key": true },\r\n"field2": { "type": "DECIMAL" },\r\n"field3": { "type": "INTEGER" },\r\n"field4": { "type": "DATE" },\r\n"field5": { "type": "TIME" },\r\n"field6": { "type": "DATETIME" },\r\n"field7": { "type": "STRING" , "options": {\r\n          "handler": "function handler(data,dataset,model,context) { console.log(\'model\',model,data,dataset); switch(data.field7) { case \'A\': data.field8 = \'Anonymous\'; break; case \'B\': data.field8 = \'Bad Request\'; break; case \'C\': data.field8 = \'Counter Attack\'; break; } }"\r\n          }\r\n          },\r\n"field8": { "type": "STRING" },\r\n"field9": { "type": "STRING" },\r\n"curtime": { "type": "DATETIME", "defaultValue": "#current_timestamp" }\r\n}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

CREATE TABLE IF NOT EXISTS `tmigratestep` (
  `taskid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stepid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stepname` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `steptype` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'START,PROCESS,END',
  `stepno` int NOT NULL DEFAULT '0',
  `stepstatus` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nextstep` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`stepid`),
  KEY `taskid` (`taskid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='table keep migrate step';


CREATE TABLE IF NOT EXISTS `tmigratetask` (
  `taskid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `taskname` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `modelid` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'tmigratemodel.modelid',
  `connectid` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'tmigrateconnect.connectid',
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

INSERT INTO `tmigratetask` (`taskid`, `taskname`, `modelid`, `connectid`, `createdate`, `createtime`, `createmillis`, `createuser`, `editdate`, `edittime`, `editmillis`, `edituser`) VALUES
	('tmigrate', 'Migrate Testing', 'tmigrate', 'PROMPDB', '2024-12-17', '15:35:23', NULL, NULL, '2024-12-17', '15:35:28', NULL, NULL);

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


/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
