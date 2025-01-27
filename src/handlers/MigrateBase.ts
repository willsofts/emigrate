import { v4 as uuid } from 'uuid';
import { HTTP } from "@willsofts/will-api";
import { KnDBField, KnModel, KnOperation } from "@willsofts/will-db";
import { KnRecordSet, KnSQL } from "@willsofts/will-sql";
import { KnContextInfo, KnValidateInfo } from '@willsofts/will-core';
import { VerifyError } from "@willsofts/will-core";
import { TknProcessHandler } from "@willsofts/will-serv";
import { PRIVATE_SECTION } from "../utils/EnvironmentVariable";
import { MigrateConfig, MigrateModel, RefConfig } from "../models/MigrateAlias";
import config from "@willsofts/will-util";
const crypto = require('crypto');

export const CHARACTER_SET = ['@','#','$','%','^','&','*','(',')','-','_','+','=','/','\\',':',';','|','[',']','{','}','<','>','?','.',',','"','\''];

export class MigrateBase extends TknProcessHandler {
    public section = PRIVATE_SECTION;
    public model : KnModel = { name: "tmigrate", alias: { privateAlias: this.section } };
    
    protected validateRequireFields(context: KnContextInfo, model: KnModel, action?: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"taskid");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    protected override async doInsert(context: KnContextInfo, model: KnModel) : Promise<KnRecordSet> {
        await this.validateRequireFields(context, model, KnOperation.INSERT);
        let rs = await this.doInserting(context, model);
        return await this.createCipherData(context, KnOperation.INSERT, rs);
    }

    public transformDataMapper(model: MigrateModel, dataSet: any, dataTarget: any) : any {
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

    public parseDefaultValue(defaultValue: string) : [any,boolean] {
        if("#current_date"==defaultValue || "#current_time"==defaultValue || "#current_timestamp"==defaultValue) {
            return [new Date(),true];
        } else if("#current_uuid"==defaultValue) {
            return [uuid(),true];
        } else if("#current_user"==defaultValue) {
            return [this.userToken?.userid,true];
        } else if("#current_site"==defaultValue) {
            return [this.userToken?.site,true];
        } else {
            if(defaultValue) {
                if(defaultValue.trim().length==0) {
                    return [defaultValue,true];
                }
                if(CHARACTER_SET.includes(defaultValue.trim())) return [defaultValue,true];
                if(defaultValue.length>1 && defaultValue.charAt(0)=='#') {
                    return [defaultValue.substring(1),true];
                }
            }
        }
        return [defaultValue,false];
    }

    public async performDefaultValues(context: KnContextInfo, model: KnModel, data: any, dataset: any): Promise<any> {
        if(model.fields) {
            for(let fname in model.fields) {
                let dbf = model.fields[fname];
                if(dbf.defaultValue) {
                    let [value] = this.parseDefaultValue(dbf.defaultValue);
                    data[fname] = value;
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
                        if(arrayIndex !== undefined && Array.isArray(data)) {
                            item[attrname] = data[arrayIndex];
                        }
                    }
                    newdataset.push(item);
                }
            }
            if(newdataset.length>0) return newdataset;
        }
        return dataset;
    }

    public async performConversion(context: KnContextInfo, model: KnModel, data: any, dataset: any): Promise<any> {
        if(model.fields) {
            for(let attrname in model.fields) {
                let field = model.fields[attrname];
                let arrayIndex = field?.options?.arrayIndex;
                if(arrayIndex !== undefined && Array.isArray(data)) {
                }
                //try to call handler function
                let handler = field?.options?.handler;
                let func = this.tryParseFunction(handler,'data','dataset','model','context');
                if(func) {
                    //ensure handler return value if function or procedure?
                    let alwaysAccept = field?.options?.handlerType == "function";
                    let result = func(data,dataset,model,context);
                    //console.log("function return:",result);
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
                    let response = await this.performFetchData(context,model,data,dataset,field);
                    this.logger.debug(this.constructor.name+".performConversion: fetch data",response);
                    if(response) {
                        let conmapper = connection?.mapper;
                        this.logger.debug(this.constructor.name+".performConversion: mapper="+conmapper+", data:",data);
                        let values = response;
                        if(conmapper) {
                            values = this.scrapeData(conmapper,response,response);
                        }
                        this.logger.debug(this.constructor.name+".performConversion: scrapeData=",values);
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
    
    public async performFetchData(context: KnContextInfo, model: KnModel, data: any, dataset: any, field: KnDBField) : Promise<any> {
        let connection = field?.options?.connection as MigrateConfig;
        if(connection) {
            let type = connection?.type;
            if(type=="API") {
                return await this.performRequestAPI(context,connection);
            } else if(type=="DB") {
                return await this.performRequestDB(context,connection);
            }
        }
        return undefined;
    }

    public async performRequestDB(context: KnContextInfo, config: MigrateConfig) : Promise<KnRecordSet | undefined> {
        if(config.query) {
            //try to get from cache
            if(!context.options) context.options = {};
            let hash = this.toHashString(config.schema+config.query);
            let response = context.options[hash];
            if(response) return response;
            let db = this.getConnector(config);
            try {
                let knsql = new KnSQL();
                knsql.append(config.query);
                let rs = await knsql.executeQuery(db,context);
                let records = this.createRecordSet(rs);
                this.logger.debug(this.constructor.name+".performRequestDB: resultset:",records);
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

    public async performRequestAPI(context: KnContextInfo, config: MigrateConfig) : Promise<any> {
        let api = config?.api;
        if(!context.options) context.options = {};
        //try to get from cache
        let body = config?.body || {}
        let hash = this.toHashString(api+JSON.stringify(body));
        let response = context.options[hash];
        if(!response && api) {
            //when not found from cache, try to make request
            response = await this.requestAPI(api,config?.setting,config?.body);
            this.logger.debug(this.constructor.name+".performRequestAPI: response:",response);
            if(response) {
                //try to set cache by context options
                context.options[hash] = response;
            }
        }
        return response;
    }

    public async requestAPI(url: string, headers: any = {}, data: any = {}) : Promise<any> {
        let body = JSON.stringify(data);
        let params = {};
        this.logger.debug(this.constructor.name+".requestAPI: fetch : url=",url," body=",body," headers=",headers);
        try {
            let response = await fetch(url, Object.assign(Object.assign({}, params), { method: "POST", headers: {
                    "Content-Type": "application/json", ...headers
                }, body }));
            if (!response.ok) {
                let msg = "Response error";
                this.logger.debug(this.constructor.name+".requestAPI: response not ok:",msg);
                throw new Error(`[${response.status}] ${msg}`);
            }
            return await response.json();
        } catch (ex: any) {
            this.logger.error(this.constructor.name+".requestAPI: error:",ex);
            return Promise.reject(new VerifyError(ex.message,HTTP.INTERNAL_SERVER_ERROR,-11102));
        } 
    }

    public async performInserting(context: KnContextInfo, model: KnModel, dataset: any): Promise<KnRecordSet> {
        let db = this.getPrivateConnector(model);
        try {
            let result = this.createRecordSet();
            await db.beginWork();
            if(Array.isArray(dataset)) {
                for(let data of dataset) {
                    context.params = data;
                    let rs = await this.performCreating(context, model, db);
                    let rss = this.createRecordSet(rs);
                    result.records += rss.records;
                }
            } else {
                context.params = dataset;
                let rs = await this.performCreating(context, model, db);
                let rss = this.createRecordSet(rs);
                result.records += rss.records;
            }
            await db.commitWork();
            return result;
        } catch(ex: any) {
            this.logger.error(ex);
            db.rollbackWork().catch(ex => this.logger.error(ex));
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public tryParseFunction(handler: any, ...args: string[]) : Function | undefined {
        let func : Function | undefined = handler;
        if(handler && (typeof handler == 'string')) {
            let funbody = handler.match(/{([\s\S]*)}/);
            if(funbody && funbody.length>0) {
                let text = funbody[1];
                text = text.replace(/\n/g, ' ');
                //console.log("function text",text);
                func = new Function(...args,text);
            }
        }
        return func;
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

    public toHashString(texts: string) : string {
        if(texts && texts.trim().length>0) {
            return crypto.createHash('md5').update(texts).digest('hex');
        }
        return texts;
    }

}
