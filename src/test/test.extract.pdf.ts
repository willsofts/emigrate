import { ExtractPDFHandler } from "../handlers/ExtractPDFHandler";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let taskid = Arguments.getString(args,"extract_data_file_pdf","-task","-t") as string;
let file = Arguments.getString(args,"./assets/extract/tso_ext.pdf","-file","-f") as string;
let async = Arguments.getBoolean(args,false,"-async","-a") as boolean;
let mktid = Arguments.getString(args,"TSO","-mktid") as string;

async function testExtract() {
    let context = { params: { filename: file, taskid: taskid, async: async, mktid: mktid }, meta: {} };
    let handler = new ExtractPDFHandler();
    let result = await handler.doCollecting(context,undefined,undefined,false);
    console.log("result:",JSON.stringify(result,null,2));
}
testExtract().catch(ex => console.error("error",ex));

//node dist/test/test.extract.pdf.js 
