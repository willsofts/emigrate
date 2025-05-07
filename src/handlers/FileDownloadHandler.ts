import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { DOWNLOAD_FILE_PATH } from "../utils/EnvironmentVariable";
import { FileSetting, PluginSetting } from "../models/MigrateAlias";
import { MigrateUtility } from "../utils/MigrateUtility";
import { PluginHandler } from "./PluginHandler";
import { v4 as uuid } from 'uuid';
import fs from "fs";
import path from "path";
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipe = promisify(pipeline);

export class FileDownloadHandler extends PluginHandler {

    public override async performDownload(plugin: PluginSetting, context?: KnContextInfo, model: KnModel = this.model) : Promise<[string,FileSetting | undefined]> {
        this.logger.debug(this.constructor.name+".performDownload: plugin",MigrateUtility.maskAttributes(plugin));        
        let setting = plugin.property;
        if(setting?.source && setting?.source.trim().length > 0 && setting?.target && setting?.target.trim().length > 0) {
            let source = setting.source;
            let reconcile = setting?.reconcile;
            if(reconcile && reconcile.trim().length > 0) source = reconcile;
            if(context && source.indexOf("${") >= 0) {
                source = Utilities.translateVariables(source,context.params);
            }
            setting.file = undefined;
            let info = path.parse(setting.target);
            let filename = info.base; //setting.target;
            let naming = String(setting.naming);
            if("auto"===naming || "true"===naming) {
                let fileid = uuid();
                filename = fileid + info.ext;        
            }
            let filepath = setting?.path || DOWNLOAD_FILE_PATH;
            if(info.dir && info.dir.trim().length > 0) {
                filepath = info.dir;
            }
            let fullfilename = path.join(filepath, filename);            
            if(!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, { recursive: true });
            }
            let init = undefined;
            let method = setting?.method || "GET";
            if("GET"!=method && "HEAD"!=method) {
                let headers = setting?.headers || {};
                let data = setting?.body || {};    
                let params = {};
                let body = JSON.stringify(data);
                init = Object.assign(params, { method: method, headers: headers, body });
            }
            this.logger.debug(this.constructor.name+".performDownload: try fetch:",source,"("+setting.source+")");
            try {
                const res = await fetch(source, init);
                if (!res.ok) return Promise.reject(new Error(`Fail to download file: ${res.statusText}`));
                if (res.ok && res.body) {
                    let writeError = undefined;
                    this.logger.debug(this.constructor.name+".performDownload: saving as :",fullfilename);
                    const writer = fs.createWriteStream(fullfilename, { autoClose: true });
                    writer.on("error",(err) => { 
                        writeError = err;
                        this.logger.error(this.constructor.name+".performDownload: write error",err); 
                    });
                    await pipe(res.body, writer);
                    if(writeError) throw writeError;
                    setting.file = fullfilename;
                    return [source,setting];
                }
            } catch (err: any) {
                this.logger.error(this.constructor.name+".performDownload: error",err);
                return Promise.reject(err);
            }                
        }
        return ["",undefined];
    }

}
