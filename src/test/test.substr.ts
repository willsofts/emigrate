let text = "TPO       CIMB      230       7.0     03/05/2005 10:15:04 03/05/2005 11:11:11 ซีไอเอ็มบีไทย";
function sub(text:string,start:number,end:number) {
    return end<0 ? text.substring(start): text.substring(start,end);
}
console.log(text);
console.log("mktid=["+sub(text,0,9)+"]");
console.log("share=["+sub(text,10,19)+"]");
console.log("unit=["+sub(text,20,29)+"]");
console.log("price=["+sub(text,30,37)+"]");
console.log("effdate=["+sub(text,38,48)+"]");
console.log("efftime=["+sub(text,49,57)+"]");
console.log("edittime=["+sub(text,58,77)+"]");
console.log("sharename=["+sub(text,78,-1)+"]");