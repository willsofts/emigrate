import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { TknMessageHandler } from "@willsofts/will-serv";

const MessageCodeService : ServiceSchema = {
    name: "msgcode",
    mixins: [KnService],
    handler: new TknMessageHandler(), 
}
export = MessageCodeService;
