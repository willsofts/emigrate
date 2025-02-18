import { MigrateTextHandler } from "../handlers/MigrateTextHandler";

let file = "./assets/tso_error.txt";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];
async function testMigrateText(file: string) {
    try {
        let context = { params: { file: file, taskid: "test_file_text_error" }, meta: {} };
        let handler = new MigrateTextHandler();
        let result = await handler.doInserting(context,undefined,false);
        console.log("result:",result);
    } catch(ex) {
        console.error(ex);
    }
}
testMigrateText(file);
