import { HTTP } from "@willsofts/will-api";
import { KnModel, KnFieldSetting, KnCellSetting, KnDBField } from "@willsofts/will-db";
import { KnDBConnector, KnResultSet, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo, KnValidateInfo, VerifyError, KnFormatInfo, KnUtility } from '@willsofts/will-core';
import { TaskModel, MigrateRecordSet, MigrateResultSet, MigrateInfo, MigrateReject, MigrateModel, MigrateParams, MigrateRecords, FilterInfo, MigrateDataRow, MigrateState, MigrateField } from "../models/MigrateAlias";
import { ExtractOperate } from "./ExtractOperate";
import { DEFAULT_CALLING_SERVICE } from "../utils/EnvironmentVariable";
import { MigrateUtility } from "../utils/MigrateUtility";
import { Utilities } from "@willsofts/will-util";

export class ExtractHandler extends ExtractOperate {
    public notename : string = "JSON";
    public cancelDataRow: boolean = false;

    public override async doCollecting(context: KnContextInfo, model: KnModel = this.model, action: string = "collect", calling: boolean = DEFAULT_CALLING_SERVICE): Promise<MigrateResultSet> {
        let taskid = context.params.taskid;
        let taskmodel = await this.getTaskModel(context,taskid,model);
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

    public async processCollecting(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams): Promise<MigrateResultSet> {
        await this.executeValidating(context,migratemodel,param);
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: context.params.taskid, processid: context.params.processid, resultset: [] };
        let rc : MigrateRecords = { totalrecords: 0, errorrecords: 0, skiprecords: 0 };
        if(param.async) {
            this.executeCollecting(context, migratemodel, param, rc).catch(ex => this.logger.error(ex));
            return result;
        }
        return await this.executeCollecting(context, migratemodel, param, rc);
    }

    public async executeValidating(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams): Promise<KnValidateInfo> {
        for(let taskmodel of migratemodel.models) {
            let vi = await this.validateStatementParameters(context,taskmodel);
            if(!vi.valid) {
                return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
            }
        }
        return { valid: true };
    }

    public async executeCollecting(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, rc: MigrateRecords): Promise<MigrateResultSet> {
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: context.params.taskid, processid: context.params.processid, resultset: [] };
        await this.processCollectingPreceding(context, migratemodel, param, rc);
        result = await this.processCollectingIsolate(context, migratemodel, param, rc);
        await this.processCollecttingSucceeding(context, migratemodel, param, rc);
        return result;
    }

    public async processCollectingPreceding(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, rc: MigrateRecords, dataset?: any): Promise<any> {
        let initconfig = migratemodel.configs?.initialize;        
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
                    values = this.scrapeData(conmapper,response,response);
                }
                this.logger.debug(this.constructor.name+".processCollectingPreceding: mapper="+conmapper,", scrapeData=",values);
                if(Array.isArray(values)) {
                    context.params[field.name] = values;
                } else {
                    for(let p in values) {
                        if(!context.params.hasOwnProperty(p)) {
                            context.params[p] = values[p];
                        }
                    }
                }
                this.logger.debug(this.constructor.name+".processCollectingPreceding: context.params",context.params);
            }
        }
    }

    public async processCollecttingSucceeding(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, rc: MigrateRecords, dataset?: any): Promise<any> {
        let finalconfig = migratemodel.configs?.finalize;        
        if(finalconfig) {
            let data = dataset || {};
            if(Array.isArray(dataset)) data = { };
            let dbfield : KnDBField = { type: "STRING", options: { connection: finalconfig?.connection }};
            let field : MigrateField = { name: "finalize", field: dbfield };
            let response = await this.performFetchData(context,this.model,field,data,dataset||{});
            this.logger.debug(this.constructor.name+".processCollecttingSucceeding: fetch data",response);
        }
    }

    public async processCollectingIsolate(context: KnContextInfo, migratemodel: MigrateModel, param: MigrateParams, rc: MigrateRecords): Promise<MigrateResultSet> {
        //this sperated db connection to each models
        if(!context.params.processid) context.params.processid = this.randomUUID();
        let result : MigrateResultSet = { taskid: context.params.taskid, processid: context.params.processid, resultset: [] };
        for(let taskmodel of migratemodel.models) {
            context.params.migrateid = this.randomUUID();
            let rs = await this.processCollectingModel(context, taskmodel, param, undefined, rc);
            result.resultset.push(rs);
        }
        return result;
    }

    public async processCollectingModel(context: KnContextInfo, taskmodel: TaskModel, param: MigrateParams, db: KnDBConnector | undefined, rc: MigrateRecords): Promise<MigrateRecordSet> {
        if(!param.fileinfo) param.fileinfo = context.params.fileinfo;
        if(!param.authtoken) param.authtoken = this.getTokenKey(context);
        if(!this.userToken) this.userToken = await this.getUserTokenInfo(context);
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        this.logger.debug(this.constructor.name+".processCollectingModel: param",param);
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: context.params.taskid, modelname: taskmodel.name, totalrecords: rc.totalrecords, errorrecords: 0, skiprecords: 0, posterror: false, ...this.createRecordSet() };
        this.insertLogging(context, taskmodel, param, result);
        if(param.async) {
            this.performCollecting(context, taskmodel, undefined, rc, param).then(value => {
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
                [rs,info,reject] = await this.performCollecting(context, taskmodel, db, rc, param);
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

    public async performCollecting(context: KnContextInfo, model: KnModel, db: KnDBConnector | undefined, rc: MigrateRecords, param: MigrateParams): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        if(db) {
            return await this.performCollectingResultSet(context,model,db,rc,param);
        } else {
            return await this.performCollectingRecordSet(context,model,rc,param);
        }
    }

    public async performCollectingRecordSet(context: KnContextInfo, model: KnModel, rc: MigrateRecords, param: MigrateParams): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performCollectingResultSet(context,model,db,rc,param);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBFault(ex,context.params.processid));
        } finally {
            if(db) db.close();
        }
    }

    public async performCollectingResultSet(context: KnContextInfo, model: KnModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        await this.performPreTransaction(context,model,db,rc,param,{});
        let [result,info,reject] = await this.performCollectingDataSet(context,model,db,rc,param);
        if(!reject.reject) {
            let post = await this.performPostTransaction(context,model,db,rc,param,{});            
            if(post.throwable) {
                result.posterror = true;
                result.message = post.throwable?.message;
            }
        }
        return [result,info,reject];
    }

    public async performCollectingDataSet(context: KnContextInfo, model: KnModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams): Promise<[MigrateRecordSet,MigrateInfo,MigrateReject]> {
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        let result : MigrateRecordSet = { migrateid: migrateid, processid: processid, taskid: context.params.taskid, modelname: model.name, totalrecords: rc.totalrecords, errorrecords: 0, skiprecords: 0, posterror: false, ...this.createRecordSet() };
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
            await this.performDataSet(context,model,rc,result,param,rs);
        }
        if(abandonError && reject.throwable) {
            reject.reject = true;
        }
        return [result,info,reject];
    }

    protected async performDataSet(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, rs: KnResultSet, options: any = {}): Promise<MigrateRecordSet> {
        let index = 0;
        let datafields = this.scrapeDataFields(model?.fields);
        let data : MigrateDataRow = {state: MigrateState.START, index, datarow: undefined, rs, fields: datafields || model.cells, options: options};
        await this.performDataRow(context,model,rc,record,param,data);
        try {
            if(rs) {
                if(datafields) {
                    [index] = await this.performDataList(context,model,rc,record,param,datafields,data);
                } else {
                    if(model.cells && model.cells.length > 0) {
                        [index] = await this.performDataList(context,model,rc,record,param,model.cells,data);
                    }                
                }
            }
        } finally {
            data.index = index;
            data.state = MigrateState.FINISH;
            data.datarow = undefined;
            await this.performDataRow(context,model,rc,record,param,data);
        }
        return record;    
    }    

    protected async performDataList(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, fields: KnFieldSetting | KnCellSetting[], data: MigrateDataRow): Promise<[number,MigrateRecordSet]> {
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
                    let info = await this.performDataRow(context,model,rc,record,param,data);
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
                let info = await this.performDataRow(context,model,rc,record,param,data);
                if(!info.cancel) {
                    record.rows.push(datarow);
                }
            }                
        }
        return [index,record];
    }

    protected async performDataRow(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, data: MigrateDataRow): Promise<FilterInfo> {
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
        if(format && format.trim().length > 0) {
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
