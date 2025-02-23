import Imap from 'node-imap';
import MailParser from 'mailparser';

export interface FetchFile {
    buffer: Buffer;
    mimetype: string;
    size: number;
    originalname: string;
}

export interface FetchInfo {
    from_name: string | undefined;
    from_address: string | undefined;
    subject: string | undefined;
    date: Date | string | undefined;
    body: string | undefined;
    files: FetchFile[],
    seqno: number,
    uid: string | undefined;
}

export interface FetchOptions {
    from?: string;
    subject?: string;
    filenameFilter?: string;
    saveAttachment?: boolean;
    naming?: string;
}

export class FetchMail {
    public imap;
    public logger;
    public options;
    
    constructor(config: any) {
        this.imap = new Imap(config.imap);
        this.logger = config?.logger;
        this.options = config?.options;
    }

    public async connect() : Promise<string> {
        return new Promise((resolve, reject) => {
            this.imap.once('error', (err) => {
                reject(err);
            });
            this.imap.once('ready', () => {
                resolve('ready');
            });
            this.imap.connect();
        });
    }

    public async end() : Promise<string> {
        return new Promise((resolve) => {
            this.imap.once('close', () => {
                this._log(this.constructor.name+'.end: fetch ended');
                resolve('ended');
            });
            this.imap.end();
        });
    }

    public async openBox(boxName = 'INBOX') : Promise<string> {
        return new Promise((resolve, reject) => {
            this.imap.openBox(boxName, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(boxName);
            });
        });
    }

    public async fetchEmails(criteria:any) : Promise<FetchInfo[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const emails : FetchInfo[] = [];
                const results = await this._search(criteria) as any;

                if (results.length === 0) {
                    return resolve(emails);
                }
                this._log(this.constructor.name+".fetchEmails: options",this.options);
                const fetch = this.imap.fetch(results, {
                    bodies: '',
                    markSeen: this.options?.markSeen
                });

                let emailsProcessed = 0;
                fetch.on('message', async (msg, seqno) => {
                    const email = await this._processMessage(msg, seqno);
                    emails.push(email);
                    emailsProcessed++;
                    if (emailsProcessed === results.length) {
                        resolve(emails);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    private async _processMessage(msg: any, seqno: any) : Promise<FetchInfo> {
        return new Promise((resolve, reject) => {
            this._log(`${this.constructor.name}.processMessage: msg #${seqno}`);

            const email : FetchInfo = {
                from_name: undefined,
                from_address: undefined,
                subject: undefined,
                date: undefined,
                body: undefined,
                files: [],
                seqno: seqno,
                uid: undefined,
            };

            const parser = new MailParser.MailParser();
            parser.on('headers', (headers: MailParser.Headers) => {
                let from = headers.get("from") as MailParser.AddressObject;
                if(from) {
                    email.from_name = from.value[0].name;
                    email.from_address = from.value[0].address?.toLowerCase();
                }
                let subject = headers.get('subject');
                if(subject) {
                    email.subject = Array.isArray(subject) ? subject[0] as string: subject as string;
                }
                let date = headers.get('date');
                if(date) {
                    if(date instanceof Date || typeof date === 'string') {
                        email.date = date;
                    }
                }
            });

            parser.on('data', (data) => {
                if (data.type === 'attachment') {
                    const buffers : any[] = [];
                    data.content.on('data', (buffer:any) => {
                        buffers.push(buffer);
                    });
                    data.content.on('end', () => {
                        let buf = Buffer.concat(buffers);
                        const file : FetchFile = {
                            buffer: buf,
                            mimetype: data.contentType,
                            size: Buffer.byteLength(buf),
                            originalname: data.filename,
                        };
                        email.files.push(file);
                        data.release();
                    });
                } else if (data.type === 'text') {
                    email.body = data.text;
                }
            });

            parser.on('error', (err) => {
                reject(err);
            });

            parser.on('end', () => {
                resolve(email);
            });

            msg.on('body', function(stream:any) {
                stream.on('data', function(chunk:any) {
                    parser.write(chunk);
                });
            });

            msg.once('attributes', function(attrs:any) {
                email.uid = attrs.uid;
            });

            msg.once('end', () => {
                this._log(`${this.constructor.name}.processMessage: finished msg #${seqno}`);
                parser.end();
            });
        });
    }

    private async _search(criteria:any) {
        this._log(this.constructor.name+".search: criteria",criteria);
        return new Promise((resolve, reject) => {
            this.imap.search(criteria, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    private _log(...msg:any) {
        if (msg && this.logger) {
            this.logger.debug(...msg);
        }
    }
}
