const https = require('https')
const fs = require('fs')
const Stream = require('stream').Transform

module.exports = (url) => new Promise(resolve =>
  https.request(url, function (response) {
    let data = new Stream();

    response.on('data', function (chunk) {
      data.push(chunk);
    });

    response.on('end', function () {
      fs.writeFileSync('./data/code.png', data.read());
      resolve(true)
    });
  }).end())
