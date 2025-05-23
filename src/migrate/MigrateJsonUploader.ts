import os from "os";
import path from 'path';
import { Request, Response } from 'express';
import { JSONReply } from "@willsofts/will-api";
import { TknUploadRouter } from "@willsofts/will-core";
import { KnValidateInfo } from '@willsofts/will-core';
import { KnResponser } from "@willsofts/will-core";
import { MigrateJsonHandler } from "../handlers/MigrateJsonHandler";

export class MigrateJsonUploader extends TknUploadRouter {

	public getUploadPath() : string {
		return path.join(os.tmpdir(),"uploaded","migrate","json");
	}

	protected override verifyFile(file: any, fileTypes: RegExp) : KnValidateInfo {
		this.logger.debug("fileFilter:",file);
		const filetypes = new RegExp("json|txt","i");
		const extname =  filetypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = true; //filetypes.test(file.mimetype);
		this.logger.debug("verifyFile: extname",extname+", mimetype",mimetype);	  
		return {valid: extname && mimetype, info: "Invalid file type" };
	}

	protected override async doUploadFile(req: Request, res: Response) : Promise<void> {
		res.contentType('application/json');
		if(req.file) {
			req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
		}
		this.logger.debug(this.constructor.name+".doUploadFile: body",JSON.stringify(req.body));
		this.logger.debug(this.constructor.name+".doUploadFile: file",req.file);
		let response: JSONReply = new JSONReply();
		response.head.modeling("migrate","json");
		response.head.composeNoError();
		try {
            let ctx = await this.createContext(req);
			ctx.params.file = req.file;
			let handler = new MigrateJsonHandler();
			handler.obtain(this.service?.broker,this.logger);
			let rs = await handler.insert(ctx);
			response.body = rs;
			res.end(JSON.stringify(response));
		} catch(ex) {
			KnResponser.responseError(res,ex,"migrate","json");
		}
	}

}

/*
curl -X POST http://localhost:8080/upload/migrate/json -F filename=@D:\exim\tso_json_array.txt -F taskid=test_file_json_array
*/
