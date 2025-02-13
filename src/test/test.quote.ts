
function removeDoubleQuote(text:string) {
    if(text.charAt(0)=="\"") text = text.substring(1);
    if(text.charAt(text.length-1)=="\"") text = text.substring(0,text.length-1);
    return text;
}

console.log(removeDoubleQuote("Hello New World"));
console.log(removeDoubleQuote("\"Hello New World\""));
console.log(removeDoubleQuote("\"Hello New World"));
console.log(removeDoubleQuote("Hello New World\""));
console.log(removeDoubleQuote("Hello \"New\" World"));
