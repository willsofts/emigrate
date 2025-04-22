import { v4 as uuid } from 'uuid';
import { HTTP } from "@willsofts/will-api";
import { KnModel, KnParamInfo, KnSQLUtils, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnValidateInfo, VerifyError } from "@willsofts/will-core";
import { KnDBConnector, KnDBFault, KnSQL, KnDBUtils, KnDBTypes, KnResultSet } from "@willsofts/will-sql";
import { TknOperateHandler, OPERATE_HANDLERS } from "@willsofts/will-serv";
import { PRIVATE_SECTION, ERROR_CANCELATION_CODE, ERROR_CANCELATION_KEY, MIGRATE_DUMP_SQL, ALWAYS_THROW_POST_ERROR } from "../utils/EnvironmentVariable";
import { MigrateModel, MigrateConfig, PluginSetting, StatementInfo, ParameterInfo, MigrateRecords, MigrateParams, FilterInfo } from "../models/MigrateAlias";
import { FileDownloadHandler } from "./FileDownloadHandler";
import { FileTransferHandler } from "./FileTransferHandler";
import { FileAttachmentHandler } from './FileAttachmentHandler';
import { FileDatabaseHandler } from "./FileDatabaseHandler";
import { PluginHandler } from './PluginHandler';
import { MigrateDate } from "../utils/MigrateDate";
import { MigrateUtility } from '../utils/MigrateUtility';
import config from "@willsofts/will-util";

const task_models = require("../../config/model.json");
const crypto = require('crypto');

export const CHARACTER_SET = ['@','#','$','%','^','&','*','(',')','-','_','+','=','/','\\',':',';','|','[',']','{','}','<','>','?','.',',','"','\''];

export class MigrateBase extends TknOperateHandler {
    public dateparser = new MigrateDate();
    public section = PRIVATE_SECTION;
    public model : KnModel = { name: "tmigrate", alias: { privateAlias: this.section } };
    public dumping: boolean = MIGRATE_DUMP_SQL;
    public progid: string = "migrate";
    
    public handlers = OPERATE_HANDLERS.concat([ {name: "config"} ]);

    public async config(context: KnContextInfo) : Promise<MigrateModel> {
        return this.callFunctional(context, {operate: "config", raw: false}, this.doConfig);
    }

    public async doConfig(context: KnContextInfo, model: KnModel) : Promise<MigrateModel> {
        await this.validateRequireFields(context, model, KnOperation.GET);
        let rs = await this.doConfiguring(context, model, KnOperation.GET);
        return await this.createCipherData(context, KnOperation.GET, rs);
    }

    protected async doConfiguring(context: KnContextInfo, model: KnModel, action: string = KnOperation.GET) : Promise<MigrateModel> {
        let result = await this.getTaskModel(context,context.params.taskid,model);
        if(result) return result;
        return Promise.reject(new VerifyError("Task not found",HTTP.NOT_FOUND,-16077));
    }

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

    public parseDefaultValue(defaultValue: string | undefined) : [any,boolean] {
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
                if(defaultValue.length>1) {
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
    

    public createSQL(statement: StatementInfo) : KnSQL | undefined {
        if(statement?.sql) {
            let knsql = new KnSQL(statement.sql);
            return knsql;
        }
        return undefined;
    }

    public composeQuery(context: KnContextInfo, statement: StatementInfo, db?: KnDBConnector) : KnSQL | undefined {
        let knsql = this.createSQL(statement);
        if(knsql) {
            let [sql,paramnames] = knsql.getExactlySql(db?.alias);
            if(paramnames) {
                for(let name of paramnames) {
                    knsql.set(name,context.params[name]);
                }
            }
            if(statement?.parameters) {
                for(let pr of statement.parameters) {
                    let [value,found] = this.parseDefaultValue(pr?.defaultValue);
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
            } else if("database"==plugin.name) {
                let handler = new FileDatabaseHandler();
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

    public async getTaskModel(context: KnContextInfo, taskid: string, model: KnModel = this.model): Promise<MigrateModel | undefined> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.getMigrateModel(context,model,db,taskid);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async getMigrateModel(context: KnContextInfo, model: KnModel, db: KnDBConnector, taskid: string): Promise<MigrateModel | undefined> {
        let results : MigrateModel = { models: [], configs: {} };
        let knsql = new KnSQL();
        knsql.append("select t.taskid,t.taskname,t.connectid,t.taskconfigs,");
        knsql.append("m.modelid,m.modelname,m.tablename,m.tablefields,m.tablesettings,tm.seqno ");
        knsql.append("from tmigratetask t, tmigratetaskmodel tm, tmigratemodel m ");
        knsql.append("where t.taskid = ?taskid ");
        knsql.append("and t.taskid = tm.taskid ");
        knsql.append("and tm.modelid = m.modelid ");
        knsql.append("order by seqno ");
        knsql.set("taskid",taskid);
        let rs = await knsql.executeQuery(db,context);
        if(rs && rs.rows?.length > 0) {
            results.configs = this.tryParseJSON(rs.rows[0].taskconfigs);
            for(let row of rs.rows) {
                let privateAlias : string | MigrateConfig = model.alias.privateAlias;
                let config = await this.getMigrateConfig(context,db,row.connectid);
                if(config) {
                    privateAlias = config;        
                }
                let tablefields = this.tryParseJSON(row.tablefields);
                let tablesettings = this.tryParseJSON(row.tablesettings);
                let taskmodel = {
                    name: row.tablename,
                    alias: { privateAlias: privateAlias },
                    fields: tablefields,
                    settings: tablesettings,
                }
                results.models.push(taskmodel);
            }
        }
        if(results.models.length > 0) return results;
        return task_models[taskid];
    }

    public async getConnectionConfig(context: KnContextInfo, connectid: string | undefined, checkExist: boolean = true, model: KnModel = this.model): Promise<MigrateConfig | undefined> {
        if(!connectid || connectid.trim().length==0) return undefined;
        let db = this.getPrivateConnector(model);
        try {
            return await this.getMigrateConfig(context,db,connectid,checkExist);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async getMigrateConfig(context: KnContextInfo, db: KnDBConnector, connectid: string, checkExist: boolean = false): Promise<MigrateConfig | undefined> {
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

    public async invalidateStatementParameters(context: KnContextInfo, model: KnModel) : Promise<ParameterInfo[]> {
        let params : ParameterInfo[] = [];
        await this.invalidateQueryParameters(context,model,params,model.settings?.statement);
        await this.invalidateQueryParameters(context,model,params,model.settings?.statement?.prestatement);
        await this.invalidateQueryParameters(context,model,params,model.settings?.statement?.poststatement);
        return params;
    }

    public async invalidateQueryParameters(context: KnContextInfo, model: KnModel, params: ParameterInfo[], statement: StatementInfo) : Promise<ParameterInfo[]> {
        if(statement) {
            if(statement.parameters && statement.parameters.length > 0) {
                let knsql = this.composeQuery(context,statement);
                if(knsql) {
                    for(let pr of statement.parameters) {
                        if(typeof pr.required === "undefined" || String(pr.required) == "true") {
                            let pv = knsql.params.get(pr.name);
                            if(!pv || !pv.value) {
                                params.push(pr);
                            }
                        }
                    }
                }
            }
            if(statement.statements && statement.statements.length > 0) {
                for(let stmt of statement.statements) {
                    await this.invalidateQueryParameters(context, model, params, stmt);
                }
            }
        }
        return params;
    }

    public async validateStatementParameters(context: KnContextInfo, model: KnModel) : Promise<KnValidateInfo> {
        let results = await this.invalidateStatementParameters(context,model);
        if(results && results.length > 0) {
            let prnames = results.map((item) => item.name);
            return { valid: false, info: prnames.join(",") };
        }
        return { valid: true };
    }

    public async performQueryStatements(context: KnContextInfo, model: KnModel, db: KnDBConnector, rc: MigrateRecords, dataset: any, statements?: StatementInfo[]): Promise<any> {
        if(statements && statements.length > 0) {
            for(let stmt of statements) {
                let knsql = this.composeQuery(context,stmt,db);
                if(knsql) {
                    this.logger.info(this.constructor.name+".performQueryStatements:",knsql);
                    await knsql.executeUpdate(db,context);
                }
            }
        }
    }

    public async performPreTransaction(context: KnContextInfo, model: KnModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<any> {
        if(model.settings?.statement?.prestatement) {
            let handler = model.settings?.statement?.prehandler;
            let func = this.tryParseFunction(handler,'dataset','param','model','context');
            if(func) {
                let res = func(dataset,param,model,context);
                //expect boolean as result
                if(res != undefined || res != null) {
                    if(!res) return res;        
                }
            }            
            await this.performQueryStatements(context,model,db,rc,dataset,model.settings?.statement?.prestatement?.statements)
            let knsql = this.composeQuery(context,model.settings?.statement?.prestatement,db);
            if(knsql) {
                this.logger.info(this.constructor.name+".performPreTransaction:",knsql);
                await knsql.executeUpdate(db,context);
            }
        }
    }

    public async performPostTransaction(context: KnContextInfo, model: KnModel, db: KnDBConnector, rc: MigrateRecords, param: MigrateParams, dataset: any): Promise<FilterInfo> {
        let result : FilterInfo = { cancel: false };
        if(model.settings?.statement?.poststatement) {
            let handler = model.settings?.statement?.posthandler;
            let func = this.tryParseFunction(handler,'dataset','param','model','context');
            if(func) {
                let res = func(dataset,param,model,context);
                //expect boolean as result
                if(res != undefined || res != null) {
                    if(!res) return result;        
                }
            }
            await this.performQueryStatements(context,model,db,rc,dataset,model.settings?.statement?.poststatement?.statements)
            let knsql = this.composeQuery(context,model.settings?.statement?.poststatement,db);
            if(knsql) {
                this.logger.info(this.constructor.name+".performPostTransaction:",knsql);
                try {
                    await knsql.executeUpdate(db,context);
                } catch(ex:any) {
                    this.logger.error(ex);
                    result.throwable = ex;
                    result.cancel = await this.cancelError(ex,model.settings);
                    if(result.cancel) {
                        return result;
                    }
                    if(String(model.settings?.alwaysThrowable) == 'true' || ALWAYS_THROW_POST_ERROR) {
                        throw ex;
                    }
                }
            }            
        }
        return result;
    }

    public tryParseXmlToJSON(xml?: string) : any {
        return MigrateUtility.tryParseXmlToJSON(xml);
    }

}
