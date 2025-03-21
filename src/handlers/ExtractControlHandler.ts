import { KnModel, KnFieldSetting, KnCellSetting } from "@willsofts/will-db";
import { ExtractHandler } from "./ExtractHandler";
import { EXTRACT_FILE_PATH } from "../utils/EnvironmentVariable";
import { MigrateDataRow } from "../models/MigrateAlias";
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';

export class ExtractControlHandler extends ExtractHandler {
    public loggingStreamWhenAsync : boolean = false;
    public cancelDataRow: boolean = true;

    protected getDelimiter(model: KnModel) : string {
        let delimiter = model.settings?.delimiter || "";
        if("TAB"==delimiter) delimiter = "\t";
        return delimiter;
    }

    protected getExtension(name: string = this.notename) : string {
        if(name == 'TEXT') return ".txt";
        else if(name == 'EXCEL') return ".xlsx";
        return "."+name.toLowerCase();
    }

    protected getFullFileName(model: KnModel, fileid: string = uuid()) : string {
        let filepath = model.settings?.filepath || EXTRACT_FILE_PATH;
        let filename = (model.settings?.filename || model.name) + this.getExtension();
        let fullfilename = path.join(filepath,filename);
        if("auto"===model.settings?.naming || "true"===model.settings?.naming) {
            fullfilename = path.join(filepath,fileid + this.getExtension());
        }
        if(!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath, { recursive: true });
        }
        return fullfilename;
    }

    protected getOptions(name: string, fields: KnFieldSetting | KnCellSetting[] | undefined) : any {
        if(fields) {
            if(Array.isArray(fields)) {
                let cell = fields.find((item:KnCellSetting) => item.name == name);
                return cell?.options;
            } else {
                let dbf = fields[name];
                return dbf?.options;
            }
        }
        return undefined;
    }

    /*
    protected override async performDataRow(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, data: MigrateDataRow): Promise<FilterInfo> {
        if(data.state == MigrateState.START) {
            let filepath = model.settings?.filepath || EXTRACT_FILE_PATH;
            let filename = (model.settings?.filename || model.name) + ".txt";
            let fullfilename = path.join(filepath,filename);
            if("auto"===model.settings?.naming || "true"===model.settings?.naming) {
                let fileid = uuid();
                fullfilename = path.join(filepath,fileid + ".txt");
            }
            if(!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, { recursive: true });
            }
            this.logger.debug(this.constructor.name+".performDataRow: save as",fullfilename);
            await new Promise<void>((resolve, reject) => {
                try {
                    const writer = fs.createWriteStream(fullfilename, { autoClose: true });            
                    writer.on('error', (err: Error) => {
                        reject(err);
                    });
                    data.options.writer = writer;
                    data.options.notefile = fullfilename;
                    resolve();
                } catch(ex) { 
                    reject(ex);
                }
            });
            this.printHeader(model,data);
        } else if(data.state == MigrateState.RUN) {
            let writer = data.options?.writer;
            if(writer) {
                let values = this.serializeDataRow(model,data);
                if(values) writer.write(values+"\n");
            }
        } else if(data.state == MigrateState.FINISH) {
            this.printFooter(model,data);
            if(data.options?.writer) {
                await new Promise<void>((resolve, reject) => {
                    data.options.writer.end(() => { 
                        param.notefile = data.options.notefile;
                        if(param.notefile) {
                            if(fs.existsSync(param.notefile)) {
                                let buffer = fs.readFileSync(param.notefile);
                                this.updateStream(context,param,record,buffer);
                            } else {
                                reject(new VerifyError(`File not found ${param.notefile}`,HTTP.NOT_FOUND,-16060,record.processid));
                            }
                        }
                        resolve();
                    });
                });
            }
        }
        return { cancel: this.cancelDataRow };
    }
    */

    protected printHeader(model: KnModel, data: MigrateDataRow) {

    }

    protected printFooter(model: KnModel, data: MigrateDataRow) {

    }

    protected serializeDataRow(model: KnModel, data: MigrateDataRow) : string | undefined {
        return undefined;
    }

}
