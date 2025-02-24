import { Arguments } from "@willsofts/will-util";
import { FileDownloadHandler } from "../handlers/FileDownloadHandler";
import { DOWNLOAD_FILE_PATH } from "../utils/EnvironmentVariable";

let args = process.argv.slice(2);
let setting = { 
    name: "download", 
    property: { 
        source: Arguments.getString(args,"http://localhost:8080/assets/tso.txt","-url","-source") as string,
        target: Arguments.getString(args,"download.txt","-t","-target") as string,
        path: Arguments.getString(args,DOWNLOAD_FILE_PATH,"-path") as string, 
    } 
};

async function testDownload(setting:any) {
    let handler = new FileDownloadHandler();
    let res = await handler.performDownload(setting);
    console.log("res",res);
}
testDownload(setting);

//node dist/test/test.file.download.js
//node dist/test/test.file.download.js -url http://localhost:8080/assets/ttso.txt
