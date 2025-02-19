let source = "http://localhost:8080/assets/tso.txt";
let method = "GET";
let args = process.argv.slice(2);
if(args.length>0) source = args[0];
if(args.length>1) method = args[1];

async function testFetch(setting: any) {
    let method = setting?.method || "GET";
    let headers = setting?.headers || {};
    let data = setting?.body || {};    
    let params = {};
    let body = JSON.stringify(data);
    let init = undefined;
    if("GET"!=method && "HEAD"!=method) {
        init = Object.assign(params, { method: method, headers: headers, body });
    }
    console.log("init:",init);
    const res = await fetch(setting.source, init);
    console.log("res:",res);
}
testFetch({ source: source, method: method });

//node dist/test/test.fetch.js
//node dist/test/test.fetch.js http://localhost:8080/api/example/file?file=tso.txt POST
