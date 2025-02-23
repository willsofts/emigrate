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
export const UPLOAD_FILE_PATH: string = config.env("UPLOAD_FILE_PATH");
export const IMPORT_FTP_HOST: string = config.env("IMPORT_FTP_HOST");
export const IMPORT_FTP_USER: string = config.env("IMPORT_FTP_USER");
export const IMPORT_FTP_PASSWORD: string = config.env("IMPORT_FTP_PASSWORD");
export const IMPORT_FTP_KEYFILE: string = config.env("IMPORT_FTP_KEYFILE");
export const ATTACH_MAIL_HOST: string = config.env("ATTACH_MAIL_HOST");
export const ATTACH_MAIL_PORT: number = parseInt(config.env("ATTACH_MAIL_PORT","993")) || 993;
export const ATTACH_MAIL_USER: string = config.env("ATTACH_MAIL_USER");
export const ATTACH_MAIL_PASSWORD: string = config.env("ATTACH_MAIL_PASSWORD");
export const ATTACH_MAIL_TLS: boolean = config.env("ATTACH_MAIL_TLS","true") === "true";
export const ATTACH_MAIL_TIMEOUT: number = parseInt(config.env("ATTACH_MAIL_TIMEOUT","3000")) || 3000;
export const ATTACH_MAIL_MARKSEEN: boolean = config.env("ATTACH_MAIL_MARKSEEN","true") === "true";
export const ATTACH_MAIL_FROM: string = config.env("ATTACH_MAIL_FROM");
export const ATTACH_MAIL_SUBJECT: string = config.env("ATTACH_MAIL_SUBJECT");
export const ATTACH_MAIL_FILENAME: string = config.env("ATTACH_MAIL_FILENAME");
export const ATTACH_FILE_PATH: string = config.env("ATTACH_FILE_PATH") || os.tmpdir();

