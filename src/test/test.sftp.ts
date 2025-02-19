import SftpClient from "ssh2-sftp-client";
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let user = Arguments.getString(args,"sbaadm","-u","-user") as string;
let password = Arguments.getString(args,"sbaadm@freewill","-p","-pwd") as string;
let host = Arguments.getString(args,"10.22.26.75","-h","-host") as string;
let port = Arguments.getInteger(args,22,"-port");
let folder = Arguments.getString(args,"/home/sbaadm/assets","-f","-folder") as string;

let sftp = new SftpClient();
sftp.on("error",(err) => console.error("on error:",err));
sftp.connect({
    host: host,
    //port: port,
    username: user,
    password: password
}).then(() => {
    return sftp.list(folder);
}).then((data) => {
    console.log("list:",data);
    sftp.end();
}).catch((err) => {
    console.error("error:",err);
    sftp.end();
});

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