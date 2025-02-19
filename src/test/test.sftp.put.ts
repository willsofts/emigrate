import SftpClient from "ssh2-sftp-client";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let user = Arguments.getString(args,"sbaadm","-u","-user") as string;
let password = Arguments.getString(args,"sbaadm@freewill","-p","-pwd") as string;
let host = Arguments.getString(args,"10.22.26.75","-h","-host") as string;
let port = Arguments.getInteger(args,22,"-port");
let file = Arguments.getString(args,"d:\\exim\\assets\\tso.txt","-f","-file") as string;
let target = Arguments.getString(args,"/home/sbaadm/assets/tso_put.txt","-t","-target") as string;

let sftp = new SftpClient();
sftp.on("error",(err) => console.error("on error:",err));

const config = {
    host: host,
    port: port,
    username: user,
    password: password
};

async function putFile(localPath: string,remotePath: string) {
    try {
        await sftp.connect(config);
        await sftp.put(localPath,remotePath);
    } catch(ex) {
        console.error("error:",ex);
        return Promise.reject(ex);
    } finally {
        console.log("finally end");
        sftp.end();
    }
}

putFile(file,target);
