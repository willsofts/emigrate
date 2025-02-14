import { KnModel, KnOperation } from "@willsofts/will-db";
import { TknOperateHandler } from "@willsofts/will-serv";
import { KnContextInfo, KnDataTable } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnSQL } from "@willsofts/will-sql";
import { PRIVATE_SECTION } from "../utils/EnvironmentVariable";

export class MigrateLogHandler extends TknOperateHandler {
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
        let rs = await knsql.executeQuery(db);
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
        let rs = await knsql.executeQuery(db);
        return this.createRecordSet(rs);
    }

}
