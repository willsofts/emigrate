import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { MigrateXmlHandler } from "../handlers/MigrateXmlHandler";

const MigrateXmlService : ServiceSchema = {
    name: "migratexml",
    mixins: [KnService],
    handler: new MigrateXmlHandler(), 
}
export = MigrateXmlService;
