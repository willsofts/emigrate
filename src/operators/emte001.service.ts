import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { Emte001Handler } from "../emte001/Emte001Handler";

const Emte001Service : ServiceSchema = {
    name: "emte001",
    mixins: [KnService],
    handler: new Emte001Handler(), 
}
export = Emte001Service;
