import { HTTP } from "@willsofts/will-api";
import { KnModel } from "@willsofts/will-db";
import { KnDBConnector, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo, KnValidateInfo, VerifyError } from '@willsofts/will-core';
import { MigrateOperate } from "./MigrateOperate";
import { MigrateConfig, MigrateRecordSet, MigrateResultSet, MigrateInfo, MigrateReject, MigrateModel, MigrateParams } from "../models/MigrateAlias";
import { MigrateLogHandler } from "./MigrateLogHandler";

const task_models = require("../../config/model.json");

export class MigrateHandler extends MigrateOperate {

    protected override async validateRequireFields(context: KnContextInfo, model: KnModel, action?: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"taskid");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    public override async doInserting(context: KnContextInfo, model: KnModel = this.model): Promise<MigrateResultSet> {        
        let taskid = context.params.taskid;
        let dataset = context.params.dataset;
        if(!dataset) dataset = context.params;        
        let body = context.options?.parentCtx?.params?.req?.body;
        if(body && Array.isArray(body)) dataset = body;
        let taskmodel = await this.getTaskModel(context,taskid,model);
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        let uuid = this.randomUUID();
        if(!context.params.migrateid) context.params.migrateid = uuid;
        if(!context.params.processid) context.params.processid = uuid;
        if(context.params.dataset) delete context.params.dataset;
        let param : MigrateParams = { authtoken: this.getTokenKey(context), filename: context.params.filename, fileinfo: context.params.fileinfo, calling: true };
        return this.processInserting(context, taskmodel, param, dataset, context.params.datapart);
    }

    public async processInserting(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: context.params.taskid, processid: context.params.processid, resultset: [] };
        for(let taskmodel of migratemodel.models) {
            context.params.migrateid = this.randomUUID();
            let rs = await this.processInsertingModel(context, taskmodel, param, dataset, datapart);
            result.resultset.push(rs);
        }
        return result;
    }

    public async processInsertingModel(context: KnContextInfo, taskmodel: KnModel, param: MigrateParams, dataset: any, datapart?: any): Promise<MigrateRecordSet> {
        if(!param.fileinfo) param.fileinfo = context.params.fileinfo;
        if(!param.authtoken) param.authtoken = this.getTokenKey(context);
        if(!this.userToken) this.userToken = await this.getUserTokenInfo(context);
        dataset = await this.performTransformation(context, taskmodel, dataset, datapart);
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: context.params.taskid, modelname: taskmodel.name, totalrecords: 0, errorrecords: 0, skiprecords: 0, ...this.createRecordSet() };
        if(taskmodel.name.trim().length == 0 || context.params.stored === "NONE" || context.params.stored === "false") {
            result.rows = dataset;
            result.records = result.rows?.length || 0;
            return result;
        }
        this.insertLogging(context, taskmodel, param, result);
        if(context.params.async=="true") {
            this.performInserting(context, taskmodel, dataset).then(value => {
                let rs = value[0];
                let info = value[1];
                let reject = value[2];
                this.updateLogging(context,param,rs,info,reject);
            }).catch(ex => { 
                this.errorLogging(context,param,result,ex);
            });
            return result;    
        } else {
            let rs : MigrateRecordSet | undefined = undefined;
            let info : MigrateInfo | undefined = undefined;
            let reject: MigrateReject | undefined = undefined;
            try {
                [rs,info,reject] = await this.performInserting(context, taskmodel, dataset);
                this.updateLogging(context,param,rs,info,reject);
            } catch(ex) {
                this.errorLogging(context,param,result,ex);
                return Promise.reject(this.getDBFault(ex,processid));
            }
            if(reject?.reject) {
                return Promise.reject(this.getDBFault(reject?.throwable,processid));
            }
            return rs;    
        }
    }

    private insertLogging(context: KnContextInfo, taskmodel: KnModel, param: MigrateParams, rs: MigrateRecordSet) {
        let params = {authtoken: param.authtoken, ...rs, tablename: taskmodel.name, processfile: param.fileinfo?.path, sourcefile: param.fileinfo?.originalname || param.filename, filesize: param.fileinfo?.size };
        if(param.calling) {
            this.call("migratelog.insert",params).catch(ex => this.logger.error(ex));
        } else {
            let handler = new MigrateLogHandler();
            handler.obtain(this.broker,this.logger);
            handler.userToken = this.userToken;
            handler.insert({params: params, meta: context.meta}).catch(ex => this.logger.error(ex));
        }
    }

    private updateLogging(context: KnContextInfo, param: MigrateParams, rs: MigrateRecordSet, info: MigrateInfo, reject: MigrateReject) {
        let processstatus = "DONE";
        let errormessage = undefined;
        if(reject.reject) {
            processstatus = "ERROR";
            errormessage = this.getDBError(reject.throwable).message;
        }
        let params = {authtoken: param.authtoken, ...rs, ...info, processstatus: processstatus, errormessage: errormessage };
        if(param.calling) {
            this.call("migratelog.update",params).catch(ex => this.logger.error(ex));
        } else {
            let handler = new MigrateLogHandler();
            handler.obtain(this.broker,this.logger);
            handler.userToken = this.userToken;
            handler.update({params: params, meta: context.meta}).catch(ex => this.logger.error(ex));
        }
    }

    private errorLogging(context: KnContextInfo, param: MigrateParams, result: MigrateRecordSet, ex: any) {
        this.logger.error(ex); 
        let err = this.getDBError(ex);
        let params = {authtoken: param.authtoken, ...result, processstatus: "ERROR", errormessage: err.message };
        if(param.calling) {
            this.call("migratelog.update",params).catch(ex => this.logger.error(ex));
        } else {
            let handler = new MigrateLogHandler();
            handler.obtain(this.broker,this.logger);
            handler.userToken = this.userToken;
            handler.update({params: params, meta: context.meta}).catch(ex => this.logger.error(ex));
        }
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
            await this.performPreTransaction(context,model,db,dataset);
            let [result,info,reject] = await this.performInsertTransaction(context,model,db,dataset);
            if(!reject.reject) {
                await this.performPostTransaction(context,model,db,dataset);
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
            await this.performPreTransaction(context,model,db,dataset);
            let [result,info,reject] =  await this.performInsertTransaction(context,model,db,dataset);
            if(!reject.reject) {
                await this.performPostTransaction(context,model,db,dataset);
            }
            return [result,info,reject];
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async performInsertTransaction(context: KnContextInfo, model: KnModel, db: KnDBConnector, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: context.params.taskid, modelname: model.name, totalrecords: 0, errorrecords: 0, skiprecords: 0, ...this.createRecordSet() };
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
                let ctx : KnContextInfo = { params: data, meta: context.meta };
                await this.performCreating(ctx, model, db);
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

    public async performPreTransaction(context: KnContextInfo, model: KnModel, db: KnDBConnector, dataset: any): Promise<any> {
        if(model.settings?.statement?.prestatement) {
            let knsql = this.composeQuery(context,db,model.settings?.statement?.prestatement);
            if(knsql) {
                await knsql.executeUpdate(db,context);
            }
        }
    }

    public async performPostTransaction(context: KnContextInfo, model: KnModel, db: KnDBConnector, dataset: any): Promise<any> {
        if(model.settings?.statement?.poststatement) {
            let knsql = this.composeQuery(context,db,model.settings?.statement?.poststatement);
            if(knsql) {
                await knsql.executeUpdate(db,context);
            }            
        }
    }

    public async getTaskModel(context: KnContextInfo, taskid: string, model: KnModel = this.model): Promise<MigrateModel | undefined> {
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

    public async getMigrateModel(context: KnContextInfo, model: KnModel, db: KnDBConnector, taskid: string): Promise<MigrateModel | undefined> {
        let results : MigrateModel = { models: [], configs: {} };
        let knsql = new KnSQL();
        knsql.append("select t.taskid,t.taskname,t.connectid,t.taskconfigs,");
        knsql.append("m.modelid,m.modelname,m.tablename,m.tablefields,m.tablesettings,tm.seqno ");
        knsql.append("from tmigratetask t, tmigratetaskmodel tm, tmigratemodel m ");
        knsql.append("where t.taskid = ?taskid ");
        knsql.append("and t.taskid = tm.taskid ");
        knsql.append("and tm.modelid = m.modelid ");
        knsql.append("order by seqno ");
        knsql.set("taskid",taskid);
        let rs = await knsql.executeQuery(db,context);
        if(rs && rs.rows?.length > 0) {
            results.configs = this.tryParseJSON(rs.rows[0].taskconfigs);
            for(let row of rs.rows) {
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
                results.models.push(taskmodel);
            }
        }
        if(results.models.length > 0) return results;
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
