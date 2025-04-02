import { HTTP } from "@willsofts/will-api";
import { KnModel } from "@willsofts/will-db";
import { KnResultSet } from "@willsofts/will-sql";
import { KnContextInfo, VerifyError } from '@willsofts/will-core';
import { ExtractControlHandler } from "./ExtractControlHandler";
import { MigrateRecords, MigrateRecordSet, MigrateParams, MigrateDataRow, FilterInfo, MigrateState } from "../models/MigrateAlias";
import fs from 'fs';

export class ExtractTextHandler extends ExtractControlHandler {
    public notename : string = "TEXT";

    protected override async performDataSet(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, rs: KnResultSet, options: any = {}): Promise<MigrateRecordSet> {
        let fullfilename = this.getFullFileName(model,record.migrateid);
        this.logger.debug(this.constructor.name+".performDataSet: save as",fullfilename);
        let datafields = this.scrapeDataFields(model?.fields);
        let data : MigrateDataRow = {state: MigrateState.START, index: 0, datarow: undefined, rs, fields: datafields || model.cells, options: options};
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
        await super.performDataSet(context,model,rc,record,param,rs,options);
        this.printFooter(model,data);
        if(data.options?.writer) {
            await new Promise<void>((resolve, reject) => {
                data.options.writer.end(async () => { 
                    param.notefile = data.options.notefile;
                    if(param.notefile) {
                        if(fs.existsSync(param.notefile)) {
                            let buffer = fs.readFileSync(param.notefile);
                            try {
                                await this.updateStream(context,param,record,buffer);
                            } catch(ex) {
                                this.logger.error(ex);
                                reject(ex);
                            }
                        } else {
                            reject(new VerifyError(`File not found ${param.notefile}`,HTTP.NOT_FOUND,-16060,record.processid));
                        }
                    }
                    resolve();
                });
            });
        }
        return record;
    }

    protected override async performDataRow(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, data: MigrateDataRow): Promise<FilterInfo> {
        if(data.state == MigrateState.RUN) {
            let writer = data.options?.writer;
            if(writer) {
                let values = this.serializeDataRow(model,data);
                if(values) writer.write(values+"\n");
            }
        }
        return { cancel: this.cancelDataRow };
    }

    protected override printHeader(model: KnModel, data: MigrateDataRow) {
         if(String(model.settings?.header ?? "true") == "true") {
            let writer = data.options?.writer;
            if(writer) {
                let delimiter = this.getDelimiter(model);
                let captions = [];
                if(Array.isArray(data.fields)) {
                    let cells = data.fields;
                    for(let cell of cells) {
                        captions.push(cell.caption || cell.name);
                    }
                } else {
                    for(let key in data.fields) {
                        let dbf = data.fields[key];
                        captions.push(dbf?.options?.caption || key);
                    }
                }
                let values = Object.values(captions).join(delimiter);
                writer.write(values+"\n");
            }
        }
    }
    
    protected override serializeDataRow(model: KnModel, data: MigrateDataRow) : string | undefined {
        if(!data.datarow) return undefined;
        let delimiter = this.getDelimiter(model);
        if(model.settings?.quotable) {
            return Object.values(data.datarow)
            .map(v => v instanceof Date ? ("\""+v.toISOString()+"\"") : (v?"\""+v+"\"":""))
            .join(delimiter);
        } else {
            return Object.values(data.datarow)
            .map(v => v instanceof Date ? v.toISOString() : v)
            .join(delimiter);
        }
    }

}
