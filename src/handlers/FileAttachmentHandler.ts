import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { ATTACH_FILE_PATH } from "../utils/EnvironmentVariable";
import { ATTACH_MAIL_HOST, ATTACH_MAIL_PORT, ATTACH_MAIL_USER, ATTACH_MAIL_PASSWORD, ATTACH_MAIL_TLS, ATTACH_MAIL_TIMEOUT, ATTACH_MAIL_MARKSEEN, ATTACH_MAIL_FROM, ATTACH_MAIL_SUBJECT, ATTACH_MAIL_FILENAME } from "../utils/EnvironmentVariable";
import { FileSetting, PluginSetting } from "../models/MigrateAlias";
import { MigrateUtility } from "../utils/MigrateUtility";
import { PluginHandler } from "./PluginHandler";
import { FetchMail, FetchFile, FetchOptions } from "../utils/FetchMail";
import { v4 as uuid } from 'uuid';
import fs from "fs";
import path from "path";

export class FileAttachmentHandler extends PluginHandler {

    public async getConfig(setting: any) : Promise<any> {        
        return {
            imap: {
                user: setting?.user || ATTACH_MAIL_USER,
                password: setting?.password || ATTACH_MAIL_PASSWORD,
                host: setting?.host || ATTACH_MAIL_HOST,
                port: setting?.port || ATTACH_MAIL_PORT, // or 143 for non-SSL
                tls: setting?.tls || (typeof setting?.tls === 'undefined' && ATTACH_MAIL_TLS), // set to false for non-SSL
                authTimeout: setting?.authTimeout || ATTACH_MAIL_TIMEOUT,
                tlsOptions: {
                  rejectUnauthorized: false, // Disable SSL certificate validation
                }
            },
            options: { markSeen: setting?.markSeen || (typeof setting?.markSeen === 'undefined' && ATTACH_MAIL_MARKSEEN) },
            logger: this.logger
        };
    }

    public async fetchMail(config: any, options: FetchOptions) : Promise<FetchFile | undefined> {
        const imap = new FetchMail(config);
        try {
            const result = await imap.connect();
            this.logger.info(`${this.constructor.name}.fetchMail: connect=${result}`);
            const boxName = await imap.openBox();
            this.logger.info(`${this.constructor.name}.fetchMail: openBox=${boxName}`);
            const criteria = [];
            criteria.push('UNSEEN');
            //criteria.push(['SINCE', moment().format('MMMM DD, YYYY')]);
            if (options.from && options.from.trim().length > 0) {
                criteria.push(['HEADER', 'FROM', options.from]);
            } else if (options.subject && options.subject.trim().length > 0) {
                criteria.push(['HEADER', 'SUBJECT', options.subject]);
            }
            const emails = await imap.fetchEmails(criteria);
            if(emails && emails.length > 0) {
                for (const email of emails) {
                    let fetching = true;
                    if(options.subject && options.subject.trim().length > 0) {
                        fetching = email.subject ? email.subject.indexOf(options.subject) >= 0 : false;
                    }
                    if(fetching && options.from && options.from.trim().length > 0) {
                        fetching = email.from_address ? email.from_address.indexOf(options.from) >= 0 : false;
                    }
                    if(fetching) {
                        let fetchfile = undefined;
                        for (const file of email.files) {
                            //this.logger.info("file",file);
                            if(!fetchfile) fetchfile = file;
                            if(options.filenameFilter && options.filenameFilter.trim().length > 0) {
                                if(file.originalname.indexOf(options.filenameFilter) >= 0) {
                                    return file;
                                }
                            }
                        }    
                        return fetchfile;
                    }
                }
            }
            return undefined;
        } finally {
            try { await imap.end(); } catch(ex) { this.logger.error(ex); }
        }
    }
    
    protected async saveFile(fetchfile: FetchFile, filepath: string, options: FetchOptions) : Promise<string> {
        let fullfilename = path.join(filepath,fetchfile.originalname);
        let info = path.parse(fetchfile.originalname);
        if("auto"===options.naming || "true"===options.naming) {
            let fileid = uuid();
            fullfilename = path.join(filepath,fileid + info.ext);
        }
        this.logger.debug(this.constructor.name+".saveFile: saving as",fullfilename);
        const writer = fs.createWriteStream(fullfilename, { autoClose: true });
        writer.write(fetchfile.buffer);
        writer.end();
        await new Promise<void>((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        return fullfilename;
    }

    public override async performDownload(plugin: PluginSetting, context?: KnContextInfo, model: KnModel = this.model) : Promise<FileSetting | undefined> {
        this.logger.debug(this.constructor.name+".performDownload: plugin",MigrateUtility.maskAttributes(plugin));        
        let setting = plugin.property;
        //setting.source = from email , setting.target = attach filename filter
        if(setting?.source && setting?.source.trim().length > 0) {
            let source = setting.source;
            let reconcile = setting?.reconcile;
            if(reconcile && reconcile.trim().length > 0) source = reconcile;
            if(context && source.indexOf("${") >= 0) {
                source = Utilities.translateVariables(source,context.params);
            }
            setting.file = undefined;
            let filepath = setting?.path || ATTACH_FILE_PATH;
            if(!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, { recursive: true });
            }
            this.logger.debug(this.constructor.name+".performDownload: try fetch mail:",source,"("+setting.source+")");
            try {
                let config = await this.getConfig(setting);
                let options : FetchOptions = { 
                    from: setting?.from || ATTACH_MAIL_FROM || source,
                    subject: setting?.subject || ATTACH_MAIL_SUBJECT,
                    filenameFilter: setting?.target || ATTACH_MAIL_FILENAME,
                    naming: setting?.naming
                };
                const res = await this.fetchMail(config,options);
                this.logger.debug(this.constructor.name+".performDownload: fetch mail response:",res);
                if (res) {
                    let fullfilename = path.join(filepath,res.originalname);
                    if(!options.saveAttachment) {
                        fullfilename = await this.saveFile(res,filepath,options);
                    }
                    setting.file = fullfilename;
                    setting.originalname = res.originalname;
                    return setting;
                }
            } catch (err: any) {
                this.logger.error(err);
                return Promise.reject(err);
            }                
        }
        return undefined;
    }

}
