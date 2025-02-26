import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateMailHandler } from "../handlers/MigrateMailHandler";

const MigrateMailService : ServiceSchema = {
    name: "migratemail",
    mixins: [KnService],
    handler: new MigrateMailHandler(), 
}
export = MigrateMailService;
