import ExcelJS from "exceljs";
import moment from "moment-timezone";

let file = "./assets/tso.xlsx";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];

var basedate = new Date(1899, 11, 30, 0, 0, 0); // 2209161600000
function datenum(v: Date, date1904:boolean = false) {
	var epoch = v.getTime();
	if(date1904) epoch -= 1462*24*60*60*1000;
	var dnthresh = basedate.getTime() + (v.getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;
	return (epoch - dnthresh) / (24 * 60 * 60 * 1000);
}
var refdate = new Date();
var dnthresh = basedate.getTime() + (refdate.getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;
var refoffset = refdate.getTimezoneOffset();
function numdate(v: number) {
	var out = new Date();
	out.setTime(v * 24 * 60 * 60 * 1000 + dnthresh);
	if (out.getTimezoneOffset() !== refoffset) {
		out.setTime(out.getTime() + (out.getTimezoneOffset() - refoffset) * 60000);
	}
	return out;
}

async function readExcel(file:string,sheetname:string="tso") {
    console.log("reading: ",file);
    const readWorkbook = new ExcelJS.Workbook();
    await readWorkbook.xlsx.readFile(file);
    const readSheet = readWorkbook.getWorksheet(1);
    console.log("sheet",readSheet);
    if(readSheet) {
        readSheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber:number) => {
            console.log(`Row ${rowNumber}: ${row.values}, length=${row.values.length}`);
            for(let i = 1; i <= row.cellCount; i++) {
                let cell = row.getCell(i);
                console.log("cell["+i+"]=",cell.value+", type="+cell.type);
                if(cell.type == ExcelJS.ValueType.Date) {
                    let now = new Date();
                    let date = cell.value as Date;
                    const gmtMinus7Offset = -7 * 60 * 60 * 1000;
                    console.log("offset=",now.getTimezoneOffset() * 60000," minus",gmtMinus7Offset);
                    let isodate = new Date(date.getTime() + (now.getTimezoneOffset() * 60000));
                    let utcdate = new Date(date.getTime() + gmtMinus7Offset);
                    console.log("date=",date.toISOString()+", iso=",isodate,", offset=",now.getTimezoneOffset());
                    console.log("utc=",date.toUTCString(),"utc=",utcdate);
                    let vdate = datenum(date);
                    console.log("vdate",vdate);
                    let ndate = numdate(vdate);
                    console.log("ndate",ndate);
                    let gmt7Date = moment(date).tz('Etc/GMT+7').format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
                    console.log("gmt7:",gmt7Date); 

                }
            }
        });
    }
}
readExcel(file);
