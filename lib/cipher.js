/**
 * @file 密码加密
 * @author vanishcode
 * @desc:
 * rsaPublicKeyModulus `B3C61EBBA4659C4CE3639287EE871F1F48F7930EA977991C7AFE3
 * CC442FEA49643212E7D570C853F368065CC57A2014666DA8AE7D493FD47D171C0D894EEE3ED7F99
 * F6798B7FFD7B5873227038AD23E3197631A8CB642213B9F27D4901AB0D92BFA27542AE890855396E
 * D92775255C977F5C302F1E7ED4B1E369C12CB6B1822F`
 * DefaultRSAPublicKeyExponent 默认的公钥指数 0x10001
*/
const byte = require('../utils/2byte')
const crypto = require('crypto')
const fs = require('fs')

module.exports = (plain) => {
    let pubKey = fs.readFileSync('./data/pub_key.pem', { encoding: 'utf-8' })
    let bufferedPlain = Buffer.from(byte(plain))
    return crypto.publicDecrypt({
        key: pubKey,
        padding: crypto.constants.RSA_NO_PADDING
    }, bufferedPlain).toString('hex')
}
