/**
 * @file 返回用户计算机可用ip
 * @author vanishcode
 */

var os = require('os'), IPv4

for (var i = 0; i < os.networkInterfaces().en0.length; i++) {
    if (os.networkInterfaces().en0[i].family == 'IPv4') {
        IPv4 = os.networkInterfaces().en0[i].address;
    }
}

module.exports = IPv4;
