import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnModel, KnFieldSetting } from "@willsofts/will-db";
import { KnContextInfo, KnDataSet } from '@willsofts/will-core';
import { MigrateTextHandler } from "./MigrateTextHandler";
import ExcelJS from "exceljs";
//import moment from "moment-timezone";
//const GMT_MINUS_OFFSET = -7 * 60 * 60 * 1000;

export class MigrateExcelHandler extends MigrateTextHandler {

    public override async performReading(context: KnContextInfo, taskmodel: KnModel, filename: string) : Promise<[any,any]> {
        let sheet = taskmodel.settings?.sheetname || taskmodel.settings?.sheetno; 
        if(!sheet) {
            return Promise.reject(new VerifyError("Sheet is unspecified",HTTP.NOT_ACCEPTABLE,-16066));
        }
        const readWorkbook = new ExcelJS.Workbook();
        await readWorkbook.xlsx.readFile(filename);
        const readSheet = readWorkbook.getWorksheet(sheet);
        if(!readSheet) {
            return Promise.reject(new VerifyError("Reading sheet undefined",HTTP.NOT_ACCEPTABLE,-16067));
        }
        let header : any = {};
        let datalist : any = [];
        let skip = taskmodel.settings?.skip || 0;
        let rowCount = readSheet.rowCount;
        for(let rowNumber = 1; rowNumber <= rowCount; rowNumber++) {
            let row = readSheet.getRow(rowNumber);
            if(rowNumber > skip) {
                let dataset = await this.readDataRow(taskmodel,taskmodel.fields,row,rowNumber);
                if(dataset) {
                    datalist.push(dataset);
                }
            } else {
                let headset = await this.readDataRow(taskmodel,taskmodel.settings?.header,row,rowNumber);
                if(headset) {
                    let hds = await this.scrapeDataSet(taskmodel,taskmodel.settings?.header,rowNumber,headset);
                    if(hds) {
                        header = { ...header, ...hds };
                    }
                }
            }
        }
        //this.logger.debug(this.constructor.name+".performReading: datalist",datalist);
        //this.logger.debug(this.constructor.name+".performReading: header",header);
        return [datalist,header];
    }

    public async readDataRow(taskmodel: KnModel, fields: KnFieldSetting | undefined, row: ExcelJS.Row, index: number) : Promise<KnDataSet | undefined> {
        if(row.hasValues && fields) {
            let now = new Date();
            let gmtOffset = now.getTimezoneOffset() * 60000;
            let cellCount = row.cellCount;
            let dataset : KnDataSet = {};
            for(let fname in fields) {
                let dbf = fields[fname];
                if(dbf.options?.seqno && cellCount >= dbf.options?.seqno) {
                    let cell = row.getCell(dbf.options.seqno);
                    if(cell) {
                        dataset[fname] = cell.value;
                        if(cell.type == ExcelJS.ValueType.Date) {
                            let date = cell.value as Date;
                            if(date) {
                                dataset[fname] = new Date(date.getTime() + gmtOffset);
                                //dataset[fname] = new Date(date.getTime() + GMT_MINUS_OFFSET);
                                //dataset[fname] = moment(date).tz('Etc/GMT+7').format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
                            }
                        }
                    }
                }
            }
            dataset["lineIndex"] = index;
            return dataset;
        }
        return undefined;
    }    

}
