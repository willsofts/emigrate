import { MigrateTextHandler } from "../handlers/MigrateTextHandler";

let taskid = "test_file_text";
let file = "./assets/tso.txt";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
async function testMigrateText(file: string, taskid: string) {
    let context = { params: { file: file, taskid: taskid }, meta: {} };
    let handler = new MigrateTextHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText(file,taskid);

//node dist/test/test.migrate.text.js
//node dist/test/test.migrate.text.js test_file_post_statement
//node dist/test/test.migrate.text.js test_file_post_statement_error
//node dist/test/test.migrate.text.js test_file_statement_element
//node dist/test/test.migrate.text.js test_file_post_statement_params

//node dist/test/test.migrate.text.js test_file_api
//node dist/test/test.migrate.text.js test_file_api ./assets/tso_api.txt
