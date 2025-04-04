import { KnDBConfig, KnRecordSet, KnResultSet } from "@willsofts/will-sql";
import { KnModel, KnGenericObject, KnFieldSetting, KnCellSetting, KnDBField } from "@willsofts/will-db";
import { ParsedPath } from "path";

export interface MigrateSetting {
    type?: string;
    fieldname?: string;
    fieldvalue?: string;
    mapper?: string;
    api?: string;
    setting?: any;
    body?: any;
    handler?: string;
    handlerType?: string;
    query?: string;
}

export interface MigrateConfig extends KnDBConfig, MigrateSetting {
    connectid?: string;
    parameters?: ParameterInfo[];
}

export interface MigrateRecords {
    totalrecords: number;
    errorrecords: number;
    skiprecords: number;
}

export interface MigrateRecordSet extends KnRecordSet {
    migrateid: string;
    processid: string;
    taskid: string;
    modelname: string;
    totalrecords: number;
    errorrecords: number;
    skiprecords: number;
    posterror: boolean;
    message?: string;
}

export interface MigrateResultSet {
    taskid: string;
    processid: string;
    resultset: MigrateRecordSet[];
}

export interface MigrateInfo {
    exception: boolean;
    errormessage: string;
    errorcontents: any[];
}

export interface MigrateReject {
    reject: boolean;
    throwable: any;
}

export interface RefConfig {
    ref: string; //@=root,$=current,#=special
    name: string; 
}

export interface TaskModel extends KnModel {
    resultset?: MigrateRecordSet;
    dataset?: any;
    datapart?: any;
}

export interface MigrateModel {
    models: TaskModel[];
    configs?: KnGenericObject;
}

export interface MigrateParams {
    authtoken: string|undefined;
    filename: string;
    fileinfo?: any;
    calling: boolean;    
    async: boolean;
    dominated?: boolean;
    notename?: string;
    notefile?: string;
}

export interface FilterInfo {
    cancel: boolean;    
    throwable?: any;
}

export interface PluginSetting {
    name: string;
    property: any;
    filetype?: string;
    connection?: any;
}

export interface FileSetting {
    source: string;
    target: string;
    path?: string;
    file?: string;
    originalname?: string;
    naming?: string;
    method?: string;
    headers?: any;
    stat?: boolean;
    body?: any;
}

export interface FileInfo {
    type: string;
    originalname: string;
    created: Date;
    modified: Date;
    size: number;
    isDirectory: boolean;
    isFile: boolean;
    mimetype: string | undefined;
    destination: string;
    path: string;
    info: ParsedPath; 
    body?: any;   
}

export interface StatementInfo {
    sql: string;
    parameters?: ParameterInfo[];
    statements?: StatementInfo[];    
}

export interface ParameterInfo {
    name: string;
    caption: string;
    type?: string;
    value?: string;
    defaultValue?: string;
    required?: boolean;
}

export interface FileType {    
    isText: boolean,
    isJson: boolean,
    isXlsx: boolean,
    isXml: boolean;
}

export enum MigrateState {
    START = "START",
    RUN = "RUN",
    FINISH = "FINISH"
}

export interface MigrateDataRow {
    state: MigrateState; 
    index: number;
    datarow: any;
    rs: KnResultSet;
    fields: KnFieldSetting | KnCellSetting[] | undefined;
    options: any;
}

export interface MigrateField {
    name: string;
    field: KnDBField;
}
