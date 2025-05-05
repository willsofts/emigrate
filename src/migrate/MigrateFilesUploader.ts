import os from "os";
import path from 'path';
import { Request, Response } from 'express';
import { JSONReply } from "@willsofts/will-api";
import { TknUploadsRouter } from "@willsofts/will-core";
import { KnValidateInfo } from '@willsofts/will-core';
import { KnResponser } from "@willsofts/will-core";
import { MigrateTextHandler } from "../handlers/MigrateTextHandler";
import { MigrateJsonHandler } from "../handlers/MigrateJsonHandler";
import { MigrateExcelHandler } from "../handlers/MigrateExcelHandler";
import { MigrateXlsxHandler } from "../handlers/MigrateXlsxHandler";
import { MigrateXmlHandler } from "../handlers/MigrateXmlHandler";
import { MigrateUtility } from "../utils/MigrateUtility";

export class MigrateFilesUploader extends TknUploadsRouter {

    public getUploadPath() : string {
        return path.join(os.tmpdir(),"uploaded","migrate","files");
    }

    protected override verifyFile(file: any, fileTypes: RegExp) : KnValidateInfo {
        this.logger.debug("fileFilter:",file);
        const filetypes = new RegExp("text|txt|csv|json|xml|xlsx|xls","i");
        const extname =  filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = true; //filetypes.test(file.mimetype);
        this.logger.debug("verifyFile: extname",extname+", mimetype",mimetype);	  
        return {valid: extname && mimetype, info: "Invalid file type" };
    }

    protected override async doUploadFile(req: Request, res: Response) : Promise<void> {
        res.contentType('application/json');
        let response: JSONReply = new JSONReply();
        response.head.modeling("migrate","files");
        response.head.composeNoError();
        let body : Array<any> = [];
        try {
            if(req.files) {
                if(Array.isArray(req.files)) {
                    for(let file of req.files) {
                        let rs = await this.performUploadFile(req,res,file);
                        body.push(rs);
                    }
                }
            }
            response.body = body;
            res.end(JSON.stringify(response));
        } catch(ex) {
            KnResponser.responseError(res,ex,"migrate","files");
        }
    }

    protected async performUploadFile(req: Request, res: Response, file: any) : Promise<any> {
        let filetype = MigrateUtility.parseFileType(file?.originalname);
        this.logger.debug(this.constructor.name+".performUploadFile: filetype",filetype);
        if(file?.originalname) {
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        }
        this.logger.debug(this.constructor.name+".performUploadFile: body",JSON.stringify(req.body));
        this.logger.debug(this.constructor.name+".performUploadFile: file",req.file);
        let ctx = await this.createContext(req);
        ctx.params.file = file;
        let type = ctx.params.type;
        if(filetype.isText) {
            if("json"==type) {
                let handler = new MigrateJsonHandler();
                handler.obtain(this.service?.broker,this.logger);
                return await handler.insert(ctx);
            } else {
                let handler = new MigrateTextHandler();
                handler.obtain(this.service?.broker,this.logger);
                return await handler.insert(ctx);
            }
        } else if(filetype.isJson || "json"==type) {
            let handler = new MigrateJsonHandler();
            handler.obtain(this.service?.broker,this.logger);
            return await handler.insert(ctx);
        } else if(filetype.isXml || "xml"==type) {
            let handler = new MigrateXmlHandler();
            handler.obtain(this.service?.broker,this.logger);
            return await handler.insert(ctx);
        } else if(filetype.isXlsx) {
            if("excel"==type) {
                let handler = new MigrateExcelHandler();
                handler.obtain(this.service?.broker,this.logger);
                return await handler.insert(ctx);
            } else {
                let handler = new MigrateXlsxHandler();
                handler.obtain(this.service?.broker,this.logger);
                return await handler.insert(ctx);
            }
        }
        return undefined;
    }

}

/*
curl -X POST http://localhost:8080/upload/migrate/files -F taskid=test_file_text -F filename=@D:\exim\tso.txt 
curl -X POST http://localhost:8080/upload/migrate/files -F taskid=test_file_text -F filename=@D:\exim\tso.txt -F filename=@D:\exim\tso2.txt
*/
