import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateFTPHandler } from "../handlers/MigrateFTPHandler";

const MigrateFTPService : ServiceSchema = {
    name: "migrateftp",
    mixins: [KnService],
    handler: new MigrateFTPHandler(), 
}
export = MigrateFTPService;
