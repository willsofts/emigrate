import { ExtractHandler } from "../handlers/ExtractHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"extract_simple_text","-task","-t") as string;
let file = Arguments.getString(args,"./assets/extract/tso_ext.txt","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;
let mktid = Arguments.getString(args,"TSO","-mktid") as string;

async function testExtract() {
    let context = { params: { filename: file, taskid: taskid, async: async, mktid: mktid }, meta: {} };
    let handler = new ExtractHandler();
    let result = await handler.doCollecting(context,undefined,undefined,false);
    console.log("result:",JSON.stringify(result,null,2));
}
testExtract();

//node dist/test/test.extract.js 
//node dist/test/test.extract.js -t extract_simple_text -f ./assets/extract/tso.txt -a true
//node dist/test/test.extract.js -t extract_simple_text_format
//node dist/test/test.extract.js -t extract_simple_text_format_locale
//node dist/test/test.extract.js -t extract_simple_text_format_disable
//node dist/test/test.extract.js -t extract_simple_text_fieldscell
//node dist/test/test.extract.js -t extract_simple_text_cells
//node dist/test/test.extract.js -t extract_simple_text_statement
//node dist/test/test.extract.js -t extract_simple_text_statement_params
