import { v4 as uuid } from 'uuid';
import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnDBConnector, KnSQLInterface, KnRecordSet, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { HTTP } from "@willsofts/will-api";
import { VerifyError, KnValidateInfo, KnContextInfo, KnDataTable, KnPageUtility, KnDataMapEntitySetting, KnDataSet, KnDataEntity } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { TknOperateHandler, OPERATE_HANDLERS } from '@willsofts/will-serv';
import { PRIVATE_SECTION } from "../utils/EnvironmentVariable";
import { MigrateConfig } from "../models/MigrateAlias";
import { MigrateModelHandler } from './MigrateModelHandler';
import { MigrateConnectHandler } from './MigrateConnectHandler';

export class Emte001Handler extends TknOperateHandler {
    public section = PRIVATE_SECTION;
    public group = "IMPORT";
    public progid = "emte001";
    public model : KnModel = { 
        name: "tmigratetask", 
        alias: { privateAlias: this.section }, 
        fields: {
            taskid: { type: "STRING", key: true },
            taskname: { type: "STRING" },
            tasktype: { type: "STRING" },
            connectid: { type: "STRING" },
            taskconfigs: { type: "STRING" },
            createmillis: { type: "BIGINT", selected: true, created: true, updated: false, defaultValue: Utilities.currentTimeMillis() },
            createdate: { type: "DATE", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createtime: { type: "TIME", selected: true, created: true, updated: false, defaultValue: Utilities.now() },
            createuser: { type: "STRING", selected: false, created: true, updated: false, defaultValue: null },
            editmillis: { type: "BIGINT", selected: false, created: true, updated: true, defaultValue: Utilities.currentTimeMillis() },
            editdate: { type: "DATE", selected: false, created: true, updated: true, defaultValue: null },
            edittime: { type: "TIME", selected: false, created: true, updated: true, defaultValue: null },
            edituser: { type: "STRING", selected: false, created: true, updated: true, defaultValue: null },
            dialectalias: { type: "STRING" , calculated: true },
            dialecttitle: { type: "STRING" , calculated: true },
            dialectoptions: { type: "STRING" , calculated: true },
        },
        //prefix naming with table name when select ex. table.column1,table.column2,...
        prefixNaming: true
    };

    public handlers = OPERATE_HANDLERS.concat([ {name: "config"}, {name: "dialect"}, {name: "connectretrieve"}, {name: "connectinsert"}, {name: "connectupdate"}, {name: "connectadd"}, {name: "connectretrieval"} ]);

    public async config(context: KnContextInfo) : Promise<MigrateConfig> {
        return this.callFunctional(context, {operate: "config", raw: false}, this.doConfig);
    }

    public async dialect(context: KnContextInfo) : Promise<KnRecordSet> {
        return this.callFunctional(context, {operate: "dialect", raw: false}, this.doDialect);
    }

    public async doConfig(context: KnContextInfo, model: KnModel) : Promise<MigrateConfig> {
        await this.validateRequireFields(context, model, KnOperation.GET);
        let rs = await this.doConfiguring(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

    public async connectretrieve(context: KnContextInfo) : Promise<MigrateConfig> {
        return this.callFunctional(context, {operate: "connectretrieve", raw: false}, this.doConnectRetrieve);
    }

    public async connectinsert(context: KnContextInfo) : Promise<MigrateConfig> {
        return this.callFunctional(context, {operate: "connectinsert", raw: false}, this.doConnectInsert);
    }

    public async connectupdate(context: KnContextInfo) : Promise<MigrateConfig> {
        return this.callFunctional(context, {operate: "connectupdate", raw: false}, this.doConnectUpdate);
    }

    public async connectadd(context: KnContextInfo) : Promise<MigrateConfig> {
        return this.callFunctional(context, {operate: "connectadd", raw: true}, this.doConnectAdd);
    }

    public async connectretrieval(context: KnContextInfo) : Promise<MigrateConfig> {
        return this.callFunctional(context, {operate: "connectretrieval", raw: true}, this.doConnectRetrieval);
    }

    public async doDialect(context: KnContextInfo, model: KnModel) : Promise<KnRecordSet> {
        let rs = await this.doDialecting(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

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
            vi = this.validateParameters(context.params,"taskname");
        } else {
            vi = this.validateParameters(context.params,"taskid");
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
            /*
            if(this.userToken?.userid) {
                knsql.append(filter).append(" ( createuser = ?userid or createuser is null ) ");
                knsql.set("userid",this.userToken?.userid);
                filter = " and ";    
            }
            */
            if(params.tasktype && params.tasktype!="") {
                knsql.append(filter).append("tasktype = ?tasktype");
                knsql.set("tasktype",params.tasktype);
                filter = " and ";
            }
            if(params.taskname && params.taskname!="") {
                knsql.append(filter).append("taskname LIKE ?taskname");
                knsql.set("taskname","%"+params.taskname+"%");
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

    protected override async doCategories(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performCategories(context, model, db);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    public override getDataSetting(name: string) : KnDataMapEntitySetting | undefined {
		return {tableName: "tdialect", addonFilters: "providedflag='1'", keyField: "dialectid", addonFields: "seqno", orderFields: "seqno", setting: { categoryName: "tdialect", keyName: "dialectid", valueNames: ["dialectname"]}, nameen: "dialectname", nameth: "dialectname", captionFields: "dialectname" };
    }

    protected async performCategories(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnDataTable> {
        let settings = [{tableName:"tmigrateconnect", keyField:"connectid", setting: { categoryName: "tmigrateconnect", keyName: "connectid", valueNames: ["connectname"]}, nameen: "connectname", nameth: "connectname", captionFields: "connectname" }];
        let datacategory = await this.getDataCategories(context, db, settings);
        let entity = datacategory.entity as KnDataEntity;
        let dialectcategories = await this.performDialectCategories(context,model,db);
        let dialectentity = dialectcategories.entity as KnDataEntity;
        entity["tdialect"] = dialectentity["tdialect"];
        entity["dialects"] = dialectentity["dialects"];
        /*
        let tdialect : KnDataSet = { };
        let dialects : KnDataSet = { };
        let rs = await this.performDialectListing(context, model, db);
        if(rs.rows.length>0) {
            for(let i=0; i<rs.rows.length; i++) {
                let row = rs.rows[i];
                tdialect[row.dialectid] = row.dialecttitle;
                dialects[row.dialectid] = row;
            }
        }
        entity["tdialect"] = tdialect;
        entity["dialects"] = dialects;
        */
        return datacategory;
    }

    /* override to handle launch router when invoked from menu */
    protected override async doExecute(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let dt = await this.performCategories(context, model, db);
            dt.action = KnOperation.EXECUTE;
            return dt;
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    protected override async performUpdating(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        await this.performClearingModels(context,model,db);
        let rs = await this.insertModels(context, model, db);
        await this.insertModelsInTask(context, model, db, rs.rows);
        return super.performUpdating(context, model, db);
    }
    
    protected async performClearing(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        await this.performClearingModels(context,model,db);
        return super.performClearing(context, model, db);
    }

    protected async performClearingModels(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let taskid = context.params.taskid;
        let modelids = await this.getModelsInTask(context,model,db,taskid);
        let rs = await this.deleteModelsInTask(context, model, db, taskid);
        if(modelids && modelids.length > 0) {
            for(let m of modelids) {
                await this.deleteModels(context, model, db, m.modelid);
            }
        }
        return rs;
    }

    protected async deleteModels(context: KnContextInfo, model: KnModel, db: KnDBConnector, modelid: string) : Promise<KnResultSet> {
        let knsql = new KnSQL();
        knsql.append("delete from tmigratemodel where modelid = ?modelid ");
        knsql.append("and not exists ( select 1 from tmigratetaskmodel where modelid = ?existid ) ");
        knsql.set("modelid",modelid);
        knsql.set("existid",modelid);
        return await knsql.executeUpdate(db,context);
    }

    protected async deleteModelsInTask(context: KnContextInfo, model: KnModel, db: KnDBConnector, taskid: string) : Promise<KnResultSet> {
        let knsql = new KnSQL();
        knsql.append("delete from tmigratetaskmodel where taskid = ?taskid ");
        knsql.set("taskid",taskid);
        return await knsql.executeUpdate(db,context);
    }

    protected async getModelsInTask(context: KnContextInfo, mode: KnModel, db: KnDBConnector, taskid: string) : Promise<any[]> {
        let results : any[] = [];
        let knsql = new KnSQL();
        knsql.append("select modelid from tmigratetaskmodel where taskid = ?taskid ");
        knsql.set("taskid",taskid);
        let rs = await knsql.executeQuery(db,context);
        if(rs && rs?.rows?.length > 0) {
            for(let row of rs.rows) {
                results.push({modelid: row.modelid});
            }
        }
        return results;
    }

    protected async insertModels(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnRecordSet> {
        let result : KnRecordSet = { records: 0, rows: [], columns: []};
        let taskid = context.params.taskid;
        let modelids = await this.getModelsInTask(context,model,db,taskid);
        if(modelids && modelids.length > 0) {
            for(let m of modelids) {
                await this.deleteModels(context, model, db, m.modelid);
            }
        }
        let models = this.tryParseJSON(context.params["models"]);
        if(models && Array.isArray(models) && models.length>0) {
            let handler = new MigrateModelHandler();
            handler.obtain(this.broker,this.logger);
            for(let m of models) {
                if(!m.modelid || m.modelid.trim().length == 0) m.modelid = uuid();
                let ctx = { params: { ...m }, meta: context.meta };
                let rs = await handler.processInsert(ctx,db);
                let res = this.createRecordSet(rs);
                result.records += res.records;
                result.rows.push({modelid: m.modelid});
            }
        }
        return result;
    }

    protected async insertModelsInTask(context: KnContextInfo, model: KnModel, db: KnDBConnector, modelids: any[]) : Promise<KnRecordSet> {
        let result : KnRecordSet = { records: 0, rows: [], columns: []};
        let taskid = context.params.taskid;
        let knsql = new KnSQL();
        knsql.append("insert into tmigratetaskmodel (taskid,modelid,seqno) values (?taskid,?modelid,?seqno) ");
        for(let i=0; i<modelids.length; i++) {
            let m = modelids[i];
            if(m.modelid && m.modelid.trim().length>0) {
                knsql.set("taskid",taskid);
                knsql.set("modelid",m.modelid);
                knsql.set("seqno",i+1);
                let rs = await knsql.executeUpdate(db,context);
                let res = this.createRecordSet(rs);
                result.records += res.records;
            }
        }
        return result;
    }

    protected async doGetting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET): Promise<KnDataTable> {
        return this.doRetrieving(context, model, action);
    }

    protected async retrieveDataSet(context: KnContextInfo, db: KnDBConnector, rs: KnRecordSet) : Promise<KnDataSet> {
        let row = this.transformData(rs.rows[0]);
        let ars = await this.performRetrieveModelsInTask(db, context.params.taskid, context);
        if(ars.rows.length > 0) {
            row["models"] = ars.rows;
        }
        return row;
    }

    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performRetrieving(db, context.params.taskid, context);
            if(rs.rows.length>0) {
                let row = await this.retrieveDataSet(context,db,rs);
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

    protected async performRetrieving(db: KnDBConnector, taskid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from ").append(this.model.name);
        knsql.append(" where taskid = ?taskid ");
        knsql.set("taskid",taskid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected async performRetrieveModelsInTask(db: KnDBConnector, taskid: string, context?: KnContextInfo): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("SELECT tmigratemodel.*,tmigratetaskmodel.seqno ");
        knsql.append("FROM tmigratetaskmodel, tmigratemodel ");
        knsql.append("WHERE tmigratetaskmodel.taskid = ?taskid ");
        knsql.append("AND tmigratetaskmodel.modelid = tmigratemodel.modelid ");
        knsql.append("ORDER BY seqno ");
        knsql.set("taskid",taskid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }
    
    /**
     * Override for search action (return data collection)
     * @param context 
     * @param model 
     * @returns KnDataTable
     */
    public override async getDataSearch(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let rs = await this.doCollecting(context, model);
        return this.createDataTable(KnOperation.COLLECT, this.createRecordSet(rs), {}, this.progid+"/"+this.progid+"_data");
    }
    
    /**
     * Override for retrieval action (return record not found error if not found any record)
     * @param context 
     * @param model 
     * @returns KnDataTable
     */
    public override async getDataRetrieval(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs =  await this.performRetrieving(db, context.params.taskid, context);
            if(rs.rows.length>0) {
                let row = await this.retrieveDataSet(context,db,rs);
                let dt = await this.performCategories(context, model, db);
                return this.createDataTable(KnOperation.RETRIEVAL, row, dt.entity, this.progid+"/"+this.progid+"_dialog");
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    /**
     * Override for add new record action (prepare screen for add)
     * @param context 
     * @param model 
     * @returns KnDataTable
     */
    public override async getDataAdd(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let dt = await this.doCategories(context, model);
        dt.action = KnOperation.ADD;
        dt.renderer = this.progid+"/"+this.progid+"_dialog";
        dt.dataset["taskid"] = uuid();
        dt.dataset["models"] = [{ modelid: uuid(), modelname: "NewModel"}];
        return dt;
    }
    
    public override async getDataEntry(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        return this.createDataTable(KnOperation.ADD, {model: { modelid: uuid(), modelname: "NewModel"} },{},this.progid+"/"+this.progid+"_model");
    }

    protected override async doInserting(context: KnContextInfo, model: KnModel): Promise<KnDataTable> {
        let rs = await this.doCreating(context, model);
        if(rs && rs.rows.length>0) {
            let row = this.transformData(rs.rows[0]);
            return this.createDataTable(KnOperation.INSERT, row);
        }
        return this.createDataTable(KnOperation.INSERT);
    }

    protected override async performCreating(context: any, model: KnModel, db: KnDBConnector) : Promise<KnResultSet> {
        let now = Utilities.now();
        let id = context.params.taskid;
        if(!id || id.trim().length == 0) id = uuid();
        let record = {
            taskid: id,
            taskname: context.params.taskname || "",
            createmillis: Utilities.currentTimeMillis(now),
            createdate: now,
            createtime: Utilities.currentTime(now),
        };
        context.params.taskid = record.taskid;
        let res = await this.insertModels(context, model, db);
        await this.insertModelsInTask(context, model, db, res.rows);
        let knsql = this.buildInsertQuery(context, model, KnOperation.CREATE);
        await this.assignParameters(context,knsql,KnOperation.CREATE,KnOperation.CREATE);
        knsql.set("taskid",record.taskid);
        knsql.set("tasktype",context.params.tasktype || this.group); 
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

    protected async performDialectGetting(context: KnContextInfo, db: KnDBConnector, dialectid: string): Promise<KnRecordSet> {
        let knsql = new KnSQL();
        knsql.append("select * ");
        knsql.append("from tdialect ");
        knsql.append("where dialectid = ?dialectid ");
        knsql.set("dialectid",dialectid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected async performDialectListing(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        let params = context.params;
        let knsql = new KnSQL();
        knsql.append("select dialectid,dialectalias,dialecttitle,dialectname,providedflag,urlflag,seqno ");
        knsql.append("from tdialect ");
        if(params.providedflag && params.providedflag!="") {
            knsql.append("where providedflag = ?providedflag ");
            knsql.set("providedflag",params.providedflag);
        }
        knsql.append("order by seqno ");
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected async doConfiguring(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET) : Promise<MigrateConfig> {
        let db = this.getPrivateConnector(model);
        try {
            let result = await this.getMigrateConfig(context,db,context.params.taskid);
            if(result) return result;
            return Promise.reject(new VerifyError("Configuration not found",HTTP.NOT_FOUND,-16004));
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }        
    }

    protected async doDialecting(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET) : Promise<KnRecordSet> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performDialectListing(context, model, db);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }        
    }
    
    public async getMigrateConfig(context: KnContextInfo, db: KnDBConnector, taskid: string) : Promise<MigrateConfig | undefined> {
        try {
            let rs = await this.performRetrieving(db, taskid, context);
            if(rs && rs.rows.length > 0) {
                let row = rs.rows[0];
                return await this.getMigrateConnection(context,db,row.connectid);
            }
            return undefined;
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        }
    }

    public async getMigrateConnection(context: KnContextInfo, db: KnDBConnector, connectid: string): Promise<MigrateConfig | undefined> {
        let result = undefined;
        let knsql = new KnSQL();
        knsql.append("select c.connecttype,c.connectdialect,c.connecturl,c.connectuser,c.connectpassword,");
        knsql.append("c.connectdatabase,c.connecthost,c.connectport,c.connectapi,c.connectsetting,c.connectbody,");
        knsql.append("c.connecthandler,c.connectquery,c.connectfieldname,c.connectfieldvalue,c.connectmapper,");
        knsql.append("d.dialectalias,d.dialectoptions ");
        knsql.append("from tmigrateconnect c,tdialect d ");
        knsql.append("where c.connectid = ?connectid ");
        knsql.append("and c.connectdialect = d.dialectid ");
        knsql.set("connectid",connectid);
        let rs = await knsql.executeQuery(db,context);
        if(rs && rs.rows?.length>0) {
            let row = rs.rows[0];
            let dialectoptions = this.tryParseJSON(row.dialectoptions) || {};
            let connectsetting = this.tryParseJSON(row.connectsetting) || {};
            let connectbody = this.tryParseJSON(row.connectbody) || {};
            result = {
                schema: connectid,
                alias: row.dialectalias,
                dialect: row.connectdialect,
                url: row.connecturl,
                user: row.connectuser,
                password: row.connectpassword,
                host: row.connecthost,
                port: row.connectport,
                database: row.connectdatabase,
                options: dialectoptions,
                type: row.connecttype,
                fieldname: row.connectfieldname,
                fieldvalue: row.connectfieldvalue,
                mapper: row.connectmapper,
                api: row.connectapi,
                setting: connectsetting,
                body: connectbody,
                handler: row.connecthandler,
                query: row.connectquery,
            };
        }
        return result;
    }

    public tryParseJSON(texts: string | undefined | null) : any | undefined {
        if(texts && texts.trim().length>0) {
            try {
                return JSON.parse(texts);
            } catch(ex) {
                this.logger.error(this.constructor.name,ex);
            }
        }
        return undefined;
    }

    public async doConnectRetrieve(context: KnContextInfo, model: KnModel) : Promise<any> {
        let handler = new MigrateConnectHandler();
        handler.obtain(this.broker,this.logger);
        return await handler.retrieve(context);
    }

    public async doConnectInsert(context: KnContextInfo, model: KnModel) : Promise<KnRecordSet> {
        let handler = new MigrateConnectHandler();
        handler.obtain(this.broker,this.logger);
        let rs = await handler.insert(context);
        return await this.createCipherData(context, KnOperation.INSERT, rs);
    }

    public async doConnectUpdate(context: KnContextInfo, model: KnModel) : Promise<KnRecordSet> {
        let handler = new MigrateConnectHandler();
        handler.obtain(this.broker,this.logger);
        let rs = await handler.update(context);
        return await this.createCipherData(context, KnOperation.UPDATE, rs);
    }

    public async getDataConnectionAdd(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let dt = await this.doCategories(context, model);
        dt.action = KnOperation.ADD;
        dt.renderer = this.progid+"/"+this.progid+"_connect_dialog";
        dt.dataset["connectid"] = uuid();
        return dt;
    }

    public async doConnectAdd(context: KnContextInfo, model: KnModel) : Promise<any> {
        let ds = await this.getDataConnectionAdd(context, model);
        return this.buildHtml("/views/"+ds.renderer, ds, context);        
    }

    public async getDataConnectionRetrieval(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let handler = new MigrateConnectHandler();
            handler.obtain(this.broker,this.logger);
            let ds = await handler.doRetrieving(context);
            let dt = await this.doCategories(context, model);
            ds.entity = dt.entity;
            ds.renderer = this.progid+"/"+this.progid+"_connect_dialog";
            return ds;
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    public async doConnectRetrieval(context: KnContextInfo, model: KnModel) : Promise<any> {
        let ds = await this.getDataConnectionRetrieval(context, model);
        return this.buildHtml("/views/"+ds.renderer, ds, context);
    }

    protected async performDialectCategories(context: KnContextInfo, model: KnModel, db: KnDBConnector) : Promise<KnDataTable> {
        let datacategory = this.createDataTable(KnOperation.RETRIEVAL,{},{});
        let entity = datacategory.entity as KnDataEntity;
        let tdialect : KnDataSet = { };
        let dialects : KnDataSet = { };
        let rs = await this.performDialectListing(context, model, db);
        if(rs.rows.length>0) {
            for(let i=0; i<rs.rows.length; i++) {
                let row = rs.rows[i];
                tdialect[row.dialectid] = row.dialecttitle;
                dialects[row.dialectid] = row;
            }
        }
        entity["tdialect"] = tdialect;
        entity["dialects"] = dialects;
        return datacategory;
    }

}
