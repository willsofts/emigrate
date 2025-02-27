import fs from "fs";
import path from "path";
import mime from "mime-types";
import { KnParamInfo, KnSQLUtils } from "@willsofts/will-db";
import { KnDBUtils, KnDBTypes } from "@willsofts/will-sql";
import { Utilities } from "@willsofts/will-util";
import { FileInfo } from "../models/MigrateAlias";
import { MigrateDate } from "../utils/MigrateDate";

const dateparser = new MigrateDate();

export class MigrateUtility {
    
    public static maskAttributes(object: any, attributesToMask: string[] = ["password"]) {
        if(!object) return object;
        const data = JSON.parse(JSON.stringify(object));
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (attributesToMask.includes(key) && typeof data[key] === 'string') {
                    data[key] = '******'; // Mask the attribute
                } else if (typeof data[key] === 'object' && data[key] !== null) {
                    data[key] = this.maskAttributes(data[key], attributesToMask); // Recursively mask nested objects
                }
            }
        }
        return data;
    }

    public static removeDoubleQuote(text: string) {
        if(text.charAt(0)=="\"") text = text.substring(1);
        if(text.charAt(text.length-1)=="\"") text = text.substring(0,text.length-1);
        return text;
    }

    public static async getFileInfo(file: string) : Promise<FileInfo> {
        let info = path.parse(file);
        let extension = info.ext;
        let index = extension.indexOf('.');
        if(index>=0) extension = extension.substring(index+1);
        let mimetype = mime.lookup(file);
        const stats = await fs.promises.stat(file);
        let result : FileInfo = {
            type: extension,
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

    public static tryParseDate(param: KnParamInfo) : Date | undefined {
        let dbf = KnSQLUtils.getDBField(param.name,param.model);
        if(dbf) {
            let dbt = KnDBUtils.parseDBTypes(dbf.type);
            if(dbt === KnDBTypes.DATE || dbt === KnDBTypes.TIME || dbt === KnDBTypes.DATETIME) {
                let value = param.value;
                if(typeof value === "string" && value.trim().length > 0) {
                    if(dbf.options?.format && dbf.options?.format.trim().length > 0) {
                        return dateparser.parseDate(value,dbf.options.format,dbf.options?.locale);
                    }
                    if(dbt === KnDBTypes.DATE || dbt === KnDBTypes.DATETIME) { 
                        return Utilities.parseDate(value);
                    }
                    if(dbt === KnDBTypes.TIME) {
                        return Utilities.parseTime(value);
                    }
                }
            }
        }
        return undefined;
    }

}
