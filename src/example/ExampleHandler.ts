import { HTTP } from "@willsofts/will-api";
import { KnModel } from "@willsofts/will-db";
import { TknOperateHandler } from "@willsofts/will-serv";
import { KnContextInfo, VerifyError, KnValidateInfo } from '@willsofts/will-core';
import { Request, Response } from 'express';
import path from 'path';
import fs from "fs";
import { FILE_ASSETS } from "../utils/EnvironmentVariable";

export class ExampleHandler extends TknOperateHandler {
    public model : KnModel = { 
        name: "texample", 
        alias: { privateAlias: this.section },
    }
    public handlers = [ {name: "file"} ];

    public async file(context: KnContextInfo) : Promise<any> {
        return this.callFunctional(context, {operate: "file", raw: true}, this.doFile);
    }
    
    protected override async validateRequireFields(context: KnContextInfo, model: KnModel = this.model, action?: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"file");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    protected async doFile(context: KnContextInfo, model: KnModel = this.model) : Promise<any> {
        await this.validateRequireFields(context,model);
        let file = context.params.file;
        let filepath = path.join(FILE_ASSETS,file);
        this.logger.debug(this.constructor.name+".doFile file",filepath);
        let foundfile = fs.existsSync(filepath);
        if(!foundfile) {
            return Promise.reject(new VerifyError("File not found",HTTP.NOT_FOUND,-16068));
        }
        try {        
            let buffer = fs.readFileSync(filepath);
            return buffer.toString();
        } catch(ex) {
            this.logger.error(ex);
        }
        return Promise.reject(new VerifyError("Not found",HTTP.NOT_FOUND,-16069));
    }

    public override async report(context: KnContextInfo, req: Request, res: Response) : Promise<void> {
        await this.validateRequireFields(context);
        this.logger.debug(this.constructor.name+".report: params",context.params);
        let file = context.params.file;
        let filepath = path.join(FILE_ASSETS,file);
        this.logger.debug(this.constructor.name+".report file",filepath);
        let foundfile = fs.existsSync(filepath);
        if(!foundfile) {
            return Promise.reject(new VerifyError("File not found",HTTP.NOT_FOUND,-16068));
        }
        try {
            let filename = path.parse(filepath).name;
            const rs = fs.createReadStream(filepath);
            rs.on("error",(err) => { 
                this.logger.error(err); 
                res.status(HTTP.INTERNAL_SERVER_ERROR).end(); 
            });
            if("json"==context.params.type) {
                res.attachment(filename+".json");
            } if("xlsx"==context.params.type) {
                res.attachment(filename+".xlsx");
            } if("xls"==context.params.type) {
                res.attachment(filename+".xls");
            } if("xml"==context.params.type) {
                res.attachment(filename+".xml");
            } else {
                res.attachment(filename+".txt");
            }
            rs.pipe(res);
            return;
        } catch(ex) {
            this.logger.error(ex);
        }
        res.status(HTTP.NOT_FOUND).send("Not found");
    }

}
