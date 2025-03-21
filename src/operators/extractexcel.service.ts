import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractExcelHandler } from "../handlers/ExtractExcelHandler";

const ExtractExcelService : ServiceSchema = {
    name: "extractexcel",
    mixins: [KnService],
    handler: new ExtractExcelHandler(), 
}
export = ExtractExcelService;
