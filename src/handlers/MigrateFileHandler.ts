import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnValidateInfo } from '@willsofts/will-core';
import { MigrateResultSet, FileInfo } from "../models/MigrateAlias";
import { MigrateTextHandler } from "./MigrateTextHandler";
import { MigrateJsonHandler } from "./MigrateJsonHandler";
import { MigrateExcelHandler } from "./MigrateExcelHandler";
import { MigrateXlsxHandler } from "./MigrateXlsxHandler";
import { MigrateXmlHandler } from "./MigrateXmlHandler";
import { MigrateUtility } from "../utils/MigrateUtility";
import { DEFAULT_CALLING_SERVICE } from "../utils/EnvironmentVariable";
import { TknOperateHandler } from "@willsofts/will-serv";
import path from 'path';
import fs from "fs";

export class MigrateFileHandler extends MigrateTextHandler {

    public handlers = [ {name: "insert"}, {name: "file"}, {name: "text"}, {name: "csv"}, {name: "json"}, {name: "excel"}, {name: "xlsx"}, {name: "xml"} ];

    protected override async validateRequireFields(context: KnContextInfo, model: KnModel, action?: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"taskid");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    public async file(context: KnContextInfo) : Promise<MigrateResultSet> {
        return this.callFunctional(context, {operate: "file", raw: false}, this.doFile);
	}

    public async text(context: KnContextInfo) : Promise<MigrateResultSet> {
        return this.callFunctional(context, {operate: "text", raw: false}, this.doText);
	}

    public async csv(context: KnContextInfo) : Promise<MigrateResultSet> {
        return this.callFunctional(context, {operate: "csv", raw: false}, this.doText);
	}

    public async json(context: KnContextInfo) : Promise<MigrateResultSet> {
        return this.callFunctional(context, {operate: "json", raw: false}, this.doJson);
	}

    public async excel(context: KnContextInfo) : Promise<MigrateResultSet> {
        return this.callFunctional(context, {operate: "excel", raw: false}, this.doExcel);
	}

    public async xlsx(context: KnContextInfo) : Promise<MigrateResultSet> {
        return this.callFunctional(context, {operate: "xlsx", raw: false}, this.doXlsx);
	}

    public async xml(context: KnContextInfo) : Promise<MigrateResultSet> {
        return this.callFunctional(context, {operate: "xml", raw: false}, this.doXml);
	}

    protected assignHandler(handler: TknOperateHandler) {
        handler.obtain(this.broker,this.logger);
        handler.userToken = this.userToken;
    }

    protected async doText(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        return await this.doManipulating(context,model,undefined,"text"); 
    }

    protected async doJson(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        return await this.doManipulating(context,model,undefined,"json"); 
    }

    protected async doExcel(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        return await this.doManipulating(context,model,undefined,"excel"); 
    }

    protected async doXlsx(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        return await this.doManipulating(context,model,undefined,"xlsx"); 
    }

    protected async doXml(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        return await this.doManipulating(context,model,undefined,"xml"); 
    }

    protected async doFile(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        return await this.doManipulating(context,model); 
    }

    protected async processText(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE) : Promise<MigrateResultSet> {
        let handler = new MigrateTextHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context,undefined,calling);
    }

    protected async processJson(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE) : Promise<MigrateResultSet> {
        let handler = new MigrateJsonHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context,undefined,calling);
    }

    protected async processExcel(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE) : Promise<MigrateResultSet> {
        let handler = new MigrateExcelHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context,undefined,calling);
    }

    protected async processXlsx(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE) : Promise<MigrateResultSet> {
        let handler = new MigrateXlsxHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context,undefined,calling);
    }

    protected async processXml(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE) : Promise<MigrateResultSet> {
        let handler = new MigrateXmlHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context,undefined,calling);
    }

    protected async processFile(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE, fortype?: string) : Promise<MigrateResultSet> {
        await this.validateRequireFields(context,model);
        let file = context.params.file;
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
        if(fortype) {
            if("text"==fortype || "txt"==fortype || "csv"==fortype) {
                return this.processText(context,model,calling); 
            } else if("json"==fortype) {
                return this.processJson(context,model,calling);
            } else if("xml"==fortype) {
                return this.processXml(context,model,calling);
            } else if("excel"==fortype) {
                return this.processExcel(context,model,calling);
            } else if("xlsx"==fortype) {
                return this.processXlsx(context,model,calling);
            }
        }   
        let isText = false;
        let isJson = false;
        let isXlsx = false;
        let isXml = false;
        if(filename) {
            const textfiletypes = new RegExp("text|txt|csv","i");
            const jsonfiletypes = new RegExp("json","i");
            const xlsxfiletypes = new RegExp("xlsx|xls","i");
            const xmlfiletypes = new RegExp("xml","i");
            const extname = path.extname(filename).toLowerCase();
            isText = textfiletypes.test(extname);
            isJson = jsonfiletypes.test(extname);
            isXlsx = xlsxfiletypes.test(extname);
            isXml = xmlfiletypes.test(extname);
        }
        let type = context.params.type;
        if(isText) {
            if("json"==type) {
                return this.processJson(context,model,calling);
            } else {
                return this.processText(context,model,calling);
            }
        } else if(isJson || "json"==type) {
            return this.processJson(context,model,calling);
        } else if(isXml || "xml"==type) {
            return this.processXml(context,model,calling);
        } else if(isXlsx) {
            if("excel"==type) {
                return this.processExcel(context,model,calling);
            } else {
                return this.processXlsx(context,model,calling);
            }
        }
        return Promise.reject(new VerifyError("Not supported",HTTP.NOT_ACCEPTABLE,-16067)); 
    }

    public override async doInserting(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE): Promise<MigrateResultSet> {
        return await this.doManipulating(context,model,calling); 
    }

    protected async doManipulating(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE, fortype?: string) : Promise<MigrateResultSet> {
        await this.validateRequireFields(context,model);
        let taskid = context.params.taskid;
        let taskmodel = await this.getTaskModel(context,taskid);
        this.logger.debug(this.constructor.name+".doFileDownload: taskmodel",taskmodel);
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        context.meta.taskmodel = taskmodel;
        let fileinfo = await this.doFileDownload(context, model, calling, fortype);
        if(fileinfo) {
            context.params.file = fileinfo;
            return await this.processFile(context,model,calling,fortype);
        }
        let fileftp = await this.doFileTransfer(context, model, calling, fortype);
        if(fileftp) {
            context.params.file = fileftp;
            return await this.processFile(context,model,calling,fortype);
        }
        return await this.processFile(context,model,calling,fortype);
    }

    protected async doFileDownload(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE, fortype?: string) : Promise<FileInfo | undefined> {
        await this.validateRequireFields(context,model);
        let taskmodel = context.meta.taskmodel;
        if(!taskmodel) {
            taskmodel = await this.getTaskModel(context,context.params.taskid);
            this.logger.debug(this.constructor.name+".doFileDownload: taskmodel",taskmodel);
        }
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        let setting = taskmodel.configs?.download;
        if(setting) {
            let res = await this.performDownload(setting);
            this.logger.debug(this.constructor.name+".doFileDownload: response",res);
            if(res && res.file) {
                try {
                    let fileinfo = await MigrateUtility.getFileInfo(res.file);
                    fileinfo.originalname = res.target;
                    //this.logger.debug(this.constructor.name+".doFileDownload: fileinfo",fileinfo);
                    return fileinfo;
                } catch(ex: any) {
                    return Promise.reject(this.getDBError(ex));
                }
            }
        }
        return undefined;
    }

    protected async doFileTransfer(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE, fortype?: string) : Promise<FileInfo | undefined> {
        await this.validateRequireFields(context,model);
        let taskmodel = context.meta.taskmodel;
        if(!taskmodel) {
            taskmodel = await this.getTaskModel(context,context.params.taskid);
            this.logger.debug(this.constructor.name+".doFileTransfer: taskmodel",taskmodel);
        }
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        let setting = taskmodel.configs?.transfer;
        if(setting) {

        }
        return undefined;
    }
}
