import fs from "fs";
import { MigrateHandler } from "../handlers/MigrateHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_simple_call_api_response_xml_multiplex","-task","-t") as string;
let file = Arguments.getString(args,"./assets/dataset.json","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;

async function testMigrate() {
    let buffer = fs.readFileSync(file);
    let dataset = JSON.parse(buffer.toString());
    let context = { params: { dataset, taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrate();

//node dist/test/test.migrate.js
//node dist/test/test.migrate.js -t test_simple_call_api_response_error_checker
