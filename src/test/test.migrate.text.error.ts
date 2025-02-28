import { MigrateTextHandler } from "../handlers/MigrateTextHandler";

let taskid = "test_file_text_error";
let file = "./assets/tso_error.txt";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
async function testMigrateText(file: string, taskid: string) {
    try {
        let context = { params: { file: file, taskid: taskid }, meta: {} };
        let handler = new MigrateTextHandler();
        let result = await handler.doInserting(context,undefined,false);
        console.log("result:",result);
    } catch(ex) {
        console.error(ex);
    }
}
testMigrateText(file,taskid);

//node dist/test/test.migrate.text.error.js
