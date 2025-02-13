export class MigrateUtility {
    
    public static removeDoubleQuote(text: string) {
        if(text.charAt(0)=="\"") text = text.substring(1);
        if(text.charAt(text.length-1)=="\"") text = text.substring(0,text.length-1);
        return text;
    }

}