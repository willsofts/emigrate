import { Arguments } from "@willsofts/will-util";
import { FileAttachmentHandler } from "../handlers/FileAttachmentHandler";

let args = process.argv.slice(2);
let setting = {
    name: "mail",
    property: {
        user: Arguments.getString(args,"ezprompt@gmail.com","-u","-user") as string,
        password: Arguments.getString(args,"nzazlorszucrhrbb","-p","-pwd") as string,
        host: Arguments.getString(args,"imap.gmail.com","-h","-host") as string,
        port: Arguments.getInteger(args,993,"-port"),
        tls: Arguments.getBoolean(args, true, "-tls"),
        markSeen: Arguments.getBoolean(args, false, "-seen"),
        subject: Arguments.getString(args, undefined, "-s", "-subject") as string,
        from: Arguments.getString(args, undefined, "-f", "-from") as string,
        source: Arguments.getString(args,"tassunoros@gmail.com","-f","-from") as string,
        target: Arguments.getString(args,"tso.txt","-t","-target") as string,
    }
};

async function testGetMailAttachment(setting:any) {
    let handler = new FileAttachmentHandler();
    let res = await handler.performDownload(setting);
    console.log("res",res);
}
testGetMailAttachment(setting);

//node dist/test/test.file.mail.js
