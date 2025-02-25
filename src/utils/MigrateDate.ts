import moment from 'moment';
import 'moment/locale/th';
import { MIN_AD_YEAR } from "./EnvironmentVariable";

export const MONTH_LIST = [
    { short_th: "ม.ค.", short_en: "Jan", full_th: "มกราคม", full_en: "January" },
    { short_th: "ก.พ.", short_en: "Feb", full_th: "กุมภาพันธ์", full_en: "February" },
    { short_th: "มี.ค.", short_en: "Mar", full_th: "มีนาคม", full_en: "March" },
    { short_th: "เม.ย.", short_en: "Apr", full_th: "เมษายน", full_en: "April" },
    { short_th: "พ.ค.", short_en: "May", full_th: "พฤษภาคม", full_en: "May" },
    { short_th: "มิ.ย.", short_en: "Jun", full_th: "มิถุนายน", full_en: "June" },
    { short_th: "ก.ค.", short_en: "Jul", full_th: "กรกฎาคม", full_en: "July" },
    { short_th: "ส.ค.", short_en: "Aug", full_th: "สิงหาคม", full_en: "August" },
    { short_th: "ก.ย.", short_en: "Sep", full_th: "กันยายน", full_en: "September" },
    { short_th: "ต.ค.", short_en: "Oct", full_th: "ตุลาคม", full_en: "October" },
    { short_th: "พ.ย.", short_en: "Nov", full_th: "พฤศจิกายน", full_en: "November" },
    { short_th: "ธ.ค.", short_en: "Dec", full_th: "ธันวาคม", full_en: "December" },
];

export class MigrateDate {

    protected getMonthName(match: string, english: boolean = false): string {
        if(english) {
            match = match.toLowerCase();
            let result = MONTH_LIST.find(item => item.short_en.toLowerCase() === match);
            if (result) return result.short_th;
            result = MONTH_LIST.find(item => item.full_en.toLowerCase() === match);
            if (result) return result.full_th;    
            return match;
        }
        let result = MONTH_LIST.find(item => item.short_th === match);
        if (result) return result.short_en;
        result = MONTH_LIST.find(item => item.full_th === match);
        if (result) return result.full_en;
        return match;
    }
    
    protected convertMonth(dateString: string, locale: string): string {
        if("en"==locale) {
            //in case of en, check th month is exist? then replace it
            return dateString.replace(/(?:ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)/g, match => this.getMonthName(match));
        } else if("th"==locale) {
            //in case of th, check en month is exist? then replace it 
            return dateString.replace(/(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/gi, match => this.getMonthName(match,true));
        }    
        return dateString;
    }
    
    public parseDate(dateString: string, format: string, locale: string = "en", minADYear: number = MIN_AD_YEAR) {
        moment.locale(locale);
        dateString = this.convertMonth(dateString,locale);
        const parsedDate = moment(dateString, format);    
        if(!parsedDate.isValid()) return null;
        let date = parsedDate.toDate();
        let year = date.getFullYear();
        if(year > minADYear) {
            date.setFullYear(year-543);
        }
        return date;
    }
    
}
