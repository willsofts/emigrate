import { HTTP } from "@willsofts/will-api";
import { KnDBField, KnModel } from "@willsofts/will-db";
import { KnRecordSet, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo, VerifyError } from '@willsofts/will-core';
import { MigrateBase } from "./MigrateBase";
import { RefConfig, MigrateConfig, MigrateRecordSet, MigrateInfo, MigrateReject, MigrateParams, MigrateField } from "../models/MigrateAlias";
import { MigrateLogHandler } from "./MigrateLogHandler";
import config from "@willsofts/will-util";

export class MigrateOperate extends MigrateBase {
    
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
            errormessage = this.getDBError(reject.throwable).message;
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
        let params = {authtoken: param.authtoken, ...mrs, processstatus: "ERROR", errormessage: err.message };
        if(param.calling) {
            this.call("migratelog.update",params).catch(ex => this.logger.error(ex));
        } else {
            let handler = new MigrateLogHandler();
            handler.obtain(this.broker,this.logger);
            handler.userToken = this.userToken;
            handler.update({params: params, meta: context.meta}).catch(ex => this.logger.error(ex));
        }
    }

    public async performTransformation(context: KnContextInfo, model: KnModel, datasource: any, datapart?: any): Promise<any> {
        let dataset = datasource;        
        if(model.settings?.xpath && model.settings?.xpath.trim().length>0) {
            //find out data set from xpath
            dataset = this.scrapeData(model.settings.xpath,datasource,datasource);
        }
        if(Array.isArray(dataset)) {
            dataset = await this.performReformation(context,model,dataset);
            dataset = await this.performDataMapper(context,model,datasource,dataset);
            for(let data of dataset) {
                await this.performDefaultValues(context,model,data,datasource,datapart);
                await this.performConversion(context,model,data,datasource);
            }     
        } else {
            dataset = await this.performDataMapper(context,model,datasource,dataset);
            await this.performDefaultValues(context,model,dataset,datasource,datapart);
            await this.performConversion(context,model,dataset,datasource);
        }
        //this.logger.debug(this.constructor.name+".performTransformation: dataset",dataset);
        return dataset;
    }

    public transformDataMapper(model: KnModel, dataSet: any, dataTarget: any) : any {
        if(!model.fields) return dataTarget;
        let dataStructure = model.fields;
        let newDataSet : any = {};
        for (let [key, value] of Object.entries(dataStructure)) {
            let mapper = (value as any)?.options?.mapper;
            if(mapper) {
                let dataValue = this.scrapeData(mapper,dataSet,dataTarget);
                newDataSet[key] = dataValue;
            }
        }    
        return Object.assign(dataTarget,newDataSet);
    }

    public scrapeData(mapper: string | RefConfig | Array<string|RefConfig>, dataSet: any, dataTarget: any) : any {
        let results = undefined;
        if(Array.isArray(mapper)) {
            for(let item of mapper) {
                if(typeof item === 'string') {
                    let value = this.scratchData(item, dataSet, dataTarget);
                    if(value!=undefined || value!=null) {
                        results = ( results ?? "" ) + value;
                    }
                } else {
                    let prefix = item.ref == '$' || item.ref == '.' ? '' : item.ref;
                    let value = this.scratchData(prefix + item.name, dataSet, dataTarget); 
                    if(value!=undefined || value!=null) {
                        results = ( results ?? "" ) + value;
                    }
                }
            }
        } else {
            if(typeof mapper === 'string') {
                results = this.scratchData(mapper, dataSet, dataTarget);
            } else {
                let prefix = mapper.ref == '$' || mapper.ref == '.' ? '' : mapper.ref;
                results = this.scratchData(prefix + mapper.name, dataSet, dataTarget);
            }
        }
        return results;
    }

    public scratchData(mapper: string, dataSet: any, dataTarget: any) : any {
        if(mapper && mapper.trim().length>0) {
            // % = environment variable, @ = find out from root tag, $ or . = find out from current node
            let firstchar = mapper.charAt(0);
            let configTag = firstchar=="%";
            let reservedTag = firstchar=='$' || firstchar=='.';
            let rootTag = firstchar=='@'; 
            if(rootTag || reservedTag || configTag) {
                mapper = mapper.substring(1);
            }
            if(configTag) {
                return config.env(mapper);
            }
            let path = mapper.split('.');
            //find out data in array at index specified
            let regex = new RegExp(`\\[(\\d+)\\]$`);
            let results = path.reduce((item: any, part: any) => { 
                let match = part.match(regex); 
                if (match && match[1]) {
                    let index = parseInt(match[1], 10);
                    let idx = part.lastIndexOf('[');
                    let token = part.substring(0,idx);
                    let array = item[token];
                    if(Array.isArray(array) && array.length>index) {
                        return array[index];
                    }
                }                
                let [value,flag] = this.parseDefaultValue(part);
                if(flag) return value;
                let rs = item && item[part]; 
                return rs; 
            }, rootTag ? dataSet : dataTarget);        
            return results;
        }
        return mapper;
    }

    public async performDataMapper(context: KnContextInfo, model: KnModel, datasource: any, dataset: any): Promise<any> {
        if(!model.fields) return dataset;        
        if(Array.isArray(dataset)) {
            for(let data of dataset) {
                await this.transformDataMapper(model,datasource,data);
            }     
        } else {
            await this.transformDataMapper(model,datasource,dataset);
        }
        return dataset;
    }

    public async performDefaultValues(context: KnContextInfo, model: KnModel, data: any, dataset: any, datapart?: any): Promise<any> {
        if(model.fields) {
            for(let fname in model.fields) {
                let dbf = model.fields[fname];
                if(dbf.defaultValue) {
                    let [value] = this.parseDefaultValue(dbf.defaultValue);
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
                        if(arrayIndex === undefined && field?.options?.seqno) arrayIndex = field?.options?.seqno - 1;
                        if(arrayIndex !== undefined && Array.isArray(data)) {
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
                let func = this.tryParseFunction(handler,'data','dataset','model','context');
                if(func) {
                    //ensure handler return value if function or procedure?
                    let alwaysAccept = field?.options?.handlerType == "function";
                    let result = func(data,dataset,model,context);
                    if(alwaysAccept) {
                        data[attrname] = result;
                    } else {
                        if(result != undefined || result != null) {
                            data[attrname] = result;
                        }
                    }
                }                
                let connection = field?.options?.connection;
                if(connection) {
                    this.logger.debug(this.constructor.name+".performConversion: connection",connection);
                    let response = await this.performFetchData(context,model,{name: attrname,field},data,dataset);
                    this.logger.debug(this.constructor.name+".performConversion: fetch data",response);
                    if(response) {
                        let conmapper = connection?.mapper;
                        let values = response;
                        if(conmapper) {
                            values = this.scrapeData(conmapper,response,response);
                        }
                        this.logger.debug(this.constructor.name+".performConversion: mapper="+conmapper,", scrapeData=",values);
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
                        let conhandler = connection?.handler;
                        let confunc = this.tryParseFunction(conhandler,'response','data','dataset','model','context');
                        if(confunc) {
                            let conAccept = connection?.handlerType == "function";
                            let conresult = confunc(response,data,dataset,model,context);
                            if(conAccept) {
                                data[attrname] = conresult;
                            } else {
                                if(conresult != undefined || conresult != null) {
                                    data[attrname] = conresult;
                                }        
                            }
                        }
                    }
                }
            }
        }
        return dataset;
    }
    
    public async performFetchData(context: KnContextInfo, model: KnModel, field: MigrateField, data: any, dataset: any) : Promise<any> {
        let connection = field.field?.options?.connection as MigrateConfig;
        if(connection) {
            let type = connection?.type;
            if(type=="API") {
                return await this.performRequestAPI(context,field,connection,data);
            } else if(type=="DB") {
                return await this.performRequestDB(context,field,connection,data);
            }
        }
        return undefined;
    }

    public async performRequestDB(context: KnContextInfo, field: MigrateField, config: MigrateConfig, data: any) : Promise<KnRecordSet | undefined> {
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
                    let [value,found] = this.parseDefaultValue(pr?.defaultValue);
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
            let db = this.getConnector(config);
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

    protected assignRequestBody(body: any, data: any, values: any[]) {
        for(let key in body) {
            let value = body[key];
            if(typeof value === 'string') {
                if(value.length > 0 && value.charAt(0) == '?') {
                    value = value.substring(1);
                    body[key] = data[value];
                    values.push(data[value]);
                }    
            } else if(typeof value === 'object') {
                this.assignRequestBody(value,data,values);
            }
        }
    }

    public async performRequestAPI(context: KnContextInfo, field: MigrateField, config: MigrateConfig, data: any) : Promise<any> {
        if(config?.api) {
            if(!context.options) context.options = {};
            //try to get from cache
            let databody = config?.body || {};
            let body = { ... databody };
            let hash = this.toHashString(config.api+JSON.stringify(body));
            let response = context.options[hash];
            if(response) return response;
            let values : any[] = [];
            this.assignRequestBody(body,data,values);
            if(config?.parameters && config?.parameters.length > 0) {
                for(let pr of config.parameters) {
                    let [value,found] = this.parseDefaultValue(pr?.defaultValue);
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
            let headers = config?.setting || {};
            response = await this.requestAPI(config.api,{...headers},body,config);
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
                        let checkerValue = this.scrapeData(config.options.errorChecker,data,data);
                        if(checkerValue) {
                            if(config.options.errorCheckerValue.includes(checkerValue)) {
                                let msg = "Request error";
                                if(config?.options?.errorCheckerMessage) {
                                    let checkerMessage = this.scrapeData(config?.options?.errorCheckerMessage,data,data);
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

}
