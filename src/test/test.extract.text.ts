import { ExtractTextHandler } from "../handlers/ExtractTextHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"extract_data_file_text","-task","-t") as string;
let file = Arguments.getString(args,"./assets/extract/tso_ext.csv","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;
let fs_requester = Arguments.getString(args,"tso","-user","-u") as string;
let mktid = Arguments.getString(args,"TSO","-mktid") as string;

async function testExtract() {
    let context = { params: { filename: file, taskid: taskid, async: async, fs_requester: fs_requester, mktid: mktid }, meta: {} };
    let handler = new ExtractTextHandler();
    let result = await handler.doCollecting(context,undefined,undefined,false);
    console.log("result:",JSON.stringify(result,null,2));
}
testExtract().catch(ex => console.error("error",ex));

//node dist/test/test.extract.text.js 
//node dist/test/test.extract.text.js -t extract_data_file_text
//node dist/test/test.extract.text.js -t extract_data_file_text_quote
//node dist/test/test.extract.text.js -t extract_data_file_text_tab
//node dist/test/test.extract.text.js -t extract_data_file_text_request_params
//node dist/test/test.extract.text.js -t extract_data_file_text_initialize
