import { v4 as uuid } from 'uuid';
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from "@willsofts/will-core";
import { KnDBConnector, KnDBFault, KnSQL } from "@willsofts/will-sql";
import { TknOperateHandler } from "@willsofts/will-serv";
import { PRIVATE_SECTION } from "../utils/EnvironmentVariable";
import { PluginSetting } from "../models/MigrateAlias";
import { FileDownloadHandler } from "./FileDownloadHandler";
import { FileTransferHandler } from "./FileTransferHandler";
import { PluginHandler } from './PluginHandler';

const crypto = require('crypto');

export const CHARACTER_SET = ['@','#','$','%','^','&','*','(',')','-','_','+','=','/','\\',':',';','|','[',']','{','}','<','>','?','.',',','"','\''];

export class MigrateBase extends TknOperateHandler {
    public section = PRIVATE_SECTION;
    public model : KnModel = { name: "tmigrate", alias: { privateAlias: this.section } };
    
    public randomUUID() : string {
        return uuid();
    }
    
    public getDBFault(err: any, state: string, code: number = -32000) : KnDBFault {
        return new KnDBFault(this.getSQLError(err),code,state);
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
            }
        }
        return undefined;
    }
    
    /*
    public async performFileDownload(setting: FileSetting) : Promise<FileSetting | undefined> {
        let handler = new FileDownloadHandler();
        handler.obtain(this.broker,this.logger);
        return await handler.performDownload(setting);
    }

    public async performFileTransfer(setting: FileSetting) : Promise<FileSetting | undefined> {
        let handler = new FileTransferHandler();
        handler.obtain(this.broker,this.logger);
        return await handler.performDownload(setting);
    }
    */
}
