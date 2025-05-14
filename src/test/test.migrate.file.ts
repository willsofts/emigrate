import { MigrateFileHandler } from "../handlers/MigrateFileHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_text","-task","-t") as string;
let file = Arguments.getString(args,"./assets/tso.txt","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;
let type = Arguments.getString(args,undefined,"-type") as string;
let fs_requester = Arguments.getString(args,"tso","-user","-u") as string;

async function testMigrateText() {
    let context = { params: { file: file, taskid: taskid, async: async, type: type, fs_requester: fs_requester }, meta: {} };
    let handler = new MigrateFileHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",JSON.stringify(result,undefined,2));
}
testMigrateText();

//node dist/test/test.migrate.file.js
//node dist/test/test.migrate.file.js -t test_simple_text_plugin_database
//node dist/test/test.migrate.file.js -t test_simple_text_plugin_connection
//node dist/test/test.migrate.file.js -t test_file_text_request_params
//node dist/test/test.migrate.file.js -t test_file_json_sub_model -f ./assets/tso_json_sub.txt -type json
//node dist/test/test.migrate.file.js -t test_file_api_verifier
