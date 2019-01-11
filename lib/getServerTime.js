const https = require('https')
module.exports = new Promise((resolve, reject) => {
    let raw = ''
    https.get('https://wappass.baidu.com/wp/api/security/antireplaytoken', (res) => {
        res.on('data', (data) => raw += data)
        res.on('end', () => resolve(JSON.parse(raw).time))
    })
})