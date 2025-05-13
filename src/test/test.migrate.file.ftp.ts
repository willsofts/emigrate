import { MigrateFileHandler } from "../handlers/MigrateFileHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_text_ftp","-task","-t") as string;
let file = Arguments.getString(args,"","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;

async function testMigrateText() {
    let context = { params: { file: file, taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateFileHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText();

//node dist/test/test.migrate.file.ftp.js
//node dist/test/test.migrate.file.ftp.js -t test_file_text_ftp_naming
