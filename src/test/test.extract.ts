import { ExtractHandler } from "../handlers/ExtractHandler";

let async = false;
let taskid = "extract_simple_text";
let file = "./assets/extract/tso_ext.txt";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
if(args.length>2) async = "true"==args[2];
async function testExtract(file: string, taskid: string) {
    let context = { params: { filename: file, taskid: taskid, async: async, mktid: "TSO" }, meta: {} };
    let handler = new ExtractHandler();
    let result = await handler.doCollecting(context,undefined,undefined,false);
    console.log("result:",JSON.stringify(result,null,2));
}
testExtract(file,taskid);

//node dist/test/test.extract.js 
//node dist/test/test.extract.js extract_simple_text ./assets/extract/tso.txt true
//node dist/test/test.extract.js extract_simple_text_format
//node dist/test/test.extract.js extract_simple_text_format_locale
//node dist/test/test.extract.js extract_simple_text_format_disable
//node dist/test/test.extract.js extract_simple_text_fieldscell
//node dist/test/test.extract.js extract_simple_text_cells
//node dist/test/test.extract.js extract_simple_text_statement
//node dist/test/test.extract.js extract_simple_text_statement_params
