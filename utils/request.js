const https = require('https')
const querystring = require('querystring')
/**
 * @param {Onject} options 包配置
 * @param {Object} data 数据
 */
module.exports = (options, data) => new Promise((resolve) => {
  if (options.method == 'POST') {
    let body = ''
    let postRequest = https.request(options, res => {
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => resolve(body))
    })
    postRequest.write(querystring.stringify(data))
    postRequest.end()
  } else {
    let body = ''
    https.request(options, res => {
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => resolve(body))
    }).end()
  }
})
