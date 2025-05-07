import { v4 as uuid } from 'uuid';
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { PluginSetting, FileInfo, } from "../models/MigrateAlias";
import { MigrateUtility } from "../utils/MigrateUtility";
import { PluginHandler } from "./PluginHandler";
import { S3StorageUtility } from "@willsofts/will-store";
import { S3_STORAGE_PATH } from "../utils/EnvironmentVariable";
import path from "path";
import fs from "fs";

export class FileS3StorageHandler extends PluginHandler {
    public storage : S3StorageUtility | undefined;
    public filelists: Array<string> | undefined;

    public override async perform(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<[string,FileInfo | FileInfo[] | undefined]> {
        if(plugin) {
            this.logger.debug(this.constructor.name+".perform: plugin",MigrateUtility.maskAttributes(plugin));
            let setting = plugin.property;
            if(plugin.connection && setting?.source && setting?.source.trim().length > 0) {
                let source = setting.source;
                if(context && source.indexOf("${") >= 0) {
                    source = Utilities.translateVariables(source,context.params);
                }
                this.logger.debug(this.constructor.name+".perform: listing file path",source);
                let connection = { ...plugin.connection };
                this.scrapeDataValues(context,connection,context.params,[]);    
                this.logger.debug(this.constructor.name+".perform: connection",connection);
                //using url=region, database=bucket, user=accesskey, password=secretkey
                this.storage = new S3StorageUtility(connection.url,connection.database,connection.user,connection.password);
                //using source as prefix folder listing file in storage
                let filenames = await this.storage.listFile(source);
                this.logger.debug(this.constructor.name+".perform: filenames",filenames);
                if(filenames && Array.isArray(filenames)) {
                    if(filenames.length > 0) {
                        this.filelists = filenames;
                        let result : FileInfo[] = [];
                        for(let file of filenames) {
                            let info = path.parse(file);
                            let filename = info.base;
                            let naming = String(setting.naming);
                            if("auto"===naming || "true"===naming) {
                                let fileid = uuid();
                                filename = fileid + info.ext;        
                            }
                            let filepath = setting?.path || S3_STORAGE_PATH;  
                            let fullfilename = path.join(filepath, filename);            
                            if(!fs.existsSync(filepath)) {
                                fs.mkdirSync(filepath, { recursive: true });
                            }
                            this.logger.debug(this.constructor.name+".perform: download file",file,"as",fullfilename);
                            let downloadres = await this.storage.downloadFile(file,fullfilename);
                            this.logger.debug(this.constructor.name+".perform: downloadFile",downloadres);
                            let fileinfo = await MigrateUtility.getFileInfo(fullfilename);
                            if(fileinfo) result.push(fileinfo);
                        }
                        return [source,result];
                    }
                }
            }
        }
        return ["",undefined];
    }

    public async terminate(plugin: PluginSetting, context: KnContextInfo, model: KnModel = this.model) : Promise<any> {
        if(plugin) {
            this.logger.debug(this.constructor.name+".terminate: plugin",MigrateUtility.maskAttributes(plugin));
            let setting = plugin.property;
            //using target as moving path on storage
            if(this.storage && this.filelists && (setting?.target && setting?.target.trim().length > 0)) {
                let target = setting.target;
                if(context && target.indexOf("${") >= 0) {
                    target = Utilities.translateVariables(target,context.params);
                }
                this.logger.debug(this.constructor.name+".terminate: moving file to",target);
                for(let file of this.filelists) {
                    try {
                        let info = path.parse(file);
                        let filename = info.base;
                        let destination = target+filename;
                        this.logger.debug(this.constructor.name+".terminate: moving file",destination);
                        let deleteres = await this.storage.moveFile(file,destination);
                        this.logger.debug(this.constructor.name+".terminate: moved file",destination,"response",deleteres);
                    } catch(ex) { this.logger.error(this.constructor.name+".terminate: move file error",ex); }
                }
            }
        }
    }

}
