import { FileDownloadHandler } from "../handlers/FileDownloadHandler";
import { DOWNLOAD_FILE_PATH } from "../utils/EnvironmentVariable";

let setting = { source: "http://localhost:8080/assets/tso.txt", target: "download.txt", path: DOWNLOAD_FILE_PATH };
let args = process.argv.slice(2);
if(args.length>0) setting.source = args[0];
if(args.length>1) setting.target = args[1];
if(args.length>2) setting.path = args[2];

async function testDownload(setting:any) {
    let handler = new FileDownloadHandler();
    let res = await handler.performDownload(setting);
    console.log("res",res);
}
testDownload(setting);

//node dist/test/test.file.download.js
//node dist/test/test.file.download.js http://localhost:8080/assets/ttso.txt
