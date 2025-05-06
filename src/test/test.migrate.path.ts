import { MigratePathHandler } from "../handlers/MigratePathHandler";

let taskid = "test_file_text";
let path = "./assets/migrate";
let fs_requester = "tso";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) path = args[1];
if(args.length>2) fs_requester = args[2];
async function testMigrate(path: string, taskid: string) {
    let context = { params: { path: path, taskid: taskid, fs_requester: fs_requester }, meta: {} };
    let handler = new MigratePathHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrate(path,taskid);

//node dist/test/test.migrate.path.js
//node dist/test/test.migrate.path.js test_file_text ./assets/migrate
