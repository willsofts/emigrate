import { HTTP } from "@willsofts/will-api";
import { KnModel, KnOperation } from "@willsofts/will-db";
import { KnContextInfo, KnDataTable } from '@willsofts/will-core';
import { KnDBConnector, KnRecordSet, KnSQL, KnResultSet } from "@willsofts/will-sql";
import { Request, Response } from 'express';
import { MigrateLogHandler } from "./MigrateLogHandler";
import { ALWAYS_ERASE_DATA_STREAM } from "../utils/EnvironmentVariable";
import path from 'path';

export class ExtractLogHandler extends MigrateLogHandler {

    public async erase(context: KnContextInfo) : Promise<any> {
        return this.callFunctional(context, {operate: KnOperation.ERASE, raw: false}, this.doErase);
    }

    protected async doErase(context: KnContextInfo, model: KnModel) : Promise<any> {
        return this.doErasing(context, model);
    }

    protected async doErasing(context: KnContextInfo, model: KnModel, action: string = KnOperation.ERASE): Promise<KnRecordSet> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.performErasing(context, model, db);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    protected async performErasing(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        if((!context.params.migrateid || context.params.migrateid.trim().length==0) && (!context.params.processid || context.params.processid.trim().length==0)) return this.createRecordSet();
        let knsql = new KnSQL();
        knsql.append("delete from tmigratefile ");
        let filter = " where ";
        if(context.params.migrateid && context.params.migrateid.trim().length > 0) {
            knsql.append(filter).append("migrateid = ?migrateid ");        
            knsql.set("migrateid",context.params.migrateid);
            filter = " and ";
        }
        if(context.params.processid && context.params.processid.trim().length > 0) {
            knsql.append(filter).append("processid = ?processid ");        
            knsql.set("processid",context.params.processid);
            filter = " and ";
        }
        let rs = await knsql.executeUpdate(db,context);
        return this.createRecordSet(rs);
    }

    protected override async doRetrieving(context: KnContextInfo, model: KnModel, action: string = KnOperation.RETRIEVE): Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performRetrieving(context, model, db);
            if(rs.rows.length>0) {
                let row = rs.rows[0];
                return this.createDataTable(KnOperation.RETRIEVE, row);
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    protected async performRetrieving(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        if(!context.params.migrateid || context.params.migrateid.trim().length==0) return this.createRecordSet();
        let streamed = String(context.params.stream) == "true";
        let knsql = new KnSQL();
        knsql.append("select lg.migrateid,lg.taskid,lg.processid,lg.processdate,lg.processtime,lg.processstatus,lg.tablename,lg.notename ");
        if(streamed) { 
            knsql.append(",fi.datafile "); 
        }
        knsql.append("from tmigratelog lg ");
        if(streamed) {
            knsql.append("left join tmigratefile fi ON fi.migrateid = lg.migrateid ");
        }
        knsql.append("where lg.migrateid = ?migrateid ");
        knsql.set("migrateid",context.params.migrateid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    protected async doGet(context: KnContextInfo, model: KnModel) : Promise<KnDataTable> {
        let db = this.getPrivateConnector(model);
        try {
            let rs = await this.performGetting(context, model, db);
            if(rs.rows.length>0) {
                return this.createDataTable(KnOperation.RETRIEVE, {}, rs.rows);
            }
            return this.recordNotFound();
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

    protected async performGetting(context: KnContextInfo, model: KnModel, db: KnDBConnector): Promise<KnRecordSet> {
        if(!context.params.processid || context.params.processid.trim().length==0) return this.createRecordSet();
        let streamed = String(context.params.stream) == "true";
        let knsql = new KnSQL();
        knsql.append("select lg.migrateid,lg.taskid,lg.processid,lg.processdate,lg.processtime,lg.processstatus,lg.tablename,lg.notename ");
        if(streamed) { 
            knsql.append(",fi.datafile "); 
        }
        knsql.append("from tmigratelog lg ");
        if(streamed) {
            knsql.append("left join tmigratefile fi ON fi.migrateid = lg.migrateid ");
        }
        knsql.append("where lg.processid = ?processid ");
        knsql.set("processid",context.params.processid);
        let rs = await knsql.executeQuery(db,context);
        return this.createRecordSet(rs);
    }

    public async exports(context: KnContextInfo, req: Request, res: Response) : Promise<void> {
        this.logger.debug(this.constructor.name+".exports: params",context.params);
        let rs = await this.doGetLog(context);
        if(rs && rs.rows?.length > 0) {
            let row = rs.rows[0];
            if(row.processflag != '2') {
                res.status(HTTP.NOT_ALLOWED).send(row.processstatus || "PROCESSING");
                return;
            }
            let datafile = row.datafile;
            if(datafile) {
                let filename = row.tablename;
                if(row.sourcefile && row.sourcefile.trim().length > 0) path.parse(row.sourcefile).name;
                if(row.notefile && row.notefile.trim().length > 0) path.parse(row.notefile).name;
                let type = row.notename || context.params.type;
                if(type) type = type.toUpperCase();
                if("TEXT"==type || "TXT"==type) {
                    res.attachment(filename+".txt");
                    res.send(Buffer.from(datafile,"base64"));
                    this.tryErase(context);
                } else if("CSV"==type) {
                    res.attachment(filename+".csv");
                    res.send(Buffer.from(datafile,"base64"));
                    this.tryErase(context);
                } else if("JSON"==type) {
                    res.attachment(filename+".json");
                    res.send(Buffer.from(datafile,"base64"));
                    this.tryErase(context);
                } else if("XML"==type) {
                    res.attachment(filename+".xml");
                    res.send(Buffer.from(datafile,"base64"));
                    this.tryErase(context);
                } else if("PDF"==type) {
                    res.attachment(filename+".pdf");
                    res.send(Buffer.from(datafile,"base64"));
                    this.tryErase(context);
                } else if("XLSX"==type || "EXCEL"==type) {
                    res.attachment(filename+".xlsx");
                    res.send(Buffer.from(datafile,"base64"));
                    this.tryErase(context);
                } else if("XLS"==type) {
                    res.attachment(filename+".xls");
                    res.send(Buffer.from(datafile,"base64"));
                    this.tryErase(context);
                } else {
                    res.status(HTTP.NOT_IMPLEMENTED).send("Not known");
                }
                return;
            }
        }
        res.status(HTTP.NOT_FOUND).send("Not found");
    }

    protected async tryErase(context: KnContextInfo, model: KnModel = this.model) : Promise<void> {
        let erase = String(context.params.erase)=="true" || ALWAYS_ERASE_DATA_STREAM;
        if(erase) {
            this.erase(context).catch(err => console.error(err));
        }
    }
    
    protected async doGetLog(context: KnContextInfo, model: KnModel = this.model) : Promise<KnResultSet> {
        let processid = context.params.processid;
        let migrateid = context.params.migrateid;
        if((!processid || processid.trim().length == 0) && (!migrateid || migrateid.trim().length == 0)) return this.createRecordSet();
        let db = this.getPrivateConnector(model);
        try {
            let filter = " where ";
            let knsql = new KnSQL();
            knsql.append("select lg.taskid,lg.tablename,lg.sourcefile,lg.processstatus,lg.processflag,lg.notename,lg.notefile,fi.datafile ");
            knsql.append("from tmigratelog lg ");
            knsql.append("left join tmigratefile fi ON fi.migrateid = lg.migrateid ");
            if(migrateid && migrateid.trim().length > 0) {
                knsql.append(filter).append("lg.migrateid = ?migrateid ");
                knsql.set("migrateid",migrateid);
                filter = " and ";
            }
            if(processid && processid.trim().length > 0) {
                knsql.append(filter).append("lg.processid = ?processid ");
                knsql.set("processid",processid);
                filter = " and ";
            }
            if(context.params.processstatus && context.params.processstatus.trim().length > 0) {
                knsql.append(filter).append("lg.processstatus = ?processstatus ");
                knsql.set("processstatus",context.params.processstatus);
                filter = " and ";
            }
            let rs = await knsql.executeQuery(db,context);
            return this.createRecordSet(rs);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
		} finally {
			if(db) db.close();
        }
    }

}
