import { MigrateExcelHandler } from "../handlers/MigrateExcelHandler";

let file = "./assets/tso.xlsx";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];
async function testMigrateExcel(file: string) {
    let context = { params: { file: file, taskid: "test_file_excel" }, meta: {} };
    let handler = new MigrateExcelHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateExcel(file);
