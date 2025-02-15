import { KnDBConfig, KnRecordSet } from "@willsofts/will-sql";
import { KnModel, KnGenericObject } from "@willsofts/will-db";

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

export interface MigrateRecordSet extends KnRecordSet {
    migrateid: string;
    processid: string;
    taskid: string;
    modelname: string;
    totalrecords: number;
    errorrecords: number;
    skiprecords: number;
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

export interface MigrateModel {
    models: KnModel[];
    configs?: KnGenericObject;
}

export interface MigrateParams {
    authtoken: string|undefined;
    filename: string;
    fileinfo?: any;
    calling: boolean;    
}
