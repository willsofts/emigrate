import { MigrateXmlHandler } from "../handlers/MigrateXmlHandler";

let file = "./assets/tso.xml";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];
async function testMigrateXml(file: string) {
    let context = { params: { file: file, taskid: "test_file_xml" }, meta: {} };
    let handler = new MigrateXmlHandler();
    let result = await handler.doInserting(context,undefined,false);
    console.log("result:",result);
}
testMigrateXml(file);
