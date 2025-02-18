import { HTTP } from "@willsofts/will-api";
import { KnModel } from "@willsofts/will-db";
import { KnDBConnector, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo, KnValidateInfo, VerifyError } from '@willsofts/will-core';
import { MigrateOperate } from "./MigrateOperate";
import { TaskModel, MigrateConfig, MigrateRecordSet, MigrateResultSet, MigrateInfo, MigrateReject, MigrateModel, MigrateParams } from "../models/MigrateAlias";

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
        let param : MigrateParams = { authtoken: this.getTokenKey(context), filename: context.params.filename, fileinfo: context.params.fileinfo, calling: true, async: context.params.async=="true" };
        return this.processInserting(context, taskmodel, param, dataset, context.params.datapart);
    }
    
    public async processInserting(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        let result : MigrateResultSet;
        await this.processInsertingPreceding(context, migratemodel, param, dataset, datapart);
        let dominated = String(migratemodel.configs?.isolateConnection) === "false";
        if(dominated) {
            result = await this.processInsertingDominate(context, migratemodel, param, dataset, datapart);
        } else {
            result = await this.processInsertingIsolate(context, migratemodel, param, dataset, datapart);
        }
        await this.processInsertingSucceeding(context, migratemodel, param, dataset, datapart);
        return result;
    }

    public async processInsertingPreceding(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, dataset: any, datapart?: any): Promise<any> {

    }

    public async processInsertingSucceeding(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, dataset: any, datapart?: any): Promise<any> {

    }

    public async processInsertingIsolate(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        //this sperated db connection to each models
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: context.params.taskid, processid: context.params.processid, resultset: [] };
        for(let taskmodel of migratemodel.models) {
            context.params.migrateid = this.randomUUID();
            let rs = await this.processInsertingModel(context, taskmodel, param, undefined, dataset, datapart);
            result.resultset.push(rs);
        }
        return result;
    }

    public async processInsertingDominate(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        if(param.async) {
            return await this.processInsertingDominateAsync(context,migratemodel,param,dataset,datapart);
        } else {
            return await this.processInsertingDominateSync(context,migratemodel,param,dataset,datapart);
        }
    }

    public async processInsertingDominateSync(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        //this using one db connection to all models
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: context.params.taskid, processid: context.params.processid, resultset: [] };
        if(migratemodel.models.length>0) {
            let autoCommit = String(migratemodel.configs?.autoCommit)=="true";
            param.async = false;
            let model = migratemodel.models[0];
            let db = this.getPrivateConnector(model);
            try {
                if(!autoCommit) await db.beginWork();
                for(let taskmodel of migratemodel.models) {
                    context.params.migrateid = taskmodel.resultset?.migrateid || this.randomUUID();
                    let rs = await this.processInsertingModel(context, taskmodel, param, db, dataset, datapart);
                    result.resultset.push(rs);
                }
                if(!autoCommit) await db.commitWork();
                return result;
            } catch(ex: any) {
                this.logger.error(ex);
                if(!autoCommit) db.rollbackWork().catch(ex => this.logger.error(ex));
                return Promise.reject(this.getDBFault(ex,context.params.processid));
            } finally {
                if(db) db.close();
            }
        }
        return result;
    }

    public async processInsertingDominateAsync(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        //this using one db connection to all models
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: context.params.taskid, processid: context.params.processid, resultset: [] };
        if(migratemodel.models.length>0) {
            try {
                param.async = false;
                param.dominated = true;
                for(let taskmodel of migratemodel.models) {
                    context.params.migrateid = this.randomUUID();
                    let rs = await this.processInsertingModel(context, taskmodel, param, undefined, dataset, datapart);
                    result.resultset.push(rs);
                }
                param.dominated = false;
                this.processInsertingDominateSync(context,migratemodel,param,dataset,datapart).catch(ex => this.logger.error(ex));
                return result;
            } catch(ex: any) {
                this.logger.error(ex);
                return Promise.reject(this.getDBFault(ex,context.params.processid));
            }
        }
        return result;
    }

    public async processInsertingModel(context: KnContextInfo, taskmodel: TaskModel, param: MigrateParams, db: KnDBConnector | undefined, dataset: any, datapart?: any): Promise<MigrateRecordSet> {
        if(!param.fileinfo) param.fileinfo = context.params.fileinfo;
        if(!param.authtoken) param.authtoken = this.getTokenKey(context);
        if(!this.userToken) this.userToken = await this.getUserTokenInfo(context);
        if(taskmodel.datapart) datapart = taskmodel.datapart;
        if(taskmodel.dataset) {
            dataset = taskmodel.dataset;
        } else {
            dataset = await this.performTransformation(context, taskmodel, dataset, datapart);
        }
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: context.params.taskid, modelname: taskmodel.name, totalrecords: 0, errorrecords: 0, skiprecords: 0, ...this.createRecordSet() };
        //let defaultInfo : MigrateInfo = { exception: false, errormessage: "", errorcontents: [] };
        //let defaultReject : MigrateReject = { reject: false, throwable: undefined };
        if(taskmodel.name.trim().length == 0 || context.params.stored === "NONE" || context.params.stored === "false") {
            result.rows = dataset;
            result.records = result.rows?.length || 0;
            return result;
        }
        taskmodel.resultset = undefined;
        taskmodel.dataset = undefined;
        taskmodel.datapart = undefined;
        if(param.dominated) {
            taskmodel.resultset = result;
            taskmodel.dataset = dataset;
            taskmodel.datapart = datapart;
            return result;
        }
        this.insertLogging(context, taskmodel, param, result);
        if(param.async) {
            this.performInserting(context, taskmodel, undefined, dataset).then(value => {
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
                [rs,info,reject] = await this.performInserting(context, taskmodel, db, dataset);
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

    public async performInserting(context: KnContextInfo, model: KnModel, db: KnDBConnector | undefined, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        if(db) {
            return await this.performSaveTransaction(context,model,db,dataset);
        } else {
            if(String(model.settings?.autoCommit)=="true") {
                return await this.performInsertWithAutoCommit(context, model, dataset);
            } else {
                return await this.performInsertWithTransaction(context, model, dataset);
            }
        }
    }

    public async performInsertWithTransaction(context: KnContextInfo, model: KnModel, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let db = this.getPrivateConnector(model);
        try {
            await db.beginWork();
            let [result,info,reject] = await this.performSaveTransaction(context,model,db,dataset);
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
            return await this.performSaveTransaction(context,model,db,dataset);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async performSaveTransaction(context: KnContextInfo, model: KnModel, db: KnDBConnector, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        await this.performPreTransaction(context,model,db,dataset);
        let [result,info,reject] = await this.performInsertTransaction(context,model,db,dataset);
        if(!reject.reject) {
            await this.performPostTransaction(context,model,db,dataset);
        }
        return [result,info,reject];
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
