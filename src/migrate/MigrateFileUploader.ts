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
import { MigrateUtility } from "../utils/MigrateUtility";

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
		let filetype = MigrateUtility.parseFileType(req.file?.originalname);
		this.logger.debug(this.constructor.name+".doUploadFile: filetype",filetype);
		if(req.file?.originalname) {
			req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
		}
		this.logger.debug(this.constructor.name+".doUploadFile: body",JSON.stringify(req.body));
		this.logger.debug(this.constructor.name+".doUploadFile: file",req.file);
		let response: JSONReply = new JSONReply();
		response.head.modeling("migrate","upload");
		response.head.composeNoError();
		try {
            let ctx = await this.createContext(req);
			ctx.params.file = req.file;
			let type = ctx.params.type;
			if(filetype.isText) {
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
			} else if(filetype.isJson || "json"==type) {
				let handler = new MigrateJsonHandler();
				handler.obtain(this.service?.broker,this.logger);
				let rs = await handler.insert(ctx);
				response.body = rs;
			} else if(filetype.isXml || "xml"==type) {
				let handler = new MigrateXmlHandler();
				handler.obtain(this.service?.broker,this.logger);
				let rs = await handler.insert(ctx);
				response.body = rs;
			} else if(filetype.isXlsx) {
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
/*
file {
  fieldname: 'filename',
  originalname: 'birth.png',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: 'C:\\Users\\ADMIN\\AppData\\Local\\Temp\\uploaded\\files',
  filename: 'f51aa9e2-385b-4ae2-b024-2b65f1a5250b.png',
  path: 'C:\\Users\\ADMIN\\AppData\\Local\\Temp\\uploaded\\files\\f51aa9e2-385b-4ae2-b024-2b65f1a5250b.png',
  size: 10717
}
*/
