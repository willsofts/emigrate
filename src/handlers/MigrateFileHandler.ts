import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo, KnValidateInfo } from '@willsofts/will-core';
import { MigrateResultSet, PluginSetting, FileInfo, MigrateModel, MigrateFileInfo } from "../models/MigrateAlias";
import { MigrateTextHandler } from "./MigrateTextHandler";
import { MigrateJsonHandler } from "./MigrateJsonHandler";
import { MigrateExcelHandler } from "./MigrateExcelHandler";
import { MigrateXlsxHandler } from "./MigrateXlsxHandler";
import { MigrateXmlHandler } from "./MigrateXmlHandler";
import { MigrateHandler } from "./MigrateHandler";
import { DEFAULT_CALLING_SERVICE } from "../utils/EnvironmentVariable";
import { TknOperateHandler } from "@willsofts/will-serv";
import path from 'path';
import fs from "fs";
import { MigrateUtility } from "../utils/MigrateUtility";

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

    protected async processData(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE) : Promise<MigrateResultSet> {
        let handler = new MigrateHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context,undefined,calling);        
    }

    protected async processFile(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE, fortype?: string) : Promise<MigrateResultSet> {
        await this.validateRequireFields(context,model);
        await this.doDataFile(context,model);
        let result = await this.performFile(context,model,{calling: calling, file: context.params.file, type: context.params.type, fortype: fortype});
        if(result) return result;
        /*
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
        }*/
        return Promise.reject(new VerifyError("Not supported",HTTP.NOT_ACCEPTABLE,-16067)); 
    }

    protected async performFile(context: KnContextInfo, model: KnModel = this.model, fileinfo: MigrateFileInfo) : Promise<MigrateResultSet | undefined> {
        let file = fileinfo.file;
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
        let calling = fileinfo.calling;
        let fortype = fileinfo.fortype;
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
        let type = fileinfo.type;
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
        return undefined;
    }

    public override async doInserting(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE): Promise<MigrateResultSet> {
        let result = await this.doManipulating(context,model,calling); 
        this.logger.debug(this.constructor.name+".doInserting: result",{taskid: result.taskid, processid: result.processid, async: context.params.async});
        return result;
    }

    protected async doManipulating(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE, fortype?: string) : Promise<MigrateResultSet> {
        await this.validateRequireFields(context,model);
        let taskid = context.params.taskid;
        let taskmodel = await this.getTaskModel(context,taskid);
        this.logger.debug(this.constructor.name+".doManipulating: taskmodel",taskmodel);
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        context.meta.taskmodel = taskmodel;
        let plugin = taskmodel.configs?.plugin as PluginSetting;        
        if(plugin) {
            let handler = await this.getPluginHandler(plugin);
            if(handler) {
                let [src,fileinfo] = await handler.perform(plugin,context,model);                
                if(fileinfo) {
                    if(Array.isArray(fileinfo)) fileinfo = fileinfo[0];
                    if(plugin.name=="database") {
                        context.params.dataset = fileinfo.body;
                        return await this.processData(context,model,calling);
                    }
                    context.params.file = fileinfo;
                    await this.doReconcile(context,taskmodel,model);
                    return await this.processFile(context,model,calling,fortype || plugin?.filetype);
                }
            }
        }
        return await this.processFile(context,model,calling,fortype);
    }

    protected async doReconcile(context: KnContextInfo, taskmodel: MigrateModel, model: KnModel = this.model) : Promise<void> {
        let reconcile = taskmodel.configs?.reconcile as PluginSetting;
        let reconcile_model = taskmodel.configs?.reconcile?.model as KnModel;
        if(reconcile && reconcile_model) {
            reconcile.property.reconcile = context.params?.reconcile;
            this.logger.debug(this.constructor.name+".doRecocile: reconcile setting",reconcile,", model:",reconcile_model);
            let reconcile_handler = await this.getPluginHandler(reconcile);
            if(reconcile_handler) {
                let [src,reconcile_fileinfo] = await reconcile_handler.perform(reconcile,context,reconcile_model);
                if(reconcile_fileinfo) {
                    if(Array.isArray(reconcile_fileinfo)) reconcile_fileinfo = reconcile_fileinfo[0];
                    let [reconcile_data] = await this.processFileReading(context,reconcile_model,reconcile_fileinfo,reconcile?.filetype);
                    this.logger.debug(this.constructor.name+".doReconcile: reconcile data",reconcile_data);
                    if(reconcile_data) {
                        let dataitem = Array.isArray(reconcile_data) ? reconcile_data[0] : reconcile_data;
                        let datakeys = Object.keys(dataitem);
                        if(datakeys.length > 0) {
                            let counter_data = dataitem[reconcile_model.name || datakeys[0]];
                            if(counter_data) {
                                context.params.reconcileCounter = parseInt(counter_data);
                            }
                        }                        
                    }
                }
            }
        }
    }

    protected async processTextReading(context: KnContextInfo, model: KnModel = this.model, file: string) : Promise<[any,any]> {
        let handler = new MigrateTextHandler();
        this.assignHandler(handler);
        return await handler.performReading(context,model,file);
    }

    protected async processJsonReading(context: KnContextInfo, model: KnModel = this.model, file: string) : Promise<[any,any]> {
        let handler = new MigrateJsonHandler();
        this.assignHandler(handler);
        return await handler.performReading(context,model,file);
    }

    protected async processExcelReading(context: KnContextInfo, model: KnModel = this.model, file: string) : Promise<[any,any]> {
        let handler = new MigrateExcelHandler();
        this.assignHandler(handler);
        return await handler.performReading(context,model,file);
    }

    protected async processXlsxReading(context: KnContextInfo, model: KnModel = this.model, file: string) : Promise<[any,any]> {
        let handler = new MigrateXlsxHandler();
        this.assignHandler(handler);
        return await handler.performReading(context,model,file);
    }

    protected async processXmlReading(context: KnContextInfo, model: KnModel = this.model, file: string) : Promise<[any,any]> {
        let handler = new MigrateXmlHandler();
        this.assignHandler(handler);
        return await handler.performReading(context,model,file);
    }

    protected async processFileReading(context: KnContextInfo, model: KnModel = this.model, file: FileInfo, fortype?: string) : Promise<[any,any]> {
        let filename = file.path;
        if(!filename || filename.trim().length==0) {
            return Promise.reject(new VerifyError("File is undefined",HTTP.NOT_ACCEPTABLE,-16065));
        }
        let foundfile = fs.existsSync(filename);
        if(!foundfile) {
            return Promise.reject(new VerifyError("File not found",HTTP.NOT_ACCEPTABLE,-16064));
        }
        if(fortype) {
            if("text"==fortype || "txt"==fortype || "csv"==fortype) {
                return this.processTextReading(context,model,filename); 
            } else if("json"==fortype) {
                return this.processJsonReading(context,model,filename);
            } else if("xml"==fortype) {
                return this.processXmlReading(context,model,filename);
            } else if("excel"==fortype) {
                return this.processExcelReading(context,model,filename);
            } else if("xlsx"==fortype) {
                return this.processXlsxReading(context,model,filename);
            }
        }   
        let filetype = MigrateUtility.parseFileType(filename);
        this.logger.debug(this.constructor.name+".processFileReading: filetype",filetype);
        let type = context.params.type;
        if(filetype.isText) {
            if("json"==type) {
                return this.processJsonReading(context,model,filename);
            } else {
                return this.processTextReading(context,model,filename);
            }
        } else if(filetype.isJson || "json"==type) {
            return this.processJsonReading(context,model,filename);
        } else if(filetype.isXml || "xml"==type) {
            return this.processXmlReading(context,model,filename);
        } else if(filetype.isXlsx) {
            if("excel"==type) {
                return this.processExcelReading(context,model,filename);
            } else {
                return this.processXlsxReading(context,model,filename);
            }
        }
        return Promise.reject(new VerifyError("Not supported",HTTP.NOT_ACCEPTABLE,-16067)); 
    }

}
