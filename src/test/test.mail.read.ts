import imaps from 'imap-simple';
import { MailParser } from 'mailparser';
import fs from 'fs';
import path from 'path';
import { Arguments } from "@willsofts/will-util";

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let args = process.argv.slice(2);
let user = Arguments.getString(args,"ezprompt@gmail.com","-u","-user") as string;
let password = Arguments.getString(args,"nzazlorszucrhrbb","-p","-pwd") as string;
let host = Arguments.getString(args,"imap.gmail.com","-h","-host") as string;
let port = Arguments.getInteger(args,993,"-port");
let tls = Arguments.getBoolean(args,true,"-tls");

const config: imaps.ImapSimpleOptions = {
  imap: {
    user: user,
    password: password,
    host: host,
    port: port, // or 143 for non-SSL
    tls: tls, // set to false for non-SSL
    authTimeout: 3000,
    tlsOptions: {
      rejectUnauthorized: false, // Disable SSL certificate validation
    }

  },
};
console.log("config",config);
async function readEmails(): Promise<void> {
  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX'); // specify the mailbox name

    const searchCriteria = ['UNSEEN']; // search for unseen emails
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };
    
    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const message of messages) {
      console.log("message:",message);
      if (message.attributes.struct) {
        const parts = imaps.getParts(message.attributes.struct);
        const part = parts.find(part => part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT');

        if (part) {
          const stream = await connection.getPartData(message, part);
          const mailparser = new MailParser();

          stream.pipe(mailparser);
          mailparser.on('end', mail => {
            if (mail.attachments && mail.attachments.length > 0) {
              mail.attachments.forEach((attachment:any) => {
                const filePath = path.join(__dirname, "attachment", attachment.filename);
                console.log("saving attachment:",filePath);
                fs.writeFile(filePath, attachment.content, err => {
                  if (err) {
                    console.error('Error saving attachment:', err);
                  } else {
                    console.log(`Attachment saved: ${filePath}`);
                  }
                });
              });
            } else {
              console.log('No attachments found');
            }
          });
        }
      }
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

readEmails();
