import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractTextFixHandler } from "../handlers/ExtractTextFixHandler";

const ExtractTextFixService : ServiceSchema = {
    name: "extractfix",
    mixins: [KnService],
    handler: new ExtractTextFixHandler(), 
}
export = ExtractTextFixService;
