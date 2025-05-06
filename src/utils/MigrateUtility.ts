import fs from "fs";
import path from "path";
import mime from "mime-types";
import { KnParamInfo, KnSQLUtils } from "@willsofts/will-db";
import { KnDBUtils, KnDBTypes } from "@willsofts/will-sql";
import { Utilities } from "@willsofts/will-util";
import { FileInfo, FileType } from "../models/MigrateAlias";
import { MigrateDate } from "../utils/MigrateDate";
import { XMLParser } from 'fast-xml-parser';

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

    public static async getFileInfo(file: string, stat: boolean = true) : Promise<FileInfo> {
        let info = path.parse(file);
        let extension = info.ext;
        let index = extension.indexOf('.');
        if(index>=0) extension = extension.substring(index+1);
        let mimetype = mime.lookup(file);
        const stats = stat ? await fs.promises.stat(file) : null;
        let result : FileInfo = {
            type: extension,
            originalname: info.base,
            created: stats ? stats.birthtime : new Date(),
            modified: stats ? stats.mtime : new Date(),
            size: stats ? stats.size : 0,
            isDirectory: stats ? stats.isDirectory() : false,
            isFile: stats ? stats.isFile() : false,
            mimetype: mimetype?mimetype:undefined,
            destination: info.dir,
            path: path.join(info.dir,info.base),
            info: info
        };
        return result;
    }

    public static async getFileInfos(dir: string) : Promise<FileInfo[] | undefined> {
        if(dir && dir.trim().length > 0) {
            if(fs.existsSync(dir)) {
                let files = await fs.promises.readdir(dir);
                if(files && files.length > 0) {
                    let filearray : FileInfo[] = [];
                    for(let file of files) {
                        let filepath = path.join(dir,file);
                        let fileinfo = await MigrateUtility.getFileInfo(filepath);
                        filearray.push(fileinfo);
                    }
                    return filearray;
                }
            }
        }
        return undefined;
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


    public static parseFileType(filename?: string) : FileType {
        let result = { isText: false, isJson: false, isXlsx: false, isXml: false };
        if(filename) {
            const textfiletypes = new RegExp("text|txt|csv","i");
            const jsonfiletypes = new RegExp("json","i");
            const xlsxfiletypes = new RegExp("xlsx|xls","i");
            const xmlfiletypes = new RegExp("xml","i");
            const extname = path.extname(filename).toLowerCase();
            result.isText = textfiletypes.test(extname);
            result.isJson = jsonfiletypes.test(extname);
            result.isXlsx = xlsxfiletypes.test(extname);
            result.isXml = xmlfiletypes.test(extname);
        }
        return result;
    }

    public static formatDate(date?: Date, format: string = "DD/MM/YYYY", locale: string = "en", era: string = "BC") : string {
        return dateparser.formatDate(date,format,locale,era);
    }

    public static formatTime(date?: Date, format: string = "HH:mm:ss", locale: string = "en", era: string = "BC") : string {
        return dateparser.formatDate(date,format,locale,era);
    }

    public static formatDateTime(date?: Date, format: string = "DD/MM/YYYY HH:mm:ss", locale: string = "en", era: string = "BC") : string {
        return dateparser.formatDate(date,format,locale,era);
    }

    public static formatDecimal(value?: number, format: string = "#,##0.00", locale: string = "en-US") : string {
        if(!value) return "";
        const decimalPlaces = (format.split('.')[1] || "").length;
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
            useGrouping: format.includes(','), 
        }).format(value);
    }

    public static formatInteger(value?: number, format: string = "#,##0", locale: string = "en-US") : string {
        return this.formatDecimal(value,format,locale);
    }

    public static paddingText(text: string, length: number, direction: string = "right", padder: string = " ") {
        if (text.length > length) {
            return text.slice(0, length);
        }    
        if (direction === "right") {
            return text.padEnd(length, padder); 
        } else if (direction === "left") {
            return text.padStart(length, padder);
        }
        return text;
    }

    public static escapeXML(str?: any) : string | undefined {
        if(str === undefined || str === null) return "";
        return (""+str).replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&apos;");
    }

    public static tryParseXmlToJSON(xml?: string) : any {
        if(xml && xml.length > 0) {
            const options = {
                ignoreDeclaration: true,  // Do not parse declaration
                ignorePiTags: true,       // Do not process instruction tags   
                ignoreAttributes: false,  // Don't ignore attributes, so they will be parsed
                textNodeName: "#text",    // Default name for text nodes
                attributeNamePrefix: "",  // Do not add prefix to attributes
                parseNodeValue: true,     // Parse the value of nodes
                parseAttributeValue: true // Parse attributes as well    
            };        
            let parser = new XMLParser(options);
            return parser.parse(xml,true);
        }
        return undefined;
    }

}
