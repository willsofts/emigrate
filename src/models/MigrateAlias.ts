import { KnDBConfig, KnRecordSet } from "@willsofts/will-sql";

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
    taskid: string;
    processid: string;
    totalrecords: number;
    errorrecords: number;
    skiprecords: number;
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
