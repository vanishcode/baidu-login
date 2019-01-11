const https = require('https')
module.exports = new Promise((resolve) => {
    https.get('https://wappass.baidu.com/', (res) => resolve(res.headers['trace-id'])
    )
})
