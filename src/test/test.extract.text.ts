import { ExtractTextHandler } from "../handlers/ExtractTextHandler";

let async = false;
let taskid = "extract_data_file_text";
let file = "./assets/extract/tso_ext.csv";
let fs_requester = "tso";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
if(args.length>2) async = "true"==args[2];
if(args.length>3) fs_requester = args[3];
async function testExtract(file: string, taskid: string) {
    let context = { params: { filename: file, taskid: taskid, async: async, fs_requester: fs_requester, mktid: "TSO" }, meta: {} };
    let handler = new ExtractTextHandler();
    let result = await handler.doCollecting(context,undefined,undefined,false);
    console.log("result:",JSON.stringify(result,null,2));
}
testExtract(file,taskid).catch(ex => console.error("error",ex));

//node dist/test/test.extract.text.js 
//node dist/test/test.extract.text.js extract_data_file_text
//node dist/test/test.extract.text.js extract_data_file_text_quote
//node dist/test/test.extract.text.js extract_data_file_text_tab
//node dist/test/test.extract.text.js extract_data_file_text_request_params
