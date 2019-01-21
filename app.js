var process = require('process');
var request = require('superagent');
var charset = require('superagent-charset');
var querystring = require('querystring');
var url = require('url');
const { spawn } = require('child_process');
var fs = require('fs');
var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var ep = require('eventproxy')();
var log = console.log;
var warn = console.warn;

var cipher = require('./utils/cipher');
// for web interface~
var web = process.argv[1];
var server = require('./web/server');

// 全局变量
var username, password, verifyCode, vcodeStr, traceID, token, u;

// 开始
if (web) {
    // TODO: server logic
} else {
    log('【命令行模式】请输入用户名和密码（以空格分开）：')
    readline.on('line', function (input) {
        input = input.split(' ');
        username = input[0];
        password = input[1];
        if (username && password) {
            readline.close();
            return ep.emit('NameAndPasswordGot');
        }
        else {
            log('错误！必须输入用户名和密码，请检查您的输入！');
        }
    })
}

// 得到用户名和密码，获取traceID
ep.on('NameAndPasswordGot', function () {
    request
        .get('https://wappass.baidu.com/')
        .end(function (err, res) {
            if (err) {
                warn(err);
                return;
            }
            else {
                traceID = res.header['trace-id'];
                return ep.emit('TraceIDGot', traceID);
            }
        })
});

// 获取服务端时间
ep.on('TraceIDGot', function (traceID) {
    var serverTime;
    request
        .get('https://wappass.baidu.com/wp/api/security/antireplaytoken')
        .end(function (err, res) {
            if (err) {
                warn(err);
                return;
            }
            else {
                serverTime = JSON.parse(res.text).time;
                return ep.emit('ServerTimeGot', serverTime);
            }
        })
});

// 登录
ep.on('ServerTimeGot', function (serverTime) {
    var encryptedPassword = cipher(password + serverTime);
    var timeStamp = new Date().getTime() + '_666';
    var loginData = querystring.stringify({
        'username': username,
        'password': encryptedPassword,       // 用获取到的服务器时间 + 密码字符串再用RSA加密
        'verifycode': verifyCode,   // 验证码值（用户填写的）         e.g. mv6k
        'vcodestr': vcodeStr,       // 验证码标识字符串（服务器返回）  e.g. njG9506f5a15ef2e242024e15d15b016589bdc2de06de0214a4
        'isphone': '0',
        'loginmerge': '1',
        'action': 'login',
        'uid': timeStamp,
        'skin': 'default_v2',
        'connect': '0',
        'dv': 'tk0.408376350146535171516806245342@oov0QqrkqfOuwaCIxUELn3oYlSOI8f51t' +
            'bnGy-nk3crkqfOuwaCIxUou2iobENoYBf51tb4Gy-nk3cuv0ounk5vrkBynGyvn1QzruvN6z3dr' +
            'LJi6LsdFIe3rkt~4Lyz5ktfn1Qlrk5v5D5fOuwaCIxUobJWOI3~rkt~4Lyi5kBfni0vrk8~n15fO' +
            'uwaCIxUobJWOI3~rkt~4Lyz5DQfn1oxrk0v5k5eruvN6z3drLneFYeVEmy-nk3c-qq6Cqw3h7CChw' +
            'vi5-y-rkFizvmEufyr1By4k5bn15e5k0~n18inD0b5D8vn1Tyn1t~nD5~5T__ivmCpA~op5gr-wbFL' +
            'hyFLnirYsSCIAerYnNOGcfEIlQ6I6VOYJQIvh515f51tf5DBv5-yln15f5DFy5myl5kqf5DFy5myvnk' +
            'txrkT-5T__Hv0nq5myv5myv4my-nWy-4my~n-yz5myz4Gyx4myv5k0f5Dqirk0ynWyv5iTf5DB~rk0z5' +
            'Gyv4kTf5DQxrkty5Gy-5iQf51B-rkt~4B__',
        'getpassUrl': '/passport/getpass?clientfrom=&adapter=0&ssid=&from=&authsite=&bd_page_type=&uid=' +
            timeStamp + '&pu=&tpl=wimn&u=https://m.baidu.com/usrprofile%3Fuid%3D' +
            timeStamp + '%23logined&type=&bdcm=060d5ffd462309f7e5529822720e0cf' +
            '3d7cad665&tn=&regist_mode=&login_share_strategy=&subpro=wimn&skin=de' +
            'fault_v2&client=&connect=0&smsLoginLink=1&loginLink=&bindToSmsLogin=&' +
            'overseas=&is_voice_sms=&subpro=wimn&hideSLogin=&forcesetpwd=&regdomestic=',
        'mobilenum': 'undefined',
        'servertime': serverTime,
        'gid': 'DA7C3AE-AF1F-48C0-AF9C-F1882CA37CD5',
        'logLoginType': 'wap_loginTouch',
        'FP_UID': '0b58c206c9faa8349576163341ef1321',
        'traceid': traceID,
    })
    request
        .post('https://wappass.baidu.com/wp/api/login')
        .set({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Referer': 'https://wappass.baidu.com/',
            'X-Requested-With': 'XMLHttpRequest',
            'Connection': 'keep-alive'
        })
        .send(loginData)
        .end(function (err, res) {
            var resObj = JSON.parse(res.text);
            if (err) {
                log(err);
                return;
            } else if (resObj.errInfo.no == '400023' || resObj.errInfo.no == '400021') {
                // token、u
                tokenuArr = resObj.data.gotoUrl.match('token=(.*?)&u=(.*?)&secstate=');
                token = tokenuArr[1];
                u = url.parse(tokenuArr[2]).path;
                log('需要验证短信或邮箱！');
                return ep.emit('NeedVerifyMobileOrEmail');
            } else if (resObj.errInfo.no == '500001') {
                vcodeStr = resObj.data.codeString;
                warn('异常，需要填写验证码！', vcodeStr);
                return ep.emit('NeedWebVerifyCode');
            } else if (resObj.errInfo.no == '0' && resObj.errInfo.msg == '') {
                return ep.emit('LoginSuccess', cookie);
            }
        });
});

// 需要验证
ep.on('NeedVerifyMobileOrEmail', function () {
    var verifyType;
    log('请选择验证方式：1.手机 2.邮箱');
    readline.on('line', function (input) {
        if (!input) {
            warn('请输入正确的编号！');
        } else {
            readline.close();
            verifyType = input.toString().trim() == '1' ? 'mobile' : 'email';
            request
                .get('https://wappass.baidu.com/passport/authwidget?action=send&tpl=' +
                    '&type=' + verifyType +
                    '&token=' + token +
                    '&from=&skin=&clientfrom=&adapter=2&updatessn=&bindToSmsLogin=&upsms=&finance=')
                .end(function (err) {
                    if (err) {
                        warn(err);
                    } else {
                        log('已发送...');
                        return ep.emit('AlreadySendToUser');
                    }
                })
        }
    })
});

// 已经提交了发送验证码的需求
ep.on('AlreadySendToUser', function (type) {
    var vcode;
    var timeStamp = new Date().getTime() + '_233';
    rl.on('line', function (input) {
        vcode = input;
        rl.close();
        request
            .get('https://wappass.baidu.com/passport/authwidget' +
                '?v=' + timeStamp +
                '&vcode=' + vcode +
                '&token=' + token +
                '&u=' + u +
                '&action=check' +
                '&type=' + type +
                '&tpl=&skin=&clientfrom=&adapter=2&updatessn=&bindToSmsLogin=&isnew=&card_no=&finance=&callback=jsonp1')
            .set({
                "Connection": "keep-alive",
                "Host": "wappass.baidu.com",
                "Pragma": "no-cache",
                "Upgrade-Insecure-Requests": "1",
            })
            .end(function (err, res) {
                var authsid = JSON.parse(res.toString().slice(7, -2)).data.authsid;
                if (err) {
                    warn(err);
                    return;
                } else {
                    log('已提交验证！');
                    ep.emit('AlreadySendCheckVCode', type, authsid);
                }
            })
    });
});

// 已经提交了发送邮箱或手机的验证码
ep.on('AlreadySendCheckVCode', function (type, authsid) {
    request
        .get(decodeURIComponent(u) + '&authsid=' + authsid + '&fromtype=' + type + '&bindToSmsLogin=')
        .end(function (err, res) {
            if (err) {
                warn(err);
                return;
            } else {
                log(res.text);
                ep.emit('LoginSuccess', res.text);
            }
        })
});

// 感觉异常操作，需要验证码（不是发送到手机或邮箱的！）
ep.on('NeedWebVerifyCode', function (vcodeStr) {
    var codeImg = './web/public/img/code.png'
    request
        .get('https://wappass.baidu.com/cgi-bin/genimage?' + vcodeStr)
        .pipe(fs.createWriteStream(codeImg));
    // 等待下载完毕~
    setTimeout(function () {
        spawn('open' + codeImg);
    }, 3000);
    readline.on('line', function (input) {
        verifyCode = input.trim();
        readline.close();
        serverTime = JSON.parse(res.text).time;
        return ep.emit('ServerTimeGot', serverTime);
    })
});

// 终于登陆成功，拿到了BDUSS等字段
ep.on('LoginSuccess', function (res) {
    log(res);
});

module.exports = {}
