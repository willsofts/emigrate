import { MigrateFileHandler } from "../handlers/MigrateFileHandler";

let taskid = "test_file_text";
let file = "./assets/tso.txt";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
async function testMigrateText(file: string, taskid: string) {
    let context = { params: { file: file, taskid: taskid }, meta: {} };
    let handler = new MigrateFileHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText(file,taskid);

//node dist/test/test.migrate.file.js
//node dist/test/test.migrate.file.js test_simple_text_plugin_database
//node dist/test/test.migrate.file.js test_simple_text_plugin_connection
