import { MigrateExcelHandler } from "../handlers/MigrateExcelHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_excel","-task","-t") as string;
let file = Arguments.getString(args,"./assets/tso.xlsx","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;

async function testMigrateExcel() {
    let context = { params: { file: file, taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateExcelHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateExcel();
