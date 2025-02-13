import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { MigrateTextHandler } from "./MigrateTextHandler";
import fs from 'fs';

export class MigrateJsonHandler extends MigrateTextHandler {

    public override async performReading(context: KnContextInfo, taskmodel: KnModel, filename: string) : Promise<[any,any]> {
        let encoding : BufferEncoding = "utf-8";
        if(taskmodel.settings?.encoding) encoding = taskmodel.settings.encoding;    
        let filedata = fs.readFileSync(filename,encoding);
        return [JSON.parse(filedata),undefined];
    }

}
