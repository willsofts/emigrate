import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnDBConnector } from "@willsofts/will-sql";
import { KnContextInfo } from '@willsofts/will-core';
import { TaskModel, MigrateTask, MigrateRecordSet, MigrateParams, MigrateRecords } from "../models/MigrateAlias";
import { ExtractHandler } from "./ExtractHandler";
import { TknOperateHandler } from "@willsofts/will-serv";
import { ExtractTextHandler } from "./ExtractTextHandler";
import { ExtractTextFixHandler } from "./ExtractTextFixHandler";
import { ExtractJsonHandler } from "./ExtractJsonHandler";
import { ExtractXmlHandler } from "./ExtractXmlHandler";
import { ExtractExcelHandler } from "./ExtractExcelHandler";
import { ExtractPDFHandler } from "./ExtractPDFHandler";
export class ExtractFileHandler extends ExtractHandler {

    public async processCollectingModel(context: KnContextInfo, task: MigrateTask, taskmodel: TaskModel, param: MigrateParams, db: KnDBConnector | undefined, rc: MigrateRecords): Promise<MigrateRecordSet> {
        let extract = context.params?.extract || taskmodel.settings?.extract || "json";
        this.logger.debug(this.constructor.name+".processCollectingModel: extract",extract);
        let handler : ExtractHandler | undefined = undefined;
        if(extract == 'text' || extract == 'txt' || extract == 'csv') {
            handler = new ExtractTextHandler();
        } else if(extract == "fix") {
            handler = new ExtractTextFixHandler();
        } else if(extract == "json") {
            handler = new ExtractJsonHandler();
        } else if(extract == "xml") {
            handler = new ExtractXmlHandler();
        } else if(extract == "excel" || extract == "xlsx" || extract == "xls") {
            handler = new ExtractExcelHandler();
        } else if(extract == "pdf") {
            handler = new ExtractPDFHandler();
        }
        if(handler) {
            this.assignHandler(handler);
            param.notename = handler.notename;
            return await handler.processCollectingModel(context, task, taskmodel, param, db, rc);
        }
        return Promise.reject(new VerifyError("Not supported",HTTP.NOT_ACCEPTABLE,-16067)); 
    }

    protected assignHandler(handler: TknOperateHandler) {
        handler.obtain(this.broker,this.logger);
        handler.userToken = this.userToken;
    }

}
