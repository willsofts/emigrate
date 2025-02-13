import { MigrateXlsxHandler } from "../handlers/MigrateXlsxHandler";

let file = "./assets/tso.xlsx";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];
async function testMigrateExcel(file: string) {
    let context = { params: { file: file, taskid: "test_file_xlsx" }, meta: {} };
    let handler = new MigrateXlsxHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateExcel(file);
