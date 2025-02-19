import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateTransferHandler } from "../handlers/MigrateTransferHandler";

const MigrateTransferService : ServiceSchema = {
    name: "migrateftp",
    mixins: [KnService],
    handler: new MigrateTransferHandler(), 
}
export = MigrateTransferService;
