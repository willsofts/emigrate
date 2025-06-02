import { Timing } from "../utils/Timing";

let args = process.argv.slice(2);
let from = "2025-06-01";
let to = "2025-06-30";
if(args.length>0) from = args[0];
if(args.length>1) to = args[1];
const fromDate = new Date(from); 
const toDate = new Date(to);
console.log("working days:",Timing.workingDays(fromDate, toDate)); 
let t = Timing.differ(fromDate,toDate);
console.log("timer:",t?.toTimer());