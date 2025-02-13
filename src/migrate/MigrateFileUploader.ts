import os from "os";
import path from 'path';
import { Request, Response } from 'express';
import { JSONReply } from "@willsofts/will-api";
import { TknUploadRouter } from "@willsofts/will-core";
import { KnValidateInfo } from '@willsofts/will-core';
import { KnResponser } from "@willsofts/will-core";
import { MigrateTextHandler } from "../handlers/MigrateTextHandler";
import { MigrateJsonHandler } from "../handlers/MigrateJsonHandler";
import { MigrateExcelHandler } from "../handlers/MigrateExcelHandler";
import { MigrateXlsxHandler } from "../handlers/MigrateXlsxHandler";
import { MigrateXmlHandler } from "../handlers/MigrateXmlHandler";

export class MigrateFileUploader extends TknUploadRouter {

	public getUploadPath() : string {
		return path.join(os.tmpdir(),"uploaded","migrate");;
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
		let isText = false;
		let isJson = false;
		let isXlsx = false;
		let isXml = false;
		if(req.file) {
			const textfiletypes = new RegExp("text|txt|csv","i");
			const jsonfiletypes = new RegExp("json","i");
			const xlsxfiletypes = new RegExp("xlsx|xls","i");
			const xmlfiletypes = new RegExp("xml","i");
			const extname = path.extname(req.file.originalname).toLowerCase();
			isText = textfiletypes.test(extname);
			isJson = jsonfiletypes.test(extname);
			isXlsx = xlsxfiletypes.test(extname);
			isXml = xmlfiletypes.test(extname);
			req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
		}
		console.log(this.constructor.name+".doUploadFile: body",JSON.stringify(req.body));
		console.log(this.constructor.name+".doUploadFile: file",req.file);
		let response: JSONReply = new JSONReply();
		response.head.modeling("migrate","upload");
		response.head.composeNoError();
		try {
            let ctx = await this.createContext(req);
			ctx.params.file = req.file;
			let type = ctx.params.type;
			if(isText) {
				if("json"==type) {
					let handler = new MigrateJsonHandler();
					handler.obtain(this.service?.broker,this.logger);
					let rs = await handler.insert(ctx);
					response.body = rs;	
				} else {
					let handler = new MigrateTextHandler();
					handler.obtain(this.service?.broker,this.logger);
					let rs = await handler.insert(ctx);
					response.body = rs;
				}
			} else if(isJson || "json"==type) {
				let handler = new MigrateJsonHandler();
				handler.obtain(this.service?.broker,this.logger);
				let rs = await handler.insert(ctx);
				response.body = rs;
			} else if(isXml || "xml"==type) {
				let handler = new MigrateXmlHandler();
				handler.obtain(this.service?.broker,this.logger);
				let rs = await handler.insert(ctx);
				response.body = rs;
			} else if(isXlsx) {
				if("excel"==type) {
					let handler = new MigrateExcelHandler();
					handler.obtain(this.service?.broker,this.logger);
					let rs = await handler.insert(ctx);
					response.body = rs;
				} else {
					let handler = new MigrateXlsxHandler();
					handler.obtain(this.service?.broker,this.logger);
					let rs = await handler.insert(ctx);
					response.body = rs;
				}
			}
			res.end(JSON.stringify(response));
		} catch(ex) {
			KnResponser.responseError(res,ex,"migrate","upload");
		}
	}

}

/*
curl -X POST http://localhost:8080/upload/migrate/file -F filename=@D:\exim\tso.txt -F taskid=test_file_text
curl -X POST http://localhost:8080/upload/migrate/file -F filename=@D:\exim\tso_json_array.txt -F taskid=test_file_json_array -F type=json
curl -X POST http://localhost:8080/upload/migrate/file -F filename=@D:\exim\tso.xlsx -F taskid=test_file_xlsx
curl -X POST http://localhost:8080/upload/migrate/file -F filename=@D:\exim\tso.xlsx -F taskid=test_file_excel -F type=excel
curl -X POST http://localhost:8080/upload/migrate/file -F filename=@D:\exim\tso.xml -F taskid=test_file_xml
*/
