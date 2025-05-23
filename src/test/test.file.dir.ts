import fs from "fs";
import path from "path";
import mime from 'mime-types';
import { MigrateUtility } from "../utils/MigrateUtility";

let dir = "./assets";
let args = process.argv.slice(2);
if(args.length>0) dir = args[0];

async function getFileInfo(file: string) {
    let info = path.parse(file);
    console.log("info",info);
    const stats = await fs.promises.stat(file);
    console.log('File Size:', stats.size, 'bytes');
    console.log('Created At:', stats.birthtime);
    console.log('Modified At:', stats.mtime);
    console.log('Is Directory:', stats.isDirectory());
    console.log('Is File:', stats.isFile());
    console.log('File info:', info);
    console.log("mime type: ",mime.lookup(file));
    console.log("path:",path.join(info.dir,info.base));
    let fileinfo = await MigrateUtility.getFileInfo(file);
    console.log("file info:",fileinfo);
}
async function getFileDir(dir: string) {
    let files = await fs.promises.readdir(dir);
    if(files) {
        for(let file of files) {
            console.log("file:",file);
            let filepath = path.join(dir,file);
            await getFileInfo(filepath);
        }
    }
}
getFileDir(dir);

//node dist/test/test.file.dir.js ./assets/migrate
