import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateJsonHandler } from "../handlers/MigrateJsonHandler";

const MigrateJsonService : ServiceSchema = {
    name: "migratejson",
    mixins: [KnService],
    handler: new MigrateJsonHandler(), 
}
export = MigrateJsonService;
