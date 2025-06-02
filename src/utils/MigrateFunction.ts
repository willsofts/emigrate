import { Timing } from "./Timing";

export class MigrateFunction {

    public static timing = Timing;

    public static computeAge(dob: Date, today?: Date) {
        let result = { 
            years: 0, 
            months: 0, 
            days: 0, 
            toString: function() { 
                return (this.years ? this.years + ' Years ' : '') 
                + (this.months ? this.months + ' Months ' : '') 
                + (this.days ? this.days + ' Days' : '');
            }
        };
        if(!dob) return result;
        if(!today) today = new Date();
        result.months = ((today.getFullYear() * 12) + (today.getMonth() + 1)) - ((dob.getFullYear() * 12) + (dob.getMonth() + 1));
        if (0 > (result.days = today.getDate() - dob.getDate())) {
            let y = today.getFullYear(), m = today.getMonth();
            m = (--m < 0) ? 11 : m;
            result.days += 
            [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m] 
                + (((1 == m) && ((y % 4) == 0) && (((y % 100) > 0) || ((y % 400) == 0))) 
                    ? 1 : 0);
            --result.months;
        }
        result.years = (result.months - (result.months % 12)) / 12;
        result.months = (result.months % 12);
        return result;
    }

}
