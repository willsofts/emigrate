import { KnModel } from "@willsofts/will-db";
import { MigrateDataRow } from "../models/MigrateAlias";
import { ExtractTextHandler } from "./ExtractTextHandler";
import { MigrateUtility } from "../utils/MigrateUtility";

export class ExtractXmlHandler extends ExtractTextHandler {
    public notename : string = "XML";
    public rootTag : string = "root";
    public rowTag : string = "row";
    public processInstructions: string = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

    protected override serializeDataRow(model: KnModel, data: MigrateDataRow) : string | undefined {
        if(!data.datarow) return undefined;
        let row = Object.entries(data.datarow)
            .map(([k, v]) => v instanceof Date ? "<"+k+">"+v.toISOString()+"</"+k+">" : "<"+k+">"+MigrateUtility.escapeXML(v)+"</"+k+">")
            .join("");
        return "<"+this.rowTag+">"+row+"</"+this.rowTag+">";
    }

    protected override printHeader(model: KnModel, data: MigrateDataRow) {
        let writer = data.options?.writer;
        if(writer) {
            writer.write(this.processInstructions+"\n");
            writer.write("<"+this.rootTag+">\n");
        }
    }

    protected override printFooter(model: KnModel, data: MigrateDataRow) {
        let writer = data.options?.writer;
        if(writer) {
            writer.write("</"+this.rootTag+">\n");
        }
    }    

}
