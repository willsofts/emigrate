import { TknAssureRouter } from '@willsofts/will-serv';
import { Application, Request, Response } from 'express';
import { HTTP } from "@willsofts/will-api";
import { Utilities } from "@willsofts/will-util";
import fs from 'fs';
import path from 'path';

export class ExampleManager extends TknAssureRouter {
	public route(app: Application, dir?: string) {
        if(dir) this.dir = dir;
        app.post("/example/xml/:file", async (req: Request, res: Response) => { 
            this.doResponseFile(req,res,req.params.file);
        });
        app.get("/example/xml/:file", async (req: Request, res: Response) => { 
            this.doResponseFile(req,res,req.params.file);
        });
        app.post("/example/json/:file", async (req: Request, res: Response) => { 
            this.doResponseFile(req,res,req.params.file,"json");
        });
        app.get("/example/json/:file", async (req: Request, res: Response) => { 
            this.doResponseFile(req,res,req.params.file,"json");
        });
    }

    public async doResponseFile(req: Request, res: Response, filename: string, type: string = "xml") {
        if(filename.indexOf(".") < 0) filename = filename+"."+type;
        let parent = Utilities.getWorkingDir(this.dir); 
        let filepath = path.join(parent,"public","assets",filename);
        this.logger.debug(this.constructor.name+".doResponseFile: filepath",filepath);
        let found = fs.existsSync(filepath);
        if(found) {
            let buffer = fs.readFileSync(filepath);
            if(type=="json") {
                res.contentType("application/json");
            } else {
                res.contentType("text/xml;charset=UTF-8");
            }
            res.send(buffer.toString());
        } else {
            res.status(HTTP.NOT_FOUND).send("File not found");
        } 
    }
}

//curl -v http://localhost:8080/example/xml/tkappstype
//curl -v http://localhost:8080/example/json/tso_json.txt
