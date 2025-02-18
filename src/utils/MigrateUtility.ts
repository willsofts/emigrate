import fs from "fs";
import path from "path";
import mime from "mime-types";
import { FileInfo } from "../models/MigrateAlias";
export class MigrateUtility {
    
    public static removeDoubleQuote(text: string) {
        if(text.charAt(0)=="\"") text = text.substring(1);
        if(text.charAt(text.length-1)=="\"") text = text.substring(0,text.length-1);
        return text;
    }

    public static async getFileInfo(file: string) : Promise<FileInfo> {
        let info = path.parse(file);
        let mimetype = mime.lookup(file);
        const stats = await fs.promises.stat(file);
        let result : FileInfo = {
            originalname: info.base,
            created: stats.birthtime,
            modified: stats.mtime,
            size: stats.size,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
            mimetype: mimetype?mimetype:undefined,
            destination: info.dir,
            path: path.join(info.dir,info.base),
            info: info
        };
        return result;
    }

}
