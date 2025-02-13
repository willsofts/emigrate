import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateXlsxHandler } from "../handlers/MigrateXlsxHandler";

const MigrateXlsxService : ServiceSchema = {
    name: "migratexlsx",
    mixins: [KnService],
    handler: new MigrateXlsxHandler(), 
}
export = MigrateXlsxService;
