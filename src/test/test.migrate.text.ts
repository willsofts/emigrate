import { MigrateTextHandler } from "../handlers/MigrateTextHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_text","-task","-t") as string;
let file = Arguments.getString(args,"./assets/tso.txt","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;

async function testMigrateText() {
    let context = { params: { file: file, taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateTextHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText();

//node dist/test/test.migrate.text.js
//node dist/test/test.migrate.text.js -t test_file_text -f ./assets/tso.txt -a true
//node dist/test/test.migrate.text.js -t test_file_post_statement
//node dist/test/test.migrate.text.js -t test_file_post_statement_error
//node dist/test/test.migrate.text.js -t test_file_statement_element
//node dist/test/test.migrate.text.js -t test_file_post_statement_params
//node dist/test/test.migrate.text.js -t test_file_post_statement_handler

//node dist/test/test.migrate.text.js -t test_file_api
//node dist/test/test.migrate.text.js -t test_file_api -f ./assets/tso_api.txt
//node dist/test/test.migrate.text.js -t test_file_initialize
//node dist/test/test.migrate.text.js -t test_file_calculate
//node dist/test/test.migrate.text.js -t test_file_calculate_functional
