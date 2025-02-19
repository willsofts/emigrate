let setting : any = { 
    source: "http://localhost:8080/api/category/lists",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { names : "tkappstype" }
};
async function testFetchApi() {
    let method = setting?.method || "POST";
    let headers = setting?.headers || {};
    let data = setting?.body || {};    
    let params = {};
    let body = JSON.stringify(data);
    let init = Object.assign(params, { method: method, headers: headers, body });    
    console.log("init:",init);
    const res = await fetch(setting.source, init);
    console.log("res:",res);
    let json = await res.json();
    console.log("json:",json);
}
testFetchApi();
