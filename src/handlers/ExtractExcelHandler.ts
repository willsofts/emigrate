import { HTTP } from "@willsofts/will-api";
import { KnModel } from "@willsofts/will-db";
import { KnResultSet } from "@willsofts/will-sql";
import { KnContextInfo, VerifyError } from '@willsofts/will-core';
import { MigrateRecords, MigrateRecordSet, MigrateParams, MigrateDataRow, FilterInfo, MigrateState } from "../models/MigrateAlias";
import { ExtractControlHandler } from "./ExtractControlHandler";
import ExcelJS from "exceljs";
import fs from "fs";

export class ExtractExcelHandler extends ExtractControlHandler {
    public notename : string = "EXCEL";

    protected override async performDataSet(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, rs: KnResultSet, options: any = {}): Promise<MigrateRecordSet> {
        let fullfilename = this.getFullFileName(model,record.migrateid);
        this.logger.debug(this.constructor.name+".performDataSet: save as",fullfilename);
        let datafields = this.scrapeDataFields(model?.fields);
        let data : MigrateDataRow = {state: MigrateState.START, index: 0, datarow: undefined, rs, fields: datafields || model.cells, options: options};
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(model.settings?.sheetname || model.name, {
          pageSetup: { paperSize: this.getPaperSize(model), orientation: model.settings?.orientation || "landscape" },
        });
        data.options.workbook = workbook;
        data.options.worksheet = worksheet;
        data.options.notefile = fullfilename;
        this.printHeader(model,data);    
        await super.performDataSet(context,model,rc,record,param,rs,options);
        this.printFooter(model,data);
        await workbook.xlsx.writeFile(data.options.notefile);
        param.notefile = data.options.notefile;
        if(param.notefile) {
            if(fs.existsSync(param.notefile)) {
                let buffer = fs.readFileSync(param.notefile);
                this.updateStream(context,param,record,buffer);
            } else {
                return Promise.reject(new VerifyError(`File not found ${param.notefile}`,HTTP.NOT_FOUND,-16060,record.processid));
            }
        }
        return record;
    }

    protected override async performDataRow(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, data: MigrateDataRow): Promise<FilterInfo> {
        if(data.state == MigrateState.RUN) {
            let worksheet = data.options?.worksheet;
            if(worksheet) {
                let colIndex = 0;
                let rowIndex = data.options.rowIndex || 1;
                const row = worksheet.getRow(rowIndex + data.index);
                for(let key in data.datarow) {
                    colIndex++;
                    let cell = row.getCell(colIndex);
                    cell.value = data.datarow[key];
                    let options = this.getOptions(key,data.fields);
                    if(options?.alignment) {
                        cell.alignment = options.alignment;    
                    }
                }
            }      
        }
        return { cancel: this.cancelDataRow };
    }

    protected override printHeader(model: KnModel, data: MigrateDataRow) {
        if(String(model.settings?.header ?? "true") == "true") {
            let worksheet = data.options?.worksheet;
            if(worksheet) {
                let captions = [];
                let column_options = [];
                if(Array.isArray(data.fields)) {
                    let cells = data.fields;
                    for(let cell of cells) {
                        captions.push(cell.caption || cell.name);
                        column_options.push(cell?.options || {});
                    }
                } else {
                    for(let key in data.fields) {
                        let dbf = data.fields[key];
                        captions.push(dbf?.options?.caption || key);
                        column_options.push(dbf?.options || {});
                    }
                }
                let skip = model.settings?.skip || 0;
                let rowIndex = skip + 1;  
                let row = worksheet.getRow(rowIndex);
                row.values = captions;
                row.font = { bold: true };
                //set column width
                row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
                    const columnIndex = colNumber - 1;
                    const columnOptions = column_options[columnIndex];
                    let workColumn = worksheet.getColumn(colNumber);
                    if(columnOptions && workColumn) {
                        let columnWidth = columnOptions?.width || 10;                    
                        workColumn.width = columnWidth;
                        let halign = columnOptions?.halign;
                        if(halign) {
                            workColumn.alignment = halign;
                        }
                    }
                });
                data.options.rowIndex = rowIndex;                  
            }
        }
    }

    protected getPaperSize(model: KnModel) : ExcelJS.PaperSize {
        let paper = model.settings?.paper || 'a4';
        paper = paper.toLowerCase();
        if(paper == 'a4') return ExcelJS.PaperSize.A4;
        else if(paper == 'a5') return ExcelJS.PaperSize.A5;
        else if(paper == 'b5') return ExcelJS.PaperSize.B5;
        else if(paper == 'legal') return ExcelJS.PaperSize.Legal;
        else if(paper == 'executive') return ExcelJS.PaperSize.Executive;
        else if(paper == 'envelope_10') return ExcelJS.PaperSize.Envelope_10;
        else if(paper == 'envelope_dl') return ExcelJS.PaperSize.Envelope_DL;
        else if(paper == 'envelope_c5') return ExcelJS.PaperSize.Envelope_C5;
        else if(paper == 'envelope_b5') return ExcelJS.PaperSize.Envelope_B5;
        else if(paper == 'envelope_monarch') return ExcelJS.PaperSize.Envelope_Monarch;
        else if(paper == 'double_japan_postcard_rotated') return ExcelJS.PaperSize.Double_Japan_Postcard_Rotated;
        else if(paper == 'k16_197x273_mm') return ExcelJS.PaperSize.K16_197x273_mm;
        return ExcelJS.PaperSize.A4;
    }
    
}
