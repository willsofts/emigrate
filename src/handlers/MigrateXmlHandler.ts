import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { MigrateTextHandler } from "./MigrateTextHandler";
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';

export class MigrateXmlHandler extends MigrateTextHandler {

    public override async performReading(context: KnContextInfo, taskmodel: KnModel, filename: string) : Promise<[any,any]> {
        const options = {
            ignoreDeclaration: true,  // Do not parse declaration
            ignorePiTags: true,       // Do not process instruction tags   
            ignoreAttributes: false,  // Don't ignore attributes, so they will be parsed
            textNodeName: "#text",    // Default name for text nodes
            attributeNamePrefix: "",  // Do not add prefix to attributes
            parseNodeValue: true,     // Parse the value of nodes
            parseAttributeValue: true // Parse attributes as well    
        };        
        let encoding = taskmodel.settings?.encoding;
        let parser = new XMLParser(options);
        let buffer = fs.readFileSync(filename,encoding);
        let datalist = parser.parse(buffer,true);
        return [datalist,undefined];
    }

}
