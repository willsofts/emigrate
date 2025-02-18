import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateDownloadHandler } from "../handlers/MigrateDownloadHandler";

const MigrateDownloadService : ServiceSchema = {
    name: "migratedownload",
    mixins: [KnService],
    handler: new MigrateDownloadHandler(), 
}
export = MigrateDownloadService;
