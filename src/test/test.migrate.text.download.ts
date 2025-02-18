import { MigrateDownloadHandler } from "../handlers/MigrateDownloadHandler";

let file = "./assets/tso.txt";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];
async function testMigrateText(file: string) {
    let context = { params: { taskid: "test_file_text_download" }, meta: {} };
    let handler = new MigrateDownloadHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText(file);
