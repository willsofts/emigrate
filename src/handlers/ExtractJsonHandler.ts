import { KnModel } from "@willsofts/will-db";
import { MigrateDataRow } from "../models/MigrateAlias";
import { ExtractTextHandler } from "./ExtractTextHandler";

export class ExtractJsonHandler extends ExtractTextHandler {
    public notename : string = "JSON";

    protected override serializeDataRow(model: KnModel, data: MigrateDataRow) : string | undefined {
        if(!data.datarow) return undefined;
        return JSON.stringify(data.datarow) + (data.index < data.rs.rows.length ? "," : "");
    }

    protected override printHeader(model: KnModel, data: MigrateDataRow) {
        let writer = data.options?.writer;
        if(writer) {
            writer.write("[\n");
        }
    }

    protected override printFooter(model: KnModel, data: MigrateDataRow) {
        let writer = data.options?.writer;
        if(writer) {
            writer.write("]\n");
        }
    } 
       
}
