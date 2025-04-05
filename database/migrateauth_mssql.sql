/*
 Navicat Premium Data Transfer

 Source Server         : iia2019
 Source Server Type    : SQL Server
 Source Server Version : 15002095 (15.00.2095)
 Source Host           : 10.22.20.7:1433
 Source Catalog        : migrateauth
 Source Schema         : dbo

 Target Server Type    : SQL Server
 Target Server Version : 15002095 (15.00.2095)
 File Encoding         : 65001

 Date: 04/04/2025 09:04:20
*/


-- ----------------------------
-- Table structure for tactivate
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tactivate]') AND type IN ('U'))
	DROP TABLE [dbo].[tactivate]
GO

CREATE TABLE [dbo].[tactivate] (
  [activatekey] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [activateuser] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [transtime] bigint DEFAULT NULL NULL,
  [expiretime] bigint DEFAULT NULL NULL,
  [senddate] date DEFAULT NULL NULL,
  [sendtime] time(7) DEFAULT NULL NULL,
  [expiredate] date DEFAULT NULL NULL,
  [activatedate] date DEFAULT NULL NULL,
  [activatetime] time(7) DEFAULT NULL NULL,
  [activatecount] int DEFAULT NULL NULL,
  [activatetimes] int DEFAULT NULL NULL,
  [activatestatus] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatecategory] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatelink] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatepage] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activateremark] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activateparameter] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatemessage] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatecontents] text COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tactivate] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tactivate
-- ----------------------------

-- ----------------------------
-- Table structure for tactivatehistory
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tactivatehistory]') AND type IN ('U'))
	DROP TABLE [dbo].[tactivatehistory]
GO

CREATE TABLE [dbo].[tactivatehistory] (
  [activatekey] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [activateuser] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [transtime] bigint DEFAULT NULL NULL,
  [expiretime] bigint DEFAULT NULL NULL,
  [senddate] date DEFAULT NULL NULL,
  [sendtime] time(7) DEFAULT NULL NULL,
  [expiredate] date DEFAULT NULL NULL,
  [activatedate] date DEFAULT NULL NULL,
  [activatetime] time(7) DEFAULT NULL NULL,
  [activatecount] int DEFAULT NULL NULL,
  [activatetimes] int DEFAULT NULL NULL,
  [activatestatus] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatecategory] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatelink] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatepage] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activateremark] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activateparameter] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatemessage] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activatecontents] text COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tactivatehistory] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tactivatehistory
-- ----------------------------

-- ----------------------------
-- Table structure for tcaptcha
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tcaptcha]') AND type IN ('U'))
	DROP TABLE [dbo].[tcaptcha]
GO

CREATE TABLE [dbo].[tcaptcha] (
  [capid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [captext] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [capanswer] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [createdate] date  NOT NULL,
  [createtime] time(7)  NOT NULL,
  [createmillis] bigint DEFAULT '0' NOT NULL,
  [expiretimes] bigint DEFAULT '0' NOT NULL,
  [expiredate] date DEFAULT NULL NULL,
  [expiretime] time(7) DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tcaptcha] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tcaptcha
-- ----------------------------

-- ----------------------------
-- Table structure for tconfig
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tconfig]') AND type IN ('U'))
	DROP TABLE [dbo].[tconfig]
GO

CREATE TABLE [dbo].[tconfig] (
  [category] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [colname] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [colvalue] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [colflag] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [seqno] int DEFAULT '0' NULL,
  [remarks] text COLLATE Thai_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[tconfig] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tconfig
-- ----------------------------
INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'2FA', N'FACTORISSUER', N'AssureSystem', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'2FA', N'FACTORVERIFY', N'false', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGMAIL', N'MAIL_FROM', N'ezprompt@gmail.com', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGMAIL', N'MAIL_PASSWORD', N'nzazlorszucrhrbb', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGMAIL', N'MAIL_PORT', N'465', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGMAIL', N'MAIL_SERVER', N'smtp.gmail.com', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGMAIL', N'MAIL_TITLE', N'System Management', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGMAIL', N'MAIL_TO', N'tassan_oro@freewillsolutions.com', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGMAIL', N'MAIL_USER', N'ezprompt', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGURATION', N'ACTIVATE_URL', N'http://localhost:8080/control', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'CONFIGURATION', N'APPROVE_URL', N'http://localhost:8080/control', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'ENVIRONMENT', N'EXPIRE_TIMES', N'2880000', NULL, N'0', N'values in milliseconds')
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'FORGOTPASSWORDMAIL', N'MAIL_FROM', N'ezprompt@gmail.com', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'FORGOTPASSWORDMAIL', N'MAIL_PASSWORD', N'nzazlorszucrhrbb', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'FORGOTPASSWORDMAIL', N'MAIL_SERVER', N'smtp.gmail.com', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'FORGOTPASSWORDMAIL', N'MAIL_TITLE', N'System Management', NULL, N'0', NULL)
GO

INSERT INTO [dbo].[tconfig] ([category], [colname], [colvalue], [colflag], [seqno], [remarks]) VALUES (N'FORGOTPASSWORDMAIL', N'MAIL_USER', N'ezprompt', NULL, N'0', NULL)
GO


-- ----------------------------
-- Table structure for tconstant
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tconstant]') AND type IN ('U'))
	DROP TABLE [dbo].[tconstant]
GO

CREATE TABLE [dbo].[tconstant] (
  [typename] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [typeid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [nameen] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [nameth] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [seqno] int DEFAULT NULL NULL,
  [iconfile] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tconstant] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tconstant
-- ----------------------------
INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tactive', N'0', N'Active', N'ใช้งาน', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tactive', N'1', N'Inactive', N'ไม่ใช้งาน', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tappstype', N'M', N'Mobile', N'Mobile', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tappstype', N'W', N'Web', N'Web', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tbranchtype', N'HB', N'Head Branch', N'สำนักงานใหญ่', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tbranchtype', N'SB', N'Sub Branch', N'สำนักงานสาขาย่อย', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tbranchtype', N'VB', N'Service Branch', N'สำนักงานบริการ', N'3', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tdomainappstype', N'S', N'Single Page Application', N'Single Page Application', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tdomainappstype', N'W', N'WEB', N'WEB', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tdomaintype', N'B', N'B2C', N'B2C', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tdomaintype', N'D', N'Directory', N'Directory', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tdomaintype', N'S', N'SAML', N'SAML', N'3', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'texpire', N'0', N'Expired', N'หมดอายุ', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'texpire', N'1', N'Never Expired', N'ไม่หมดอายุ', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tgroupmobile', N'DASHBOARD', N'Dash Board', N'Dash Board', N'1', N'dashboard.png')
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tgroupmobile', N'HISTORY', N'History', N'History', N'2', N'history.png')
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tgroupmobile', N'REPORT', N'Report', N'Report', N'3', N'report.png')
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tgroupmobile', N'WORKLIST', N'Work List', N'Work List', N'4', N'worklist.png')
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tlanguage', N'EN', N'English', N'อังกฤษ', N'1', N'EN.png')
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tlanguage', N'TH', N'Thai', N'ไทย', N'2', N'TH.png')
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tpermit', N'all', N'Alls', N'ทั้งหมด', N'7', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tpermit', N'delete', N'Delete', N'ลบ', N'3', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tpermit', N'export', N'Export', N'นำออก', N'6', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tpermit', N'import', N'Import', N'นำเข้า', N'5', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tpermit', N'insert', N'Insert', N'เพิ่ม', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tpermit', N'print', N'Print', N'พิมพ์', N'8', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tpermit', N'retrieve', N'Retrieve', N'ค้นหา', N'4', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tpermit', N'update', N'Update', N'แก้ไข', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogsystem', N'A', N'Admin', N'Admin', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogsystem', N'F', N'Reference', N'Reference', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'C', N'Script', N'สคริปส์', N'11', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'E', N'Entry', N'กรอกข้อมูล', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'F', N'Reference', N'ข้อมูลหลัก', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'G', N'Generate', N'สร้างหน้าจอ', N'13', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'I', N'Plugin', N'ปลั๊กอิน', N'3', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'M', N'Import', N'นำเข้าข้อมูล', N'5', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'N', N'Internal', N'ใช้ภายใน', N'4', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'O', N'Store Procedure', N'โปรซีเดอร์', N'12', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'P', N'Post', N'โพส', N'7', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'Q', N'Enquiry', N'ค้นหาข้อมูล', N'8', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'R', N'Report', N'รายงาน', N'9', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'U', N'Utility', N'เครื่องมือ', N'10', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tprogtype', N'X', N'Export', N'นำออกข้อมูล', N'6', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'trxstatus', N'C', N'Completed', N'Completed', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'trxstatus', N'E', N'Error', N'Error', N'3', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'trxstatus', N'N', N'Not Complete', N'Not Complete', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'trxstatus', N'R', N'Response', N'Response', N'4', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tsystemtype', N'A', N'Android', N'Android', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tsystemtype', N'I', N'iOS', N'iOS', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tsystemtype', N'W', N'Web', N'Web', N'3', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tuserstatus', N'A', N'Activated', N'ใช้งาน', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tuserstatus', N'C', N'Closed', N'ปิดการใช้งาน', N'2', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tuserstatus', N'P', N'Pending', N'ระงับการใช้งาน', N'3', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'A', N'Admin', N'เจ้าหน้าที่บริหาร', N'30', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'C', N'Super Coach', N'เจ้าหน้าที่ระดับสูง', N'50', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'D', N'Director', N'ผู้อำนวยการ', N'70', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'E', N'Employee', N'พนักงาน', N'10', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'M', N'Manager', N'ผู้จัดการ', N'40', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'O', N'Operator', N'เจ้าหน้าที่ปฏิบัติการ', N'15', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'P', N'President', N'ประธาน', N'90', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'Q', N'Quality Assure', N'ผู้ตรวจสอบ', N'25', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'S', N'Supervisor', N'ผู้ควบคุมดูแล', N'20', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'T', N'Assistance Manager', N'ผู้ช่วยผู้จัดการ', N'35', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'V', N'Vice President', N'รองประธาน', N'80', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'X', N'Executive', N'ผู้บริหาร', N'60', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tusertype', N'Z', N'Client', N'ลูกค้า', N'5', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tvisible', N'0', N'Visible', N'มองเห็น', N'1', NULL)
GO

INSERT INTO [dbo].[tconstant] ([typename], [typeid], [nameen], [nameth], [seqno], [iconfile]) VALUES (N'tvisible', N'1', N'Invisible', N'มองไม่เห็น', N'2', NULL)
GO


-- ----------------------------
-- Table structure for tcpwd
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tcpwd]') AND type IN ('U'))
	DROP TABLE [dbo].[tcpwd]
GO

CREATE TABLE [dbo].[tcpwd] (
  [userid] varchar(60) COLLATE Thai_CI_AS  NOT NULL,
  [category] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [contents] varchar(150) COLLATE Thai_CI_AS  NOT NULL
)
GO

ALTER TABLE [dbo].[tcpwd] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tcpwd
-- ----------------------------

-- ----------------------------
-- Table structure for tdirectory
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tdirectory]') AND type IN ('U'))
	DROP TABLE [dbo].[tdirectory]
GO

CREATE TABLE [dbo].[tdirectory] (
  [domainid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [domainname] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [description] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [applicationid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [tenanturl] varchar(200) COLLATE Thai_CI_AS  NOT NULL,
  [basedn] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [secretkey] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [systemtype] varchar(1) COLLATE Thai_CI_AS DEFAULT 'W' NOT NULL,
  [appstype] varchar(1) COLLATE Thai_CI_AS DEFAULT 'W' NOT NULL,
  [domaintype] varchar(1) COLLATE Thai_CI_AS DEFAULT 'S' NOT NULL,
  [domainurl] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [inactive] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NOT NULL,
  [invisible] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NOT NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tdirectory] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tdirectory
-- ----------------------------

-- ----------------------------
-- Table structure for tfavor
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tfavor]') AND type IN ('U'))
	DROP TABLE [dbo].[tfavor]
GO

CREATE TABLE [dbo].[tfavor] (
  [userid] varchar(60) COLLATE Thai_CI_AS  NOT NULL,
  [programid] varchar(20) COLLATE Thai_CI_AS  NOT NULL,
  [seqno] int DEFAULT '0' NOT NULL
)
GO

ALTER TABLE [dbo].[tfavor] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tfavor
-- ----------------------------

-- ----------------------------
-- Table structure for tgroup
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tgroup]') AND type IN ('U'))
	DROP TABLE [dbo].[tgroup]
GO

CREATE TABLE [dbo].[tgroup] (
  [groupname] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [supergroup] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NULL,
  [nameen] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [nameth] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [seqno] int DEFAULT '0' NULL,
  [iconstyle] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [privateflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [usertype] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [mobilegroup] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [xmltext] text COLLATE Thai_CI_AS  NULL,
  [menutext] text COLLATE Thai_CI_AS  NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tgroup] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tgroup
-- ----------------------------
INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'ADMIN', N'MD', N'Administrator', N'ผู้ดูแลระบบ', N'1', N'fa fa-globe', N'0', N'A', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'CENTER', N'MD', N'Center Administrator', N'ผู้บริหารระบบส่วนกลาง', N'5', N'fa fa-tasks', N'1', N'A', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'DIRECTOR', NULL, N'Director', N'ผู้อำนวยการ', N'7', NULL, N'0', N'D', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'EMPLOYEE', NULL, N'Employee', N'พนักงาน', N'8', NULL, N'0', N'E', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'EXECUTIVE', NULL, N'Executive', N'ผู้บริหาร', N'9', NULL, N'0', N'X', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'MANAGER', NULL, N'Manager', N'ผู้จัดการ', N'10', NULL, N'0', N'M', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'MENU', N'', N'Menu', N'เมนู', N'14', N'fa fa-tasks', N'0', N'O', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'OPERATOR', N'ADMIN', N'Operator', N'เจ้าหน้าที่ปฏิบัติการ', N'11', N'fa fa-cogs', N'0', N'O', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'QA', N'', N'QA', N'ผู้ตรวจสอบ', N'14', NULL, N'0', N'O', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'SETTING', N'', N'Setting', N'ตั้งค่า', N'15', N'fa fa-cogs', N'0', N'O', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'SUPERVISOR', NULL, N'Supervisor', N'ผู้ควบคุม', N'12', NULL, N'0', N'S', NULL, NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tgroup] ([groupname], [supergroup], [nameen], [nameth], [seqno], [iconstyle], [privateflag], [usertype], [mobilegroup], [xmltext], [menutext], [editdate], [edittime], [edituser]) VALUES (N'TESTER', N'ADMIN', N'Tester', N'ผู้ทดสอบ', N'13', N'fa fa-desktop', N'0', N'O', NULL, NULL, NULL, NULL, NULL, NULL)
GO


-- ----------------------------
-- Table structure for tnpwd
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tnpwd]') AND type IN ('U'))
	DROP TABLE [dbo].[tnpwd]
GO

CREATE TABLE [dbo].[tnpwd] (
  [reservenum] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [remarks] varchar(150) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tnpwd] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tnpwd
-- ----------------------------
INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'060', N'TrueMove, TrueMoveH')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'061', N'AIS, DTAC, TrueMoveH')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'062', N'AIS, DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'068', N'TOT')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0800', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0801', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0802', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0803', N'TrueMove')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0804', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0805', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0810', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0811', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0812', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0813', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0814', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0815', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0816', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0817', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0818', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0819', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'082', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'083', N'TrueMove')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'084', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'085', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'086', N'TrueMove')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0871', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0872', NULL)
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0873', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0874', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0875', N'DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'0876', NULL)
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'088', N'my by CAT')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'089', N'AIS, DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'090', N'AIS, TrueMoveH')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'091', N'AIS, DTAC, TrueMoveH, TOT')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'092', N'AIS, DTAC')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'093', N'AIS, TrueMoveH')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'094', N'DTAC, TrueMoveH')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'095', N'AIS, DTAC, TrueMoveH')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'096', N'TrueMoveH')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'097', N'AIS, TrueMoveH')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'098', N'AIS')
GO

INSERT INTO [dbo].[tnpwd] ([reservenum], [remarks]) VALUES (N'099', N'AIS, TrueMoveH')
GO


-- ----------------------------
-- Table structure for tpasskey
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tpasskey]') AND type IN ('U'))
	DROP TABLE [dbo].[tpasskey]
GO

CREATE TABLE [dbo].[tpasskey] (
  [keyid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [keypass] varchar(350) COLLATE Thai_CI_AS  NOT NULL,
  [site] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [keyname] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [createdate] date  NOT NULL,
  [createtime] time(7)  NOT NULL,
  [createmillis] bigint DEFAULT '0' NOT NULL,
  [createuser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [expireflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [expireday] int DEFAULT '0' NULL,
  [expiredate] date DEFAULT NULL NULL,
  [expiretime] time(7) DEFAULT NULL NULL,
  [expiretimes] bigint DEFAULT '0' NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tpasskey] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tpasskey
-- ----------------------------

-- ----------------------------
-- Table structure for tppwd
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tppwd]') AND type IN ('U'))
	DROP TABLE [dbo].[tppwd]
GO

CREATE TABLE [dbo].[tppwd] (
  [userid] varchar(60) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [checkreservepwd] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [checkpersonal] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [checkmatchpattern] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [checkmatchnumber] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [timenotusedoldpwd] smallint DEFAULT '0' NULL,
  [alertbeforeexpire] smallint DEFAULT '0' NULL,
  [pwdexpireday] smallint DEFAULT '0' NULL,
  [notloginafterday] smallint DEFAULT '0' NULL,
  [notchgpwduntilday] smallint DEFAULT '0' NULL,
  [minpwdlength] smallint DEFAULT '0' NULL,
  [alphainpwd] smallint DEFAULT '0' NULL,
  [otherinpwd] smallint DEFAULT '0' NULL,
  [maxsamechar] smallint DEFAULT '0' NULL,
  [mindiffchar] smallint DEFAULT '0' NULL,
  [maxarrangechar] smallint DEFAULT '0' NULL,
  [loginfailtime] int DEFAULT NULL NULL,
  [fromip] varchar(15) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [toip] varchar(15) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [starttime] time(7) DEFAULT NULL NULL,
  [endtime] time(7) DEFAULT NULL NULL,
  [groupflag] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [maxloginfailtime] smallint DEFAULT NULL NULL,
  [checkdictpwd] smallint DEFAULT NULL NULL,
  [maxpwdlength] smallint DEFAULT NULL NULL,
  [digitinpwd] smallint DEFAULT NULL NULL,
  [upperinpwd] smallint DEFAULT NULL NULL,
  [lowerinpwd] smallint DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tppwd] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tppwd
-- ----------------------------
INSERT INTO [dbo].[tppwd] ([userid], [checkreservepwd], [checkpersonal], [checkmatchpattern], [checkmatchnumber], [timenotusedoldpwd], [alertbeforeexpire], [pwdexpireday], [notloginafterday], [notchgpwduntilday], [minpwdlength], [alphainpwd], [otherinpwd], [maxsamechar], [mindiffchar], [maxarrangechar], [loginfailtime], [fromip], [toip], [starttime], [endtime], [groupflag], [maxloginfailtime], [checkdictpwd], [maxpwdlength], [digitinpwd], [upperinpwd], [lowerinpwd]) VALUES (N'DEFAULT', N'1', N'1', N'0', N'1', N'0', N'0', N'120', N'0', N'7', N'8', N'0', N'1', N'0', N'0', N'0', N'0', NULL, NULL, NULL, NULL, N'1', N'0', N'0', N'0', N'1', N'1', N'1')
GO


-- ----------------------------
-- Table structure for tprod
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tprod]') AND type IN ('U'))
	DROP TABLE [dbo].[tprod]
GO

CREATE TABLE [dbo].[tprod] (
  [product] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [nameen] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [nameth] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [seqno] int DEFAULT '0' NULL,
  [serialid] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [startdate] date DEFAULT NULL NULL,
  [url] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [capital] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [verified] varchar(1) COLLATE Thai_CI_AS DEFAULT '1' NULL,
  [centerflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [iconfile] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tprod] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tprod
-- ----------------------------
INSERT INTO [dbo].[tprod] ([product], [nameen], [nameth], [seqno], [serialid], [startdate], [url], [capital], [verified], [centerflag], [iconfile], [editdate], [edittime], [edituser]) VALUES (N'PROMPT', N'Prompt Module', N'Prompt Module', N'99', NULL, NULL, NULL, NULL, N'0', N'1', N'prompt.png', NULL, NULL, NULL)
GO


-- ----------------------------
-- Table structure for tprog
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tprog]') AND type IN ('U'))
	DROP TABLE [dbo].[tprog]
GO

CREATE TABLE [dbo].[tprog] (
  [product] varchar(30) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [programid] varchar(20) COLLATE Thai_CI_AS  NOT NULL,
  [progname] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [prognameth] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [progtype] varchar(2) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [appstype] varchar(2) COLLATE Thai_CI_AS DEFAULT 'W' NULL,
  [description] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [parameters] varchar(80) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [progsystem] varchar(10) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [iconfile] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [iconstyle] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [shortname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [shortnameth] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [progpath] varchar(150) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [newflag] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tprog] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tprog
-- ----------------------------
INSERT INTO [dbo].[tprog] ([product], [programid], [progname], [prognameth], [progtype], [appstype], [description], [parameters], [progsystem], [iconfile], [iconstyle], [shortname], [shortnameth], [progpath], [editdate], [edittime], [edituser]) VALUES (N'PROMPT', N'emte001', N'Task Setting', N'Task Setting', N'F', N'W', N'Task Setting', NULL, N'F', N'', NULL, N'Task', N'Task', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tprog] ([product], [programid], [progname], [prognameth], [progtype], [appstype], [description], [parameters], [progsystem], [iconfile], [iconstyle], [shortname], [shortnameth], [progpath], [editdate], [edittime], [edituser]) VALUES (N'PROMPT', N'sfte012', N'Configure Setting', N'Configure Setting', N'F', N'W', N'Configure Setting', NULL, N'F', N'sfte012.png', NULL, N'Configure', N'Configure', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tprog] ([product], [programid], [progname], [prognameth], [progtype], [appstype], [description], [parameters], [progsystem], [iconfile], [iconstyle], [shortname], [shortnameth], [progpath], [editdate], [edittime], [edituser]) VALUES (N'PROMPT', N'sftq001', N'Tracking', N'Tracking', N'F', N'W', N'Tracking', NULL, N'F', N'sftq001.png', NULL, N'Tracking', N'Tracking', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tprog] ([product], [programid], [progname], [prognameth], [progtype], [appstype], [description], [parameters], [progsystem], [iconfile], [iconstyle], [shortname], [shortnameth], [progpath], [editdate], [edittime], [edituser]) VALUES (N'PROMPT', N'sftu004', N'Access Token', N'Access Token', N'F', N'W', N'Access Token', NULL, N'F', N'sftu004.png', NULL, N'Token', N'Token', NULL, NULL, NULL, NULL)
GO


-- ----------------------------
-- Table structure for tproggrp
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tproggrp]') AND type IN ('U'))
	DROP TABLE [dbo].[tproggrp]
GO

CREATE TABLE [dbo].[tproggrp] (
  [groupname] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [programid] varchar(20) COLLATE Thai_CI_AS  NOT NULL,
  [parameters] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [seqno] int DEFAULT '0' NULL
)
GO

ALTER TABLE [dbo].[tproggrp] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tproggrp
-- ----------------------------
INSERT INTO [dbo].[tproggrp] ([groupname], [programid], [parameters], [seqno]) VALUES (N'ADMIN', N'sfte012', NULL, N'1')
GO

INSERT INTO [dbo].[tproggrp] ([groupname], [programid], [parameters], [seqno]) VALUES (N'ADMIN', N'sftq001', NULL, N'2')
GO

INSERT INTO [dbo].[tproggrp] ([groupname], [programid], [parameters], [seqno]) VALUES (N'SETTING', N'emte001', NULL, N'2')
GO

INSERT INTO [dbo].[tproggrp] ([groupname], [programid], [parameters], [seqno]) VALUES (N'SETTING', N'sftu004', NULL, N'1')
GO


-- ----------------------------
-- Table structure for trpwd
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[trpwd]') AND type IN ('U'))
	DROP TABLE [dbo].[trpwd]
GO

CREATE TABLE [dbo].[trpwd] (
  [reservepwd] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL
)
GO

ALTER TABLE [dbo].[trpwd] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of trpwd
-- ----------------------------
INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw0rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw1rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw2rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw3rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw4rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw5rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw6rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw7rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw8rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssw9rd')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'P@ssword')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password0')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password1')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password2')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password3')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password4')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password5')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password6')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password7')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password8')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Password9')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Qaz123wsx')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Qaz12wsx')
GO

INSERT INTO [dbo].[trpwd] ([reservepwd]) VALUES (N'Qwerty123')
GO


-- ----------------------------
-- Table structure for trxlog
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[trxlog]') AND type IN ('U'))
	DROP TABLE [dbo].[trxlog]
GO

CREATE TABLE [dbo].[trxlog] (
  [keyid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [curtime] bigint DEFAULT NULL NULL,
  [trxtime] bigint DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [transtime] datetime DEFAULT NULL NULL,
  [caller] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [sender] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [owner] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [processtype] varchar(15) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [trxstatus] char(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [attachs] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [refer] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [note] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [package] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [action] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [quotable] varchar(150) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [grouper] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [remark] text COLLATE Thai_CI_AS  NULL,
  [contents] text COLLATE Thai_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[trxlog] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of trxlog
-- ----------------------------

-- ----------------------------
-- Table structure for trxres
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[trxres]') AND type IN ('U'))
	DROP TABLE [dbo].[trxres]
GO

CREATE TABLE [dbo].[trxres] (
  [keyid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [curtime] bigint DEFAULT NULL NULL,
  [trxtime] bigint DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [transtime] datetime DEFAULT NULL NULL,
  [caller] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [sender] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [owner] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [processtype] varchar(15) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [trxstatus] char(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [remark] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [attachs] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [refer] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [note] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [package] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [action] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [quotable] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [grouper] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [contents] text COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[trxres] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of trxres
-- ----------------------------

-- ----------------------------
-- Table structure for ttemplate
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[ttemplate]') AND type IN ('U'))
	DROP TABLE [dbo].[ttemplate]
GO

CREATE TABLE [dbo].[ttemplate] (
  [template] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [templatetype] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [subjecttitle] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [contents] text COLLATE Thai_CI_AS  NOT NULL,
  [contexts] text COLLATE Thai_CI_AS  NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[ttemplate] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of ttemplate
-- ----------------------------
INSERT INTO [dbo].[ttemplate] ([template], [templatetype], [subjecttitle], [contents], [contexts], [editdate], [edittime], [edituser]) VALUES (N'USER_FORGOT', N'MAIL_NOTIFY', N'Confirm Password Changed', N'Dear, ${userfullname}.<br/>\r\nConfirm your password was changed.<br/>\r\nuser = ${username}<br>\r\npassword = ${userpassword}<br>\r\nyours sincerely,<br>		\r\nAdministrator<br/>', N'Dear, ${userfullname}.<br/>\r\nConfirm your password was changed.<br/>\r\nuser = ${username}<br>\r\npassword = ${userpassword}<br>\r\nyours sincerely,<br>		\r\nAdministrator<br/>', NULL, NULL, NULL)
GO

INSERT INTO [dbo].[ttemplate] ([template], [templatetype], [subjecttitle], [contents], [contexts], [editdate], [edittime], [edituser]) VALUES (N'USER_INFO', N'MAIL_NOTIFY', N'Confirm New Account', N'<p>Dear, ${userfullname}.<br />New account was created for access system.<br />To confirm, please kindly use information below.<br />user = ${username}<br />password = ${userpassword}<br />yours sincerely,<br />Administrator</p>', N'<p>Dear, ${userfullname}.<br />New account was created for access system.<br />To confirm, please kindly use information below.<br />user = ${username}<br />password = ${userpassword}<br />yours sincerely,<br />Administrator</p>', N'2023-10-26', N'10:41:22.0000000', N'tso')
GO


-- ----------------------------
-- Table structure for ttemplatetag
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[ttemplatetag]') AND type IN ('U'))
	DROP TABLE [dbo].[ttemplatetag]
GO

CREATE TABLE [dbo].[ttemplatetag] (
  [tagname] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [tagtitle] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [seqno] int DEFAULT '0' NOT NULL
)
GO

ALTER TABLE [dbo].[ttemplatetag] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of ttemplatetag
-- ----------------------------
INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${datacontents}', N'Data Info', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${datetime}', N'Date Time', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${description}', N'Description', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${enddate}', N'End Date', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${errorcontents}', N'Error Info', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${startdate}', N'Start Date', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${tablecontents}', N'Table Contents', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${textcontents}', N'Post Information', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${userfullname}', N'User Full Name', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${username}', N'User ID', N'0')
GO

INSERT INTO [dbo].[ttemplatetag] ([tagname], [tagtitle], [seqno]) VALUES (N'${userpassword}', N'User Password', N'0')
GO


-- ----------------------------
-- Table structure for tupwd
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tupwd]') AND type IN ('U'))
	DROP TABLE [dbo].[tupwd]
GO

CREATE TABLE [dbo].[tupwd] (
  [serverdatetime] datetime DEFAULT NULL NULL,
  [systemdate] date DEFAULT '0000-00-00' NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [userpassword] varchar(200) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [edituserid] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL
)
GO

ALTER TABLE [dbo].[tupwd] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tupwd
-- ----------------------------
INSERT INTO [dbo].[tupwd] ([serverdatetime], [systemdate], [userid], [userpassword], [edituserid]) VALUES (N'2025-03-21 08:00:16.957', N'2025-03-21', N'tso', N'$2b$10$V7N5UyRWkXqviwy13kXVd.unrR3yYE8CqS7en7BNzJ7VKJtWGgFpG', N'tso')
GO


-- ----------------------------
-- Table structure for tuser
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuser]') AND type IN ('U'))
	DROP TABLE [dbo].[tuser]
GO

CREATE TABLE [dbo].[tuser] (
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [username] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [site] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [startdate] date DEFAULT NULL NULL,
  [enddate] date DEFAULT NULL NULL,
  [status] varchar(1) COLLATE Thai_CI_AS DEFAULT 'A' NULL,
  [userpassword] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [passwordexpiredate] date DEFAULT NULL NULL,
  [passwordchangedate] date DEFAULT NULL NULL,
  [passwordchangetime] time(7) DEFAULT NULL NULL,
  [showphoto] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [adminflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [groupflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [theme] varchar(20) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [firstpage] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [loginfailtimes] tinyint DEFAULT '0' NULL,
  [failtime] bigint DEFAULT NULL NULL,
  [lockflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [usertype] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [iconfile] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [accessdate] date DEFAULT NULL NULL,
  [accesstime] time(7) DEFAULT NULL NULL,
  [accesshits] bigint DEFAULT '0' NULL,
  [siteflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [branchflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [approveflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [changeflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [newflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [activeflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [mistakens] tinyint DEFAULT '0' NULL,
  [mistakentime] bigint DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tuser] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuser
-- ----------------------------
INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'adminis', N'admin@freewill.com', N'FWS', NULL, NULL, N'A', N'$2a$10$MhzJQISuqFZSES0k00LPx.iMWUMGgp4P4oR5xlAYdzc2ydaVQgMnG', NULL, NULL, NULL, NULL, N'1', N'0', NULL, NULL, N'0', N'0', N'0', N'A', NULL, N'2025-02-27', N'20:24:16.0000000', N'466', N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'2021-05-16', N'10:27:01.0000000', N'tso')
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'centre', N'center@freewill.com', N'FWS', NULL, NULL, N'A', N'$2a$10$fCARfKVL/xYrnJC6QS7c/O.u1WEKq.xS.qmlRV4sZo6PA1sJPW78C', NULL, NULL, NULL, NULL, N'1', N'0', NULL, NULL, N'0', N'0', N'0', N'A', NULL, N'2021-05-25', N'10:45:29.0000000', N'46', N'1', N'1', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test1', N'test1@test.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', N'0', N'0', N'E', NULL, N'2023-09-27', N'16:18:12.0000000', N'46', N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test2', N'test2@test.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', NULL, N'0', N'E', NULL, NULL, NULL, N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test3', N'test3@test.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', NULL, N'0', N'E', NULL, NULL, NULL, N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test4', N'test4@test.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', NULL, N'0', N'E', NULL, NULL, NULL, N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test5', N'test5@test.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', NULL, N'0', N'E', NULL, NULL, NULL, N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test6', N'test6@test.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', NULL, N'0', N'E', NULL, NULL, NULL, N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test7', N'test7@test.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', NULL, N'0', N'E', NULL, NULL, NULL, N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test8', N'test8@test.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', NULL, N'0', N'E', NULL, NULL, NULL, N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'test9', N'test9@testing.com', N'FWS', NULL, NULL, N'A', N'$2a$10$g/5giEKKwQKm.9UNmL6CCOtSqN64tFi04QzCS/D.ECog88PsTAVC.', NULL, NULL, NULL, NULL, N'0', N'0', NULL, NULL, N'0', NULL, N'0', N'O', NULL, NULL, NULL, N'0', N'0', N'1', N'0', N'0', N'0', N'0', N'0', NULL, N'2023-09-14', N'16:35:54.0000000', N'tso')
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'tester', N'tester@freewill.com', N'FWS', NULL, NULL, N'A', N'$2a$10$lDY.QbMZp./3KLS3uGpu3OHypOk4itewChD2.2jrtsgQmGaJ2BayS', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, N'0', N'0', N'0', N'O', NULL, N'2024-09-17', N'13:47:15.0000000', N'12', N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'2021-05-16', N'10:26:46.0000000', N'tso')
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'tso', N'tso@freewill.com', N'FWS', NULL, NULL, N'A', N'$2b$10$V7N5UyRWkXqviwy13kXVd.unrR3yYE8CqS7en7BNzJ7VKJtWGgFpG', N'2025-07-19', N'2025-03-21', N'08:00:16.9333333', N'1', N'1', N'0', N'', N'', N'0', N'0', N'0', N'A', N'', N'2025-04-03', N'06:27:21.3333333', N'7282', N'0', N'1', N'1', N'0', N'0', N'0', N'0', N'0', N'2023-09-14', N'16:57:56.0000000', N'tso')
GO

INSERT INTO [dbo].[tuser] ([userid], [username], [site], [startdate], [enddate], [status], [userpassword], [passwordexpiredate], [passwordchangedate], [passwordchangetime], [showphoto], [adminflag], [groupflag], [theme], [firstpage], [loginfailtimes], [failtime], [lockflag], [usertype], [iconfile], [accessdate], [accesstime], [accesshits], [siteflag], [branchflag], [approveflag], [changeflag], [newflag], [activeflag], [mistakens], [mistakentime], [editdate], [edittime], [edituser]) VALUES (N'ttso', N'ttso@freewill.com', N'FWS', NULL, NULL, N'A', N'$2a$10$XxaiWYBcRIglzgJ9MF3toO6ZpUh6dv/XDEFlPsPtkpS583Hiuqz/y', N'2025-07-28', N'2022-03-30', N'09:21:19.0000000', NULL, N'0', N'0', NULL, NULL, N'0', N'0', N'0', N'E', NULL, N'2024-12-04', N'12:56:25.0000000', N'339', N'0', N'0', N'0', N'0', N'0', N'0', N'0', N'0', NULL, NULL, NULL)
GO


-- ----------------------------
-- Table structure for tuserbranch
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserbranch]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserbranch]
GO

CREATE TABLE [dbo].[tuserbranch] (
  [site] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [branch] varchar(20) COLLATE Thai_CI_AS  NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL
)
GO

ALTER TABLE [dbo].[tuserbranch] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserbranch
-- ----------------------------

-- ----------------------------
-- Table structure for tuserfactor
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserfactor]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserfactor]
GO

CREATE TABLE [dbo].[tuserfactor] (
  [factorid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [factorkey] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [email] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [issuer] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [createdate] date  NOT NULL,
  [createtime] time(7)  NOT NULL,
  [createtranstime] bigint  NOT NULL,
  [factorflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NOT NULL,
  [factorurl] varchar(350) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [confirmdate] date DEFAULT NULL NULL,
  [confirmtime] time(7) DEFAULT NULL NULL,
  [confirmtranstime] bigint DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [factorremark] varchar(350) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tuserfactor] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserfactor
-- ----------------------------

-- ----------------------------
-- Table structure for tuserfactorhistory
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserfactorhistory]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserfactorhistory]
GO

CREATE TABLE [dbo].[tuserfactorhistory] (
  [factorid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [factorkey] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [email] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [issuer] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [createdate] date  NOT NULL,
  [createtime] time(7)  NOT NULL,
  [createtranstime] bigint  NOT NULL,
  [factorflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NOT NULL,
  [factorurl] varchar(350) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [confirmdate] date DEFAULT NULL NULL,
  [confirmtime] time(7) DEFAULT NULL NULL,
  [confirmtranstime] bigint DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [factorremark] varchar(350) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tuserfactorhistory] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserfactorhistory
-- ----------------------------

-- ----------------------------
-- Table structure for tusergrp
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tusergrp]') AND type IN ('U'))
	DROP TABLE [dbo].[tusergrp]
GO

CREATE TABLE [dbo].[tusergrp] (
  [userid] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [groupname] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [rolename] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tusergrp] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tusergrp
-- ----------------------------
INSERT INTO [dbo].[tusergrp] ([userid], [groupname], [rolename]) VALUES (N'adminis', N'ADMIN', NULL)
GO

INSERT INTO [dbo].[tusergrp] ([userid], [groupname], [rolename]) VALUES (N'adminis', N'SETTING', NULL)
GO

INSERT INTO [dbo].[tusergrp] ([userid], [groupname], [rolename]) VALUES (N'tso', N'ADMIN', NULL)
GO

INSERT INTO [dbo].[tusergrp] ([userid], [groupname], [rolename]) VALUES (N'tso', N'SETTING', NULL)
GO


-- ----------------------------
-- Table structure for tuserinfo
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserinfo]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserinfo]
GO

CREATE TABLE [dbo].[tuserinfo] (
  [site] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [employeeid] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [userbranch] varchar(20) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [usertname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [usertsurname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [userename] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [useresurname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [displayname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activeflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [accessdate] date DEFAULT NULL NULL,
  [accesstime] time(7) DEFAULT NULL NULL,
  [photoimage] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [email] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [gender] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [lineid] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [mobile] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [langcode] varchar(10) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [birthday] date DEFAULT NULL NULL,
  [inactive] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [remarks] text COLLATE Thai_CI_AS  NULL,
  [usercontents] text COLLATE Thai_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[tuserinfo] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserinfo
-- ----------------------------
INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'adminis', N'adminis', N'00', N'FWS', N'Administrator', N'FWS', N'Administrator', N'FWS_Adm', N'0', N'2025-02-27', N'20:24:16.0000000', N'photo_fwg_fwgadmin.jpg', N'admin@freewillsolutions.com', N'M', NULL, NULL, NULL, NULL, N'0', N'2021-05-16', N'10:27:01.0000000', N'tso', N'sfte007', NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test1', N'test1', NULL, N'Test1', N'Test', N'Test1', N'Test', N'Test1_Tes', N'0', N'2023-09-27', N'16:18:12.0000000', NULL, N'test1@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test2', N'test2', NULL, N'Test2', N'Test', N'Test2', N'Test', N'Test2_Tes', N'0', NULL, NULL, NULL, N'test2@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test3', N'test3', NULL, N'Test3', N'Test', N'Test3', N'Test', N'Test3_Tes', N'0', NULL, NULL, NULL, N'test3@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test4', N'test4', NULL, N'Test4', N'Test', N'Test4', N'Test', N'Test4_Tes', N'0', NULL, NULL, NULL, N'test4@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test5', N'test5', NULL, N'Test5', N'Test', N'Test5', N'Test', N'Test5_Tes', N'0', NULL, NULL, NULL, N'test5@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test6', N'test6', NULL, N'Test6', N'Test', N'Test6', N'Test', N'Test6_Tes', N'0', NULL, NULL, NULL, N'test6@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test7', N'test7', NULL, N'Test7', N'Test', N'Test7', N'Test', N'Test7_Tes', N'0', NULL, NULL, NULL, N'test7@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test8', N'test8', NULL, N'Test8', N'Test', N'Test8', N'Test', N'Test8_Tes', N'0', NULL, NULL, NULL, N'test8@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'test9', N'test9', NULL, N'Test9', N'Test', N'Test9', N'Test', N'Test9_Tes', N'0', NULL, NULL, NULL, N'test9@gmail.com', NULL, NULL, NULL, NULL, NULL, N'0', N'2023-09-14', N'16:35:54.0000000', N'tso', N'sfte007', NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'tester', N'tester', NULL, N'Tester', N'Test', N'Tester', N'Test', N'Tester_Tes', N'0', N'2024-09-17', N'13:47:15.0000000', NULL, N'tester@gmail.com', N'M', NULL, NULL, NULL, NULL, N'0', N'2021-05-16', N'10:26:46.0000000', N'tso', N'sfte007', NULL)
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'tso', N'tso', N'00', N'Tassan', N'Oros', N'Tassan', N'Oros', N'Tassan_oro', N'0', N'2025-04-03', N'06:27:21.3333333', N'photo_fwg_tso.png', N'tassun_oro@hotmail.com', N'M', N'tassun_oro', N'0955941678', N'EN', NULL, N'0', N'2024-10-02', N'15:15:39.0000000', N'tso', N'sfte007', N'{"companion":"qby1"}')
GO

INSERT INTO [dbo].[tuserinfo] ([site], [employeeid], [userid], [userbranch], [usertname], [usertsurname], [userename], [useresurname], [displayname], [activeflag], [accessdate], [accesstime], [photoimage], [email], [gender], [lineid], [mobile], [langcode], [birthday], [inactive], [editdate], [edittime], [edituser], [remarks], [usercontents]) VALUES (N'FWS', N'ttso', N'ttso', N'00', N'Tassun', N'Oros', N'Tassun', N'Oros', N'Tassun_Oro', N'0', N'2024-12-04', N'12:56:25.0000000', NULL, N'tassunoros@gmail.com', N'M', NULL, NULL, NULL, NULL, N'0', NULL, NULL, NULL, NULL, N'{"companion":"tama1"}')
GO


-- ----------------------------
-- Table structure for tuserinfohistory
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserinfohistory]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserinfohistory]
GO

CREATE TABLE [dbo].[tuserinfohistory] (
  [site] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [employeeid] varchar(50) COLLATE Thai_CI_AS DEFAULT '' NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [userbranch] varchar(20) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [usertname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [usertsurname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [userename] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [useresurname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [displayname] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [activeflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [accessdate] date DEFAULT NULL NULL,
  [accesstime] time(7) DEFAULT NULL NULL,
  [photoimage] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [email] varchar(100) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [gender] varchar(1) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [lineid] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [mobile] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [langcode] varchar(10) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [birthday] date DEFAULT NULL NULL,
  [inactive] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [edituser] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [remarks] text COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [usercontents] text COLLATE Thai_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[tuserinfohistory] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserinfohistory
-- ----------------------------

-- ----------------------------
-- Table structure for tuserlog
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserlog]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserlog]
GO

CREATE TABLE [dbo].[tuserlog] (
  [seqno] bigint DEFAULT '0' NOT NULL,
  [curtime] datetime  NOT NULL,
  [useralias] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [site] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [progid] varchar(25) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [handler] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [action] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [remark] text COLLATE Thai_CI_AS  NULL,
  [token] varchar(350) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [address] varchar(200) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [paths] varchar(500) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [headers] text COLLATE Thai_CI_AS  NULL,
  [requests] text COLLATE Thai_CI_AS  NULL,
  [contents] text COLLATE Thai_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[tuserlog] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserlog
-- ----------------------------

-- ----------------------------
-- Table structure for tuserpwd
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserpwd]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserpwd]
GO

CREATE TABLE [dbo].[tuserpwd] (
  [trxid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [userpassword] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [expiredate] datetime  NOT NULL,
  [transtime] bigint  NOT NULL,
  [passwordexpiredate] date  NOT NULL,
  [passwordchangedate] date  NOT NULL,
  [passwordchangetime] time(7)  NOT NULL,
  [expireflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [confirmdate] date DEFAULT NULL NULL,
  [confirmtime] time(7) DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL
)
GO

ALTER TABLE [dbo].[tuserpwd] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserpwd
-- ----------------------------

-- ----------------------------
-- Table structure for tuserpwdhistory
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserpwdhistory]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserpwdhistory]
GO

CREATE TABLE [dbo].[tuserpwdhistory] (
  [trxid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [userpassword] varchar(100) COLLATE Thai_CI_AS  NOT NULL,
  [expiredate] datetime  NOT NULL,
  [transtime] bigint  NOT NULL,
  [passwordexpiredate] date  NOT NULL,
  [passwordchangedate] date  NOT NULL,
  [passwordchangetime] time(7)  NOT NULL,
  [expireflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL,
  [confirmdate] date DEFAULT NULL NULL,
  [confirmtime] time(7) DEFAULT NULL NULL,
  [editdate] date DEFAULT NULL NULL,
  [edittime] time(7) DEFAULT NULL NULL,
  [hisid] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [hisno] bigint DEFAULT NULL NULL,
  [hisflag] varchar(1) COLLATE Thai_CI_AS DEFAULT '0' NULL
)
GO

ALTER TABLE [dbo].[tuserpwdhistory] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserpwdhistory
-- ----------------------------

-- ----------------------------
-- Table structure for tuserrole
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tuserrole]') AND type IN ('U'))
	DROP TABLE [dbo].[tuserrole]
GO

CREATE TABLE [dbo].[tuserrole] (
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [roleid] varchar(50) COLLATE Thai_CI_AS  NOT NULL
)
GO

ALTER TABLE [dbo].[tuserrole] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tuserrole
-- ----------------------------

-- ----------------------------
-- Table structure for tusertoken
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tusertoken]') AND type IN ('U'))
	DROP TABLE [dbo].[tusertoken]
GO

CREATE TABLE [dbo].[tusertoken] (
  [useruuid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [userid] varchar(50) COLLATE Thai_CI_AS  NOT NULL,
  [createdate] date  NOT NULL,
  [createtime] time(7)  NOT NULL,
  [createmillis] bigint  NOT NULL,
  [expiredate] date  NOT NULL,
  [expiretime] time(7)  NOT NULL,
  [expiretimes] bigint  NOT NULL,
  [site] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [code] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [state] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [nonce] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [authtoken] varchar(350) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [prime] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [generator] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [privatekey] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [publickey] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [sharedkey] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [otherkey] varchar(250) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [tokentype] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [tokenstatus] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [factorcode] varchar(50) COLLATE Thai_CI_AS DEFAULT NULL NULL,
  [outdate] date DEFAULT NULL NULL,
  [outtime] time(7) DEFAULT NULL NULL,
  [accesscontents] text COLLATE Thai_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[tusertoken] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tusertoken
-- ----------------------------
INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'129a6c9e-5dc0-458a-9d67-f68ff7616f0e', N'tso', N'2025-04-01', N'07:00:45.7066667', N'1743490845706', N'2025-04-02', N'01:00:45.7066667', N'1743555645706', N'FWS', N'77d5c584-fb10-47bc-acf8-b09d689694dd', N'012c7c37-42b7-4c6b-a19c-2475ddecad16', N'3f98607d-bcc4-4f4d-b336-5a96e9c2a0e3', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiMTI5YTZjOWUtNWRjMC00NThhLTlkNjctZjY4ZmY3NjE2ZjBlIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDM0OTA4NDUsImV4cCI6MTc0MzU1NTY0NX0.XRPQZiVqJ523OT6OxIejWEoyIPwWxXoGXXUyiDAIo-U', N'110127604166044580152699116351941772754473628080237025638271542982400650079689', N'2113', N'19290159471222101752886515711382131726824826852157427871057247362503466116809', N'45512019302341300148828881896925175013053049013728169665166455878274079543951', N'42027165021556859358049834645082361154449652977725029421325912164749317997931', N'85365595888575403528619897009082824309850519875476536463760557553707867955282', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'159c507e-b79f-43ab-b2ae-8c563361fed6', N'tso', N'2025-03-27', N'02:31:06.8266667', N'1743042666828', N'2025-03-27', N'20:31:06.8266667', N'1743107466828', N'FWS', N'e3b1c24c-7b05-40ea-91af-ee982f620654', N'070d0a97-fcba-4e16-8819-26e963de358b', N'30d21dd5-0561-48a4-a52a-25e842bee838', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiMTU5YzUwN2UtYjc5Zi00M2FiLWIyYWUtOGM1NjMzNjFmZWQ2Iiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDMwNDI2NjYsImV4cCI6MTc0MzEwNzQ2Nn0.Zb-Qa0tdlJUyom6hCL1Tkg3ee_RLMYZ-DIxyXafoJZY', N'76773291914868328863985751020402072633668837776938750983503442613071715211671', N'8741', N'28769016380526162540042848183026224918075481026888457733831655142839185496451', N'43884424320367175217099096441799001011203377978561947537844453097018451302770', N'64802723641173592413336798133167280860918234650410196726732492573272559355576', N'37308212110305005529529559202863784598115584694346964852530298243465959438437', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'1d95ed7b-fd72-47bf-9349-3cc7eb339879', N'tso', N'2025-04-01', N'03:10:30.6366667', N'1743477030636', N'2025-04-01', N'21:10:30.6366667', N'1743541830636', N'FWS', N'90832cb4-9b02-482a-bfde-901b663fa378', N'fb807334-9c4a-4668-b3cc-8e0b9f9b3d21', N'aa0e0b0a-a344-4f0c-b799-2b4f9abd27ac', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiMWQ5NWVkN2ItZmQ3Mi00N2JmLTkzNDktM2NjN2ViMzM5ODc5Iiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDM0NzcwMzAsImV4cCI6MTc0MzU0MTgzMH0.ZAv_Cb7GZ2AE2JHNnnfQ65cR1nlRJGe_ccK_1t1QdJc', N'94106415644292240004433034042464790992056763383523528787287755750698434519441', N'5779', N'24499093774437868673260053316890915065406124818400637871480284040773835494011', N'7873394537610840175973933135274959461336820249221635799545974429199828597254', N'43032560135136493206422767475669617913265652631272103256839451229654646669762', N'73825207515536140463497755470086584010398563315014197266089241083792166764894', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'2c8becac-4f62-4c51-8230-4a2d7661cea1', N'tso', N'2025-03-28', N'07:43:24.1666667', N'1743147804168', N'2025-03-29', N'01:43:24.1666667', N'1743212604168', N'FWS', N'35ca6afe-f032-4c5b-be58-c1c42791a692', N'59962ea5-f320-4350-a7d1-4b12063f7511', N'802bcb27-b9d0-4e66-8b13-27c194ef2ce8', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiMmM4YmVjYWMtNGY2Mi00YzUxLTgyMzAtNGEyZDc2NjFjZWExIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDMxNDc4MDQsImV4cCI6MTc0MzIxMjYwNH0.F2DPNnZtZYbCg763TGh3utww-FHdNDbhV-eyf7GQRPw', N'105522594659534422983888574954928839187331175309971832503233926134855578913149', N'4787', N'26011467381871582307214812613501443808422559050852518637465207997969255513841', N'38616432087966266580515442951466460766420398335339719760503505560878276495908', N'8140265562021906000245259200099509708922961683922855358764197870238137758309', N'17886468768334161286336978191271151531935344990730843672413069813874147161730', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'2daa0459-2aa1-4f23-9090-dddd41f597f1', N'tso', N'2025-03-25', N'08:36:35.4166667', N'1742891795417', N'2025-03-26', N'02:36:35.4166667', N'1742956595417', N'FWS', N'a4789fea-1abf-4156-8b6e-aa8adfbe1357', N'114c803e-ed1f-4593-8600-cc8d559c6bdd', N'40b35eb0-3bf4-4a7b-8bdd-c5e9301a6107', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiMmRhYTA0NTktMmFhMS00ZjIzLTkwOTAtZGRkZDQxZjU5N2YxIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI4OTE3OTUsImV4cCI6MTc0Mjk1NjU5NX0.PaF4ZRim85IevSIYVnodofBtL6LTRqtkQ9YID2N61WU', N'85671225581997849118193558683231445388054848706467090848415496701861120152097', N'1637', N'28615264400995639049721198274397723056533092414618429961478752570232738087663', N'26873497927333787021017210852953900392979508011102661053847666470014087556350', N'43617239574548836440781205526396361754834555542905957383126448281128780946959', N'84468004358678163271764573311038784494445152881975283999058074194054944405790', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'39145a96-fd85-4d15-86b4-b43598fbc3b7', N'tso', N'2025-03-26', N'03:26:49.5900000', N'1742959609589', N'2025-03-26', N'21:26:49.5900000', N'1743024409589', N'FWS', N'e43f0d1b-26e5-4031-9dae-b829d6ab8989', N'4510cdab-8ef6-488d-9f66-efc663a23a48', N'dbc2db0b-5346-4ded-b274-99808273161e', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiMzkxNDVhOTYtZmQ4NS00ZDE1LTg2YjQtYjQzNTk4ZmJjM2I3Iiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI5NTk2MDksImV4cCI6MTc0MzAyNDQwOX0.e9kC3Z2iHbIK-XibLdCmJyui47zXNIGfdahL9Weg-5o', N'81758353148384257567782235951525942314030500591386810531167676993825959929177', N'7867', N'25825289784234189447708809706822097878784540791780260631862488004022270018293', N'33830883085043520462459349520732672724951379158652348050306341510548954932981', N'44137083576784371758058314628443333564155462385602554998887602861501586252651', N'62007122281925401071624842928868788549282683348940318068007753798231373845255', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'3b0ada8c-1111-4e32-b4d1-7d73c44e70a0', N'tso', N'2025-03-30', N'10:26:55.0266667', N'1743330415027', N'2025-03-31', N'04:26:55.0266667', N'1743395215027', N'FWS', N'893c4c2a-2d35-4ace-89e8-13dc350f5e1d', N'38a8e029-7e52-4335-9f14-80af6d21ea7d', N'41be1690-551f-4afe-b3db-3c1ee7ec0c89', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiM2IwYWRhOGMtMTExMS00ZTMyLWI0ZDEtN2Q3M2M0NGU3MGEwIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDMzMzA0MTUsImV4cCI6MTc0MzM5NTIxNX0.JNbO3nAut5Y0kFXSWrjcuI6NOBWy7_-QHxvoofMA4B0', N'90756056147963889915463267599397774789035178748025901085505025424246478889367', N'8269', N'25053784832650271397154504195164877394027450236192377722737539590702165232481', N'81299645869833319983381110675150775697136811609514505719392334095854631834672', N'8666859657323889751397200887544243633495033297964054782375320451049395737235', N'82057162469344603509007857696093376360497622855714489822067375529002246766700', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'404e6a4f-d328-41eb-bc30-6aa63c349eba', N'tso', N'2025-03-31', N'02:49:35.7100000', N'1743389375711', N'2025-03-31', N'20:49:35.7100000', N'1743454175711', N'FWS', N'3edc337d-6c21-445a-af17-67d41d6efa2a', N'8e648986-9aa0-43fa-a6b3-3c0482c3d718', N'c5359739-c504-400e-8b63-14a8210585f4', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiNDA0ZTZhNGYtZDMyOC00MWViLWJjMzAtNmFhNjNjMzQ5ZWJhIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDMzODkzNzUsImV4cCI6MTc0MzQ1NDE3NX0.CSS7RyVmFWBHPY_gEp_5o5XzCKd8QNVxvFfFtRu0w1s', N'106615867725444528770423263118708004986703331140306323716069835440001664007387', N'6421', N'14586064586211980346854043804193679677675423209030739666057953569758294573637', N'5207555601724316836733206665218656910606889151528653104715987448877413271530', N'33451885118861357221723872194836265385445720223957675493818922342128751616156', N'2777516149622881751782139128038571156735485592925892234734897134711131575055', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'73a368c1-7d36-40c2-ab3e-d12c0e4ee56d', N'tso', N'2025-03-25', N'03:22:48.2866667', N'1742872968285', N'2025-03-25', N'21:22:48.2866667', N'1742937768285', N'FWS', N'9f5184ba-3e0d-4299-800a-02c6224aab96', N'6c28c80e-cccc-47c9-97fb-8d525f508b53', N'e20b9f2e-4ce5-4317-ab4d-d5369ed1ec5f', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiNzNhMzY4YzEtN2QzNi00MGMyLWFiM2UtZDEyYzBlNGVlNTZkIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI4NzI5NjgsImV4cCI6MTc0MjkzNzc2OH0.PPCYTuZVZRroBlvMBTvx46bSDOrOBKP0Ek8c_fOoqp8', N'87356030330454034473648998682197455395745953334648801812473791266763138815613', N'2417', N'14558205192073334835049017221179162115737467828399035724609984886327654012669', N'10887246482831147845127186941724346270447554716205123511624970081636560948107', N'5166889021833219564653274350314989769078468850651546264765859370457500956206', N'6609619251112276355598758043845280878259045681265942031876483076362485550838', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'8377500e-cf9e-4ef6-a7b3-08ebf9bfb11a', N'tso', N'2025-04-02', N'06:58:37.5466667', N'1743577117546', N'2025-04-03', N'00:58:37.5466667', N'1743641917546', N'FWS', N'68598792-706d-4af0-b619-68448b1afc70', N'70cb0630-5591-4771-8d28-d3c321ee8d51', N'4f249864-844e-49ed-906b-2099ffcdb082', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiODM3NzUwMGUtY2Y5ZS00ZWY2LWE3YjMtMDhlYmY5YmZiMTFhIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDM1NzcxMTcsImV4cCI6MTc0MzY0MTkxN30.T2Ga8bR3xY1bRxjLEszWfcdGVK_tMeeipoa1daE52QY', N'58229656087241839193203185148778970583175501367872255017319550268107065141863', N'1637', N'16722198140989122092249846841441069656334576366476025737046743319349306011343', N'2210327908444148185796397954600108499166040476298684730430478241285084445224', N'46822612674535364148872517342074528161427754784114674253318298342497223455094', N'31798236841629097302521311817833629449684448351289688239600588746143719444222', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'94251dd6-3b8e-4a36-9a5c-c9f2a1dcf081', N'tso', N'2025-03-25', N'02:06:04.1700000', N'1742868364169', N'2025-03-25', N'20:06:04.1700000', N'1742933164169', N'FWS', N'35ef7c7c-f83e-4858-94d2-7768627554f4', N'7841262a-3307-429e-ad9b-d110b8458e73', N'b684976f-0746-4e04-95e7-a23ba33d8403', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiOTQyNTFkZDYtM2I4ZS00YTM2LTlhNWMtYzlmMmExZGNmMDgxIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI4NjgzNjQsImV4cCI6MTc0MjkzMzE2NH0.egrOFtENAk-qQvIb_n2Jl8nq9eFzbfkDZEoipUf51-U', N'59584482200300796302121845379460301013305210499330996604607481666934404415093', N'9041', N'24915197957826805262385236772750208706575995432676408687691701672074209756369', N'43604522669722271133845486821109950752813064410650020378196958318813497134951', N'2845892163810123704606775905666230076253423306164030330976678346671646433184', N'9745637309637516467238843609977530584035662926398461976457766110739213653449', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'a30a9434-b0c9-47ee-9675-19947db31ea4', N'tso', N'2025-03-24', N'03:19:34.6166667', N'1742786374618', N'2025-03-24', N'21:19:34.6166667', N'1742851174618', N'FWS', N'52036c85-09fa-48da-81c3-ed108e771222', N'f02a19c0-e5d3-4001-a580-af51defcfc40', N'b6d42b16-a32a-428c-ae08-ace7ec8346a5', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiYTMwYTk0MzQtYjBjOS00N2VlLTk2NzUtMTk5NDdkYjMxZWE0Iiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI3ODYzNzQsImV4cCI6MTc0Mjg1MTE3NH0.kpz9_6xZk4tXBk0SRZ1FO-gniR08T6UG3xwXI19V2xs', N'104059016707951383084124810068337569230387624149148618290776142582996844483039', N'9923', N'14926917402213081952469985873204100085231379705004561543237985213002553162051', N'59485356787951885303259932024473021948517801643713832541841409068207464575183', N'80371730697281552600093480356191502891851234983511604148580665423926809123152', N'102342127320275282458397535121618574757357544910094040742313608233947653281512', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'a816f167-1739-45fc-912d-bf34387e722e', N'tso', N'2025-03-21', N'07:59:56.1866667', N'1742543996186', N'2025-03-22', N'01:59:56.1866667', N'1742608796186', N'FWS', N'35cf4839-ac11-4a42-9060-927725f02780', N'2ffc613d-c553-4404-b3be-f4bdafbe5afe', N'bd13a279-a53b-422d-8c88-d2ca1fa4b992', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiYTgxNmYxNjctMTczOS00NWZjLTkxMmQtYmYzNDM4N2U3MjJlIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI1NDM5OTYsImV4cCI6MTc0MjYwODc5Nn0.YhodHSaydRZciF8hF2neEZ10OLtn2TnuL80EkMwxUe8', N'82649967576086758341432193760131057824441299286526753939710154073627651813957', N'6947', N'26569478811241456283905554261330690065436738795871894222791063635822939658143', N'72546954616769456058159665694655517374566031086938916635504460950482493042255', N'18256604612528588648942542642608907378826211179456163095449139922060024413808', N'32062840288869881373127657702877309361697727748007680856689507464293578648519', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'b7bc9191-5bf7-49e7-9831-da464fe92a5d', N'tso', N'2025-03-24', N'11:26:53.0800000', N'1742815613079', N'2025-03-25', N'05:26:53.0800000', N'1742880413079', N'FWS', N'14d96916-c602-4012-9110-e0a92a1fb754', N'f3510a88-5b89-4a17-b5b0-fbd4a5cf8c31', N'fc924c41-24c9-469f-87e5-acec17565331', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiYjdiYzkxOTEtNWJmNy00OWU3LTk4MzEtZGE0NjRmZTkyYTVkIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI4MTU2MTMsImV4cCI6MTc0Mjg4MDQxM30.uyhvWFgrMYaadKHcxoNUO-ONFGS9i7WQ-vM9VzQm2SI', N'91806170075607312078875179491887632998473798953999401633158783050124467473767', N'5689', N'28465182062002820043426145156141869495224426844126314839444427126306219879129', N'78760435708818059462790586674937247398150174097675964050333208259425270307311', N'28515161587082376218299918376808685868767987016661575640721008630449111881960', N'31498928564762352658801945441428895574289707351376259938061798359922265950840', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'ca0eb1bc-5ac8-4f2e-9c7c-4f98f7560392', N'tso', N'2025-03-25', N'10:26:42.9366667', N'1742898402938', N'2025-03-26', N'04:26:42.9366667', N'1742963202938', N'FWS', N'f013de97-47ea-49c2-91a4-b2b97e472290', N'bfdb0e66-dbd3-40ec-9a0d-44034411eb45', N'a2e86066-20be-45d0-abc3-53968fc75d9b', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiY2EwZWIxYmMtNWFjOC00ZjJlLTljN2MtNGY5OGY3NTYwMzkyIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI4OTg0MDIsImV4cCI6MTc0Mjk2MzIwMn0.3EpoztqDz3rOQkDtdOoMZKeUghYdQxnSVXDtLEfWu5g', N'91021576605671093152960525226085867184097491031500888046798643668435526063637', N'9839', N'19474729600274634965358129309176964665409399038212601292489170159722603668071', N'50006197776943134970882520791726602165539529424035933284877750488801574479015', N'28831743428837229308525736722333043558830124874934175787500454364676005135385', N'87716053400684967198506479171761140863588112457732847627994608262473411638869', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'ce2e6a61-b94d-4f9d-ba9e-75af833133b4', N'tso', N'2025-04-02', N'11:37:11.9933333', N'1743593831992', N'2025-04-03', N'05:37:11.9933333', N'1743658631992', N'FWS', N'5b7c34c5-0848-4ca2-b1eb-f8650b1659e6', N'baa3d8ce-b8df-41e0-9f9c-830ae4e42192', N'4b3b0835-2f4a-4fed-b049-8d3d63782924', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiY2UyZTZhNjEtYjk0ZC00ZjlkLWJhOWUtNzVhZjgzMzEzM2I0Iiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDM1OTM4MzEsImV4cCI6MTc0MzY1ODYzMX0.7WaVv5zD3wDvIUGenUZxOoi5zE-ziCFyOyGKHMncoXQ', N'79944059915637277630868417791952082757097512516982719056487696196490565669373', N'6863', N'23154462290457996685137862398819237646756099340052482421342365436504230809931', N'4125575046078337841977895888310468811907902942433958954924467373018313253827', N'1585687009263482826276015262816504336747320547330939609786932100068334107773', N'2133392454204558422693892595372065358239163096353676817118669204063549492851', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'dd356dbd-5ae3-44d3-b7b7-c518f9a2b004', N'tso', N'2025-03-24', N'03:13:29.8566667', N'1742786009857', N'2025-03-24', N'21:13:29.8566667', N'1742850809857', N'FWS', N'78ced328-350c-499e-89d8-2c918dc7bd97', N'3f6c48ad-972c-41a3-9eed-6c4a5d4457c4', N'baed6307-9df2-4ed6-a8ae-dddd441144da', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiZGQzNTZkYmQtNWFlMy00NGQzLWI3YjctYzUxOGY5YTJiMDA0Iiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDI3ODYwMDksImV4cCI6MTc0Mjg1MDgwOX0.sOslSAnQyhCwJ_omRkyt-7AmeKfl-dDiHAcdvpUwtHQ', N'104059016707951383084124810068337569230387624149148618290776142582996844483039', N'9923', N'14926917402213081952469985873204100085231379705004561543237985213002553162051', N'59485356787951885303259932024473021948517801643713832541841409068207464575183', N'86892625858764887371763427406632672874446482881268749112110340992142017865641', N'44101177343581026911507047479671298516034075907265562232299363364055862240000', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'eed285ce-411e-4dca-91de-4c2fbdc6c2c6', N'tso', N'2025-03-26', N'16:10:44.1300000', N'1743005444129', N'2025-03-27', N'10:10:44.1300000', N'1743070244129', N'FWS', N'e6fe0a18-79ed-482e-b6d1-929c5f7178d0', N'0ae57ba6-1b00-4a58-82c6-9bc1918b1935', N'b8b42ece-be26-47e7-b0ea-d14d3e9333f9', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiZWVkMjg1Y2UtNDExZS00ZGNhLTkxZGUtNGMyZmJkYzZjMmM2Iiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDMwMDU0NDQsImV4cCI6MTc0MzA3MDI0NH0.DjlUQyR_sYnP44fXv7vcPUqfQY1vu2WE7qM5RnaaAUM', N'102712649114998914490705028247455696933186785332717616981822231688074571951759', N'5641', N'21000869901542385765652809460225117332941479017458962117844673274070626390727', N'46382211839455730405052266644790666287683756800853460812275947241792206174183', N'24191502709614337018579737082855177705682587247216787072150939026915943875055', N'84778162998799748923700367154336712545574489145020799506417925091778772453058', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'f661430c-c9d8-4231-9cb8-b734e1a6a82a', N'tso', N'2025-04-03', N'06:27:21.1466667', N'1743661641148', N'2025-04-04', N'00:27:21.1466667', N'1743726441148', N'FWS', N'c290350e-af96-4932-af27-353770402cb7', N'31a0014a-6263-46ae-b90d-141e86d8f74b', N'20374263-954e-420c-b36f-6dd41d135925', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiZjY2MTQzMGMtYzlkOC00MjMxLTljYjgtYjczNGUxYTZhODJhIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDM2NjE2NDEsImV4cCI6MTc0MzcyNjQ0MX0.vfftd_EWSDdcwGQV_VmWePbgWg7rOmY8znzQBcxh5IU', N'81742973602571680347825266703702389511683332324014049289035365577223517070357', N'3637', N'20313949706505317412683839751750143439682899706074229438782392251874463710717', N'47915468481227551873613611278932367043895426453883033517954042634559363509817', N'56499516671879485168162945028570945597314320452072453458019983745791375323090', N'26948441891898158905859267349008686766719500184706354675769646506655899004775', N'S', N'C', NULL, NULL, NULL, NULL)
GO

INSERT INTO [dbo].[tusertoken] ([useruuid], [userid], [createdate], [createtime], [createmillis], [expiredate], [expiretime], [expiretimes], [site], [code], [state], [nonce], [authtoken], [prime], [generator], [privatekey], [publickey], [sharedkey], [otherkey], [tokentype], [tokenstatus], [factorcode], [outdate], [outtime], [accesscontents]) VALUES (N'fb60a75a-ad60-4a68-95ac-f26feb09e43c', N'tso', N'2025-03-28', N'10:02:01.1433333', N'1743156121143', N'2025-03-29', N'04:02:01.1433333', N'1743220921143', N'FWS', N'6d22cca6-644e-4433-9492-da12af66968e', N'593370b5-7b7f-45bc-b010-87773ae47edf', N'e8d92f17-f339-40af-b148-4f7423630703', N'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiZmI2MGE3NWEtYWQ2MC00YTY4LTk1YWMtZjI2ZmViMDllNDNjIiwic2l0ZSI6IkZXUyIsImFjY2Vzc29yIjoidHNvIiwidHlwZSI6IlMiLCJpYXQiOjE3NDMxNTYxMjEsImV4cCI6MTc0MzIyMDkyMX0.Waibx50_QyNeT7NXCXajVh-F0WulRGqfTKOWC3Su5l0', N'79535837869802510268121314440834896573199934762921982871032843839049710850033', N'7499', N'16423184053030745341112846972754334663215539361189905407333910902751546191061', N'4265661537355106206682145426460514818394727214075581660496244436000955225224', N'65112490365538114915886579913006938391945708142181178267435800238817975864367', N'70372481748147072146547988506573620348184813971272295084755012251811181795979', N'S', N'C', NULL, NULL, NULL, NULL)
GO


-- ----------------------------
-- Primary Key structure for table tactivate
-- ----------------------------
ALTER TABLE [dbo].[tactivate] ADD CONSTRAINT [PK__tactivat__B5F2C0DEF4AC64B3] PRIMARY KEY CLUSTERED ([activatekey], [activateuser])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tcaptcha
-- ----------------------------
ALTER TABLE [dbo].[tcaptcha] ADD CONSTRAINT [PK__tcaptcha__14B1F97894954990] PRIMARY KEY CLUSTERED ([capid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tconfig
-- ----------------------------
ALTER TABLE [dbo].[tconfig] ADD CONSTRAINT [PK__tconfig__F1804B4103ACDB20] PRIMARY KEY CLUSTERED ([category], [colname])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tconstant
-- ----------------------------
ALTER TABLE [dbo].[tconstant] ADD CONSTRAINT [PK__tconstan__9941586C43FFF21C] PRIMARY KEY CLUSTERED ([typename], [typeid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tcpwd
-- ----------------------------
ALTER TABLE [dbo].[tcpwd] ADD CONSTRAINT [PK__tcpwd__E4DEE19BA7DBEC21] PRIMARY KEY CLUSTERED ([userid], [category])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table tdirectory
-- ----------------------------
CREATE NONCLUSTERED INDEX [domainname]
ON [dbo].[tdirectory] (
  [domainname] ASC
)
GO

CREATE NONCLUSTERED INDEX [applicationid]
ON [dbo].[tdirectory] (
  [applicationid] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table tdirectory
-- ----------------------------
ALTER TABLE [dbo].[tdirectory] ADD CONSTRAINT [PK__tdirecto__4A884FA9C63D809C] PRIMARY KEY CLUSTERED ([domainid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tfavor
-- ----------------------------
ALTER TABLE [dbo].[tfavor] ADD CONSTRAINT [PK__tfavor__B8C7EF9BAA3BA2C2] PRIMARY KEY CLUSTERED ([userid], [programid], [seqno])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tgroup
-- ----------------------------
ALTER TABLE [dbo].[tgroup] ADD CONSTRAINT [PK__tgroup__ED1647CD08D11BFC] PRIMARY KEY CLUSTERED ([groupname])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tnpwd
-- ----------------------------
ALTER TABLE [dbo].[tnpwd] ADD CONSTRAINT [PK__tnpwd__BE759FE82D75BAB4] PRIMARY KEY CLUSTERED ([reservenum])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table tpasskey
-- ----------------------------
CREATE NONCLUSTERED INDEX [site_userid]
ON [dbo].[tpasskey] (
  [site] ASC,
  [userid] ASC
)
GO


-- ----------------------------
-- Uniques structure for table tpasskey
-- ----------------------------
ALTER TABLE [dbo].[tpasskey] ADD CONSTRAINT [passkey] UNIQUE NONCLUSTERED ([keypass] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tpasskey
-- ----------------------------
ALTER TABLE [dbo].[tpasskey] ADD CONSTRAINT [PK__tpasskey__607AFDE033E19339] PRIMARY KEY CLUSTERED ([keyid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tppwd
-- ----------------------------
ALTER TABLE [dbo].[tppwd] ADD CONSTRAINT [PK__tppwd__CBA1B2575DD4FD68] PRIMARY KEY CLUSTERED ([userid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tprod
-- ----------------------------
ALTER TABLE [dbo].[tprod] ADD CONSTRAINT [PK__tprod__583517CE4E918CE9] PRIMARY KEY CLUSTERED ([product])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tprog
-- ----------------------------
ALTER TABLE [dbo].[tprog] ADD CONSTRAINT [PK__tprog__EB84E363DCB9CF1E] PRIMARY KEY CLUSTERED ([programid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tproggrp
-- ----------------------------
ALTER TABLE [dbo].[tproggrp] ADD CONSTRAINT [PK__tproggrp__C3AE09FB367FCC65] PRIMARY KEY CLUSTERED ([groupname], [programid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table trpwd
-- ----------------------------
ALTER TABLE [dbo].[trpwd] ADD CONSTRAINT [PK__trpwd__B88A2BEA5D4631B8] PRIMARY KEY CLUSTERED ([reservepwd])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table trxlog
-- ----------------------------
ALTER TABLE [dbo].[trxlog] ADD CONSTRAINT [PK__trxlog__607AFDE0A8BEEE23] PRIMARY KEY CLUSTERED ([keyid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table ttemplate
-- ----------------------------
ALTER TABLE [dbo].[ttemplate] ADD CONSTRAINT [PK__ttemplat__88301DA9D551B022] PRIMARY KEY CLUSTERED ([template], [templatetype])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table ttemplatetag
-- ----------------------------
ALTER TABLE [dbo].[ttemplatetag] ADD CONSTRAINT [PK__ttemplat__D48789A1079BD738] PRIMARY KEY CLUSTERED ([tagname])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Uniques structure for table tuser
-- ----------------------------
ALTER TABLE [dbo].[tuser] ADD CONSTRAINT [username] UNIQUE NONCLUSTERED ([username] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tuser
-- ----------------------------
ALTER TABLE [dbo].[tuser] ADD CONSTRAINT [PK__tuser__CBA1B257E53AC5CC] PRIMARY KEY CLUSTERED ([userid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tuserbranch
-- ----------------------------
ALTER TABLE [dbo].[tuserbranch] ADD CONSTRAINT [PK__tuserbra__28B0EB085209AB69] PRIMARY KEY CLUSTERED ([site], [branch], [userid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Uniques structure for table tuserfactor
-- ----------------------------
ALTER TABLE [dbo].[tuserfactor] ADD CONSTRAINT [userid1] UNIQUE NONCLUSTERED ([userid] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tuserfactor
-- ----------------------------
ALTER TABLE [dbo].[tuserfactor] ADD CONSTRAINT [PK__tuserfac__3353B12B9C1A0423] PRIMARY KEY CLUSTERED ([factorid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tusergrp
-- ----------------------------
ALTER TABLE [dbo].[tusergrp] ADD CONSTRAINT [PK__tusergrp__0570D62BEC71097E] PRIMARY KEY CLUSTERED ([userid], [groupname])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table tuserinfo
-- ----------------------------
CREATE NONCLUSTERED INDEX [email]
ON [dbo].[tuserinfo] (
  [email] ASC
)
GO


-- ----------------------------
-- Uniques structure for table tuserinfo
-- ----------------------------
ALTER TABLE [dbo].[tuserinfo] ADD CONSTRAINT [userid2] UNIQUE NONCLUSTERED ([userid] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tuserinfo
-- ----------------------------
ALTER TABLE [dbo].[tuserinfo] ADD CONSTRAINT [PK__tuserinf__A39056F68C802F78] PRIMARY KEY CLUSTERED ([site], [employeeid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table tuserpwd
-- ----------------------------
CREATE NONCLUSTERED INDEX [userid]
ON [dbo].[tuserpwd] (
  [userid] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table tuserpwd
-- ----------------------------
ALTER TABLE [dbo].[tuserpwd] ADD CONSTRAINT [PK__tuserpwd__FD502E4A4FE141C7] PRIMARY KEY CLUSTERED ([trxid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tuserrole
-- ----------------------------
ALTER TABLE [dbo].[tuserrole] ADD CONSTRAINT [PK__tuserrol__F77826E8625D9FC6] PRIMARY KEY CLUSTERED ([userid], [roleid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table tusertoken
-- ----------------------------
CREATE NONCLUSTERED INDEX [nonce]
ON [dbo].[tusertoken] (
  [nonce] ASC,
  [code] ASC,
  [state] ASC
)
GO


-- ----------------------------
-- Uniques structure for table tusertoken
-- ----------------------------
ALTER TABLE [dbo].[tusertoken] ADD CONSTRAINT [authtoken] UNIQUE NONCLUSTERED ([authtoken] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table tusertoken
-- ----------------------------
ALTER TABLE [dbo].[tusertoken] ADD CONSTRAINT [PK__tusertok__118FCF6B5E86CE98] PRIMARY KEY CLUSTERED ([useruuid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO

