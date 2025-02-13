import LineByLine from "n-readlines";

let file = "./assets/tso.txt";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];
let lineByLine = new LineByLine(file);
let line;
let lineno = 1;
while(line = lineByLine.next()) {
    console.log("Line: ",lineno," : ",line.toString("utf-8"));
    lineno++;
}
