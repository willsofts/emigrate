import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateHandler } from "../handlers/MigrateHandler";

const MigrateService : ServiceSchema = {
    name: "migrate",
    mixins: [KnService],
    handler: new MigrateHandler(), 
}
export = MigrateService;
