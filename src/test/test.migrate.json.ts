import { MigrateJsonHandler } from "../handlers/MigrateJsonHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_json","-task","-t") as string;
let file = Arguments.getString(args,"./assets/tso_json.txt","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;

async function testMigrateJSON() {
    let context = { params: { file: file, taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateJsonHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",JSON.stringify(result,undefined,2));
}
testMigrateJSON();

//node dist/test/test.migrate.json.js
//node dist/test/test.migrate.json.js -t test_file_json -f ./assets/tso_json.txt
//node dist/test/test.migrate.json.js -t test_file_json_sub_model -f ./assets/tso_json_sub.txt
