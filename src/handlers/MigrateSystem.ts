import { HTTP } from "@willsofts/will-api";
import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnValidateInfo, VerifyError } from "@willsofts/will-core";
import { KnDBConnector, KnSQL } from "@willsofts/will-sql";
import { OPERATE_HANDLERS } from "@willsofts/will-serv";
import { ERROR_CANCELATION_CODE, ERROR_CANCELATION_KEY, ALWAYS_THROW_POST_ERROR } from "../utils/EnvironmentVariable";
import { MigrateModel, MigrateConnectSetting, PluginSetting, StatementInfo, ParameterInfo, MigrateRecords, MigrateParams, FilterInfo } from "../models/MigrateAlias";
import { FileDownloadHandler } from "./FileDownloadHandler";
import { FileTransferHandler } from "./FileTransferHandler";
import { FileAttachmentHandler } from './FileAttachmentHandler';
import { FileDatabaseHandler } from "./FileDatabaseHandler";
import { FilePathHandler } from "./FilePathHandler";
import { FileAzureStorageHandler } from "./FileAzureStorageHandler";
import { FileS3StorageHandler } from "./FileS3StorageHandler";
import { PluginHandler } from './PluginHandler';
import { MigrateBase } from "./MigrateBase";

const task_models = require("../../config/model.json");

export class MigrateSystem extends MigrateBase {
    
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
            } else if("folder"==plugin.name) {
                let handler = new FilePathHandler();
                handler.obtain(this.broker,this.logger);
                return handler;
            } else if("azure"==plugin.name) {
                let handler = new FileAzureStorageHandler();
                handler.obtain(this.broker,this.logger);
                return handler;
            } else if("s3"==plugin.name) {
                let handler = new FileS3StorageHandler();
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
                let privateAlias : string | MigrateConnectSetting = model.alias.privateAlias;
                let config = await this.getMigrateConnectSetting(context,db,row.connectid);
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

}
