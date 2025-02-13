import { HTTP } from "@willsofts/will-api";
import { VerifyError } from "@willsofts/will-core";
import { KnModel } from "@willsofts/will-db";
import { KnContextInfo } from '@willsofts/will-core';
import { MigrateTextHandler } from "./MigrateTextHandler";
import XLSX from "xlsx";

export class MigrateXlsxHandler extends MigrateTextHandler {

    public override async performReading(context: KnContextInfo, taskmodel: KnModel, filename: string) : Promise<[any,any]> {
        let sheet = taskmodel.settings?.sheetname || taskmodel.settings?.sheetno; 
        if(!sheet) {
            return Promise.reject(new VerifyError("Sheet is unspecified",HTTP.NOT_ACCEPTABLE,-16066));
        }
        const readWorkbook = XLSX.readFile(filename,{cellDates: true});
        let sheetname = taskmodel.settings?.sheetname;
        if(taskmodel.settings?.sheetno) {
            sheetname = readWorkbook.SheetNames[taskmodel.settings?.sheetno];
        }
        let readSheet = readWorkbook.Sheets[sheetname];        
        if(!readSheet) {
            return Promise.reject(new VerifyError("Reading sheet undefined",HTTP.NOT_ACCEPTABLE,-16067));
        }
        let header : any = {};
        let datalist = XLSX.utils.sheet_to_json(readSheet,{blankrows: false, header: 1 });
        if(taskmodel.settings?.skip > 0) {
            let headlist = datalist.slice(0,taskmodel.settings?.skip);
            datalist = datalist.slice(taskmodel.settings?.skip);
            for(let idx = 0; idx < headlist.length; idx++) {
                let hdr = headlist[idx] as string[];
                let headset = await this.scrapeDataArray(taskmodel,taskmodel.settings?.header,hdr,idx+1);
                if(headset) {
                    let hds = await this.scrapeDataSet(taskmodel,taskmodel.settings?.header,idx+1,headset);
                    if(hds) {
                        header = { ...header, ...hds };
                    }
                }
            }
        }
        this.logger.debug("header:",header);
        //this.logger.debug("datalist:",datalist);
        return [datalist,header];
    }

}
