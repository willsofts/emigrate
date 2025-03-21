import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractXmlHandler } from "../handlers/ExtractXmlHandler";

const ExtractXmlService : ServiceSchema = {
    name: "extractxml",
    mixins: [KnService],
    handler: new ExtractXmlHandler(), 
}
export = ExtractXmlService;
