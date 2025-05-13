import { HTTP } from "@willsofts/will-api";
import { KnModel, KnDBField } from "@willsofts/will-db";
import { KnDBConnector } from "@willsofts/will-sql";
import { KnContextInfo, KnValidateInfo, VerifyError } from '@willsofts/will-core';
import { MigrateOperate } from "./MigrateOperate";
import { TaskModel, MigrateRecordSet, MigrateResultSet, MigrateInfo, MigrateReject, MigrateTask, MigrateParams, MigrateRecords, FilterInfo, MigrateField } from "../models/MigrateAlias";
import { MigrateFilter } from "../utils/MigrateFilter";
import { DEFAULT_CALLING_SERVICE } from "../utils/EnvironmentVariable";

export class MigrateHandler extends MigrateOperate {

    protected override async validateRequireFields(context: KnContextInfo, model: KnModel, action?: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"taskid");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    public override async doInserting(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE): Promise<MigrateResultSet> {        
        let taskid = context.params.taskid;
        let dataset = context.params.dataset;
        if(!dataset) dataset = context.params;        
        let body = context.options?.parentCtx?.params?.req?.body;
        if(body && Array.isArray(body)) dataset = body;
        let taskmodel = await this.getMigrateTaskModel(context,taskid,model);
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        let uuid = this.randomUUID();
        if(!context.params.migrateid) context.params.migrateid = uuid;
        if(!context.params.processid) context.params.processid = uuid;
        if(context.params.dataset) delete context.params.dataset;
        let param : MigrateParams = { authtoken: this.getTokenKey(context), filename: context.params.filename, fileinfo: context.params.fileinfo, calling: calling, async: String(context.params.async)=="true" };
        let result = await this.processInserting(context, taskmodel, param, dataset, context.params.datapart);
        this.logger.debug(this.constructor.name+".doInserting: result",{taskid: result.taskid, processid: result.processid, async: context.params.async});
        return result;
    }

    public async processInserting(context: KnContextInfo, task: MigrateTask, param: MigrateParams, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        await this.executeValidating(context,task,param);
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: task.taskid || context.params.taskid, processid: context.params.processid, filepath: param.filename, resultset: [] };
        let totalrecords = Array.isArray(dataset) ? dataset.length : 1;
        let rc : MigrateRecords = { totalrecords: totalrecords, errorrecords: 0, skiprecords: 0 };
        if(param.async) {
            this.executeInserting(context, task, param, rc, dataset, datapart).catch(ex => this.logger.error(ex));
            return result;
        }
        return await this.executeInserting(context, task, param, rc, dataset, datapart);
    }

    public async executeValidating(context: KnContextInfo, task: MigrateTask, param: MigrateParams): Promise<KnValidateInfo> {
        for(let taskmodel of task.models) {
            let vi = await this.validateStatementParameters(context,taskmodel);
            if(!vi.valid) {
                return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
            }
        }
        if(task.tasks && task.tasks.length > 0) {
            for(let submodel of task.tasks) {
                await this.executeValidating(context, submodel, param);
            }
        }
        return { valid: true };
    }

    public async executeInserting(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: task.taskid || context.params.taskid, processid: context.params.processid, filepath: param.filename, resultset: [] };
        await this.processInsertingPreceding(context, task, param, rc, dataset, datapart);
        let dominated = String(task.configs?.isolateConnection) === "false";
        this.logger.debug(this.constructor.name+".executeInserting: isolateConnection",task.configs?.isolateConnection);
        if(dominated) {
            result = await this.processInsertingDominate(context, task, param, rc, dataset, datapart);
        } else {
            result = await this.processInsertingIsolate(context, task, param, rc, dataset, datapart);
        }
        await this.processInsertingSucceeding(context, task, param, rc, dataset, datapart);
        if(task.tasks && task.tasks.length > 0) {
            result.taskset = [];
            for(let submodel of task.tasks) {
                let subrc : MigrateRecords = { totalrecords: rc.totalrecords, errorrecords: 0, skiprecords: 0 };
                let subresult = await this.executeInserting(context, submodel, param, subrc, dataset, datapart);
                result.taskset.push(subresult);
            }
        }
        return result;
    }

    public async processInsertingPreceding(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset: any, datapart?: any): Promise<any> {
        let initconfig = task.configs?.initialize;        
        if(initconfig) {
            let data = dataset;
            if(Array.isArray(dataset)) data = { };
            let dbfield : KnDBField = { type: "STRING", options: { connection: initconfig?.connection }};
            let field : MigrateField = { name: "initialize", field: dbfield };
            let response = await this.performFetchData(context,this.model,field,data,dataset);
            this.logger.debug(this.constructor.name+".processInsertingPreceding: fetch data",response);
            if(response) {
                let conmapper = field.field.options?.connection?.mapper;
                let values = response;
                if(conmapper) {
                    values = this.scrapeData(conmapper,{dataSet:response, dataTarget:response, dataChunk:response, dataParent:response});
                }
                this.logger.debug(this.constructor.name+".processInsertingPreceding: mapper="+conmapper,", scrapeData=",values);
                let paravalues = context.params[field.name] || {};
                for(let p in values) {
                    paravalues[p] = values[p];
                }
                context.params[field.name] = paravalues;
                this.logger.debug(this.constructor.name+".processInsertingPreceding: context.params",context.params);
            }
        }
    }

    public async processInsertingSucceeding(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset: any, datapart?: any): Promise<any> {
        let finalconfig = task.configs?.finalize;        
        if(finalconfig) {
            let dbfield : KnDBField = { type: "STRING", options: { connection: finalconfig?.connection }};
            let field : MigrateField = { name: "finalize", field: dbfield };
            let response = await this.performFetchData(context,this.model,field,dataset,dataset);
            this.logger.debug(this.constructor.name+".processInsertingSucceeding: fetch data",response);
        }
    }

    public async processInsertingIsolate(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        //this sperated db connection to each models
        this.logger.debug(this.constructor.name+".processInsertingIsolate: autoCommit",task.configs?.autoCommit);
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: task.taskid || context.params.taskid, processid: context.params.processid, filepath: param.filename, resultset: [] };
        for(let taskmodel of task.models) {
            context.params.migrateid = this.randomUUID();
            let rs = await this.processInsertingModel(context, task, taskmodel, param, undefined, rc, dataset, datapart);
            result.resultset.push(rs);
        }
        return result;
    }

    public async processInsertingDominate(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        //this using one db connection to all models
        if(param.async) {
            return await this.processInsertingDominateAsync(context,task,param,rc,dataset,datapart);
        } else {
            return await this.processInsertingDominateSync(context,task,param,rc,dataset,datapart);
        }
    }

    public async processInsertingDominateSync(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        //this using one db connection to all models
        this.logger.debug(this.constructor.name+".processInsertingDominateSync: autoCommit",task.configs?.autoCommit);
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: task.taskid || context.params.taskid, processid: context.params.processid, filepath: param.filename, resultset: [] };
        if(task.models.length>0) {
            let autoCommit = String(task.configs?.autoCommit)=="true";
            param.async = false;
            let model = task.models[0];
            let db = this.getPrivateConnector(model);
            try {
                if(!autoCommit) await db.beginWork();
                for(let taskmodel of task.models) {
                    context.params.migrateid = taskmodel.resultset?.migrateid || this.randomUUID();
                    let rs = await this.processInsertingModel(context, task, taskmodel, param, db, rc, dataset, datapart);
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

    public async processInsertingDominateAsync(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset: any, datapart?: any): Promise<MigrateResultSet> {
        //this using one db connection to all models
        this.logger.debug(this.constructor.name+".processInsertingDominateAsync: autoCommit",task.configs?.autoCommit);
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: task.taskid || context.params.taskid, processid: context.params.processid, filepath: param.filename, resultset: [] };
        if(task.models.length>0) {
            try {
                //try to obtain result by specified dominated = true
                param.async = false;
                param.dominated = true;
                for(let taskmodel of task.models) {
                    context.params.migrateid = this.randomUUID();
                    let rs = await this.processInsertingModel(context, task, taskmodel, param, undefined, rc, dataset, datapart);
                    result.resultset.push(rs);
                }
                param.dominated = false;
                //then process with no await
                this.processInsertingDominateSync(context,task,param,rc,dataset,datapart).catch(ex => this.logger.error(ex));
                return result;
            } catch(ex: any) {
                this.logger.error(ex);
                return Promise.reject(this.getDBFault(ex,context.params.processid));
            }
        }
        return result;
    }

    public async processInsertingModel(context: KnContextInfo, task: MigrateTask, taskmodel: TaskModel, param: MigrateParams, db: KnDBConnector | undefined, rc: MigrateRecords, dataset: any, datapart?: any): Promise<MigrateRecordSet> {
        if(!param.fileinfo) param.fileinfo = context.params.fileinfo;
        if(!param.authtoken) param.authtoken = this.getTokenKey(context);
        if(!this.userToken) this.userToken = await this.getUserTokenInfo(context);
        if(taskmodel.datapart) datapart = taskmodel.datapart;
        if(taskmodel.dataset) {
            dataset = taskmodel.dataset;
        } else {
            dataset = await this.performTransformation(context, taskmodel, dataset, datapart, dataset, dataset);
        }
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: task.taskid || context.params.taskid, modelid: taskmodel.modelid, modelname: taskmodel.name, totalrecords: rc.totalrecords, errorrecords: 0, skiprecords: 0, posterror: false, filename: param.filename, originalname: param.fileinfo?.originalname, ...this.createRecordSet() };
        if(taskmodel.name.trim().length == 0 || context.params.stored == "NONE" || String(context.params.stored) == "false") {
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
            this.performInserting(context, task, taskmodel, db, rc, param, dataset).then(value => {
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
                [rs,info,reject] = await this.performInserting(context, task, taskmodel, db, rc, param, dataset);
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

    public async performInserting(context: KnContextInfo, task: MigrateTask, model: TaskModel, db: KnDBConnector | undefined, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        if(db) {
            return await this.performSaveTransaction(context,task,model,db,rc,param,dataset);
        } else {
            if(String(model.settings?.autoCommit)=="true") {
                return await this.performInsertWithAutoCommit(context, task, model, rc, param, dataset);
            } else {
                return await this.performInsertWithTransaction(context, task, model, rc, param, dataset);
            }
        }
    }

    public async performInsertWithTransaction(context: KnContextInfo, task: MigrateTask, model: TaskModel, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let db = this.getPrivateConnector(model);
        try {
            await db.beginWork();
            let [result,info,reject] = await this.performSaveTransaction(context,task,model,db,rc,param,dataset);
            if(!reject.reject) {
                await db.commitWork();
            } else {
                db.rollbackWork().catch(ex => this.logger.error(ex));                
            }
            return [result,info,reject];
        } catch(ex: any) {
            this.logger.error(ex);
            db.rollbackWork().catch(ex => this.logger.error(ex));
            return Promise.reject(this.getDBFault(ex,context.params.procesid));
        } finally {
            if(db) db.close();
        }
    }

    public async performInsertWithAutoCommit(context: KnContextInfo, task: MigrateTask, model: TaskModel, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performSaveTransaction(context,task,model,db,rc,param,dataset);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBFault(ex,context.params.procesid));
        } finally {
            if(db) db.close();
        }
    }

    public async performSaveTransaction(context: KnContextInfo, task: MigrateTask, model: TaskModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        await this.performPreTransaction(context,task,model,db,rc,param,dataset);
        let [result,info,reject] = await this.performInsertTransaction(context,task,model,db,rc,param,dataset);
        if(!reject.reject) {
            let post = await this.performPostTransaction(context,task,model,db,rc,param,dataset);            
            if(post?.throwable) {
                result.posterror = true;
                result.message = post.throwable?.message;
            }
        }
        return [result,info,reject];
    }

    public async performInsertTransaction(context: KnContextInfo, task: MigrateTask, model: TaskModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: task.taskid || context.params.taskid, modelid: model.modelid, modelname: model.name, totalrecords: rc.totalrecords, errorrecords: 0, skiprecords: 0, posterror: false, filename: param.filename, originalname: param.fileinfo?.originalname, ...this.createRecordSet() };
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
            let filter = await this.performFiltering(context,model,db,rc,param,data);
            if(filter?.cancel) {
                result.skiprecords++;
            } else {
                try {
                    let ctx : KnContextInfo = { params: data, meta: context.meta };
                    await this.performCreating(ctx, model, db);
                    result.records++;
                    if(model.models && model.models.length > 0) {
                        for(let submodel of model.models) {
                            if(submodel.settings?.xpath && submodel.settings?.xpath.trim().length > 0) {
                                let subrc : MigrateRecords = { totalrecords: rc.totalrecords, errorrecords: 0, skiprecords: 0 };
                                let subdata = this.scrapeData(submodel.settings.xpath,{dataSet:data, dataTarget:data, dataChunk:data, dataParent:data},context);
                                if(subdata) {
                                    let hasData = false;
                                    if(Array.isArray(subdata) && subdata.length > 0) {
                                        hasData = true;
                                    } else {
                                        if(Object.keys(subdata).length > 0) {
                                            hasData = true;
                                        }
                                    }
                                    if(hasData) {
                                        let [subresult, subinfo, subreject] = await this.performInsertTransaction(context,task,submodel,db,subrc,param,subdata);
                                        if(!result.subset) {
                                            result.subset = [];                                            
                                        }
                                        result.subset.push(subresult);
                                    }
                                }
                            }
                        }
                    }
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
            }
            index++;
        }
        if(abandonError && reject.throwable) {
            reject.reject = true;
        }
        return [result,info,reject];
    }

    protected async performFiltering(context: KnContextInfo, model: KnModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams, data: any): Promise<FilterInfo> {
        let filters = model.settings?.filters;
        if(filters) {
            if(filters?.handler) {
                let func = this.tryParseFunction(filters?.handler,'data','db','model','context');
                if(func) {
                    let result = func(data,db,model,context);
                    if(result != undefined || result != null) {
                        if(typeof result === "boolean") return { cancel: result };
                        return result;
                    }
                    return { cancel: false };
                }
            }
            let filter = new MigrateFilter({ model: model, filters: filters, logger: this.logger });
            return await filter.performFilter(data);
        }
        return { cancel: false };
    }

}
