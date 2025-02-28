import { v4 as uuid } from 'uuid';
import { KnModel, KnParamInfo, KnSQLUtils } from "@willsofts/will-db";
import { KnContextInfo } from "@willsofts/will-core";
import { KnDBConnector, KnDBFault, KnSQL, KnDBUtils, KnDBTypes } from "@willsofts/will-sql";
import { TknOperateHandler } from "@willsofts/will-serv";
import { PRIVATE_SECTION, ERROR_CANCELATION_CODE, ERROR_CANCELATION_KEY } from "../utils/EnvironmentVariable";
import { PluginSetting } from "../models/MigrateAlias";
import { FileDownloadHandler } from "./FileDownloadHandler";
import { FileTransferHandler } from "./FileTransferHandler";
import { FileAttachmentHandler } from './FileAttachmentHandler';
import { PluginHandler } from './PluginHandler';
import { MigrateDate } from "../utils/MigrateDate";

const crypto = require('crypto');

export const CHARACTER_SET = ['@','#','$','%','^','&','*','(',')','-','_','+','=','/','\\',':',';','|','[',']','{','}','<','>','?','.',',','"','\''];

export class MigrateBase extends TknOperateHandler {
    public dateparser = new MigrateDate();
    public section = PRIVATE_SECTION;
    public model : KnModel = { name: "tmigrate", alias: { privateAlias: this.section } };
    public dumping: boolean = false;

    public randomUUID() : string {
        return uuid();
    }
    
    public getDBFault(err: any, state: string, code: number = -32000) : KnDBFault {
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

    public parseDefaultValue(defaultValue: string) : [any,boolean] {
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
    

    public createSQL(statement: any) : KnSQL | undefined {
        if(statement?.sql) {
            let knsql = new KnSQL(statement.sql);
            return knsql;
        }
        return undefined;
    }

    public composeQuery(context: KnContextInfo, db: KnDBConnector, statement: any) : KnSQL | undefined {
        let knsql = this.createSQL(statement);
        if(knsql) {
            let [sql,paramnames] = knsql.getExactlySql(db.alias);
            if(paramnames) {
                for(let name of paramnames) {
                    knsql.set(name,context.params[name]);
                }
            }
            if(statement?.parameters) {
                for(let pr of statement.parameters) {
                    let [value,found] = this.parseDefaultValue(pr.defaultValue);
                    if(found) {
                        knsql.set(pr.name,value);
                    }
                }
            }
            return knsql;
        }
        return undefined;
    }

    public async getPluginHandler(plugin: PluginSetting | undefined) : Promise<PluginHandler | undefined> {
        if(plugin) {
            if("download"==plugin.name) {
                let handler = new FileDownloadHandler();
                handler.obtain(this.broker,this.logger);
                return handler;
            } else if("transfer"==plugin.name) {
                let handler = new FileTransferHandler();
                handler.obtain(this.broker,this.logger);
                return handler;
            } else if("mail"==plugin.name) {
                let handler = new FileAttachmentHandler();
                handler.obtain(this.broker,this.logger);
                return handler;
            }
        }
        return undefined;
    }
    
    public async cancelError(ex: any, settings?: any) : Promise<boolean> {
        let name = undefined;
        if(ex.hasOwnProperty("errno")) name = "errno";
        else if(ex.hasOwnProperty("number")) name = "number";
        let key = settings?.errorCancelationKey || ERROR_CANCELATION_KEY || name;
        let errno = ex[key];
        let codeset = settings?.errorCancelationCode || ERROR_CANCELATION_CODE;
        this.logger.debug(this.constructor.name+".cancelError: ERROR KEY =",key,", CODE =",errno,", CANCELATION CODE =",codeset);
        if(errno && codeset && codeset.trim().length > 0) {
            let codes = codeset.split(',');
            for(let code of codes) {
                if(code == ex.errno) {
                    return true;
                }
            }
        }
        return false;
    }

}
