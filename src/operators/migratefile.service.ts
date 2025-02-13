import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateFileHandler } from "../handlers/MigrateFileHandler";

const MigrateFileService : ServiceSchema = {
    name: "migratefile",
    mixins: [KnService],
    handler: new MigrateFileHandler(), 
}
export = MigrateFileService;
