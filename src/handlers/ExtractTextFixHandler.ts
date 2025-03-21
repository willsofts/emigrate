import { KnModel } from "@willsofts/will-db";
import { MigrateDataRow } from "../models/MigrateAlias";
import { ExtractTextHandler } from "./ExtractTextHandler";
import { MigrateUtility } from "../utils/MigrateUtility";

export class ExtractTextFixHandler extends ExtractTextHandler {
    public notename : string = "TXT";

    protected override serializeDataRow(model: KnModel, data: MigrateDataRow) : string | undefined {
        if(!data.datarow) return undefined;
        let values : string[] = [];
        for(let key in data.datarow) {
            let options = this.getOptions(key,data.fields);
            if(options?.length) {
                let value = data.datarow[key];
                value = value instanceof Date ? value.toISOString() : (value ? ""+value : "");
                value = MigrateUtility.paddingText(value,options.length,options?.align);
                values.push(value);
            }
        }
        return values.join("");
    }

}
