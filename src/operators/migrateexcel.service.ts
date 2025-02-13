import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateExcelHandler } from "../handlers/MigrateExcelHandler";

const MigrateExcelService : ServiceSchema = {
    name: "migrateexcel",
    mixins: [KnService],
    handler: new MigrateExcelHandler(), 
}
export = MigrateExcelService;
