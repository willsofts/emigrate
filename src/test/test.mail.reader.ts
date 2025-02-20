import imap from 'imap-simple';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import path from 'path';
import { Arguments } from "@willsofts/will-util";

let args = process.argv.slice(2);
let user = Arguments.getString(args,"ezprompt@gmail.com","-u","-user") as string;
let password = Arguments.getString(args,"nzazlorszucrhrbb","-p","-pwd") as string;
let host = Arguments.getString(args,"imap.gmail.com","-h","-host") as string;
let port = Arguments.getInteger(args,993,"-port");
let tls = Arguments.getBoolean(args,true,"-tls");

const config = {
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
  }
};

async function saveAttachment(part: any, emailSubject: string) {
  const filename = part.filename;
  const attachmentDir = path.join(__dirname, 'attachments');
  
  // Ensure the attachments directory exists
  if (!fs.existsSync(attachmentDir)) {
    fs.mkdirSync(attachmentDir);
  }

  const filePath = path.join(attachmentDir, filename);
  
  // Save the attachment to the local filesystem
  const writeStream = fs.createWriteStream(filePath);
  writeStream.write(part.body);
  writeStream.end();
  
  console.log(`Saved attachment "${filename}" from email "${emailSubject}" to "${filePath}"`);
}

async function readEmails() {
  try {
    const connection = await imap.connect(config);
    console.log('Connected to Gmail');

    // Open the inbox
    await connection.openBox('INBOX');

    // Search for unread emails
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: ['HEADER', 'TEXT', 'ATTACHMENTS'], struct: true };

    // Get emails
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    for (const message of messages) {
      const subject = message.parts[0].body.subject;
      const from = message.parts[0].body.from;
      const date = message.parts[0].body.date;

      console.log(`New email from: ${from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Date: ${date}`);

      // Parse email body
      const { text } = await simpleParser(message.parts.filter(part => part.which === 'TEXT')[0].body);
      console.log('Body:', text);

      // Check for attachments and save them
      const attachments = message.parts.filter((part:any) => part.disposition && part.disposition.type === 'ATTACHMENT');
      for (const attachment of attachments) {
        await saveAttachment(attachment, subject);
      }
    }

    // Close the connection
    connection.end();
  } catch (error) {
    console.error('Error reading emails:', error);
  }
}

readEmails();
