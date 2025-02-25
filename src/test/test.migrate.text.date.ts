import { MigrateTextHandler } from "../handlers/MigrateTextHandler";

let taskid = "test_file_date";
let file = "./assets/date.txt";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];
if(args.length>1) taskid = args[1];
async function testMigrateText(file: string, taskid: string) {
    let context = { params: { file: file, taskid: taskid }, meta: {} };
    let handler = new MigrateTextHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText(file,taskid);

//node dist/test/test.migrate.text.date.js 
//node dist/test/test.migrate.text.date.js ./assets/date_comma.txt test_file_date_comma
