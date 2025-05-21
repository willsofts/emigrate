import { HTTP } from "@willsofts/will-api";
import { KnModel, KnDBField } from "@willsofts/will-db";
import { KnRecordSet, KnSQL, KnDBConnector } from "@willsofts/will-sql";
import { KnContextInfo, VerifyError } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { MigrateSystem } from "./MigrateSystem";
import { TaskModel, MigrateTask, MigrateRecords, MigrateConnectSetting, MigrateRecordSet, MigrateInfo, MigrateReject, MigrateParams, MigrateField, DataScrape, DataIndex, DataSources } from "../models/MigrateAlias";
import { MigrateLogHandler } from "./MigrateLogHandler";
import querystring from 'querystring';
import { evaluate } from 'mathjs';

const variablePattern = /\$\{(.*?)\}/g;

export class MigrateOperate extends MigrateSystem {
    
    protected insertLogging(context: KnContextInfo, taskmodel: KnModel, param: MigrateParams, rs: MigrateRecordSet, processtype: string = "IMGRATE") {
        let { rows, columns, ...mrs} = rs;
        let params = {authtoken: param.authtoken, ...mrs, tablename: taskmodel.name, processtype: processtype, processfile: param.fileinfo?.path, sourcefile: param.fileinfo?.originalname || param.filename, filesize: param.fileinfo?.size, notename: param.notename, notefile: param.notefile };
        if(param.calling) {
            this.call("migratelog.insert",params).catch(ex => this.logger.error(ex));
        } else {
            let handler = new MigrateLogHandler();
            handler.obtain(this.broker,this.logger);
            handler.userToken = this.userToken;
            handler.insert({params: params, meta: context.meta}).catch(ex => this.logger.error(ex));
        }
    }

    protected updateLogging(context: KnContextInfo, param: MigrateParams, rs: MigrateRecordSet, info: MigrateInfo, reject: MigrateReject) {
        let processstatus = "DONE";
        let errormessage = undefined;
        if(reject.reject) {
            processstatus = "ERROR";
            errormessage = (reject.throwable?.stack || this.getDBError(reject.throwable).message) + "\n"+JSON.stringify(reject.throwable);
        }
        let { rows, columns, ...mrs} = rs;
        let params = {authtoken: param.authtoken, ...mrs, ...info, processstatus: processstatus, errormessage: errormessage };
        if(param.calling) {
            this.call("migratelog.update",params).catch(ex => this.logger.error(ex));
        } else {
            let handler = new MigrateLogHandler();
            handler.obtain(this.broker,this.logger);
            handler.userToken = this.userToken;
            handler.update({params: params, meta: context.meta}).catch(ex => this.logger.error(ex));
        }
    }

    protected errorLogging(context: KnContextInfo, param: MigrateParams, rs: MigrateRecordSet, ex: any) {
        this.logger.error(ex); 
        let err = this.getDBError(ex);
        let { rows, columns, ...mrs} = rs;
        let params = {authtoken: param.authtoken, ...mrs, processstatus: "ERROR", errormessage: (ex?.stack || err.message) + "\n"+JSON.stringify(err) };
        if(param.calling) {
            this.call("migratelog.update",params).catch(ex => this.logger.error(ex));
        } else {
            let handler = new MigrateLogHandler();
            handler.obtain(this.broker,this.logger);
            handler.userToken = this.userToken;
            handler.update({params: params, meta: context.meta}).catch(ex => this.logger.error(ex));
        }
    }

    public async performTransformFilter(context: KnContextInfo, model: TaskModel, dataset: any): Promise<any> {
        if(dataset && model.settings?.transformFilters) {
            if(Array.isArray(dataset)) {
                let newdataset : any[] = [];
                for(let data of dataset) {
                    let filter = await this.performFiltering(context,model,model.settings?.transformFilters,data);
                    if(!filter?.cancel) {
                        newdataset.push(data);
                    }
                }
                return newdataset;
            } else {
                let filter = await this.performFiltering(context,model,model.settings?.filters,dataset);
                if(filter?.cancel) {
                    return undefined;
                }
            }
        }
        return dataset;
    }

    //public async performTransformation(context: KnContextInfo, model: TaskModel, datasource: any, datapart: any, datachunk: any, dataparent: any, dataindex: DataIndex = {parentIndex: 0, currentIndex: 0}): Promise<any> {
    public async performTransformation(context: KnContextInfo, model: TaskModel, ds: DataSources, dataindex: DataIndex = {parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0}): Promise<any> {
        let dataset = ds.dataSource;        
        if(model.settings?.xpath && model.settings?.xpath.trim().length > 0) {
            //find out data set from xpath
            dataset = this.scrapeData(model.settings.xpath,{...dataindex, dataSet: ds.dataSource, dataTarget: ds.dataSource, dataChunk: ds.dataChunk, dataParent: ds.dataParent},context);
        }
        if(dataset) {
            if(Array.isArray(dataset)) {
                dataset = await this.performReformation(context,model,dataset);
                dataset = await this.performDataMapper(context,model,{dataSource: ds.dataSource, dataPart: dataset, dataChunk: ds.dataChunk, dataParent: ds.dataParent},{ ...dataindex, currentLength: dataset.length-1});
                for(let index = 0, isz = dataset.length; index < isz; index++) {
                    let data = dataset[index];
                    await this.performDefaultValues(context,model,data,ds.dataSource,ds.dataPart);
                    if(model.fields) {
                        for(let attrname in model.fields) {
                            let field = model.fields[attrname];
                            if(field) {
                                let fieldmodel = field?.options?.model as TaskModel;
                                if(fieldmodel) {
                                    if(!fieldmodel.settings) fieldmodel.settings = { };                                    
                                    fieldmodel.settings.xpath = fieldmodel.settings.xpath || attrname;
                                    data[attrname] = await this.performTransformModel(context,fieldmodel,{dataSource: data, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: data},{parentIndex: dataindex.parentIndex, currentIndex: index, parentLength: data.parentLength, currentLength: isz-1 });
                                }
                            }
                        }
                    }
                    await this.performCalculator(context,model,{dataSource: data, dataPart: dataset, dataChunk: ds.dataChunk, dataParent: ds.dataParent},{parentIndex: dataindex.parentIndex, currentIndex: index, parentLength: data.parentLength, currentLength: isz-1 });
                    await this.performConversion(context,model,data,ds.dataSource);
                    if(model.models && model.models.length > 0) {
                        for(let submodel of model.models) {
                            await this.performTransformation(context,submodel,{dataSource: data, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: data},{parentIndex: index, currentIndex: 0, parentLength: data.parentLength, currentLength: isz-1});
                        }
                    }
                }     
            } else {
                dataset = await this.performDataMapper(context,model,{dataSource: ds.dataSource, dataPart: dataset, dataChunk: ds.dataChunk, dataParent: ds.dataParent},{ ...dataindex, currentLength: 1});
                await this.performDefaultValues(context,model,dataset,ds.dataSource,ds.dataPart);
                if(model.fields) {
                    for(let attrname in model.fields) {
                        let field = model.fields[attrname];
                        if(field) {
                            let fieldmodel = field?.options?.model as TaskModel;
                            if(fieldmodel) {
                                if(!fieldmodel.settings) fieldmodel.settings = { };                                    
                                fieldmodel.settings.xpath = fieldmodel.settings.xpath || attrname;
                                dataset[attrname] = await this.performTransformModel(context,fieldmodel,{dataSource: dataset, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: ds.dataSource},{ ...dataindex, currentLength: 1});
                            }
                        }
                    }
                }
                await this.performCalculator(context,model,{dataSource: dataset, dataPart: [dataset], dataChunk: ds.dataChunk, dataParent: ds.dataParent},{ ...dataindex, currentLength: 1});
                await this.performConversion(context,model,dataset,ds.dataSource);
                if(model.models && model.models.length > 0) {
                    for(let submodel of model.models) {
                        await this.performTransformation(context,submodel,{dataSource: dataset, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: ds.dataSource},{ ...dataindex, currentLength: 1});
                    }
                }
            }
        }
        return dataset;
    }

    //public async performTransformModel(context: KnContextInfo, model: TaskModel, datasource: any, datapart: any, datachunk: any, dataparent: any, dataindex: DataIndex): Promise<any> {
    public async performTransformModel(context: KnContextInfo, model: TaskModel, ds: DataSources, dataindex: DataIndex): Promise<any> {
        let dataset = ds.dataSource;        
        if(model.settings?.xpath && model.settings?.xpath.trim().length > 0) {
            //find out data set from xpath
            dataset = this.scrapeData(model.settings.xpath,{...dataindex, dataSet: ds.dataSource, dataTarget: ds.dataSource, dataChunk: ds.dataChunk, dataParent: ds.dataParent},context);
        }
        if(dataset) {
            dataset = structuredClone(dataset);
            let keyfields = model.fields ? Object.keys(model.fields) : [];
            if(Array.isArray(dataset)) {
                dataset = await this.performReformation(context,model,dataset);
                dataset = await this.performDataMapper(context,model,{dataSource: ds.dataSource, dataPart: dataset, dataChunk: ds.dataChunk, dataParent: ds.dataParent},{ ...dataindex, currentLength: dataset.length-1});
                for(let index = 0, isz = dataset.length; index < isz; index++) {
                    let data = dataset[index];
                    await this.performDefaultValues(context,model,data,ds.dataSource,ds.dataPart);
                    await this.performCalculator(context,model,{dataSource: data, dataPart: dataset, dataChunk: ds.dataChunk, dataParent: ds.dataParent},{parentIndex: dataindex.parentIndex, currentIndex: index, parentLength: data.parentLength, currentLength: isz-1 });
                    await this.performConversion(context,model,data,ds.dataSource);
                    this.omitDataObject(data,keyfields);
                }                     
            } else {
                dataset = await this.performDataMapper(context,model,{dataSource: ds.dataSource, dataPart: dataset, dataChunk: ds.dataChunk, dataParent: ds.dataParent},{ ...dataindex, currentLength: 1});
                await this.performDefaultValues(context,model,dataset,ds.dataSource,ds.dataPart);
                await this.performCalculator(context,model,{dataSource: dataset, dataPart: [dataset], dataChunk: ds.dataChunk, dataParent: ds.dataParent},{ ...dataindex, currentLength: 1});
                await this.performConversion(context,model,dataset,ds.dataSource);
                this.omitDataObject(dataset,keyfields);
            }
        }        
        return dataset;
    }

    //public async performDataMapper(context: KnContextInfo, model: KnModel, datasource: any, dataset: any, datachunk: any, dataparent: any, dataindex: DataIndex): Promise<any> {
    public async performDataMapper(context: KnContextInfo, model: KnModel, ds: DataSources, dataindex: DataIndex): Promise<any> {
        if(!model.fields) return ds.dataPart;
        let paras = this.getContextParameters(context);
        //this.logger.debug(this.constructor.name+".performDataMapper: context parameters",paras);
        if(Array.isArray(ds.dataPart)) {
            for(let index = 0, isz = ds.dataPart.length; index < isz; index++) {
                let data : DataScrape = { parentIndex: dataindex.parentIndex, currentIndex: index, parentLength: dataindex.parentLength, currentLength: isz-1, dataSet: ds.dataSource, dataTarget: ds.dataPart[index], dataChunk: ds.dataChunk, dataParent: ds.dataParent };
                await this.transformDataMapper(context,model,data,paras);
                //await this.transformDataMapper(context,model,datasource,data,paras,datachunk,dataparent);
            }     
        } else {
            let data : DataScrape = { ...dataindex, currentLength: 1, dataSet: ds.dataSource, dataTarget: ds.dataPart, dataChunk: ds.dataChunk, dataParent: ds.dataParent };
            await this.transformDataMapper(context,model,data,paras);
            //await this.transformDataMapper(context,model,datasource,dataset,paras,datachunk,dataparent);
        }
        return ds.dataPart;
    }

    //public transformDataMapper(context: KnContextInfo, model: KnModel, dataSet: any, dataTarget: any, dataParams: any, dataChunk: any, dataParent: any) : any {
    public transformDataMapper(context: KnContextInfo, model: KnModel, data: DataScrape, dataParams: any) : any {
        if(!model.fields) return data.dataTarget;
        let dataStructure = model.fields;
        let dataSpec = {...dataParams,...data.dataTarget};
        let newDataSet : any = {};
        for (let [key, value] of Object.entries(dataStructure)) {
            let mapper = value?.options?.mapper;
            if(mapper) {
                let dataValue = this.scrapeData(mapper,{parentIndex: data.parentIndex, currentIndex: data.currentIndex, parentLength: data.parentLength, currentLength: data.currentLength, 
                    dataSet: data.dataSet, dataTarget: dataSpec, dataChunk: data.dataChunk, dataParent: data.dataParent},context);
                newDataSet[key] = dataValue;
            }
        }    
        return Object.assign(data.dataTarget,newDataSet);
    }

    public async performDefaultValues(context: KnContextInfo, model: KnModel, data: any, dataset: any, datapart?: any): Promise<any> {
        if(model.fields) {
            for(let fname in model.fields) {
                let dbf = model.fields[fname];
                if(dbf.defaultValue) {
                    let [value] = this.parseDefaultValue(dbf.defaultValue,context);
                    data[fname] = value;
                }
                //find out data from datapart by header setting
                let header = dbf?.options?.header;
                if(header && typeof datapart === "object") {
                    if(typeof header === "string") {
                        data[fname] = datapart[header];
                    } else if(typeof header === "object") {
                        if(header?.seqno > 0 && header?.line >= 0) {
                            let fieldname = undefined;
                            let headsettings = model.settings?.header;
                            for(let key in headsettings) {
                                let config = headsettings[key];
                                if(config?.options?.seqno == header.seqno && config?.options?.line == header.line) {
                                    fieldname = key;
                                    break;
                                }
                            }
                            if(fieldname) {
                                data[fname] = datapart[fieldname];
                            }
                        }                            
                    }                    
                }
            }
        }
    }

    public async performReformation(context: KnContextInfo, model: KnModel, dataset: any): Promise<any> {
        //try to reform data in array into json model
        if(model.fields && Array.isArray(dataset)) {
            let newdataset: any = [];
            for(let data of dataset) {
                if(Array.isArray(data)) {
                    let item: any = {};
                    for(let attrname in model.fields) {
                        let field = model.fields[attrname];
                        let arrayIndex = field?.options?.arrayIndex;
                        if(arrayIndex === undefined && field?.options?.seqno) {
                            arrayIndex = field?.options?.seqno - 1;
                        }
                        if(arrayIndex !== undefined) {
                            item[attrname] = data[arrayIndex];
                        }
                    }
                    newdataset.push(item);
                }
            }
            if(newdataset.length > 0) return newdataset;
        }
        return dataset;
    }

    public async performConversion(context: KnContextInfo, model: KnModel, data: any, dataset: any): Promise<any> {
        if(model.fields) {
            for(let attrname in model.fields) {
                let field = model.fields[attrname];
                //try to call handler function
                let handler = field?.options?.handler;
                let func = this.tryParseFunction(handler,'data','dataset','field','model','context');
                if(func) {
                    //ensure handler return value if function or procedure?
                    let alwaysAccept = field?.options?.handlerType == "function";
                    let result = func(data,dataset,field,model,context);
                    if(alwaysAccept) {
                        //check return info {valid: boolean, value: any}
                        if(this.isReturnInfo(result)) {
                            data[attrname] = result.value;
                        } else {
                            data[attrname] = result;
                        }
                    } else {
                        if(result != undefined || result != null) {
                            if(this.isReturnInfo(result)) {
                                data[attrname] = result.value;
                            } else {
                                data[attrname] = result;
                            }
                        }
                    }
                }        
                await this.performFetching(context,model,{name: attrname,field},data,dataset);
            }
        }
        return dataset;
    }

    public async performFetching(context: KnContextInfo, model: KnModel, field: MigrateField, data: any, dataset: any) : Promise<any> {
        let response;
        let connection = field.field?.options?.connection as MigrateConnectSetting;
        if(connection) {
            this.logger.debug(this.constructor.name+".performFetching: connection",connection);
            response = await this.performFetchData(context,model,field,data,dataset);
            this.logger.debug(this.constructor.name+".performFetching: fetch data",response);
        } else {
            let dsmapper = field.field?.options?.datasource;
            if(dsmapper) {
                response = this.scrapeData(dsmapper,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: context.params, dataTarget: context.params, dataChunk: context.params, dataParent: context.params},context);
            }
        }
        let attrname = field.name;
        if(response) {
            let conmapper = connection?.mapper;
            let values = response;
            if(conmapper) {
                values = this.scrapeData(conmapper,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: response, dataTarget: response, dataChunk: response, dataParent: response},context);
                this.logger.debug(this.constructor.name+".performFetching: mapper="+conmapper,", scrapeData=",values);
            }
            if(values) {
                if(Array.isArray(values)) {
                    let confieldname = connection?.fieldname;
                    let confieldvalue = connection?.fieldvalue;
                    if(confieldname && confieldname.trim().length>0 && confieldvalue && confieldvalue.trim().length>0) {
                        let dataValue = data[attrname];
                        for(let record of values) {
                            let value = record[confieldname];
                            if(value == dataValue) {
                                data[attrname] = record[confieldvalue];
                                break;
                            }
                        }
                    }
                } else {
                    let dataValue = data[attrname];
                    let value = values[dataValue];
                    data[attrname] = value;
                }
            }
            let confunc = this.tryParseFunction(connection?.handler,'response','data','dataset','field','model','context');
            if(confunc) {
                let conAccept = connection?.handlerType == "function";
                let conResult = confunc(response,data,dataset,field,model,context);
                if(conAccept) {
                    //check return info {valid: boolean, value: any}
                    if(this.isReturnInfo(conResult)) {
                        data[attrname] = conResult.value;
                    } else {
                        data[attrname] = conResult;
                    }
                } else {
                    if(conResult != undefined || conResult != null) {
                        if(this.isReturnInfo(conResult)) {
                            data[attrname] = conResult.value;
                        } else {
                            data[attrname] = conResult;
                        }
                    }        
                }
            }
        }
    }

    public async performFetchData(context: KnContextInfo, model: KnModel, field: MigrateField, data: any, dataset: any) : Promise<any> {
        let connection = field.field?.options?.connection as MigrateConnectSetting;
        if(connection) {
            let verifyfunc = this.tryParseFunction(connection?.verifier,'data','dataset','field','model','context');
            if(verifyfunc) {
                let verifyAccept = connection?.verifierType == "function";
                let verifyResult = verifyfunc(data,dataset,field,model,context);
                this.logger.debug(this.constructor.name+".performFetchData: field:",field.name,", verifyResult:",verifyResult);
                if(verifyAccept) {
                    //check return info {valid: boolean, value: any}
                    if(this.isReturnInfo(verifyResult)) {
                        context.params.verifier = verifyResult.value;
                        if(!verifyResult.valid) return verifyResult.value;
                    } else {
                        if(typeof verifyResult === 'boolean') {
                            if(!verifyResult) return verifyResult;
                        }
                    }
                } else {
                    if(verifyResult != undefined || verifyResult != null) {
                        if(this.isReturnInfo(verifyResult)) {
                            context.params.verifier = verifyResult.value;
                            if(!verifyResult.valid) return verifyResult.value;
                        } else {
                            if(typeof verifyResult === 'boolean') {
                                if(!verifyResult) return verifyResult;
                            }
                        }
                    }        
                }
            }
            let type = connection?.type;
            if(type=="API") {
                return await this.performRequestAPI(context,field,connection,data);
            } else if(type=="DB") {
                return await this.performRequestDB(context,field,connection,data);
            }
        }
        return undefined;
    }

    public async performRequestDB(context: KnContextInfo, field: MigrateField, config: MigrateConnectSetting, data: any) : Promise<KnRecordSet | undefined> {
        if(config.query) {
            //try to get from cache
            if(!context.options) context.options = {};
            let hash = this.toHashString(config.schema+config.query);
            let response = context.options[hash];
            if(response) return response;
            let values = [];
            let knsql = new KnSQL();
            knsql.append(config.query);
            let [sql,paramnames] = knsql.getExactlySql(config?.alias);
            if(paramnames && paramnames.length > 0) {
                for(let name of paramnames) {
                    let value = context.params[name];
                    if(typeof value === 'undefined') value = data[name];
                    knsql.set(name,value);
                    values.push(value);
                }
            }    
            if(config?.parameters && config?.parameters.length > 0) {
                for(let pr of config.parameters) {
                    let [value,found] = this.parseDefaultValue(pr?.defaultValue,context);
                    if(found) {
                        knsql.set(pr.name,value);
                        values.push(value);
                    }
                }
            }
            if(values.length > 0) {
                hash = this.toHashString(config.schema+config.query+values.join(''));
                response = context.options[hash];
                if(response) return response;
            }
            let cfg = await this.getConnectionConfig(context,config?.connectid);
            let db = cfg ? this.getConnector(cfg) : this.getConnector(config);
            try {
                let rs = await knsql.executeQuery(db,context);
                let records = this.createRecordSet(rs);
                this.logger.debug(this.constructor.name+".performRequestDB: field:",field.name,", resultset:",records);
                //try to set cache by context options
                context.options[hash] = records;
                return records;
            } catch(ex: any) {
                this.logger.error(ex);
                return Promise.reject(this.getDBError(ex));
            } finally {
                if(db) db.close();
            }
        }
        return undefined;
    }

    public async performRequestAPI(context: KnContextInfo, field: MigrateField, configure: MigrateConnectSetting, data: any) : Promise<any> {
        let config = configure;
        let cfg = await this.getConnectionConfig(context,configure?.connectid);        
        if(cfg) {
            let { api, setting, body } = cfg;
            config = { ...configure, api, setting, body };
        }
        if(config?.api) {
            if(!context.options) context.options = {};
            //try to get from cache
            let databody = config?.body || {};
            let body = { ...databody };
            let hash = this.toHashString(config.api+JSON.stringify(body));
            let response = context.options[hash];
            if(response) return response;
            let values : any[] = [];
            this.scrapeDataValues(context,body,data,values);
            if(config?.parameters && config?.parameters.length > 0) {
                for(let pr of config.parameters) {
                    let [value,found] = this.parseDefaultValue(pr?.defaultValue,context);
                    if(found) {
                        body[pr.name] = value;
                        values.push(value);
                    }
                }
            }
            if(values.length > 0) {
                hash = this.toHashString(config.api+JSON.stringify(body)+values.join(''));
                response = context.options[hash];
                if(response) return response;
            }
            //when not found from cache, try to make request
            let setting = config?.setting || {};
            let headers = { ...setting };
            this.scrapeDataValues(context,headers,data,[]);
            this.logger.debug(this.constructor.name+".performRequestAPI: context params",context.params);
            response = await this.requestAPI(config.api,headers,body,config);
            this.logger.debug(this.constructor.name+".performRequestAPI: field:",field.name,", response:",response);
            if(response) {
                //try to set cache by context options
                context.options[hash] = response;
            }
            return response;
        }
        return undefined;
    }

    public async requestAPI(url: string, headers: any = {}, data: any = {}, config: any) : Promise<any> {
        let body = JSON.stringify(data);
        let params = {};
        this.logger.debug(this.constructor.name+".requestAPI: fetch : url=",url,", body=",body,", headers=",headers);
        try {
            let method = headers?.method || "POST";
            if(headers?.method) delete headers.method;
            let request = "GET" == method || "HEAD" == method ? { method: method, headers: { "Content-Type": "application/json", ...headers } } : { method: method, headers: { "Content-Type": "application/json", ...headers }, body };
            if("GET" == method && Object.keys(data).length > 0) {
                let querystr = querystring.stringify(data);
                url = url + "?" + querystr;
            }
            let response = await fetch(url, Object.assign(Object.assign({}, params), request));
            if (!response.ok) {
                let msg = "Response error";
                this.logger.debug(this.constructor.name+".requestAPI: response not ok:",msg);
                throw new Error(`[${response.status}] ${msg}`);
            }
            const contenttype = response.headers.get("content-type");
            this.logger.debug(this.constructor.name+".requestAPI: content-type",contenttype);
            if(contenttype) {
                if(contenttype.includes("application/json")) {
                    return await response.json();
                } else if (contenttype.includes("application/xml") || contenttype.includes("text/xml") || config?.options?.acceptType == 'text/xml') {
                    let xml = await response.text();
                    let data = this.tryParseXmlToJSON(xml);
                    //in case of manual check error (api always response ok)
                    if(config?.options?.errorChecker && config?.options?.errorCheckerValue) {
                        let checkerValue = this.scrapeData(config.options.errorChecker,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: data, dataTarget: data, dataChunk: data, dataParent: data});
                        if(checkerValue) {
                            if(config.options.errorCheckerValue.includes(checkerValue)) {
                                let msg = "Request error";
                                if(config?.options?.errorCheckerMessage) {
                                    let checkerMessage = this.scrapeData(config?.options?.errorCheckerMessage,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: data, dataTarget: data, dataChunk: data, dataParent: data});
                                    if(checkerMessage) msg = checkerMessage;
                                }
                                this.logger.debug(this.constructor.name+".requestAPI: request error:",msg);
                                throw new Error(msg);
                            }
                        }
                    }
                    return data;
                }
            }
            return await response.json();
        } catch (ex: any) {
            this.logger.error(this.constructor.name+".requestAPI: error:",ex);
            return Promise.reject(new VerifyError(ex.message,HTTP.INTERNAL_SERVER_ERROR,-11102));
        } 
    }

    public async performPrecedent(context: KnContextInfo, task: MigrateTask, model: KnModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<any> {
        let precedent = model.settings?.precedent;        
        if(precedent) {
            let handler = precedent?.handler;
            let func = this.tryParseFunction(handler,'dataset','param','model','context');
            if(func) {
                let res = func(dataset,param,model,context);
                //expect boolean as result or {valid: boolean, value: any}
                if(this.isReturnInfo(res)) {
                    if(!res.valid) return res;
                } else {
                    if(res != undefined || res != null) {
                        if(this.isReturnInfo(res)) {
                            if(!res.valid) return res;
                        } else {
                            if(!res) return res;        
                        }
                    }
                }
            }            
            let data = dataset;
            if(Array.isArray(dataset)) data = { };
            let dbfield : KnDBField = { type: "STRING", options: { connection: precedent?.connection }};
            let field : MigrateField = { name: "precedent", field: dbfield };
            let response = await this.performFetchData(context,this.model,field,data,dataset);
            this.logger.debug(this.constructor.name+".performPrecedent: fetch data",response);
            if(response) {
                let conmapper = field.field.options?.connection?.mapper;
                let values = response;
                if(conmapper) {
                    values = this.scrapeData(conmapper,{parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet:response, dataTarget:response, dataChunk:response, dataParent:response});
                }
                this.logger.debug(this.constructor.name+".performPrecedent: mapper="+conmapper,", scrapeData=",values);
                let paravalues = context.params[field.name] || {};
                for(let p in values) {
                    paravalues[p] = values[p];
                }
                context.params[field.name] = paravalues;
                this.logger.debug(this.constructor.name+".performPrecedent: context.params",context.params);
            }
        }
    }

    public async performSuccedent(context: KnContextInfo, task: MigrateTask, model: KnModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<any> {
        let succedent = model.settings?.succedent;        
        if(succedent) {
            let handler = succedent?.handler;
            let func = this.tryParseFunction(handler,'dataset','param','model','context');
            if(func) {
                let res = func(dataset,param,model,context);
                //expect boolean as result or {valid: boolean, value: any}
                if(this.isReturnInfo(res)) {
                    if(!res.valid) return res;
                } else {
                    if(res != undefined || res != null) {
                        if(this.isReturnInfo(res)) {
                            if(!res.valid) return res;
                        } else {
                            if(!res) return res;        
                        }
                    }
                }
            }            
            let data = dataset;
            if(Array.isArray(dataset)) data = { };
            let dbfield : KnDBField = { type: "STRING", options: { connection: succedent?.connection }};
            let field : MigrateField = { name: "succedent", field: dbfield };
            let response = await this.performFetchData(context,this.model,field,data,dataset);
            this.logger.debug(this.constructor.name+".performSuccedent: fetch data",response);
        }
    }

    public async performCalculator(context: KnContextInfo, model: KnModel, ds: DataSources, dataindex: DataIndex): Promise<any> {
        if(model.fields) {
            for(let attrname in model.fields) {
                let field = model.fields[attrname];
                let calculate = field?.options?.calculate;
                if(calculate) {
                    let funresult = await this.performCalculateFunctional(context,model,ds,dataindex,calculate);
                    let expression = calculate.expr as string;
                    if(expression && expression.trim().length > 0) {
                        //reserved variable initialize and calculate for auto data binding
                        let dataset : any = { initialize: context.params.initialize, calculate : funresult };
                        for(let p in ds.dataSource) {
                            dataset[p] = ds.dataSource[p];
                        }
                        let datavalue = await this.performCalculateExpression(context,model,{dataSource: dataset, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: ds.dataParent},dataindex,expression,calculate.verify);
                        ds.dataSource[attrname] = datavalue;
                    }
                }
            }
        }
        return ds.dataSource;
    }

    public async performCalculateExpression(context: KnContextInfo, model: KnModel, ds: DataSources, dataindex: DataIndex, expression: string, verify: boolean = true): Promise<any> {
        if(expression && expression.trim().length > 0) {
            const variables = this.getExpressionVariables(expression);
            //this.logger.debug(this.constructor.name+".performCalculateExpression: variables",variables);
            if(variables && variables.length > 0) {
                let datavalues : any = {};
                for(let varname of variables) {
                    let mapvalue = this.scrapeData(varname,{...dataindex, dataSet: ds.dataSource, dataTarget: ds.dataSource, dataChunk: ds.dataChunk, dataParent: ds.dataParent},context);                                
                    if(mapvalue === undefined || mapvalue === null) mapvalue = 0;
                    else if(typeof mapvalue === 'string') mapvalue = Utilities.parseFloat(mapvalue,0);
                    datavalues[varname] = mapvalue;
                }
                const evaluatedExpression = expression.replace(variablePattern, (substr: string, varName: string) => {
                    return datavalues[varName].toString();
                });
                //this.logger.debug(this.constructor.name+".performCalculateExpression: expression",expression,", evaluated",evaluatedExpression);
                try {
                    let value = evaluate(evaluatedExpression);
                    if(isFinite(value)) return value;
                    if(isNaN(value)) return value;
                } catch(ex) { 
                    if(verify) {
                        throw ex;
                    }
                }
            }
        }
        return undefined;
    }

    protected getExpressionVariables(expression: string) : string[] {
        const variables = [...expression.matchAll(variablePattern)].map(match => match[1]);
        if(variables && variables.length > 0) {
            return Array.from(new Set(variables));
        }
        return variables;
    }

    public async performCalculateFunctional(context: KnContextInfo, model: KnModel, ds: DataSources, dataindex: DataIndex, calculate: any): Promise<any> {
        if(calculate) {
            let result : any = {};
            if(calculate.sum) {
                let expression = calculate.sum.expr as string;
                let mapname = calculate.sum.mapper || "@current_dataset";
                if((mapname && mapname.trim().length > 0) && (expression && expression.trim().length > 0)) {
                    //try to find out data array from mapper setting
                    let mapvalues = "@current_dataset" == mapname ? ds.dataPart : this.scrapeData(mapname,{...dataindex, dataSet: ds.dataSource, dataTarget: ds.dataSource, dataChunk: ds.dataChunk, dataParent: ds.dataParent},context);
                    if(mapvalues && Array.isArray(mapvalues)) {
                        result.sum_count = mapvalues.length;
                        let values = 0;
                        for(let mapvalue of mapvalues) {
                            let datavalue = await this.performCalculateExpression(context,model,{dataSource: mapvalue, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: ds.dataParent},dataindex,expression,calculate.verify);
                            if(typeof datavalue === 'number') values += datavalue;
                        }
                        result.sum = values;
                    }
                }
            }
            if(calculate.avg) {
                let expression = calculate.avg.expr as string;
                let mapname = calculate.avg.mapper || "@current_dataset";
                if((mapname && mapname.trim().length > 0) && (expression && expression.trim().length > 0)) {
                    let mapvalues = "@current_dataset" == mapname ? ds.dataPart : this.scrapeData(mapname,{...dataindex, dataSet: ds.dataSource, dataTarget: ds.dataSource, dataChunk: ds.dataChunk, dataParent: ds.dataParent},context);
                    if(mapvalues && Array.isArray(mapvalues)) {
                        result.avg_count = mapvalues.length;
                        let values = 0;
                        for(let mapvalue of mapvalues) {
                            let datavalue = await this.performCalculateExpression(context,model,{dataSource: mapvalue, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: ds.dataParent},dataindex,expression,calculate.verify);
                            if(typeof datavalue === 'number') values += datavalue;
                        }
                        result.avg = values / result.avg_count;
                    }
                }
            }
            if(calculate.min) {
                let expression = calculate.min.expr as string;
                let mapname = calculate.min.mapper || "@current_dataset";
                if((mapname && mapname.trim().length > 0) && (expression && expression.trim().length > 0)) {
                    //try to find out data array from mapper setting
                    let mapvalues = "@current_dataset" == mapname ? ds.dataPart : this.scrapeData(mapname,{...dataindex, dataSet: ds.dataSource, dataTarget: ds.dataSource, dataChunk: ds.dataChunk, dataParent: ds.dataParent},context);
                    if(mapvalues && Array.isArray(mapvalues)) {
                        result.min_count = mapvalues.length;
                        let values = undefined;
                        for(let mapvalue of mapvalues) {
                            let datavalue = await this.performCalculateExpression(context,model,{dataSource: mapvalue, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: ds.dataParent},dataindex,expression,calculate.verify);
                            if(typeof datavalue === 'number') {
                                if(values === undefined) values = datavalue;
                                if(values > datavalue) values = datavalue;
                            }
                        }
                        result.min = values;
                    }
                }
            }
            if(calculate.max) {
                let expression = calculate.max.expr as string;
                let mapname = calculate.max.mapper || "@current_dataset";
                if((mapname && mapname.trim().length > 0) && (expression && expression.trim().length > 0)) {
                    //try to find out data array from mapper setting
                    let mapvalues = "@current_dataset" == mapname ? ds.dataPart : this.scrapeData(mapname,{...dataindex, dataSet: ds.dataSource, dataTarget: ds.dataSource, dataChunk: ds.dataChunk, dataParent: ds.dataParent},context);
                    if(mapvalues && Array.isArray(mapvalues)) {
                        result.max_count = mapvalues.length;
                        let values = undefined;
                        for(let mapvalue of mapvalues) {
                            let datavalue = await this.performCalculateExpression(context,model,{dataSource: mapvalue, dataPart: ds.dataPart, dataChunk: ds.dataChunk, dataParent: ds.dataParent},dataindex,expression,calculate.verify);
                            if(typeof datavalue === 'number') {
                                if(values === undefined) values = datavalue;
                                if(values < datavalue) values = datavalue;
                            }
                        }
                        result.max = values;
                    }
                }
            }
            if(calculate.count) {
                let mapname = calculate.count.mapper || "@current_dataset";
                if(mapname && mapname.trim().length > 0) {
                    let mapvalues = "@current_dataset" == mapname ? ds.dataPart : this.scrapeData(mapname,{...dataindex, dataSet: ds.dataSource, dataTarget: ds.dataSource, dataChunk: ds.dataChunk, dataParent: ds.dataParent},context);
                    if(mapvalues && Array.isArray(mapvalues)) {
                        result.count = mapvalues.length;
                    }
                }
            }
            return result;
        }
        return undefined;
    }

}
