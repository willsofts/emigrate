import SftpClient from "ssh2-sftp-client";
import { Arguments } from "@willsofts/will-util";
import fs from "fs";

let args = process.argv.slice(2);
let user = Arguments.getString(args,"tassan_oro","-u","-user") as string;
let host = Arguments.getString(args,"172.31.199.217","-h","-host") as string;
let port = Arguments.getInteger(args,22,"-port");
let folder = Arguments.getString(args,"/home/tassan_oro","-f","-folder") as string;
let keyfile = Arguments.getString(args,"D:\\keystore\\aws\\aws_server_workflow_tassan_openssh.ppk","-k","-key") as string;
//key file need OpenSSH format: putty keygen load & convert -> Export OpenSSH format
let buffer = fs.readFileSync(keyfile);
let sftp = new SftpClient();
sftp.on("error",(err) => console.error("on error:",err));
sftp.connect({
    host: host,
    //port: port,
    username: user,
    privateKey: buffer,
}).then(() => {
    return sftp.list(folder);
}).then((data) => {
    console.log("list:",data);
    sftp.end();
}).catch((err) => {
    console.error("error:",err);
    sftp.end();
});

//node dist/test/test.sftp.key.js

/*
example output:
[
  {
    type: '-',
    name: 'tso_json.txt',
    size: 2255,
    modifyTime: 1739933453000,
    accessTime: 1739933453000,
    rights: { user: 'rw', group: 'r', other: '' },
    owner: 7101,
    group: 9800,
    longname: '-rw-r-----    1 sbaadm   docker       2255 Feb 19 09:50 tso_json.txt'
  }
]
*/