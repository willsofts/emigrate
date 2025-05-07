import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { DOWNLOAD_FILE_PATH, UPLOAD_FILE_PATH, IMPORT_FTP_HOST, IMPORT_FTP_USER, IMPORT_FTP_PASSWORD, IMPORT_FTP_KEYFILE } from "../utils/EnvironmentVariable";
import { FileSetting, PluginSetting } from "../models/MigrateAlias";
import { MigrateUtility } from "../utils/MigrateUtility";
import { PluginHandler } from "./PluginHandler";
import { v4 as uuid } from 'uuid';
import fs from "fs";
import path from "path";
import SftpClient from "ssh2-sftp-client";
import { ConnectOptions } from "ssh2-sftp-client";

export class FileTransferHandler extends PluginHandler {

    private client : SftpClient | undefined = undefined;

    public async getClient() : Promise<SftpClient> {
        if(!this.client) {
            this.client = new SftpClient();
            this.client.on("error",(err) => this.logger.error("on error:",err));
        }
        return this.client;
    }
    
    public async getConfig(setting: any) : Promise<ConnectOptions> {
        let buffer = undefined;
        let keyfile = setting?.keyfile || IMPORT_FTP_KEYFILE;
        if(keyfile && keyfile.trim().length > 0) {
            if(!fs.existsSync(keyfile)) {
                return Promise.reject(new Error("Key file not found"));
            }
            buffer = fs.readFileSync(keyfile);
        }
        if(buffer) {
            return {
                host: setting?.host || IMPORT_FTP_HOST,
                port: setting?.port,
                username: setting?.user || IMPORT_FTP_USER,
                privateKey: buffer,
            };
        }
        return {
            host: setting?.host || IMPORT_FTP_HOST,
            port: setting?.port,
            username: setting?.user || IMPORT_FTP_USER,
            password: setting?.password || IMPORT_FTP_PASSWORD
        };
    }

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
            let filename = setting.target;
            let naming = String(setting.naming);
            if("auto"===naming || "true"===naming) {
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
            let sftp = undefined;
            try {
                let config = await this.getConfig(setting);
                sftp = await this.getClient();
                await sftp.connect(config);
                await sftp.get(source,fullfilename);
                this.logger.debug(this.constructor.name+".performDownload: get:",source,"("+setting.source+") as:",fullfilename);
                setting.file = fullfilename;
                return [source,setting];
            } catch (err: any) {
                this.logger.error(err);
                return Promise.reject(err);
                //return Promise.reject(new Error(`Error during transfer: ${err.message}`));
            } finally {
                if(sftp) sftp.end().catch(ex => this.logger.error(ex));
            }                
        }
        return ["",undefined];
    }

    public async performUpload(plugin: PluginSetting, context?: KnContextInfo, model: KnModel = this.model) : Promise<[string,FileSetting | undefined]> {
        this.logger.debug(this.constructor.name+".performDownload: plugin",MigrateUtility.maskAttributes(plugin));        
        let setting = plugin.property;
        if(setting?.source && setting?.source.trim().length > 0 && setting?.target && setting?.target.trim().length > 0) {
            let source = setting.source;
            if(context && source.indexOf("${") >= 0) {
                source = Utilities.translateVariables(source,context.params);
            }
            setting.file = undefined;
            let info = path.parse(setting.target);
            let filename = info.base; //setting.target;
            if("auto"===setting.naming || "true"===setting.naming) {
                let fileid = uuid();
                filename = fileid + info.ext;        
            }
            let filepath = setting?.path || UPLOAD_FILE_PATH;
            if(info.dir && info.dir.trim().length > 0) {
                filepath = info.dir;
            }
            let fullfilename = path.join(filepath, filename);
            let sftp = undefined;
            try {
                fullfilename = fullfilename.replaceAll('\\','/');
                let config = await this.getConfig(setting);
                sftp = await this.getClient();
                await sftp.connect(config);
                await sftp.put(source,fullfilename);
                this.logger.debug(this.constructor.name+".performDownload: put:",source,"("+setting.source+") as:",fullfilename);
                setting.file = fullfilename;
                return [source,setting];
            } catch (err: any) {
                this.logger.error(err);
                return Promise.reject(err);
                //return Promise.reject(new Error(`Error during transfer: ${err.message}`));
            } finally {
                if(sftp) sftp.end().catch(ex => this.logger.error(ex));
            }                
        }
        return ["",undefined];
    }

}
