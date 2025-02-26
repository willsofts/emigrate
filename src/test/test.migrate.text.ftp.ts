import { MigrateFTPHandler } from "../handlers/MigrateFTPHandler";

let taskid = "test_file_text_ftp";
let file = "./assets/tso.txt";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
async function testMigrateText(file: string, taskid: string) {
    let context = { params: { taskid: taskid }, meta: {} };
    let handler = new MigrateFTPHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText(file,taskid);

//node dist/test/test.migrate.text.ftp.js
