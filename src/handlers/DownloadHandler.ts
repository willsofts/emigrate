import { DOWNLOAD_FILE_PATH } from "../utils/EnvironmentVariable";
import { DownloadSetting } from "../models/MigrateAlias";
import { TknOperateHandler } from "@willsofts/will-serv";
import { pipeline } from 'stream';
import { promisify } from 'util';
import { v4 as uuid } from 'uuid';
import fs from "fs";
import path from "path";

const pipe = promisify(pipeline);

export class DownloadHandler extends TknOperateHandler {

    public async performDownload(setting: DownloadSetting) : Promise<DownloadSetting | undefined> {
        this.logger.debug(this.constructor.name+".performDownload: setting",setting);        
        if(setting?.url && setting?.url.trim().length > 0 && setting?.target && setting?.target.trim().length > 0) {
            setting.file = undefined;
            let info = path.parse(setting.target);
            let filename = setting.target;
            if("auto"===setting.naming || "true"===setting.naming) {
                let fileid = uuid();
                filename = fileid + info.ext;        
            }
            let fullfilename = filename;
            let filepath = setting?.path || DOWNLOAD_FILE_PATH;
            if(info.dir && info.dir.trim().length > 0) {
                filepath = info.dir;
            } else { 
                fullfilename = path.join(filepath, filename);
            }
            if(!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, { recursive: true });
            }    
            const res = await fetch(setting.url);
            if (!res.ok) throw new Error(`Fail to download file: ${res.statusText}`);
            if (res.ok && res.body) {
                try {
                    this.logger.debug("saving as :",fullfilename);
                    const writer = fs.createWriteStream(fullfilename, { autoClose: true });
                    writer.on("error",(err) => { 
                        this.logger.error(err); 
                    });
                    await pipe(res.body, writer);
                    setting.file = fullfilename;
                    return setting;
                } catch (err: any) {
                    throw new Error(`Error during download: ${err.message}`);
                }                
            }
        }
        return undefined;
    }

}
