import { v4 as uuid } from 'uuid';
import { HTTP } from "@willsofts/will-api";
import { KnModel, KnParamInfo, KnSQLUtils } from "@willsofts/will-db";
import { KnContextInfo, VerifyError } from "@willsofts/will-core";
import { KnDBConnector, KnDBFault, KnSQL, KnDBUtils, KnDBTypes, KnResultSet } from "@willsofts/will-sql";
import { TknOperateHandler } from "@willsofts/will-serv";
import { PRIVATE_SECTION, MIGRATE_DUMP_SQL } from "../utils/EnvironmentVariable";
import { MigrateConnectSetting } from "../models/MigrateAlias";
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
        return new KnDBFault(this.getSQLError(err),code,state);
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
                        let value = context?.params[key];
                        if(value) return [value,true];
                    }
                    let first = defaultValue.charAt(0);
                    if(first=='#' || first=='$' || first=='?') {
                        let key = defaultValue.substring(1);
                        let value = config.env(key,key);
                        return [value,true];
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
            } else if(typeof value === 'object') {
                this.scrapeDataValues(context,value,data,values);
            }
        }
    }

}
