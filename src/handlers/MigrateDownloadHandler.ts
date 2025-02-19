import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { MigrateResultSet, FileInfo } from "../models/MigrateAlias";
import { MigrateFileHandler } from "./MigrateFileHandler";
import { MigrateUtility } from "../utils/MigrateUtility";
import { DEFAULT_CALLING_SERVICE } from "../utils/EnvironmentVariable";

export class MigrateDownloadHandler extends MigrateFileHandler {

    public handlers = [ {name: "insert"}, {name: "file"} ];

    public override async file(context: KnContextInfo) : Promise<MigrateResultSet> {
        return this.callFunctional(context, {operate: "file", raw: false}, this.doFileDownload);
	}

    protected override async doFileDownload(context: KnContextInfo, model: KnModel, calling: boolean = DEFAULT_CALLING_SERVICE) : Promise<FileInfo | undefined> {
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
            } else {
                return Promise.reject(new VerifyError("Download info not found",HTTP.NOT_ACCEPTABLE,-16071));         
            }
        } else {
            return Promise.reject(new VerifyError("No download setting found",HTTP.NOT_ACCEPTABLE,-16070));     
        }
    }
    
}
