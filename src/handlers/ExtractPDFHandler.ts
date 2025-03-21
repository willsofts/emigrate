import { HTTP } from "@willsofts/will-api";
import { KnModel } from "@willsofts/will-db";
import { KnResultSet } from "@willsofts/will-sql";
import { KnContextInfo, VerifyError } from '@willsofts/will-core';
import { MigrateRecords, MigrateRecordSet, MigrateParams, MigrateDataRow, MigrateState } from "../models/MigrateAlias";
import { ExtractControlHandler } from "./ExtractControlHandler";
import fs from "fs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const pdf_fonts = require("../../config/fonts.json");

export class ExtractPDFHandler extends ExtractControlHandler {
    public notename : string = "PDF";
    public cancelDataRow: boolean = false;

    protected override async performDataSet(context: KnContextInfo, model: KnModel, rc: MigrateRecords, record: MigrateRecordSet, param: MigrateParams, rs: KnResultSet, options: any = {}): Promise<MigrateRecordSet> {
        let fullfilename = this.getFullFileName(model,record.migrateid);
        this.logger.debug(this.constructor.name+".performDataSet: save as",fullfilename);
        let datafields = this.scrapeDataFields(model?.fields);
        let data : MigrateDataRow = {state: MigrateState.START, index: 0, datarow: undefined, rs, fields: datafields || model.cells, options: options};
        data.options.notefile = fullfilename;
        let [captions, column_styles] = this.getDocumentStyles(data);
        await super.performDataSet(context,model,rc,record,param,rs,options);
        const doc = new jsPDF(model.settings?.orientation || "portrait", "pt", model.settings?.paper || "a4");
        let fontname = this.settingDocument(model,doc);
        autoTable(doc, {
            headStyles: { halign: model.settings?.halign || 'center', fillColor: model.settings?.fillColor || "gray" },
            columnStyles: column_styles,
            body: record.rows,
            columns: captions,
            theme: "grid",
            styles: { font: fontname },
        });
        doc.save(data.options.notefile);                
        param.notefile = data.options.notefile;
        if(param.notefile) {
            if(fs.existsSync(param.notefile)) {
                let buffer = fs.readFileSync(param.notefile);
                this.updateStream(context,param,record,buffer);
            } else {
                return Promise.reject(new VerifyError(`File not found ${param.notefile}`,HTTP.NOT_FOUND,-16060,record.processid));
            }
        }
        record.rows = [];
        return record;
    }
    
    protected getDocumentStyles(data : MigrateDataRow) : [any[],any]{
        let captions = [];
        let column_styles : any = {};
        if(Array.isArray(data.fields)) {
            let cells = data.fields;
            for(let cell of cells) {
                captions.push({ header: cell.caption || cell.name, dataKey: cell.name });
                let alignment = cell?.options?.alignment;
                if(typeof alignment === 'object') {
                    alignment = alignment?.horizontal || 'left';
                }
                column_styles[cell.name] = { halign : alignment };
            }
        } else {
            for(let key in data.fields) {
                let dbf = data.fields[key];
                captions.push({ header: dbf?.options?.caption || key, dataKey: key });
                let alignment = dbf?.options?.alignment;
                if(typeof alignment === 'object') {
                    alignment = alignment?.horizontal || 'left';
                }
                column_styles[key] = { halign: alignment };
            }
        }
        return [captions,column_styles];
    }

    protected settingDocument(model: KnModel, doc: jsPDF) : string {
        let fontname = model.settings?.fontname || "tahoma";
        let font = pdf_fonts[fontname];
        if(font) {
            doc.addFileToVFS(fontname+'-normal.ttf', font);
            doc.addFont(fontname+'-normal.ttf', fontname, 'normal');
            doc.addFont(fontname+'-normal.ttf', fontname, 'bold');
            doc.addFont(fontname+'-normal.ttf', fontname, 'italic');
            doc.setFont(fontname);        
        }
        return fontname;
    }

}
