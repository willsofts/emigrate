import { KnModel } from "@willsofts/will-db";
import { KnSQL } from "@willsofts/will-sql";
import { KnContextInfo } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { FileSetting, PluginSetting } from "../models/MigrateAlias";
import { MigrateUtility } from "../utils/MigrateUtility";
import { PluginHandler } from "./PluginHandler";
import { MigrateSystem } from "./MigrateSystem";

export class FileDatabaseHandler extends PluginHandler {

    public override async performDownload(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<[string,FileSetting | undefined]> {
        this.logger.debug(this.constructor.name+".performDownload: plugin",MigrateUtility.maskAttributes(plugin));        
        let setting = plugin.property;
        if(setting?.source && setting?.source.trim().length > 0 && setting?.target && setting?.target.trim().length > 0) {
            let source = setting.source;
            if(source.indexOf("${") >= 0) {
                source = Utilities.translateVariables(source,context.params);
            }
            this.logger.debug(this.constructor.name+".performDownload: try fetch result:",source,"("+setting.source+")");
            let connection = plugin?.connection;
            if(connection) {
                let handler = new MigrateSystem();
                handler.obtain(this.broker,this.logger);
                let cfg = await handler.getConnectionConfig(context,connection?.connectid);
                let db = cfg ? this.getConnector(cfg) : this.getConnector(connection);
                try {
                    let knsql = handler.composeQuery(context,setting?.statement,db);
                    if(!knsql && connection?.query) knsql = new KnSQL(connection.query);
                    if(!knsql) knsql = new KnSQL("select * from "+source);
                    this.logger.debug(this.constructor.name+".performDownload: sql:",knsql);
                    if(knsql) {
                        let rs = await knsql.executeQuery(db,context);
                        setting.stat = false;
                        setting.file = setting.target;
                        setting.body = rs.rows;
                        return [source,setting];
                    }
                } catch(ex: any) {
                    this.logger.error(ex);
                    return Promise.reject(this.getDBError(ex));
                } finally {
                    if(db) db.close();
                }
            }
        }
        return ["",undefined];
    }

}
