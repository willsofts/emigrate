function test() {
    const crypto = require('crypto');
    let name = 'braitsch';
    let hash = crypto.createHash('md5').update(name).digest('hex');
    console.log(hash);
}
test();
