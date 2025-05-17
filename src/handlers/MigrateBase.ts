import { v4 as uuid } from 'uuid';
import { HTTP } from "@willsofts/will-api";
import { KnModel, KnParamInfo, KnSQLUtils } from "@willsofts/will-db";
import { KnContextInfo, VerifyError } from "@willsofts/will-core";
import { KnDBConnector, KnDBFault, KnSQL, KnDBUtils, KnDBTypes, KnResultSet } from "@willsofts/will-sql";
import { TknOperateHandler } from "@willsofts/will-serv";
import { PRIVATE_SECTION, MIGRATE_DUMP_SQL } from "../utils/EnvironmentVariable";
import { MigrateConnectSetting, RefConfig, MigrateFault, DataScrape } from "../models/MigrateAlias";
import { MigrateDate } from "../utils/MigrateDate";
import { MigrateUtility } from '../utils/MigrateUtility';
import config from "@willsofts/will-util";

const crypto = require('crypto');

export const CHARACTER_SET = ['@','#','$','%','^','&','*','(',')','-','_','+','=','/','\\',':',';','|','[',']','{','}','<','>','?','.',',','"','\''];

export class MigrateBase extends TknOperateHandler {
    public dateparser = new MigrateDate();
    public section = PRIVATE_SECTION;
    public model : KnModel = { name: "tmigrate", alias: { privateAlias: this.section } };
    public dumping: boolean = MIGRATE_DUMP_SQL;
    public progid: string = "migrate";
    
    protected override doClearing(context: KnContextInfo, model: KnModel): Promise<KnResultSet> {
        return this.notImplementation();
    }

    public randomUUID() : string {
        return uuid();
    }
    
    public getDBFault(err: any, state: string = "", code: number = -32000) : KnDBFault | VerifyError {
        if(err instanceof VerifyError) return err;
        return new MigrateFault(this.getSQLError(err),code,state,err?.stack);
    }

    public isEmptyObject(data: any) : boolean {
        //check empty array of empty object
        if(data) {
            if(Array.isArray(data) && data.length == 0) {
                return true;
            } if(typeof data === "object" && Object.keys(data).length == 0) {
                return true;
            }
        }
        return false;
    }

    public omitDataObject(data: any, keys: string[]) : any {
        for (let key in data) {
            if (!keys.includes(key)) {
                delete data[key];
            }
        }
        return data;    
    }

    public isReturnInfo(object: any) : boolean {
        if(object) {
            if(object.hasOwnProperty('valid') && object.hasOwnProperty('value')) {
                return true;
            }
        }
        return false;
    }

    public parseDefaultValue(defaultValue: string | undefined, context?: KnContextInfo) : [any,boolean] {
        if("#current_date"==defaultValue || "#current_time"==defaultValue || "#current_timestamp"==defaultValue || "#systemdate"==defaultValue || "#systemtime"==defaultValue || "#systemtimestamp"==defaultValue || "#kndate"==defaultValue) {
            return [new Date(),true];
        } else if("#current_uuid"==defaultValue || "#uuid"==defaultValue || "#guid"==defaultValue || "#newid"==defaultValue) {
            return [uuid(),true];
        } else if("#current_user"==defaultValue || "#knuser"==defaultValue) {
            return [this.userToken?.userid,true];
        } else if("#current_site"==defaultValue || "#knsite"==defaultValue) {
            return [this.userToken?.site,true];
        } else {
            if(defaultValue) {
                if(defaultValue.trim().length == 0) {
                    return [defaultValue,true];
                }
                if(CHARACTER_SET.includes(defaultValue.trim())) return [defaultValue,true];
                if(defaultValue.length > 1) {
                    if(defaultValue.indexOf("#params.") >= 0) {
                        let key = defaultValue.substring(8);
                        if(key.indexOf(".") > 0 && context) {
                            let value = this.scrapeData(key,{ parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: context.params, dataTarget: context.params, dataChunk: context.params, dataParent: context.params });
                            if(value) {
                                return [value,true];
                            } else {
                                value = context?.params[key];
                                if(value) return [value,true];    
                            }
                        } else {
                            let value = context?.params[key];
                            if(value) return [value,true];
                        }
                    }
                    let first = defaultValue.charAt(0);
                    if(first=='#' || first=='$' || first=='?') {
                        let key = defaultValue.substring(1);
                        if(key.indexOf(".") > 0 && context) {
                            let value = this.scrapeData(key,{ parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: context.params, dataTarget: context.params, dataChunk: context.params, dataParent: context.params });
                            if(value) { 
                                return [value,true];
                            } else {
                                value = config.env(key,key);
                                return [value,true];    
                            }
                        } else {
                            let value = config.env(key,key);
                            return [value,true];
                        }
                    }
                }
            }
        }
        return [defaultValue,false];
    }

    public override tryParseParameterValue(param: KnParamInfo): any {
        let dbf = KnSQLUtils.getDBField(param.name,param.model);
        if(dbf) {
            let dbt = KnDBUtils.parseDBTypes(dbf.type);
            if(dbt === KnDBTypes.DATE || dbt === KnDBTypes.TIME || dbt === KnDBTypes.DATETIME) {
                let value = param.value;
                if(typeof value === "string" && value.trim().length > 0) {
                    if(dbf.options?.format && dbf.options?.format.trim().length > 0) {
                        return this.dateparser.parseDate(value,dbf.options.format,dbf.options?.locale);
                    }
                }
            }
        }
        return super.tryParseParameterValue(param);
    }    

    public tryParseFunction(handler: any, ...args: string[]) : Function | undefined {
        let func : Function | undefined = handler;
        if(handler && (typeof handler == 'string')) {
            let funbody = handler.match(/{([\s\S]*)}/);
            if(funbody && funbody.length>0) {
                let text = funbody[1];
                text = text.replace(/\n/g, ' ');
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
        
    public async getConnectionConfig(context: KnContextInfo, connectid: string | undefined, checkExist: boolean = true, model: KnModel = this.model): Promise<MigrateConnectSetting | undefined> {
        if(!connectid || connectid.trim().length==0) return undefined;
        let db = this.getPrivateConnector(model);
        try {
            return await this.getMigrateConnectSetting(context,db,connectid,checkExist);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async getMigrateConnectSetting(context: KnContextInfo, db: KnDBConnector, connectid: string, checkExist: boolean = false): Promise<MigrateConnectSetting | undefined> {
        if(!connectid || connectid.trim().length==0) return undefined;
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
        } else {
            if(checkExist) {
                return Promise.reject(new VerifyError("Connection setting not found ("+connectid+")",HTTP.NOT_FOUND,-16076)); 
            }
        }
        return result;
    }

    public tryParseXmlToJSON(xml?: string) : any {
        return MigrateUtility.tryParseXmlToJSON(xml);
    }

    public getContextParameters(context: KnContextInfo) : any {
        let { taskid, migrateid, processid, async, stored, type, file, filename, fileinfo, dataset, datafile, ...paras } = context.params;
        return paras;
    }

    protected scrapeDataValues(context: KnContextInfo, body: any, data: any, values: any[]) {
        for(let key in body) {
            let value = body[key];
            if(typeof value === 'string') {
                if(value.length > 0 && value.charAt(0) == '?') {
                    let val = value.substring(1);
                    if(data && data.hasOwnProperty(val)) {
                        let param = data[val];
                        body[key] = param;
                        values.push(param);
                    } else {
                        if(val.indexOf(".") > 0) {
                            let mapvalues = this.scrapeData(val,{ parentIndex: 0, currentIndex: 0, parentLength: 0, currentLength: 0, dataSet: context.params, dataTarget: context.params, dataChunk: context.params, dataParent: context.params },context);
                            if(mapvalues) {
                                body[key] = mapvalues;
                                values.push(mapvalues);
                            }
                        } else {
                            let [param,found] = this.parseDefaultValue(value,context);
                            if(found) {
                                body[key] = param;
                                values.push(param);
                            } else {
                                param = data[val];
                                body[key] = param;
                                values.push(param);
                            }
                        }
                    }
                }    
            } else if(typeof value === 'object') {
                this.scrapeDataValues(context,value,data,values);
            }
        }
    }

    public scrapeData(mapper: string | RefConfig | Array<string|RefConfig>, data: DataScrape, context?: KnContextInfo) : any {
        let results = undefined;
        if(Array.isArray(mapper)) {
            for(let item of mapper) {
                if(typeof item === 'string') {
                    let value = this.scratchData(item, data, context);
                    if(value!=undefined || value!=null) {
                        results = ( results ?? "" ) + value;
                    }
                } else {
                    let prefix = item.ref == '$' || item.ref == '.' ? '' : item.ref;
                    let value = this.scratchData(prefix + item.name, data, context); 
                    if(value!=undefined || value!=null) {
                        results = ( results ?? "" ) + value;
                    }
                }
            }
        } else {
            if(typeof mapper === 'string') {
                results = this.scratchData(mapper, data, context);
            } else {
                let prefix = mapper.ref == '$' || mapper.ref == '.' ? '' : mapper.ref;
                results = this.scratchData(prefix + mapper.name, data, context);
            }
        }
        return results;
    }

    public scratchData(mapper: string, data: DataScrape, context?: KnContextInfo) : any {
        if(mapper && mapper.trim().length>0) {
            // % = environment variable, @ = find out from root tag, $ or . = find out from current data, ^ = find from parent data
            let firstchar = mapper.charAt(0);
            let parentTag = firstchar=='^';
            let configTag = firstchar=="%";
            let reservedTag = firstchar=='$' || firstchar=='.';
            let rootTag = firstchar=='@'; 
            if(rootTag || reservedTag || configTag || parentTag) {
                mapper = mapper.substring(1);
            }
            if(configTag) {
                return config.env(mapper);
            }
            let path = mapper.split('.');
            //find out data in array at index specified
            //let regex = new RegExp(`\\[(\\d+)\\]$`);
            let regex = new RegExp(`\\[([^\\]]+)\\]$`);
            let results = path.reduce((item: any, part: any) => { 
                let match = part.match(regex); 
                if (match && match[1]) {
                    let idxstr = match[1];
                    if(idxstr == 'currentIndex') {
                        idxstr = String(data.currentIndex);
                    } else if(idxstr == 'parentIndex') {
                        idxstr = String(data.parentIndex);
                    } else if(idxstr == 'currentLength') {
                        idxstr = String(data.currentLength);
                    } else if(idxstr == 'parentLength') {
                        idxstr = String(data.parentLength);
                    }
                    if(!isNaN(idxstr)) {                   
                        let index = parseInt(idxstr, 10);
                        let idx = part.lastIndexOf('[');
                        let token = part.substring(0,idx);
                        let array = item[token];
                        if(Array.isArray(array) && array.length > index) {
                            return array[index];
                        }
                    }
                }                
                let [value,flag] = this.parseDefaultValue(part,context);
                if(flag) return value;
                let rs = item && item[part]; 
                return rs; 
            }, rootTag ? data.dataChunk || data.dataSet : ( parentTag ? data.dataParent || data.dataSet : data.dataTarget )); 
            return results;
        }
        return mapper;
    }

}
