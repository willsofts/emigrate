import { MigrateXlsxHandler } from "../handlers/MigrateXlsxHandler";

let taskid = "test_file_xlsx";
let file = "./assets/tso.xlsx";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
async function testMigrateExcel(file: string, taskid: string) {
    let context = { params: { file: file, taskid: taskid }, meta: {} };
    let handler = new MigrateXlsxHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateExcel(file,taskid);

//node dist/test/test.migrate.xlsx test_file_xlsx ./assets/tso.xlsx
//node dist/test/test.migrate.xlsx test_file_api ./assets/tso_api.xlsx 
