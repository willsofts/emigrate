import { HTTP } from "@willsofts/will-api";
import { KnModel, KnFieldSetting, KnCellSetting, KnDBField } from "@willsofts/will-db";
import { KnDBConnector, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo, KnValidateInfo, VerifyError, KnFormatInfo, KnUtility } from '@willsofts/will-core';
import { TaskModel, MigrateRecordSet, MigrateResultSet, MigrateInfo, MigrateReject, MigrateTask, MigrateParams, MigrateRecords, FilterInfo, MigrateDataRow, MigrateState, MigrateField } from "../models/MigrateAlias";
import { ExtractOperate } from "./ExtractOperate";
import { DEFAULT_CALLING_SERVICE } from "../utils/EnvironmentVariable";
import { MigrateUtility } from "../utils/MigrateUtility";
import { Utilities } from "@willsofts/will-util";

export class ExtractHandler extends ExtractOperate {
    public notename : string = "JSON";
    public cancelDataRow: boolean = false;

    public override async doCollecting(context: KnContextInfo, model: KnModel = this.model, action: string = "collect", calling: boolean = DEFAULT_CALLING_SERVICE): Promise<MigrateResultSet> {
        let taskid = context.params.taskid;
        let taskmodel = await this.getMigrateTaskModel(context,taskid,model);
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        let uuid = this.randomUUID();
        if(!context.params.migrateid) context.params.migrateid = uuid;
        if(!context.params.processid) context.params.processid = uuid;
        this.logger.debug(this.constructor.name+".doCollecting: context.params",context.params);
        let param : MigrateParams = { authtoken: this.getTokenKey(context), filename: context.params.filename, fileinfo: context.params.fileinfo, calling: calling, async: String(context.params.async)=="true", notename: this.notename };
        let result = await this.processCollecting(context, taskmodel, param);
        this.logger.debug(this.constructor.name+".doCollecting: result",{taskid: result.taskid, processid: result.processid, async: context.params.async});
        return result;
    }

    public async processCollecting(context: KnContextInfo, task: MigrateTask, param: MigrateParams): Promise<MigrateResultSet> {
        await this.executeValidating(context,task,param);
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: task.taskid || context.params.taskid, processid: context.params.processid, resultset: [] };
        let rc : MigrateRecords = { totalrecords: 0, errorrecords: 0, skiprecords: 0 };
        if(param.async) {
            this.executeCollecting(context, task, param, rc).catch(ex => this.logger.error(ex));
            return result;
        }
        return await this.executeCollecting(context, task, param, rc);
    }

    public async executeValidating(context: KnContextInfo, task: MigrateTask, param: MigrateParams): Promise<KnValidateInfo> {
        for(let taskmodel of task.models) {
            let vi = await this.validateStatementParameters(context,taskmodel);
            if(!vi.valid) {
                return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
            }
        }
        return { valid: true };
    }

    public async executeCollecting(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords): Promise<MigrateResultSet> {
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: task.taskid || context.params.taskid, processid: context.params.processid, resultset: [] };
        await this.processCollectingPreceding(context, task, param, rc);
        result = await this.processCollectingIsolate(context, task, param, rc);
        await this.processCollecttingSucceeding(context, task, param, rc);
        return result;
    }

    public async processCollectingPreceding(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset?: any): Promise<any> {
        let initconfig = task.configs?.initialize;        
        if(initconfig) {
            let data = dataset || {};
            if(Array.isArray(dataset)) data = { };
            let dbfield : KnDBField = { type: "STRING", options: { connection: initconfig?.connection }};
            let field : MigrateField = { name: "initialize", field: dbfield };
            let response = await this.performFetchData(context,this.model,field,data,dataset||{});
            this.logger.debug(this.constructor.name+".processInsertingPreceding: fetch data",response);
            if(response) {
                let conmapper = field.field.options?.connection?.mapper;
                let values = response;
                if(conmapper) {
                    values = this.scrapeData(conmapper,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: response, dataTarget: response, dataChunk: response, dataParent: response});
                }
                this.logger.debug(this.constructor.name+".processCollectingPreceding: mapper="+conmapper,", scrapeData=",values);
                let paravalues = context.params[field.name] || {};
                for(let p in values) {
                    paravalues[p] = values[p];
                }
                context.params[field.name] = paravalues;
                this.logger.debug(this.constructor.name+".processCollectingPreceding: context.params",context.params);
            }
        }
    }

    public async processCollecttingSucceeding(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords, dataset?: any): Promise<any> {
        let finalconfig = task.configs?.finalize;        
        if(finalconfig) {
            let data = dataset || {};
            if(Array.isArray(dataset)) data = { };
            let dbfield : KnDBField = { type: "STRING", options: { connection: finalconfig?.connection }};
            let field : MigrateField = { name: "finalize", field: dbfield };
            let response = await this.performFetchData(context,this.model,field,data,dataset||{});
            this.logger.debug(this.constructor.name+".processCollecttingSucceeding: fetch data",response);
        }
    }

    public async processCollectingIsolate(context: KnContextInfo, task: MigrateTask, param: MigrateParams, rc: MigrateRecords): Promise<MigrateResultSet> {
        //this sperated db connection to each models
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: task.taskid || context.params.taskid, processid: context.params.processid, resultset: [] };
        for(let taskmodel of task.models) {
            context.params.migrateid = this.randomUUID();
            let rs = await this.processCollectingModel(context, task, taskmodel, param, undefined, rc);
            result.resultset.push(rs);
        }
        return result;
    }

    public async processCollectingModel(context: KnContextInfo, task: MigrateTask, taskmodel: TaskModel, param: MigrateParams, db: KnDBConnector | undefined, rc: MigrateRecords): Promise<MigrateRecordSet> {
        if(!param.fileinfo) param.fileinfo = context.params.fileinfo;
        if(!param.authtoken) param.authtoken = this.getTokenKey(context);
        if(!this.userToken) this.userToken = await this.getUserTokenInfo(context);
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        this.logger.debug(this.constructor.name+".processCollectingModel: param",param);
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: task.taskid || context.params.taskid, modelid: taskmodel.modelid, modelname: taskmodel.name, totalrecords: rc.totalrecords, datarecords: rc.totalrecords, errorrecords: 0, skiprecords: 0, posterror: false, ...this.createRecordSet() };
        this.insertLogging(context, taskmodel, param, result);
        if(param.async) {
            this.performCollecting(context, task, taskmodel, undefined, rc, param).then(value => {
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
                [rs,info,reject] = await this.performCollecting(context, task, taskmodel, db, rc, param);
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

    public async performCollecting(context: KnContextInfo, task: MigrateTask, model: TaskModel, db: KnDBConnector | undefined, rc: MigrateRecords, param: MigrateParams): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        if(db) {
            return await this.performCollectingResultSet(context,task,model,db,rc,param);
        } else {
            return await this.performCollectingRecordSet(context,task,model,rc,param);
        }
    }

    public async performCollectingRecordSet(context: KnContextInfo, task: MigrateTask, model: TaskModel, rc: MigrateRecords, param: MigrateParams): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performCollectingResultSet(context,task,model,db,rc,param);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBFault(ex,context.params.processid));
        } finally {
            if(db) db.close();
        }
    }

    public async performCollectingResultSet(context: KnContextInfo, task: MigrateTask, model: TaskModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        await this.performPreTransaction(context,task,model,db,rc,param,{});
        let [result,info,reject] = await this.performCollectingDataSet(context,task,model,db,rc,param);
        if(!reject.reject) {
            let post = await this.performPostTransaction(context,task,model,db,rc,param,{});            
            if(post.throwable) {
                result.posterror = true;
                result.message = post.throwable?.message;
            }
        }
        return [result,info,reject];
    }

    public async performCollectingDataSet(context: KnContextInfo, task: MigrateTask, model: TaskModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: task.taskid || context.params.taskid, modelid: model.modelid, modelname: model.name, totalrecords: rc.totalrecords, datarecords: rc.totalrecords, errorrecords: 0, skiprecords: 0, posterror: false, ...this.createRecordSet() };
        let abandonError = model.settings?.abandonError === undefined || String(model.settings?.abandonError)=="true";
        result.totalrecords = 0;
        let info : MigrateInfo = { exception: false, errormessage: "", errorcontents: [] };
        let reject : MigrateReject = { reject: false, throwable: undefined };
        let knsql = this.composeQuery(context,model.settings?.statement,db);
        if(!knsql) knsql = new KnSQL("select * from "+model.name);
        if(knsql) {
            this.logger.info(this.constructor.name+".performCollectingDataSet:",knsql);
            let rs = await knsql.executeQuery(db,context);
            if(rs) {
                let rownum = rs.rows?.length;
                result.totalrecords = rownum;
                result.records = rownum;
                result.rows = [];
            }
            await this.performDataSet(context,task,model,rc,result,param,rs);
        }
        if(abandonError && reject.throwable) {
            reject.reject = true;
        }
        result.datarecords = result.rows?.length;
        return [result,info,reject];
    }

    protected async performDataSet(context: KnContextInfo, task: MigrateTask, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, rs: KnResultSet, options: any = {}): Promise<MigrateRecordSet> {
        let index = 0;
        let datafields = this.scrapeDataFields(model?.fields);
        let data : MigrateDataRow = {state: MigrateState.START, index, datarow: undefined, rs, fields: datafields || model.cells, options: options};
        await this.performDataRow(context,task,model,rc,record,param,data);
        try {
            if(rs) {
                if(datafields) {
                    [index] = await this.performDataList(context,task,model,rc,record,param,datafields,data);
                } else {
                    if(model.cells && model.cells.length > 0) {
                        [index] = await this.performDataList(context,task,model,rc,record,param,model.cells,data);
                    }                
                }
            }
        } finally {
            data.index = index;
            data.state = MigrateState.FINISH;
            data.datarow = undefined;
            await this.performDataRow(context,task,model,rc,record,param,data);
        }
        return record;    
    }    

    protected async performDataList(context: KnContextInfo, task: MigrateTask, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, fields: KnFieldSetting | KnCellSetting[], data: MigrateDataRow): Promise<[number,MigrateRecordSet]> {
        let index = 0;
        let paras = this.getContextParameters(context);
        this.logger.debug(this.constructor.name+".performDataList: paras",paras);
        if(Array.isArray(fields)) {
            let cells = fields as KnCellSetting[];
            for(let row of data.rs.rows) {
                index++;
                let ds = { ...paras, ...row };
                let [hasdata,datarow] = this.scrapeDataCells(model,cells,ds);
                if(hasdata) {
                    data.index = index;
                    data.state = MigrateState.RUN;
                    data.datarow = datarow;
                    let info = await this.performDataRow(context,task,model,rc,record,param,data);
                    if(!info.cancel) {
                        record.rows.push(datarow);
                    }
                }
            }
        } else {
            for(let row of data.rs.rows) {
                index++;
                let ds = { ...paras, ...row };
                let datarow = this.transformData(ds,fields,(info:KnFormatInfo) => this.formatData(info));
                data.index = index;
                data.state = MigrateState.RUN;
                data.datarow = datarow;
                let info = await this.performDataRow(context,task,model,rc,record,param,data);
                if(!info.cancel) {
                    record.rows.push(datarow);
                }
            }                
        }
        return [index,record];
    }

    protected async performDataRow(context: KnContextInfo, task: MigrateTask, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, data: MigrateDataRow): Promise<FilterInfo> {
        return { cancel: this.cancelDataRow };
    }

    protected scrapeDataFields(fields?: KnFieldSetting) : KnFieldSetting | undefined {
        if(!fields) return fields;
        let datafields : KnFieldSetting | undefined = {};
        for(let key in fields) {
            let dbf = fields[key];
            if(typeof dbf.options?.seqno !== 'undefined') {
                datafields[key] = dbf;
            }
        }
        if(Object.keys(datafields).length == 0) {
            datafields = fields;
        } else {
            //if has seqno try to sort by seqno too
            datafields = Object.entries(datafields)
            .sort((a, b) => a[1].options?.seqno - b[1].options?.seqno)
            .reduce((item, [key, value]) => { 
                item[key] = value;
                return item;
            }, {} as KnFieldSetting);
        }
        return datafields;
    }

    protected scrapeDataCells(model: KnModel, cells: KnCellSetting[], row: any) : [boolean,any] {
        let hasdata = false;
        let datarow : any = {};
        for(let cell of cells) {
            if(cell.name && cell.name.trim().length > 0 && cell.fields) {
                let data = this.transformData(row,cell.fields,(info:KnFormatInfo) => this.formatData(info));
                let delimiter = cell.options?.delimiter || model.settings?.delimiter || "";
                let values = Object.values(data).join(delimiter);
                datarow[cell.name] = values;
                hasdata = true;
            }
        }
        return [hasdata,datarow];
    }

    protected formatData(info: KnFormatInfo) : any {
        let format = info.field?.options?.format;
        let mapper = info.field?.options?.mapper;
        if(mapper && mapper.trim().length > 0) {
            let datasource = info.field?.options?.datasource;
            if(datasource && datasource.trim().length > 0) {
                let ds = info.rs[datasource];
                if(ds) {
                    let mapvalue = this.scrapeData(mapper,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: info.rs, dataTarget: info.rs, dataChunk: info.rs, dataParent: info.rs});
                    if(mapvalue) {
                        let values = this.scrapeData(mapvalue,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: ds, dataTarget: ds, dataChunk: ds, dataParent: ds});
                        info.value = values;
                    }
                }
            } else {
                let values = this.scrapeData(mapper,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: info.rs, dataTarget: info.rs, dataChunk: info.rs, dataParent: info.rs});
                info.value = values;
            }
        }
        if(format && format.trim().length > 0) {
            if(!info.value && info.field?.defaultValue) {
                let [value] = this.parseDefaultValue(info.field.defaultValue);
                info.value = value;
            }    
            let locale = info.field?.options?.locale;
            let era = info.field?.options?.era;
            if(info.value instanceof Date) {
                if(info.field?.type == "DATE") {
                    return MigrateUtility.formatDate(info.value as Date,format,locale,era);
                } else if(info.field?.type == "TIME") {
                    return MigrateUtility.formatTime(info.value as Date,format,locale,era);
                } else if(info.field?.type == "DATETIME") {
                    return MigrateUtility.formatDateTime(info.value as Date,format,locale,era);
                } else {
                    return MigrateUtility.formatDate(info.value as Date,format,locale,era);
                }
            } else if(typeof info.value === "number") {
                try {
                    if(info.field?.type == "INTEGER" || info.field?.type == "BIGINT") {
                        return MigrateUtility.formatInteger(info.value as number,format,locale);
                    } else {
                        return MigrateUtility.formatDecimal(info.value as number,format,locale);
                    }
                } catch(ex) { console.error(ex); }
            } else if(typeof info.value === "string" && info.value!="") {
                try {
                    if(info.field?.type == "INTEGER" || info.field?.type == "BIGINT") {
                        let value = Utilities.parseInteger(info.value);
                        if(value) {
                            return MigrateUtility.formatInteger(value,format,locale);
                        }
                    } else if(info.field?.type == "DECIMAL") {
                        let value = Utilities.parseFloat(info.value);
                        if(value) {
                            return MigrateUtility.formatDecimal(value,format,locale);
                        }
                    }
                } catch(ex) { console.error(ex); }
            }    
        }
        if(info.field?.defaultValue) {
            let [value] = this.parseDefaultValue(info.field.defaultValue);
            return value;
        }
        let fieldscell = info.field?.options?.fieldscell;
        if(fieldscell && Object.keys(fieldscell).length > 0) {
            let data = this.transformData(info.rs,fieldscell,(info:KnFormatInfo) => this.formatData(info));
            let delimiter = info.field?.options?.delimiter || "";
            return Object.values(data).join(delimiter);
        }
        return KnUtility.formatData(info);
    }
    
}
