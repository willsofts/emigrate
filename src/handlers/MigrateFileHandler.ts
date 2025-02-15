import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { MigrateResultSet } from "../models/MigrateAlias";
import { MigrateTextHandler } from "./MigrateTextHandler";
import { MigrateJsonHandler } from "./MigrateJsonHandler";
import { MigrateExcelHandler } from "./MigrateExcelHandler";
import { MigrateXlsxHandler } from "./MigrateXlsxHandler";
import { MigrateXmlHandler } from "./MigrateXmlHandler";
import { TknOperateHandler } from "@willsofts/will-serv";
import path from 'path';

export class MigrateFileHandler extends MigrateTextHandler {

    public handlers = [ {name: "file"}, {name: "text"}, {name: "csv"}, {name: "json"}, {name: "excel"}, {name: "xlsx"}, {name: "xml"} ];

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
        return await this.doInserting(context);
    }

    protected async doJson(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        let handler = new MigrateJsonHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context);
    }

    protected async doExcel(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        let handler = new MigrateExcelHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context);
    }

    protected async doXlsx(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        let handler = new MigrateXlsxHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context);
    }

    protected async doXml(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        let handler = new MigrateXmlHandler();
        this.assignHandler(handler);
        return await handler.doInserting(context);
    }

    protected async doFile(context: KnContextInfo, model: KnModel) : Promise<MigrateResultSet> {
        await this.validateRequireFields(context,model);
        let file = context.params.file;
        let isText = false;
        let isJson = false;
        let isXlsx = false;
        let isXml = false;
        if(file) {
            const textfiletypes = new RegExp("text|txt|csv","i");
            const jsonfiletypes = new RegExp("json","i");
            const xlsxfiletypes = new RegExp("xlsx|xls","i");
            const xmlfiletypes = new RegExp("xml","i");
            const extname = path.extname(file).toLowerCase();
            isText = textfiletypes.test(extname);
            isJson = jsonfiletypes.test(extname);
            isXlsx = xlsxfiletypes.test(extname);
            isXml = xmlfiletypes.test(extname);
        }
        let type = context.params.type;
        if(isText) {
            if("json"==type) {
                return this.doJson(context,model);
            } else {
                return this.doText(context,model);
            }
        } else if(isJson || "json"==type) {
            return this.doJson(context,model);
        } else if(isXml || "xml"==type) {
            return this.doXml(context,model);
        } else if(isXlsx) {
            if("excel"==type) {
                return this.doExcel(context,model);
            } else {
                return this.doXlsx(context,model);
            }
        }
        return Promise.reject(new VerifyError("Not supported",HTTP.NOT_ACCEPTABLE,-16067)); 
    }

}
