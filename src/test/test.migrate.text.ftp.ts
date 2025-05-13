import { MigrateFTPHandler } from "../handlers/MigrateFTPHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_text_ftp","-task","-t") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;

async function testMigrateText() {
    let context = { params: { taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateFTPHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText();

//node dist/test/test.migrate.text.ftp.js
