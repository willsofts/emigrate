import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { TknOperateHandler } from "@willsofts/will-serv";
import { FileInfo, FileSetting, PluginSetting } from "../models/MigrateAlias";
import { MigrateUtility } from "../utils/MigrateUtility";

export class PluginHandler extends TknOperateHandler {
    
    public model : KnModel = { name: "tmigrate", alias: { privateAlias: this.section } };

    public async perform(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<FileInfo | undefined> {
        if(plugin) {
            let res = await this.performDownload(plugin,context,model);
            this.logger.debug(this.constructor.name+".perform: response",res);
            if(res && res.file) {
                try {
                    let fileinfo = await MigrateUtility.getFileInfo(res.file);
                    fileinfo.originalname = res.originalname || res.target;
                    return fileinfo;
                } catch(ex: any) {
                    return Promise.reject(this.getDBError(ex));
                }
            }
        }
        return undefined;
    }

    public async performDownload(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<FileSetting | undefined> {
        return undefined;
    }

}
