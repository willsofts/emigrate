import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateLogHandler } from "../handlers/MigrateLogHandler";

const MigrateLogService : ServiceSchema = {
    name: "migratelog",
    mixins: [KnService],
    handler: new MigrateLogHandler(), 
}
export = MigrateLogService;
