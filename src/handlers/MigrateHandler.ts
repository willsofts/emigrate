import { HTTP } from "@willsofts/will-api";
import { KnModel } from "@willsofts/will-db";
import { KnDBConnector, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo, KnValidateInfo, VerifyError } from '@willsofts/will-core';
import { MigrateOperate } from "./MigrateOperate";
import { MigrateConfig, MigrateRecordSet, MigrateInfo, MigrateReject } from "../models/MigrateAlias";

const task_models = require("../../config/model.json");

export class MigrateHandler extends MigrateOperate {

    protected override async validateRequireFields(context: KnContextInfo, model: KnModel, action?: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"taskid");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    public override async doInserting(context: KnContextInfo, model: KnModel = this.model): Promise<MigrateRecordSet> {        
        let taskid = context.params.taskid;
        let dataset = context.params.dataset;
        if(!dataset) dataset = context.params;        
        let body = context.options?.parentCtx?.params?.req?.body;
        if(body && Array.isArray(body)) dataset = body;
        let taskmodel = await this.getTaskModel(context,taskid,model);
        if(!taskmodel) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        if(!context.params.processid) context.params.processid = this.randomUUID();
        return this.processInserting(context, taskmodel, dataset, context.params.datapart, context.params.filename);
    }

    public async processInserting(context: KnContextInfo, taskmodel: KnModel, dataset: any, datapart?: any, filename?: string, fileinfo?: any): Promise<MigrateRecordSet> {
        if(!fileinfo) fileinfo = context.params.fileinfo;
        if(!this.userToken) this.userToken = await this.getUserTokenInfo(context);
        let authtoken = this.getTokenKey(context);
        dataset = await this.performTransformation(context, taskmodel, dataset, datapart);
        let processid = context.params.processid || this.randomUUID();
        let result : MigrateRecordSet = { taskid: context.params.taskid, processid: processid, totalrecords: 0, errorrecords: 0, skiprecords: 0, ...this.createRecordSet() };
        if(taskmodel.name.trim().length == 0 || context.params.stored === "NONE" || context.params.stored === "false") {
            result.rows = dataset;
            result.records = result.rows?.length || 0;
            return result;
        }
        let params = {authtoken: authtoken, ...result, tablename: taskmodel.name, processfile: fileinfo?.path, sourcefile: fileinfo?.originalname || filename, filesize: fileinfo?.size };
        this.call("migratelog.insert",params).catch(ex => this.logger.error(ex));
        if(context.params.async=="true") {
            this.performInserting(context, taskmodel, dataset).then(value => {
                let rs = value[0];
                let info = value[1];
                let reject = value[2];
                this.updateLogging(authtoken,rs,info,reject);
            }).catch(ex => { 
                this.errorLogging(authtoken,result,ex);
            });
            return result;    
        } else {
            let rs : MigrateRecordSet | undefined = undefined;
            let info : MigrateInfo | undefined = undefined;
            let reject: MigrateReject | undefined = undefined;
            try {
                [rs,info,reject] = await this.performInserting(context, taskmodel, dataset);
                this.updateLogging(authtoken,rs,info,reject);
            } catch(ex) {
                this.errorLogging(authtoken,result,ex);
                return Promise.reject(this.getDBFault(ex,processid));
            }
            if(reject?.reject) {
                return Promise.reject(this.getDBFault(reject?.throwable,processid));
            }
            return rs;    
        }
    }

    private updateLogging(authtoken: string|undefined, rs: MigrateRecordSet, info: MigrateInfo, reject: MigrateReject) {
        let processstatus = "DONE";
        let errormessage = undefined;
        if(reject.reject) {
            processstatus = "ERROR";
            errormessage = this.getDBError(reject.throwable).message;
        }
        let params = {authtoken: authtoken, ...rs, ...info, processstatus: processstatus, errormessage: errormessage };
        this.call("migratelog.update",params).catch(ex => this.logger.error(ex));
    }

    private errorLogging(authtoken: string|undefined, result: MigrateRecordSet, ex: any) {
        this.logger.error(ex); 
        let err = this.getDBError(ex);
        let params = {authtoken: authtoken, ...result, processstatus: "ERROR", errormessage: err.message };
        this.call("migratelog.update",params).catch(ex => this.logger.error(ex));
    }

    public async performInserting(context: KnContextInfo, model: KnModel, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        if(String(model.settings?.autoCommit)=="true") {
            return await this.performInsertWithAutoCommit(context, model, dataset);
        } else {
            return await this.performInsertWithTransaction(context, model, dataset);
        }
    }

    public async performInsertWithTransaction(context: KnContextInfo, model: KnModel, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let db = this.getPrivateConnector(model);
        try {
            await db.beginWork();
            let [result,info,reject] = await this.performInsertTransaction(context,model,db,dataset);
            if(!reject.reject) {
                await db.commitWork();
            } else {
                db.rollbackWork().catch(ex => this.logger.error(ex));                
            }
            return [result,info,reject];
        } catch(ex: any) {
            this.logger.error(ex);
            db.rollbackWork().catch(ex => this.logger.error(ex));
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async performInsertWithAutoCommit(context: KnContextInfo, model: KnModel, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performInsertTransaction(context,model,db,dataset);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async performInsertTransaction(context: KnContextInfo, model: KnModel, db: KnDBConnector, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let processid = context.params.processid || this.randomUUID();
        let result : MigrateRecordSet = { taskid: context.params.taskid, processid: processid, totalrecords: 0, errorrecords: 0, skiprecords: 0, ...this.createRecordSet() };
        let datalist = dataset;
        if(!Array.isArray(dataset)) {
            datalist = [dataset];
        }
        let onException = model.settings?.onException;
        let abandonError = model.settings?.abandonError === undefined || String(model.settings?.abandonError)=="true";
        let verifyError = model.settings?.verifyError === undefined || String(model.settings?.verifyError)=="true";
        this.logger.debug(this.constructor.name+": abandonError:",abandonError,", verifyError:",verifyError);
        result.totalrecords = datalist.length;
        let info : MigrateInfo = { exception: false, errormessage: "", errorcontents: [] };
        let reject : MigrateReject = { reject: false, throwable: undefined };
        let index = 0;
        while(!info.exception && (index < datalist.length)) {
            let data = datalist[index];
            try {
                context.params = data;
                await this.performCreating(context, model, db);
                result.records++;
            } catch(ex: any) {
                reject.throwable = ex;
                this.logger.error(ex);
                result.errorrecords++;
                info.errorcontents.push(data);
                if(verifyError) {
                    info.errormessage = this.getDBError(ex).message;
                    info.exception = true;
                }
                if(onException) {
                    onException.call(this,context,model,index,data,ex);
                }
            }
            index++;
        }
        if(abandonError && reject.throwable) {
            reject.reject = true;
        }
        return [result,info,reject];
    }

    public async getTaskModel(context: KnContextInfo, taskid: string, model: KnModel = this.model): Promise<KnModel | undefined> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.getMigrateModel(context,model,db,taskid);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async getMigrateModel(context: KnContextInfo, model: KnModel, db: KnDBConnector, taskid: string): Promise<KnModel | undefined> {
        let knsql = new KnSQL();
        knsql.append("select t.taskid,t.taskname,t.modelid,t.connectid,");
        knsql.append("m.modelname,m.tablename,m.tablefields,m.tablesettings ");
        knsql.append("from tmigratetask t,tmigratemodel m ");
        knsql.append("where t.taskid = ?taskid ");
        knsql.append("and t.modelid = m.modelid ");
        knsql.set("taskid",taskid);
        let rs = await knsql.executeQuery(db,context);
        if(rs && rs.rows?.length>0) {
            let row = rs.rows[0];
            let privateAlias : string | MigrateConfig = model.alias.privateAlias;
            let config = await this.getMigrateConfig(context,db,row.connectid);
            if(config) {
                privateAlias = config;        
            }
            let tablefields = this.tryParseJSON(row.tablefields);
            let tablesettings = this.tryParseJSON(row.tablesettings);
            let taskmodel = {
                name: row.tablename,
                alias: { privateAlias: privateAlias },
                fields: tablefields,
                settings: tablesettings,
            }
            return taskmodel;
        }
        return task_models[taskid];
    }

    public async getMigrateConfig(context: KnContextInfo, db: KnDBConnector, connectid: string): Promise<MigrateConfig | undefined> {
        let result = undefined;
        let knsql = new KnSQL();
        knsql.append("select c.connecttype,c.connectdialect,c.connecturl,c.connectuser,c.connectpassword,");
        knsql.append("c.connectdatabase,c.connecthost,c.connectport,c.connectapi,c.connectsetting,c.connectbody,");
        knsql.append("c.connecthandler,c.connectquery,c.connectfieldname,c.connectfieldvalue,c.connectmapper,");
        knsql.append("d.dialectalias,d.dialectoptions ");
        knsql.append("from tmigrateconnect c,tdialect d ");
        knsql.append("where c.conectid = ?connectid ");
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

}
