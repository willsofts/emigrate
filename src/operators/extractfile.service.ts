import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractFileHandler } from "../handlers/ExtractFileHandler";

const ExtractFileService : ServiceSchema = {
    name: "extractfile",
    mixins: [KnService],
    handler: new ExtractFileHandler(), 
}
export = ExtractFileService;
