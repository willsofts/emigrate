import { MigrateTextHandler } from "../handlers/MigrateTextHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_text_filter","-task","-t") as string;
let file = Arguments.getString(args,"./assets/tso.txt","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;

async function testMigrateText() {
    let context = { params: { file: file, taskid: taskid, async: async }, meta: {} };
    let handler = new MigrateTextHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateText();

//node dist/test/test.migrate.text.filter.js
//node dist/test/test.migrate.text.filter.js -t test_file_text_filter_range
//node dist/test/test.migrate.text.filter.js -t test_file_text_filter_range -f ./assets/tso_test.txt
