import { KnDBConfig } from "@willsofts/will-sql";
import { KnModel } from "@willsofts/will-db";

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

export interface MigrateModel extends KnModel {
    xpath?: string;
    settings?: any;
}

export interface RefConfig {
    ref: string; //@=root,$=current,#=special
    name: string; 
}
