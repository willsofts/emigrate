import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractHandler } from "../handlers/ExtractHandler";

const ExtractService : ServiceSchema = {
    name: "extract",
    mixins: [KnService],
    handler: new ExtractHandler(), 
}
export = ExtractService;
