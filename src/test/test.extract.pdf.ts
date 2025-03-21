import { ExtractPDFHandler } from "../handlers/ExtractPDFHandler";

let async = false;
let taskid = "extract_data_file_pdf";
let file = "./assets/extract/tso_ext.pdf";
let args = process.argv.slice(2);
if(args.length>0) taskid = args[0];
if(args.length>1) file = args[1];
if(args.length>2) async = "true"==args[2];
async function testExtract(file: string, taskid: string) {
    let context = { params: { filename: file, taskid: taskid, async: async, mktid: "TSO" }, meta: {} };
    let handler = new ExtractPDFHandler();
    let result = await handler.doCollecting(context,undefined,undefined,false);
    console.log("result:",JSON.stringify(result,null,2));
}
testExtract(file,taskid).catch(ex => console.error("error",ex));

//node dist/test/test.extract.pdf.js 
