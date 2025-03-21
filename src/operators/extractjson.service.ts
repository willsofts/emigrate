import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractJsonHandler } from "../handlers/ExtractJsonHandler";

const ExtractJsonService : ServiceSchema = {
    name: "extractjson",
    mixins: [KnService],
    handler: new ExtractJsonHandler(), 
}
export = ExtractJsonService;
