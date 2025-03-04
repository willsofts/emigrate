import { v4 as uuid } from 'uuid';
import { HTTP } from "@willsofts/will-api";
import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { VerifyError, KnValidateInfo, KnContextInfo, KnDataTable, KnPageUtility } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { TknOperateHandler } from '@willsofts/will-serv';
import { PRIVATE_SECTION } from "../utils/EnvironmentVariable";

export class MigrateConnectHandler extends TknOperateHandler {
    public section = PRIVATE_SECTION;
    public progid = "emte001";
    public model : KnModel = { 
        name: "tmigrateconnect", 
        alias: { privateAlias: this.section }, 
        fields: {
            connectid: { type: "STRING", key: true },
            connectname: { type: "STRING" },
            connecttype: { type: "STRING" },
            connectdialect: { type: "STRING" },
            connectapi: { type: "STRING" },
            connecturl: { type: "STRING" },
            connectuser: { type: "STRING" },
            connectpassword: { type: "STRING" },
            connectdatabase: { type: "STRING" },
            connecthost: { type: "STRING" },
            connectport: { type: "INTEGER" },
            connectfieldname: { type: "STRING" },
            connectfieldvalue: { type: "STRING" },
            connectmapper: { type: "STRING" },
            connectsetting: { type: "STRING" },
            connectbody: { type: "STRING" },
            connecthandler: { type: "STRING" },
            connectquery: { type: "STRING" },
            createmillis: { type: "BIGINT", selected: true, created: true, updated: false, defaultValue: Utilities.currentTimeMillis() },
            createdate: { type: "DATE", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createtime: { type: "TIME", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createuser: { type: "STRING", selected: false, created: true, updated: false, defaultValue: null },
            editmillis: { type: "BIGINT", selected: false, created: true, updated: true, defaultValue: Utilities.currentTimeMillis() },
            editdate: { type: "DATE", selected: false, created: true, updated: true, defaultValue: null },
            edittime: { type: "TIME", selected: false, created: true, updated: true, defaultValue: null },
            edituser: { type: "STRING", selected: false, created: true, updated: true, defaultValue: null },
        },
        //prefix naming with table name when select ex. table.column1,table.column2,...
        prefixNaming: true
    };

    /* try to assign individual parameters under this context */
    protected override async assignParameters(context: KnContextInfo, sql: KnSQLInterface, action?: string, mode?: string) {
        sql.set("editmillis",Utilities.currentTimeMillis());
        sql.set("editdate",Utilities.now(),"DATE");
        sql.set("edittime",Utilities.now(),"TIME");
        sql.set("edituser",this.userToken?.userid);
    }

    /* try to validate fields for insert, update, delete, retrieve */
    protected override validateRequireFields(context: KnContextInfo, model: KnModel, action: string) : Promise<KnValidateInfo> {
        let vi : KnValidateInfo = {valid: true};
        let page = new KnPageUtility(this.progid, context);
        if(page.isInsertMode(action)) {
            vi = this.validateParameters(context.params,"connectname");
        } else {
            vi = this.validateParameters(context.params,"connectid");
        }
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    protected override buildFilterQuery(context: KnContextInfo, model: KnModel, knsql: KnSQLInterface, selector: string, action?: string, subaction?: string): KnSQLInterface {
        if(this.isCollectMode(action)) {
            let params = context.params;
            knsql.append(selector);
            knsql.append(" from ");
            knsql.append(model.name);
            let filter = " where ";
            if(params.connectname && params.connectname!="") {
                knsql.append(filter).append("connectname LIKE ?connectname");
                knsql.set("connectname","%"+params.connectname+"%");
                filter = " and ";
            }
            if(params.fromdate && params.fromdate!="") {
                let fromdate = Utilities.parseDate(params.fromdate);
                if(fromdate) {
                    knsql.append(filter).append("createdate >= ?fromdate");
                    knsql.set("fromdate",fromdate);
                    filter = " and ";
                }
            }
            if(params.todate && params.todate!="") {
                let todate = Utilities.parseDate(params.todate);
                if(todate) {
                    knsql.append(filter).append("createdate <= ?todate");
                    knsql.set("todate",todate);
                    filter = " and ";
                }
            }
            return knsql;    
        }
        return super.buildFilterQuery(context, model, knsql, selector, action, subaction);
    }

    protected override async doGet(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        await this.validateRequireFields(context, model, KnOperation.GET);
        let rs = await this.doGetting(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

    protected async doGetting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET): Promise<KnDataTable> {
        return this.doRetrieving(context, model, action);
    }

    public override async doRetrieving(context: KnContextInfo, model: KnModel = this.model, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performRetrieving(db, context.params.connectid, context);
            if(rs.rows.length>0) {
                let row = rs.rows[0];
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

    protected async performRetrieving(db: KnDBConnector, connectid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from ").append(this.model.name);
        knsql.append(" where connectid = ?connectid ");
        knsql.set("connectid",connectid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }
    
    protected override async doInserting(context: KnContextInfo, model: KnModel): Promise<KnDataTable> {
        let rs = await this.doCreating(context, model);
        if(rs && rs.rows.length>0) {
            let row = this.transformData(rs.rows[0]);
            return this.createDataTable(KnOperation.INSERT, row);
        }
        return this.createDataTable(KnOperation.INSERT);
    }

    protected override async performCreating(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let now = Utilities.now();
        let id = context.params.connectid;
        if(!id || id.trim().length == 0) id = uuid();
        let record = {
            connectid: id,
            connectname: context.params.connectname || "",
            createmillis: Utilities.currentTimeMillis(now),
            createdate: now,
            createtime: Utilities.currentTime(now),
        };
        context.params.connectid = record.connectid;
        let knsql = this.buildInsertQuery(context, model, KnOperation.CREATE);
        await this.assignParameters(context,knsql,KnOperation.CREATE,KnOperation.CREATE);
        knsql.set("connectid",record.connectid);
        knsql.set("connectname",record.connectname);
        knsql.set("connectport",Utilities.parseInteger(context.params.connectport,0));        
        knsql.set("createmillis",record.createmillis);
        knsql.set("createdate",record.createdate,"DATE");
        knsql.set("createtime",record.createtime,"TIME");
        knsql.set("createuser",this.userToken?.userid);
        let rs = await knsql.executeUpdate(db,context);
        let rcs = this.createRecordSet(rs);
        if(rcs.records>0) {
            rcs.rows = [record];
        }
        return rcs;
    }

    public async processInsert(context: KnContextInfo, db: KnDBConnector, model: KnModel = this.model) : Promise<KnResultSet> {
        return await this.performCreating(context,model,db);
    }

    protected override async performUpdating(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let connectport = context.params.connectport;
        if(!connectport || connectport.trim().length==0) {
            context.params.connectport = 0;
        } 
        return super.performUpdating(context, model, db);
    }

}
