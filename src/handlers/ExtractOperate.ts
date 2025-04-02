import { HTTP } from "@willsofts/will-api";
import { KnModel, KnSetting } from "@willsofts/will-db";
import { KnRecordSet } from "@willsofts/will-sql";
import { KnContextInfo, VerifyError, KnValidateInfo } from '@willsofts/will-core';
import { MigrateOperate } from "./MigrateOperate";
import { MigrateRecordSet, MigrateParams, MigrateInfo, MigrateReject  } from "../models/MigrateAlias";
import { MigrateLogHandler } from "./MigrateLogHandler";

export class ExtractOperate extends MigrateOperate {
    public settings : KnSetting = { rowsPerPage: 10, maxRowsPerPage: 100, maxLimit: -1, disableColumnSchema: true, disableQueryPaging: true, disablePageOffset: true };
    public progid: string = "extract";
    public loggingStreamWhenAsync : boolean = true;

    protected override async validateRequireFields(context: KnContextInfo, model: KnModel, action?: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"taskid");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }
    
    protected override insertLogging(context: KnContextInfo, taskmodel: KnModel, param: MigrateParams, rs: MigrateRecordSet, processtype: string = "EXPORT") {
        super.insertLogging(context,taskmodel,param,rs,processtype);
    }

    protected override updateLogging(context: KnContextInfo, param: MigrateParams, rs: MigrateRecordSet, info: MigrateInfo, reject: MigrateReject) {
        super.updateLogging(context,param,rs,info,reject);
        if(param.async && rs.rows) {
            if(!this.loggingStreamWhenAsync) return;
            this.updateStream(context, param, rs, rs.rows).catch(ex => this.logger.error(ex));
        }
    }

    protected async updateStream(context: KnContextInfo, param: MigrateParams, record: MigrateRecordSet, stream: any) : Promise<KnRecordSet> {
        let params = {authtoken: param.authtoken, migrateid: record.migrateid, processid: record.processid, notename: param.notename, notefile: param.notefile };
        let handler = new MigrateLogHandler();
        handler.obtain(this.broker,this.logger);
        handler.userToken = this.userToken;
        return await handler.updateStream({params: params, meta: context.meta}, stream);
    }

}
