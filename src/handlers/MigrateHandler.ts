import { HTTP } from "@willsofts/will-api";
import { KnModel } from "@willsofts/will-db";
import { KnDBConnector, KnSQL, KnRecordSet } from "@willsofts/will-sql";
import { KnContextInfo } from '@willsofts/will-core';
import { VerifyError } from "@willsofts/will-core";
import { MigrateBase } from "./MigrateBase";
import { MigrateConfig, MigrateModel } from "../models/MigrateAlias";

const task_models = require("../../config/model.json");

export class MigrateHandler extends MigrateBase {

    protected async doInserting(context: KnContextInfo, model: KnModel): Promise<KnRecordSet> {        
        let taskid = context.params.taskid;
        let dataset = context.params.dataset;
        if(!dataset) dataset = context.params;        
        let body = context.options?.parentCtx?.params?.req?.body;
        if(body && Array.isArray(body)) dataset = body;
        let taskmodel = await this.getTaskModel(context,model,taskid);
        if(!taskmodel) {
            return Promise.reject(new VerifyError("Model not found",HTTP.NOT_ACCEPTABLE,-16063));
        }
        dataset = await this.performTransformation(context, taskmodel, dataset);
        return this.performInserting(context, taskmodel, dataset);
    }

    public async performTransformation(context: KnContextInfo, model: MigrateModel, datasource: any): Promise<any> {
        let dataset = datasource;        
        if(model.xpath && model.xpath.trim().length>0) {
            //find out data set from xpath
            dataset = this.scrapeData(model.xpath,datasource,datasource);
        }
        dataset = await this.performDataMapper(context,model,datasource,dataset);
        if(Array.isArray(dataset)) {
            dataset = await this.performReformation(context,model,dataset);
            for(let data of dataset) {
                await this.performDefaultValues(context,model,data,datasource);
                await this.performConversion(context,model,data,datasource);
            }     
        } else {
            await this.performDefaultValues(context,model,dataset,datasource);
            await this.performConversion(context,model,dataset,datasource);
        }
        this.logger.debug(this.constructor.name+".performTransformation: dataset",dataset);
        return dataset;
    }

    public async performDataMapper(context: KnContextInfo, model: MigrateModel, datasource: any, dataset: any): Promise<any> {
        if(!model.fields) return dataset;        
        if(Array.isArray(dataset)) {
            for(let data of dataset) {
                await this.transformDataMapper(model,datasource,data);
            }     
        } else {
            await this.transformDataMapper(model,datasource,dataset);
        }
        return dataset;
    }

    public async getTaskModel(context: KnContextInfo, model: KnModel, taskid: string): Promise<MigrateModel | undefined> {
        let db = this.getPrivateConnector(model);
        try {
            return await this.getMigrateModel(context,model,db,taskid);
        } catch(ex: any) {
            this.logger.error(ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async getMigrateModel(context: KnContextInfo, model: KnModel, db: KnDBConnector, taskid: string): Promise<MigrateModel | undefined> {
        let knsql = new KnSQL();
        knsql.append("select t.taskid,t.taskname,t.modelid,t.connectid,");
        knsql.append("m.modelname,m.tablename,m.tablefields,m.tablesettings ");
        knsql.append("from tmigratetask t,tmigratemodel m ");
        knsql.append("where t.taskid = ?taskid ");
        knsql.append("and t.modelid = m.modelid ");
        knsql.set("taskid",taskid);
        let rs = await knsql.executeQuery(db,context);
        if(rs && rs.rows?.length>0) {
            let row = rs.rows[0];
            let privateAlias : string | MigrateConfig = model.alias.privateAlias;
            let config = await this.getMigrateConfig(context,db,row.connectid);
            if(config) {
                privateAlias = config;        
            }
            let tablefields = this.tryParseJSON(row.tablefields);
            let tablesettings = this.tryParseJSON(row.tablesettings);
            let taskmodel = {
                name: row.tablename,
                alias: { privateAlias: privateAlias },
                fields: tablefields,
                settings: tablesettings,
            }
            return taskmodel;
        }
        return task_models[taskid];
    }

    public async getMigrateConfig(context: KnContextInfo, db: KnDBConnector, connectid: string): Promise<MigrateConfig | undefined> {
        let result = undefined;
        let knsql = new KnSQL();
        knsql.append("select c.connecttype,c.connectdialect,c.connecturl,c.connectuser,c.connectpassword,");
        knsql.append("c.connectdatabase,c.connecthost,c.connectport,c.connectapi,c.connectsetting,c.connectbody,");
        knsql.append("c.connecthandler,c.connectquery,c.connectfieldname,c.connectfieldvalue,c.connectmapper,");
        knsql.append("d.dialectalias,d.dialectoptions ");
        knsql.append("from tmigrateconnect c,tdialect d ");
        knsql.append("where c.conectid = ?connectid ");
        knsql.append("and c.connectdialect = d.dialectid ");
        knsql.set("connectid",connectid);
        let rs = await knsql.executeQuery(db,context);
        if(rs && rs.rows?.length>0) {
            let row = rs.rows[0];
            let dialectoptions = this.tryParseJSON(row.dialectoptions) || {};
            let connectsetting = this.tryParseJSON(row.connectsetting) || {};
            let connectbody = this.tryParseJSON(row.connectbody) || {};
            result = {
                schema: connectid,
                alias: row.dialectalias,
                dialect: row.connectdialect,
                url: row.connecturl,
                user: row.connectuser,
                password: row.connectpassword,
                host: row.connecthost,
                port: row.connectport,
                database: row.connectdatabase,
                options: dialectoptions,
                type: row.connecttype,
                fieldname: row.connectfieldname,
                fieldvalue: row.connectfieldvalue,
                mapper: row.connectmapper,
                api: row.connectapi,
                setting: connectsetting,
                body: connectbody,
                handler: row.connecthandler,
                query: row.connectquery,
            };
        }
        return result;
    }


}
