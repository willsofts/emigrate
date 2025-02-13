import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateTextHandler } from "../handlers/MigrateTextHandler";

const MigrateTextService : ServiceSchema = {
    name: "migratetext",
    mixins: [KnService],
    handler: new MigrateTextHandler(), 
}
export = MigrateTextService;
