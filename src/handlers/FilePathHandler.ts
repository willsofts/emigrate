import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { PluginSetting, FileInfo, } from "../models/MigrateAlias";
import { MigrateUtility } from "../utils/MigrateUtility";
import { PluginHandler } from "./PluginHandler";

export class FilePathHandler extends PluginHandler {

    public override async perform(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<[string,FileInfo | FileInfo[] | undefined]> {
        if(plugin) {
            this.logger.debug(this.constructor.name+".perform: plugin",MigrateUtility.maskAttributes(plugin));
            let setting = plugin.property;
            if(setting?.source && setting?.source.trim().length > 0) {
                let source = setting.source;
                if(context && source.indexOf("${") >= 0) {
                    source = Utilities.translateVariables(source,context.params);
                }
                this.logger.debug(this.constructor.name+".perform: listing file path",source);
                let result = await MigrateUtility.getFileInfos(source);
                return [source,result];
            }
        }
        return ["",undefined];
    }

}
