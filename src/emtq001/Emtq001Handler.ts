import { KnModel, KnOperation, KnPageSetting } from "@willsofts/will-db";
import { KnSQLInterface } from "@willsofts/will-sql";
import { KnContextInfo, KnDataTable } from '@willsofts/will-core';
import { Utilities } from "@willsofts/will-util";
import { TknOperateHandler } from '@willsofts/will-serv';
import { PRIVATE_SECTION } from "../utils/EnvironmentVariable";

export class Emtq001Handler extends TknOperateHandler {
    public section = PRIVATE_SECTION;
    public progid = "emtq001";
    public model : KnModel = { 
        name: "tmigratelog", 
        alias: { privateAlias: this.section }, 
        fields: {
            migrateid: { type: "STRING", key: true },
            taskid: { type: "STRING" },
            processid: { type: "STRING" },
            processdate: { type: "DATE" },
            processtime: { type: "TIME" },
            processmillis: { type: "BIGINT" },
            processtype: { type: "STRING" },
            processstatus: { type: "STRING" },
            processflag: { type: "STRING" },
            tablename: { type: "STRING" },
            totalrecords: { type: "BIGINT" },
            records: { type: "BIGINT" },
            errorrecords: { type: "BIGINT" },
            skiprecords: { type: "BIGINT" },
            taskname: { type: "STRING", calculated: true },
        },
        //prefix naming with table name when select ex. table.column1,table.column2,...
        prefixNaming: true
    };

    protected override buildFilterQuery(context: KnContextInfo, model: KnModel, knsql: KnSQLInterface, selector: string, action?: string, subaction?: string, pageSetting?: KnPageSetting): KnSQLInterface {
        if(this.isCollectMode(action)) {
            let params = context.params;
            let counting = "count"==subaction;
            knsql.append(selector);
            if(!counting) {
                knsql.append(", tmigratetask.taskname ");
            }
            knsql.append(" from ");
            knsql.append(model.name);
            if(!counting) {
                knsql.append(" left join tmigratetask on tmigratetask.taskid = ").append(model.name).append(".taskid ");    
                if(params.taskname && params.taskname.length > 0) {
                    knsql.append("and tmigratetask.taskname LIKE ?taskname ");
                    knsql.set("taskname","%"+params.taskname+"%");
                }
            }
            let filter = " where ";
            if(params.processtype && params.processtype.length > 0) {
                knsql.append(filter).append(model.name).append(".processtype = ?processtype");
                knsql.set("processtype",params.processtype);
                filter = " and ";
            }
            if(params.fromdate && params.fromdate.length > 0) {
                let fromdate = Utilities.parseDate(params.fromdate);
                if(fromdate) {
                    knsql.append(filter).append(model.name).append(".processdate >= ?fromdate");
                    knsql.set("fromdate",fromdate);
                    filter = " and ";
                }
            }
            if(params.todate && params.todate.length > 0) {
                let todate = Utilities.parseDate(params.todate);
                if(todate) {
                    knsql.append(filter).append(model.name).append(".processdate <= ?todate");
                    knsql.set("todate",todate);
                    filter = " and ";
                }
            }
            if(params.taskname && params.taskname.length > 0) {
                knsql.append(filter).append(model.name).append(".taskid LIKE ?tasknaming");
                knsql.set("tasknaming","%"+params.taskname+"%");
            }
            if(!counting && pageSetting) {
                if(!pageSetting.orderBy || pageSetting.orderBy.length==0) {
                    pageSetting.orderBy = "processdate";
                }
            }
            return knsql;    
        }
        return super.buildFilterQuery(context, model, knsql, selector, action, subaction);
    }

    /**
     * Override for search action (return data collection)
     * @param context 
     * @param model 
     * @returns KnDataTable
     */
    public override async getDataSearch(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let rs = await this.doCollecting(context, model);
        return this.createDataTable(KnOperation.COLLECT, this.createRecordSet(rs), {}, this.progid+"/"+this.progid+"_data");
    }
    
}
