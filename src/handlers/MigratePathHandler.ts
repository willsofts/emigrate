import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { MigrateResultSet, PluginSetting, FileInfo } from "../models/MigrateAlias";
import { DEFAULT_CALLING_SERVICE } from "../utils/EnvironmentVariable";
import { MigrateUtility } from "../utils/MigrateUtility";
import { MigrateFileHandler } from "./MigrateFileHandler";

export class MigratePathHandler extends MigrateFileHandler {
    public handlers = [ {name: "insert"} ];

    protected override async doManipulating(context: KnContextInfo, model: KnModel = this.model, calling: boolean = DEFAULT_CALLING_SERVICE, fortype?: string) : Promise<MigrateResultSet> {
        await this.validateRequireFields(context,model);
        let taskid = context.params.taskid;
        let taskmodel = await this.getTaskModel(context,taskid);
        this.logger.debug(this.constructor.name+".doManipulating: taskmodel",taskmodel);
        if(!taskmodel || taskmodel.models?.length==0) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        context.meta.taskmodel = taskmodel;
        let uuid = this.randomUUID();
        if(!context.params.processid) context.params.processid = uuid;
        let filearray : FileInfo[] | undefined = undefined;
        let path = context.params.path;
        if(path && path.trim().length > 0) {
            filearray = await MigrateUtility.getFileInfos(path);
        }
        let plugin = taskmodel.configs?.plugin as PluginSetting;        
        if(!filearray && plugin) {
            let handler = await this.getPluginHandler(plugin);
            if(handler) {
                let [src,fileinfo] = await handler.perform(plugin,context,model);                
                if(fileinfo) {
                    if(Array.isArray(fileinfo)) {
                        fortype = fortype || plugin?.filetype;
                        filearray = fileinfo;
                        path = src;
                    }
                }
            }
        }
        if(filearray && filearray.length > 0) {
            let result : MigrateResultSet = { taskid: context.params.taskid, processid: context.params.processid, filepath: path, resultset: [] };
            for(let file of filearray) {
                if(file.isFile) {
                    context.params.file = file;
                    let rs = await this.performFile(context,model,{calling: calling, file: file, type: context.params.type, fortype: fortype});
                    if(rs?.resultset) {
                        rs.resultset.forEach((rss) => result.resultset.push(rss));
                    }
                }
            }
            return result;
        }
        return Promise.reject(new VerifyError("File not found",HTTP.NOT_FOUND,-16064));
    }

}
