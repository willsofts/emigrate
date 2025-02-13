import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';

function removeTextNode(obj:any) : any {
    if (Array.isArray(obj)) {
        return obj.map(removeTextNode);  // Recursively handle array elements
    } else if (obj !== null && typeof obj === 'object') {
        // For each key, check if it's a text node and move its value up
        for (const key in obj) {
            if (key === '#text') {
                return obj[key]; // Replace the '#text' key with its value
            }
            if (typeof obj[key] === 'object') {
                obj[key] = removeTextNode(obj[key]);  // Recursively handle nested objects
            }
        }
    }
    return obj; // Return the object if no modification is needed
}

let file = "./assets/tso.xml";
let args = process.argv.slice(2);
if(args.length>0) file = args[0];

const options = {
    ignoreDeclaration: true,
    ignorePiTags: true,    
    ignoreAttributes: false,  // Don't ignore attributes, so they will be parsed
    textNodeName: "#text",    // Default name for text nodes
    attributeNamePrefix: "",  // Do not add prefix to attributes
    parseNodeValue: true,     // Parse the value of nodes
    parseAttributeValue: true // Parse attributes as well    
};

let parser = new XMLParser(options);
let buffer = fs.readFileSync(file,"utf-8");
let data = parser.parse(buffer,true);
console.log("data",data);
console.log("string",JSON.stringify(data,null,1));

let jsonclean = removeTextNode(data);
console.log("clean:",JSON.stringify(jsonclean,null,1));
