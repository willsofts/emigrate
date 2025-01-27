let data_path = "entity.rows[10].reporter";

function tokenizeAndExtractIndex(path: string, arrayKey: string) {
    // Tokenize the path by splitting at the dot (.)
    let tokens = path.split('.');

    // Extract the index if it matches the array key
    let index = null;
    tokens = tokens.map(token => {
        //let regex = new RegExp(`^${arrayKey}\\[(\\d+)\\]$`);
        let regex = new RegExp(`\\[(\\d+)\\]$`);
        let match = token.match(regex);
        console.log("token="+token+", match="+match);
        if (match && match[1]) {
            index = parseInt(match[1], 10);
            let idx = token.lastIndexOf('[');
            return token.substring(0,idx);
        }
        return token;
    });

    return { tokens, index };
}

let result = tokenizeAndExtractIndex(data_path, "rows");
console.log(result.tokens); // Output: ["entity", "rows", "reporter"]
console.log(result.index);  // Output: 1
