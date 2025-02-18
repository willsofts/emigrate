import os from "os";
import config from "@willsofts/will-util";

export const META_INFO: any = config.get("META_INFO") || {};
export const API_URL: string = config.env("API_URL","");
export const BASE_URL: string = config.env("BASE_URL","");
export const CDN_URL: string = config.env("CDN_URL","");
export const IMG_URL: string = config.env("IMG_URL","");
export const MESSAGE_URL: string = config.env("MESSAGE_URL","");
export const REDIRECT_URL: string = config.env("REDIRECT_URL",""); 
export const RELEASE_VERSION: string = config.env("RELEASE_VERSION","v1.0.0");
export const BASE_STORAGE: string = config.env("BASE_STORAGE","");
export const ALLOW_RAW_PARAMETERS: boolean = config.env("ALLOW_RAW_PARAMETERS") === "true";

export const DB_SECTION: string = config.env("DB_SECTION","MYSQL");
export const PRIVATE_SECTION: string = config.env("PRIVATE_SECTION","MYSQL");
export const MAX_EXPIRE_DATE: string = config.env("MAX_EXPIRE_DATE","31/12/9000"); 

export const DEFAULT_CALLING_SERVICE: boolean = config.env("DEFAULT_CALLING_SERVICE","true") === "true";
export const FILE_ASSETS: string = config.env("FILE_ASSETS","./assets");
export const DOWNLOAD_FILE_PATH: string = config.env("DOWNLOAD_FILE_PATH") || os.tmpdir();
