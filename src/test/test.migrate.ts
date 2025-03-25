import { MigrateHandler } from "../handlers/MigrateHandler";
import fs from "fs";

let async = false;
let taskid = "test_simple_call_api_response_xml_multiplex";
let file = "./assets/dataset.json";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
if(args.length>2) async = "true"==args[2];
async function testMigrate(file: string, taskid: string) {
    let buffer = fs.readFileSync(file);
    let dataset = JSON.parse(buffer.toString());
    let context = { params: { dataset, taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrate(file,taskid);

//node dist/test/test.migrate.js
//node dist/test/test.migrate.js test_simple_call_api_response_error_checker
