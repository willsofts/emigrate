import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExtractPDFHandler } from "../handlers/ExtractPDFHandler";

const ExtractPDFService : ServiceSchema = {
    name: "extractpdf",
    mixins: [KnService],
    handler: new ExtractPDFHandler(), 
}
export = ExtractPDFService;
