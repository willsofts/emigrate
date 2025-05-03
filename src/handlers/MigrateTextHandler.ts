import { HTTP } from "@willsofts/will-api";
import { KnModel, KnFieldSetting } from "@willsofts/will-db";
import { KnContextInfo, KnValidateInfo, KnDataSet } from '@willsofts/will-core';
import { VerifyError } from "@willsofts/will-core";
import { KnDBConnector } from "@willsofts/will-sql";
import { MigrateHandler } from "./MigrateHandler";
import { MigrateUtility } from "../utils/MigrateUtility";
import { TaskModel, MigrateRecordSet, MigrateResultSet, MigrateParams, MigrateRecords } from "../models/MigrateAlias";
import { DEFAULT_CALLING_SERVICE, DOWNLOAD_FILE_PATH } from "../utils/EnvironmentVariable";
import LineByLine from "n-readlines";
import fs from 'fs';
import path from "path";

export class MigrateTextHandler extends MigrateHandler {
    
    protected override async validateRequireFields(context: KnContextInfo, model: KnModel, action?: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"taskid","file");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    protected async doDataFile(context: KnContextInfo, model: KnModel = this.model) : Promise<void> {
        //check client submit data file with base64?
        if(context.params?.datafile) {
            let file = context.params?.file;
            let type = context.params?.type;
            if(!file && !type) {
                return Promise.reject(new VerifyError("File or type is undefined",HTTP.NOT_ACCEPTABLE,-16062));
            }
            let filename = this.randomUUID()+(type?"."+type:""); 
            if(file) {
                let info = path.parse(file);
                filename = info.base;
                if("auto"===context.params?.naming || "true"===context.params?.naming) {
                    let fileid = this.randomUUID();
                    filename = fileid + info.ext;        
                }
            }
            let filepath = model.settings?.path || DOWNLOAD_FILE_PATH;
            let fullfilename = path.join(filepath, filename);            
            if(!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, { recursive: true });
            }
            this.logger.debug(this.constructor.name+".doDataFile: saving as :",fullfilename);
            let buffer = Buffer.from(context.params.datafile,"base64");
            const writer = fs.createWriteStream(fullfilename, { autoClose: true });
            writer.write(buffer);
            writer.end();
            await new Promise<void>((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            context.params.file = fullfilename;
        }
    }

    public override async doInserting(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE): Promise<MigrateResultSet> {
        await this.doDataFile(context,model);
        let file = context.params.file;
        this.logger.debug(this.constructor.name+".doInserting: file",file);
        let filename = file;
        if(typeof file === "object") {
            filename = file.path;
        }
        if(!filename || filename.trim().length==0) {
            return Promise.reject(new VerifyError("File is undefined",HTTP.NOT_ACCEPTABLE,-16065));
        }
        let foundfile = fs.existsSync(filename);
        if(!foundfile) {
            return Promise.reject(new VerifyError("File not found",HTTP.NOT_ACCEPTABLE,-16064));
        }        
        let taskmodel = context.meta.taskmodel;
        if(!taskmodel) {
            taskmodel = await this.getTaskModel(context,context.params.taskid);
        }
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        let uuid = this.randomUUID();
        if(!context.params.migrateid) context.params.migrateid = uuid;
        if(!context.params.processid) context.params.processid = uuid;
        let param : MigrateParams = { authtoken: this.getTokenKey(context), filename: filename, fileinfo: file, calling: calling, async: String(context.params.async)=="true" };
        let result = await this.processInserting(context,taskmodel,param,context.params.dataset);
        this.logger.debug(this.constructor.name+".doInserting: result",{taskid: result.taskid, processid: result.processid, async: context.params.async});
        return result;
    }

    public override async processInsertingModel(context: KnContextInfo, taskmodel: TaskModel, param: MigrateParams, db: KnDBConnector | undefined): Promise<MigrateRecordSet> {
        if(!this.userToken) this.userToken = await this.getUserTokenInfo(context);
        if(!param.authtoken) param.authtoken = this.getTokenKey(context);
        let uuid = this.randomUUID();
        let migrateid = context.params.migrateid || uuid;
        let processid = context.params.processid || uuid;
        this.logger.debug(this.constructor.name+".processInsertingModel: model",taskmodel,"filename",param.filename);
        let result = { migrateid: migrateid, processid: processid, taskid: context.params.taskid, modelname: taskmodel.name, totalrecords: 0, errorrecords: 0, skiprecords: 0, posterror: false, ...this.createRecordSet() };
        let [datalist,header] = await this.performReading(context, taskmodel, param.filename);
        if(datalist) {
            if(this.isEmptyObject(datalist)) {
                return result;
            }
            let totalrecords = Array.isArray(datalist) ? datalist.length : 1;
            let reconcileCounter = context.params.reconcileCounter;
            this.logger.debug(this.constructor.name+".processInsertModel: total",totalrecords,"reconcileCounter",reconcileCounter);
            if(typeof reconcileCounter !== 'undefined' && reconcileCounter != totalrecords) {
                return Promise.reject(new VerifyError("Reconcile error ("+totalrecords+":"+reconcileCounter+")",HTTP.NOT_ACCEPTABLE,-16072));
            }
            let rc : MigrateRecords = { totalrecords: totalrecords, errorrecords: 0, skiprecords: 0 };
            let handler = new MigrateHandler();
            handler.obtain(this.broker,this.logger);
            handler.userToken = this.userToken;
            return await handler.processInsertingModel(context,taskmodel,param,db,rc,datalist,header);
        }
        return result;
    }

    public async performReading(context: KnContextInfo, taskmodel: KnModel, file: string) : Promise<[any,any]> {
        let decoding : BufferEncoding = "utf-8";
        if(taskmodel.settings?.decoding) decoding = taskmodel.settings.decoding;
        let header : any = {};
        let datalist : any = [];
        let lineByLine = new LineByLine(file);
        let line;
        let lineno = 0;
        let skip = 0;
        if(taskmodel.settings?.skip) skip = taskmodel.settings.skip;
        while(line = lineByLine.next()) {
            lineno++;
            let text = line.toString(decoding);
            if(lineno <= skip) {
                let headset = await this.composeDataSet(taskmodel,taskmodel.settings?.header,text,lineno);
                if(headset) {
                    let hds = await this.scrapeDataSet(taskmodel,taskmodel.settings?.header,lineno,headset);
                    if(hds) {
                        header = { ...header, ...hds };
                    }
                }
                continue;
            }
            let dataset = await this.composeDataSet(taskmodel,taskmodel.fields,text,lineno);
            //this.logger.debug("Line: "+lineno,", text: ",text);
            //this.logger.debug("dataset: ",dataset);
            //this.logger.debug("header: ",header);
            if(dataset) {
                datalist.push(dataset);
            }
        }
        return [datalist.length > 0 ? datalist: undefined, header];
    }

    public async scrapeDataSet(taskmodel: KnModel, fields: KnFieldSetting | undefined, index: number, dataset: any) : Promise<any> {
        if(fields) {
            let result : KnDataSet = {};
            for(let fname in fields) {
                let dbf = fields[fname];
                if(dbf) {
                    if(index == dbf.options?.line) {
                        result[fname] = dataset[fname];
                    }
                }
            }
            if(Object.keys(result).length > 0) {
                return result;
            }
        }
        return undefined;
    }

    public async composeDataSet(taskmodel: KnModel, fields: KnFieldSetting | undefined, text: string, index: number) : Promise<KnDataSet | undefined> {
        text = text.trim();
        if(text.length>0) {
            let dataset = await this.scratchString(taskmodel,fields,text,index);
            if(dataset) return dataset;
            return await this.tokenizeString(taskmodel,fields,text,index);
        }
        return undefined;
    }

    public async scratchString(taskmodel: KnModel, fields: KnFieldSetting | undefined, text: string, index: number, checking: boolean = false, triming: boolean = true) : Promise<KnDataSet | undefined> {
        if(fields) {
            let settings = taskmodel.settings;
            let dataset : KnDataSet = {};
            for(let fname in fields) {
                let dbf = fields[fname];
                if(dbf) {
                    let startIndex = dbf.options?.startIndex;
                    let endIndex = dbf.options?.endIndex || -1;
                    if(startIndex !== undefined && endIndex !== undefined) {
                        if(startIndex >= 0) {
                            if(checking) {
                                let len = text.length;
                                if(startIndex > len || endIndex > len) {
                                    continue;
                                }
                            }
                            if(endIndex >= 0 && endIndex >= startIndex) {
                                let value = "";
                                if(text.length > endIndex) {
                                    value = text.substring(startIndex,endIndex+1);
                                }
                                dataset[fname] = settings?.quotable? MigrateUtility.removeDoubleQuote(triming?value.trim():value) : (triming?value.trim():value);
                            } else if(endIndex < 0) {
                                let value = "";
                                if(text.length > startIndex) {
                                    value = text.substring(startIndex);
                                }
                                dataset[fname] = settings?.quotable? MigrateUtility.removeDoubleQuote(triming?value.trim():value) : (triming?value.trim():value);
                            }
                        }
                    }
                }
            }
            if(Object.keys(dataset).length > 0) {
                dataset["rowIndex"] = index;
                return dataset;
            }
        }
        return undefined;
    }

    public async tokenizeString(taskmodel: KnModel, fields: KnFieldSetting | undefined, text: string, index: number) : Promise<KnDataSet | undefined> {
        let settings = taskmodel.settings;
        let delimiter = ",";
        if(settings?.delimiter) delimiter = settings.delimiter;
        let texts = delimiter==',' ? text.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) : text.split(delimiter=="TAB"?'\t':delimiter);
        return await this.scrapeDataArray(taskmodel, fields, texts, index);
    }

    public async scrapeDataArray(taskmodel: KnModel, fields: KnFieldSetting | undefined, texts: string[], index: number) : Promise<KnDataSet | undefined> {
        let settings = taskmodel.settings;
        if(texts.length > 0) {
            if(fields) {
                let dataset : KnDataSet = {};
                for(let fname in fields) {
                    let dbf = fields[fname];
                    if(dbf.options?.seqno && texts.length >= dbf.options?.seqno) {
                        let value = texts[dbf.options.seqno-1];
                        if(value) dataset[fname] = settings?.quotable? MigrateUtility.removeDoubleQuote(value.trim()) : value.trim();
                    }
                }
                dataset["rowIndex"] = index;
                return dataset;
            }
        }
        return undefined;
    }

}
