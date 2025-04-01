import { HTTP } from "@willsofts/will-api";
import { KnModel, KnOperation } from "@willsofts/will-db";
import { TknOperateHandler } from "@willsofts/will-serv";
import { KnContextInfo, KnDataTable } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnSQL, KnResultSet } from "@willsofts/will-sql";
import { PRIVATE_SECTION } from "../utils/EnvironmentVariable";
import { Request, Response } from 'express';
import path from 'path';

export class MigrateLogHandler extends TknOperateHandler {    
    public dumping: boolean = false; //force disable dump log sql statement
    public section = PRIVATE_SECTION;
    public model : KnModel = { 
        name: "tmigratelog", 
        alias: { privateAlias: this.section },
        fields: {
            migrateid: { type: "STRING", key: true, created: true },
            taskid: { type: "STRING", created: true },
            processid: { type: "STRING", created: true },
            processdate: { type: "DATE", created: true },
            processtime: { type: "TIME", created: true },
            processmillis: { type: "BIGINT", created: true },
            processtype: { type: "STRING", created: true },
            processstatus: { type: "STRING", created: true, updated: true },
            processflag: { type: "STRING", created:  true, updated: true },
            processfile: { type: "STRING" },
            sourcefile: { type: "STRING" },
            filesize: { type: "BIGINT" },
            logfile: { type: "STRING" },
            errorfile: { type: "STRING" },
            notefile: { type: "STRING" },
            logname: { type: "STRING" },
            errorname: { type: "STRING" },
            notename: { type: "STRING" },
            tablename: { type: "STRING" },
            totalrecords: { type: "BIGINT" },
            records: { type: "BIGINT" },
            errorrecords: { type: "BIGINT" },
            skiprecords: { type: "BIGINT" },
            startdate: { type: "DATE", created: true },
            starttime: { type: "TIME", created: true },
            startmillis: { type: "BIGINT", created: true },
            enddate: { type: "DATE", updated: true },
            endtime: { type: "TIME", updated: true },
            endmillis: { type: "BIGINT", updated: true },
            site: { type: "STRING", created: true, selected: false },
            userid: { type: "STRING", created: true, selected: false },
            useruuid: { type: "STRING", created: true, selected: false },
            authtoken: { type: "STRING", created: true, selected: false },
            tokentype: { type: "STRING", created: true, selected: false },
            errormessage: { type: "TEXT" },
            errorcontents: { type: "TEXT" },
            remarks: { type: "TEXT" },
        }    
    };
    
    protected override async assignParameters(context: KnContextInfo, sql: KnSQLInterface, action?: string, mode?: string) {
        let now = Utilities.now();
        if(KnOperation.INSERT == action || KnOperation.CREATE == action) {
            if(!this.userToken) this.userToken = await this.getUserTokenInfo(context,true);
            sql.set("processdate",now,"DATE");
            sql.set("processtime",now,"TIME");
            sql.set("processmillis",now.getTime());
            sql.set("processtype",context.params?.processtype || "MIGRATE");
            sql.set("processstatus",context.params?.processstatus || "PROCESSING");
            sql.set("processflag",context.params?.processflag || "0");
            sql.set("startdate",now,"DATE");
            sql.set("starttime",now,"TIME");
            sql.set("startmillis",now.getTime());
            sql.set("site",this.userToken?.site);
            sql.set("userid",this.userToken?.userid);
            sql.set("useruuid",this.userToken?.useruuid);
            sql.set("tokentype",this.userToken?.tokentype);
            sql.set("authtoken",this.getTokenKey(context));
        } else if(KnOperation.UPDATE == action) {
            sql.set("processstatus",context.params?.processstatus || "DONE");
            sql.set("processflag",context.params?.processflag || "2");
            sql.set("enddate",now,"DATE");
            sql.set("endtime",now,"TIME");
            sql.set("endmillis",now.getTime());
            sql.set("errorcontents",JSON.stringify(context.params?.errorcontents));
        }
    }

    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performRetrieving(context, model, db);
            if(rs.rows.length>0) {
                let row = rs.rows[0];
                let errorcontents = row.errorcontents;
                if(errorcontents && errorcontents.trim().length > 0) {
                    try { row.errorcontents = JSON.parse(errorcontents); } catch(ex) { }
                }                
                return this.createDataTable(KnOperation.RETRIEVE, row);
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    protected async performRetrieving(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        if(!context.params.migrateid || context.params.migrateid.trim().length==0) return this.createRecordSet();
        let selstr = this.buildSelectField(context, model);
        let knsql = new KnSQL("select ");
        knsql.append(selstr);
        knsql.append(" from tmigratelog where migrateid = ?migrateid ");
        knsql.set("migrateid",context.params.migrateid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected async doGet(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performGetting(context, model, db);
            if(rs.rows.length>0) {
                for(let row of rs.rows) {
                    let errorcontents = row.errorcontents;
                    if(errorcontents && errorcontents.trim().length > 0) {
                        try { row.errorcontents = JSON.parse(errorcontents); } catch(ex) { }
                    }
                }
                return this.createDataTable(KnOperation.RETRIEVE, {}, rs.rows);
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    protected async performGetting(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        if(!context.params.processid || context.params.processid.trim().length==0) return this.createRecordSet();
        let selstr = this.buildSelectField(context, model);
        let knsql = new KnSQL("select ");
        knsql.append(selstr);
        knsql.append(" from tmigratelog where processid = ?processid ");
        knsql.set("processid",context.params.processid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    public override async report(context: KnContextInfo, req: Request, res: Response) : Promise<void> {
        this.logger.debug(this.constructor.name+".report: params",context.params);
        let rs = await this.doGetLog(context);
        if(rs && rs.rows?.length > 0) {
            let row = rs.rows[0];
            let filename = row.tablename;
            if(row.sourcefile && row.sourcefile.trim().length > 0) path.parse(row.sourcefile).name;
            let jsoncontents = [];
            if(row.errorcontents) { 
                try { jsoncontents = JSON.parse(row.errorcontents); } catch(ex) { }
            }
            if("json"==context.params.type) {
                res.attachment(filename+".json");
                res.json(jsoncontents);
            } else {
                res.attachment(filename+".txt");
                //res.send(row.errorcontents);
                if(jsoncontents.length > 0) {
                    let keys = Object.keys(jsoncontents[0]).join(",");
                    res.write(keys+"\n");
                    for(let data of jsoncontents) {
                        let values = Object.values(data).join(",");
                        res.write(values+"\n");
                    }
                    res.end();    
                } else {
                    res.send("");
                }
            }
            return;
        }
        res.status(HTTP.NOT_FOUND).send("Not found");
    }

    protected async doGetLog(context: KnContextInfo, model: KnModel = this.model) : Promise<KnResultSet> {
        let processid = context.params.processid;
        let migrateid = context.params.migrateid;
        if((!processid || processid.trim().length == 0) && (!migrateid || migrateid.trim().length == 0)) return this.createRecordSet();
        let db = this.getPrivateConnector(model);
        try {
            let filter = " where ";
            let knsql = new KnSQL();
            knsql.append("select taskid,tablename,sourcefile,errormessage,errorcontents ");
            knsql.append("from tmigratelog ");
            if(migrateid && migrateid.trim().length > 0) {
                knsql.append(filter).append("migrateid = ?migrateid ");
                knsql.set("migrateid",migrateid);
                filter = " and ";
            }
            if(processid && processid.trim().length > 0) {
                knsql.append(filter).append("processid = ?processid ");
                knsql.set("processid",processid);
                filter = " and ";
            }
            if(context.params.processstatus && context.params.processstatus.trim().length > 0) {
                knsql.append(filter).append("processstatus = ?processstatus ");
                knsql.set("processstatus",context.params.processstatus);
                filter = " and ";
            }
            let rs = await knsql.executeQuery(db,context);
            return this.createRecordSet(rs);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    protected async performUpdateStream(context: KnContextInfo, db: KnDBConnector, stream: any): Promise<KnRecordSet> {
        let migrateid = context.params.migrateid;
        if(!migrateid || migrateid.trim().length==0) return this.createRecordSet();
        await this.performUpdateNote(context,db,migrateid,context.params.notename,context.params.notefile);
        return await this.performInsertStream(context,db,migrateid,context.params.processid,context.params.notename,stream);
    }

    protected async performInsertStream(context: KnContextInfo, db: KnDBConnector, migrateid: string, processid: string, notename: string, stream: any): Promise<KnRecordSet> {
        if(!migrateid || migrateid.trim().length==0) return this.createRecordSet();
        let datafile = stream;
        if(Buffer.isBuffer(stream)) {
            datafile = stream.toString("base64")
        } else {        
            if(typeof stream === 'object') {
                datafile = Buffer.from(JSON.stringify(stream,null,2)).toString("base64");
            } else if(typeof stream === 'string') {
                datafile = Buffer.from(stream).toString("base64");
            }
        }
        let now = Utilities.now();
        let knsql = new KnSQL();
        knsql.append("insert into tmigratefile(migrateid,processid,notename,createdate,createtime,createmillis,createuser,datafile) ");
        knsql.append("values(?migrateid,?processid,?notename,?createdate,?createtime,?createmillis,?createuser,?datafile) ");
        knsql.set("migrateid",migrateid);
        knsql.set("processid",processid);
        knsql.set("notename",notename);
        knsql.set("createdate",now,"DATE");
        knsql.set("createtime",now,"TIME");
        knsql.set("createmillis",now.getTime());
        knsql.set("createuser",this.userToken?.userid);
        knsql.set("datafile",datafile);
        let rs = await knsql.executeUpdate(db,context);
        return this.createRecordSet(rs);
    }

    protected async performUpdateNote(context: KnContextInfo, db: KnDBConnector, migrateid: string, notename: string, notefile: string): Promise<KnRecordSet> {
        if(!migrateid || migrateid.trim().length==0) return this.createRecordSet();
        if(!notefile || notefile.trim().length==0) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("update tmigratelog set ");
        if(notename && notename.trim().length > 0) {
            knsql.append("notename = ?notename, ");
            knsql.set("notename",notename);
        }
        knsql.append("notefile = ?notefile ");
        knsql.append("where migrateid = ?migrateid ");
        knsql.set("migrateid",migrateid);
        knsql.set("notefile",notefile);
        let rs = await knsql.executeUpdate(db,context);
        return this.createRecordSet(rs);
    }

    public async updateStream(context: KnContextInfo, stream: any, model: KnModel = this.model) : Promise<KnRecordSet> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performUpdateStream(context, db, stream);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

}
