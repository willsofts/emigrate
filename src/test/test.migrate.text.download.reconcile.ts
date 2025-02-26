import { MigrateDownloadHandler } from "../handlers/MigrateDownloadHandler";

let taskid = "test_file_text_download_reconcile";
let file = "./assets/tso.txt";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
async function testMigrateText(file: string, taskid: string) {
    let context = { params: { taskid: taskid }, meta: {} };
    let handler = new MigrateDownloadHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText(file,taskid);

//node dist/test/test.migrate.text.download.reconcile.js
//node dist/test/test.migrate.text.download.reconcile.js test_file_text_download_reconcile_error
