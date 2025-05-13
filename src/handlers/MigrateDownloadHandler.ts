import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { MigrateFileHandler } from "./MigrateFileHandler";
import { MigrateResultSet } from "../models/MigrateAlias";
import { DEFAULT_CALLING_SERVICE } from "../utils/EnvironmentVariable";

export class MigrateDownloadHandler extends MigrateFileHandler {

    public handlers = [ {name: "insert"}, {name: "file"} ];

    protected override async doManipulating(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE, fortype?: string) : Promise<MigrateResultSet> {
        await this.validateRequireFields(context,model);
        let taskid = context.params.taskid;
        let taskmodel = await this.getMigrateTaskModel(context,taskid);
        this.logger.debug(this.constructor.name+".doManipulating: taskmodel",taskmodel);
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        context.meta.taskmodel = taskmodel;
        let plugin = taskmodel.configs?.plugin;        
        if(plugin && plugin.name=="download") {
            let handler = await this.getPluginHandler(plugin);
            if(handler) {
                let fileinfo = await handler.perform(plugin,context,model);
                if(fileinfo) {
                    context.params.file = fileinfo;
                    await this.doReconcile(context,taskmodel,model);
                    return await this.processFile(context,model,calling,fortype);
                }
            } else {
                return Promise.reject(new VerifyError("Download handler not found",HTTP.NOT_ACCEPTABLE,-16071));
            }
        }
        return Promise.reject(new VerifyError("Download setting not found",HTTP.NOT_ACCEPTABLE,-16070));     
    }
    
}
