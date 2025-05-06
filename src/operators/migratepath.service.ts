import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigratePathHandler } from "../handlers/MigratePathHandler";

const MigratePathService : ServiceSchema = {
    name: "migratepath",
    mixins: [KnService],
    handler: new MigratePathHandler(), 
}
export = MigratePathService;
