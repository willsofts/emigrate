import XLSX from "xlsx";

let file = "./assets/tso_header.xlsx";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];

function readExcel(file:string,sheetname:string="tso") {
    console.log("reading: ",file);
    const readWorkbook = XLSX.readFile(file,{cellDates: true});
    console.log("sheetnames",readWorkbook.SheetNames);
    //console.log("sheets",readWorkbook.Sheets);
    sheetname = readWorkbook.SheetNames[0];
    const readWorksheet = readWorkbook.Sheets[sheetname];
    //let data = XLSX.utils.sheet_to_json(readWorksheet,{blankrows: false, header: ["mktid","share","unit","price","effdate","efftime","edittime"] });
    //let data = XLSX.utils.sheet_to_json(readWorksheet,{blankrows: false, header: ["mktid","share","unit","price","effdate","efftime","edittime","sharename"] });
    let data = XLSX.utils.sheet_to_json(readWorksheet,{blankrows: false, header: 1 });
    //let data = XLSX.utils.sheet_to_json(readWorksheet);
    console.log(data);
}
readExcel(file);
