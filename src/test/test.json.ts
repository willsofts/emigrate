
let data_fields = {
    field1: { type: "STRING", options: { mapper: "entity.reporter" } },
    field2: { type: "INTEGER", options: { handler: "" } }
};
data_fields.field2.options.handler = `
function handler(data) {
    console.log('data',data);
}
`;

console.log(data_fields);
console.log(JSON.stringify(data_fields));

let verify : any = false;
console.log("verify=",(verify==false));
console.log("verify=",(String(verify)=="false"));
verify = undefined;
console.log("verify=",(verify==false));
console.log("verify=",(String(verify)=="false"));
