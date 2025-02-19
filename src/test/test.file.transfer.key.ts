import { Arguments } from "@willsofts/will-util";
import { FileTransferHandler } from "../handlers/FileTransferHandler";

let args = process.argv.slice(2);
let setting = {
    user: Arguments.getString(args,"tassan_oro","-u","-user") as string,
    host: Arguments.getString(args,"172.31.199.217","-h","-host") as string,
    port: Arguments.getInteger(args,22,"-port"),
    source: Arguments.getString(args,"/home/tassan_oro/ai/start.sh","-f","-file") as string,
    target: Arguments.getString(args,"d:\\exim\\assets\\sftp\\start.sh","-t","-target") as string,
    keyfile: Arguments.getString(args,"D:\\keystore\\aws\\aws_server_workflow_tassan_openssh.ppk","-k","-key") as string,
};

async function testTransfer(setting:any) {
    let handler = new FileTransferHandler();
    let res = await handler.performDownload(setting);
    console.log("res",res);
}
testTransfer(setting);

//node dist/test/test.file.transfer.key.js
