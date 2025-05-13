import { MigratePathHandler } from "../handlers/MigratePathHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"test_file_text","-task","-t") as string;
let path = Arguments.getString(args,"./assets/migrate","-path","-p") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;
let fs_requester = Arguments.getString(args,"tso","-user","-u") as string;

async function testMigrate() {
    let context = { params: { path: path, taskid: taskid, async: async, fs_requester: fs_requester }, meta: {} };
    let handler = new MigratePathHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrate();

//node dist/test/test.migrate.path.js
//node dist/test/test.migrate.path.js -t test_file_text -p ./assets/migrate
//node dist/test/test.migrate.path.js -t test_file_text_azure_storage -p ""
