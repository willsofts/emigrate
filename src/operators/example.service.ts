import KnService from "@willsofts/will-db";
import { ServiceSchema } from "moleculer";
import { ExampleHandler } from "../example/ExampleHandler";

const ExampleService : ServiceSchema = {
    name: "example",
    mixins: [KnService],
    handler: new ExampleHandler(), 
}
export = ExampleService;
