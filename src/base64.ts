import fs from 'fs';

let args = process.argv.slice(2);
if(args.length>1) {
    let infile = args[0];
    let outfile = args[1];
    console.log("convert file to base64: from",infile,"to",outfile);
    const fileData = fs.readFileSync(infile);
    const base64Data = fileData.toString('base64');
    fs.writeFileSync(outfile, base64Data);    
} else {
    console.log("USAGE: node base64.js in-put-file out-put-file-base64");
}