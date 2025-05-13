import { MigrateXlsxHandler } from "../handlers/MigrateXlsxHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_xlsx_header","-task","-t") as string;
let file = Arguments.getString(args,"./assets/tso_header.xlsx","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;

async function testMigrateExcel() {
    let context = { params: { file: file, taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateXlsxHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateExcel();
