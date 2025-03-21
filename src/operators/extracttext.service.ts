import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractTextHandler } from "../handlers/ExtractTextHandler";

const ExtractTextService : ServiceSchema = {
    name: "extracttext",
    mixins: [KnService],
    handler: new ExtractTextHandler(), 
}
export = ExtractTextService;
