import { MigrateJsonHandler } from "../handlers/MigrateJsonHandler";

let file = "./assets/tso_json_array.txt";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];
async function testMigrateJSON(file: string) {
    let context = { params: { file: file, taskid: "test_file_json_array" }, meta: {} };
    let handler = new MigrateJsonHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateJSON(file);
