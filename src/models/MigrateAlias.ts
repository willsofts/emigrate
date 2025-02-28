import { KnDBConfig, KnRecordSet } from "@willsofts/will-sql";
import { KnModel, KnGenericObject } from "@willsofts/will-db";
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
    query?: string;
}

export interface MigrateConfig extends KnDBConfig, MigrateSetting {

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
}

export interface FilterInfo {
    cancel: boolean;    
    throwable?: any;
}

export interface PluginSetting {
    name: string;
    property: any;
    filetype?: string;
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
}
