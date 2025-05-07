import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { FileInfo, FileSetting, PluginSetting } from "../models/MigrateAlias";
import { MigrateUtility } from "../utils/MigrateUtility";
import { MigrateBase } from "./MigrateBase";

export class PluginHandler extends MigrateBase {

    public async perform(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<[string,FileInfo | FileInfo[] | undefined]> {
        if(plugin) {
            let [src,res] = await this.performDownload(plugin,context,model);
            if(res && !res.body) this.logger.debug(this.constructor.name+".perform: response",res);
            if(res && res.file) {
                try {
                    let fileinfo = await MigrateUtility.getFileInfo(res.file,res.stat);
                    fileinfo.originalname = res.originalname || res.target;
                    fileinfo.body = res.body;
                    return [src,fileinfo];
                } catch(ex: any) {
                    return Promise.reject(this.getDBError(ex));
                }
            }
        }
        return ["",undefined];
    }

    public async performDownload(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<[string,FileSetting | undefined]> {
        return ["",undefined];
    }
    
    public async terminate(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<any> {

    }

}
