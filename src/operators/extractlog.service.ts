import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractLogHandler } from "../handlers/ExtractLogHandler";

const ExtractLogService : ServiceSchema = {
    name: "extractlog",
    mixins: [KnService],
    handler: new ExtractLogHandler(), 
}
export = ExtractLogService;
