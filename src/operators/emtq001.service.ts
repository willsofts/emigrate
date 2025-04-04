import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { Emtq001Handler } from "../emtq001/Emtq001Handler";

const Emtq001Service : ServiceSchema = {
    name: "emtq001",
    mixins: [KnService],
    handler: new Emtq001Handler(), 
}
export = Emtq001Service;
