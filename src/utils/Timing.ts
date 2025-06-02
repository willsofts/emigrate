export interface Timer {
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
}

export class Timing {
    static readonly ONE_HOUR = 60;
    private static readonly MM = 60 * 1000;
    private static readonly HH = 60 * Timing.MM;
    private static readonly DD = 24 * Timing.HH;

    private day: number = 0;
    private hour: number = 0;
    private minute: number = 0;
    private second: number = 0;
    private millisecond: number = 0;
    private holiday: number = 0;

    constructor(diftime: number);
    constructor(day: number, hour: number, minute: number, second: number, millisecond: number, holiday?: number);
    constructor(
        arg1: number,
        arg2?: number,
        arg3?: number,
        arg4?: number,
        arg5?: number,
        arg6?: number
    ) {
        if (arg2 === undefined) {
            // Single argument - difftime
            const hdif = arg1;
            const dd = Math.floor(hdif / Timing.DD);
            const ddif = hdif - dd * Timing.DD;
            const hh = Math.floor(ddif / Timing.HH);
            const mdif = ddif - hh * Timing.HH;
            const mm = Math.floor(mdif / Timing.MM);
            const sdif = mdif - mm * Timing.MM;
            const ss = Math.floor(sdif / 1000);
            const ms = sdif - ss * 1000;

            this.day = dd;
            this.hour = hh;
            this.minute = mm;
            this.second = ss;
            this.millisecond = ms;
        } else {
            this.day = arg1;
            this.hour = arg2!;
            this.minute = arg3!;
            this.second = arg4!;
            this.millisecond = arg5!;
            this.holiday = arg6 ?? 0;
        }
    }

    static differ(start: Date, end: Date, holidays: number = 0): Timing | null {
        if (!start || !end) return null;
        const hdif = Math.abs(end.getTime() - start.getTime());
        let dd = Math.floor(hdif / Timing.DD);
        const ddif = hdif - dd * Timing.DD;
        const hh = Math.floor(ddif / Timing.HH);
        const mdif = ddif - hh * Timing.HH;
        const mm = Math.floor(mdif / Timing.MM);
        const sdif = mdif - mm * Timing.MM;
        const ss = Math.floor(sdif / 1000);
        const ms = sdif - ss * 1000;

        dd = dd - holidays;
        return new Timing(dd, hh, mm, ss, ms);
    }

    static workdays(start: Date, end: Date, holidays: number = 0): Timing | null {
        if (!start || !end) return null;
        const hdif = Math.abs(end.getTime() - start.getTime());
        let dd = Math.floor(hdif / Timing.DD);
        const ddif = hdif - dd * Timing.DD;
        const hh = Math.floor(ddif / Timing.HH);
        const mdif = ddif - hh * Timing.HH;
        const mm = Math.floor(mdif / Timing.MM);
        const sdif = mdif - mm * Timing.MM;
        const ss = Math.floor(sdif / 1000);
        const ms = sdif - ss * 1000;

        const wdays = Timing.workingDays(start, end);
        const hdays = dd - (wdays > 0 ? wdays - 1 : wdays);
        dd = dd - hdays - holidays;

        return new Timing(dd, hh, mm, ss, ms, hdays);
    }

    static workingDays(from: Date, to: Date): number {
        if (!from || !to) return 0;
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const fromTime = from.getTime();
        const toTime = to.getTime();
        const days = 1 + Math.floor(Math.abs(toTime - fromTime) / MS_PER_DAY);
        // Day of week: 0=Sunday, ..., 6=Saturday
        let startDay = from.getDay();
        if (to < from) {
            startDay = to.getDay();
        }
        const stday = startDay;
        const start = stday === 0 ? 6 : stday - 1;
        const rest = days % 7;
        let end = start + rest - 1;
        if (rest === 1) {
            end += (stday >= 5 ? stday - 5 : 1);
        }
        if (end > 7) end = 7;
        let weekend = 0;
        if (end > 5) {
            if (stday === 6) {
                weekend = rest === 1 ? (start > 5 ? start - 5 : 0) : 0;
            } else {
                weekend = end - 5 - (start > 5 ? start - 5 : 0);
            }
        }
        return Math.floor(days / 7) * 5 + ((days % 7) - weekend);
    }

    setHour(hour: number): void {
        this.hour = hour;
    }

    setMillisecond(millisecond: number): void {
        this.millisecond = millisecond;
    }

    setMinute(minute: number): void {
        this.minute = minute;
    }

    setSecond(second: number): void {
        this.second = second;
    }

    getDay(): number {
        return this.day;
    }

    getHoliday(): number {
        return this.holiday;
    }

    getHour(): number {
        return this.hour;
    }

    getMillisecond(): number {
        return this.millisecond;
    }

    getMinute(): number {
        return this.minute;
    }

    getSecond(): number {
        return this.second;
    }

    parseDays(): number {
        return +(this.day + this.hour / 24).toFixed(2);
    }

    parseHours(): number {
        const totalHours = this.day * 24 + this.hour;
        const fraction = (this.minute + this.second / Timing.ONE_HOUR) / Timing.ONE_HOUR;
        return +(totalHours + fraction).toFixed(2);
    }

    parseMinutes(): number {
        const totalMinutes = this.day * 1440 + this.hour * 60 + this.minute;
        return +(totalMinutes + this.second / Timing.ONE_HOUR).toFixed(2);
    }

    parseSeconds(): number {
        return this.day * 86400 + this.hour * 3600 + this.minute * 60 + this.second;
    }

    serialize(): string {
        return `${this.pad(this.hour)}:${this.pad(this.minute)}:${this.pad(this.second)}`;
    }

    serializeTo(dd: string, hh: string, mm: string, ss: string): string {
        return `${(dd ? this.day.toString() + dd : '')}${this.pad(this.hour)}${hh}${this.pad(this.minute)}${mm}${this.pad(this.second)}${ss}`;
    }

    toString(): string {
        return `${this.hour}:${this.minute}:${this.second}`;
    }

    toStringFormatted(dd: string, hh: string, mm: string, ss: string): string {
        return `${this.day > 0 ? this.day + dd : ''}${this.hour > 0 ? this.hour + hh : ''}${this.minute > 0 ? this.minute + mm : ''}${this.second > 0 ? this.second : '0' + this.second}${ss}`;
    }

    toTimer() : Timer {
        return {day: this.day, hour: this.hour, minute: this.minute, second: this.second, millisecond: this.millisecond };
    }

    private pad(n: number): string {
        return n > 9 ? n.toString() : '0' + n;
    }
}
