import { Arguments } from "@willsofts/will-util";
import { FileTransferHandler } from "../handlers/FileTransferHandler";

let args = process.argv.slice(2);
let setting = {
    name: "transfer",
    property: {
        user: Arguments.getString(args,"sbaadm","-u","-user") as string,
        password: Arguments.getString(args,"sbaadm@freewill","-p","-pwd") as string,
        host: Arguments.getString(args,"10.22.26.75","-h","-host") as string,
        port: Arguments.getInteger(args,22,"-port"),
        source: Arguments.getString(args,"d:\\exim\\assets\\tso.txt","-f","-file") as string,
        target: Arguments.getString(args,"/home/sbaadm/assets/tso_put.txt","-t","-target") as string,
    }
};

async function testTransfer(setting:any) {
    let handler = new FileTransferHandler();
    let res = await handler.performUpload(setting);
    console.log("res",res);
}
testTransfer(setting);

//node dist/test/test.file.transfer.put.js
