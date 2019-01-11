/**
 * @file 常量，包括请求头、数据格式
 * @author vanishcode
 */

module.exports = {
  // 安全起见，一般应该使用命令行输入
  username: 'ookookookokok0',
  password: 'GEEK98++',
  // 登陆头
  loginOptions: {
    host: 'wappass.baidu.com',
    path: '/wp/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Referer': 'https://wappass.baidu.com/',
      'X-Requested-With': 'XMLHttpRequest',
      'Connection': 'keep-alive',
    }
  },
  // 登陆数据
  loginData: function (username, password, verifyCode, vcodeStr, timeStamp, serverTime, traceID) {
    return {
      'username': username,
      'password': password,       // 用获取到的服务器时间 + 密码字符串再用RSA加密
      'verifycode': verifyCode,   // 验证码值（用户填写的）         e.g.   mv6k
      'vcodestr': vcodeStr,       // 验证码标识字符串（服务器返回）  e.g.   njG9506f5a15ef2e242024e15d15b016589bdc2de06de0214a4
      'isphone': '0',
      'loginmerge': '1',
      'action': 'login',
      'uid': timeStamp,
      'skin': 'default_v2',
      'connect': '0',
      'dv': 'tk0.408376350146535171516806245342@oov0QqrkqfOuwaCIxUELn3oYlSOI8f51tbnGy-nk3crkqfOuwaCIxUou2iobENoYBf51tb4Gy-nk3cuv0ounk5vrkBynGyvn1QzruvN6z3drLJi6LsdFIe3rkt~4Lyz5ktfn1Qlrk5v5D5fOuwaCIxUobJWOI3~rkt~4Lyi5kBfni0vrk8~n15fOuwaCIxUobJWOI3~rkt~4Lyz5DQfn1oxrk0v5k5eruvN6z3drLneFYeVEmy-nk3c-qq6Cqw3h7CChwvi5-y-rkFizvmEufyr1By4k5bn15e5k0~n18inD0b5D8vn1Tyn1t~nD5~5T__ivmCpA~op5gr-wbFLhyFLnirYsSCIAerYnNOGcfEIlQ6I6VOYJQIvh515f51tf5DBv5-yln15f5DFy5myl5kqf5DFy5myvnktxrkT-5T__Hv0nq5myv5myv4my-nWy-4my~n-yz5myz4Gyx4myv5k0f5Dqirk0ynWyv5iTf5DB~rk0z5Gyv4kTf5DQxrkty5Gy-5iQf51B-rkt~4B__',
      'getpassUrl': '/passport/getpass?clientfrom=&adapter=0&ssid=&from=&authsite=&bd_page_type=&uid=' + timeStamp + '&pu=&tpl=wimn&u=https://m.baidu.com/usrprofile%3Fuid%3D' + timeStamp + '%23logined&type=&bdcm=060d5ffd462309f7e5529822720e0cf3d7cad665&tn=&regist_mode=&login_share_strategy=&subpro=wimn&skin=default_v2&client=&connect=0&smsLoginLink=1&loginLink=&bindToSmsLogin=&overseas=&is_voice_sms=&subpro=wimn&hideSLogin=&forcesetpwd=&regdomestic=',
      'mobilenum': 'undefined',
      'servertime': serverTime,
      'gid': 'DA7C3AE-AF1F-48C0-AF9C-F1882CA37CD5',
      'logLoginType': 'wap_loginTouch',
      'FP_UID': '0b58c206c9faa8349576163341ef1321',
      'traceid': traceID,
    }
  },
  verifyCodeSendURL: function (verifyType, token) {
    return `/passport/authwidget?action=send&tpl=&type=${verifyType}&token=${token}&from=&skin=&clientfrom=&adapter=2&updatessn=&bindToSmsLogin=&upsms=&finance=`
  },
  verifyCodeSendOptions: function (url) {
    return {
      host: 'wappass.baidu.com',
      path: url,
      method: 'GET',
    }
  },
  verifyCodeCheckURL: function (timeStamp, vcode, token, u) {
    return `/passport/authwidget?v=${timeStamp}&vcode=${vcode}&token=${token}&u=${u}&action=check&type=email&tpl=&skin=&clientfrom=&adapter=2&updatessn=&bindToSmsLogin=&isnew=&card_no=&finance=&callback=jsonp1`
  },
  verifyCodeCheckOptions: function (url) {
    return {
      host: 'wappass.baidu.com',
      path: url,
      method: 'GET',
      headers: {
        "Connection": "keep-alive",
        "Host": "wappass.baidu.com",
        "Pragma": "no-cache",
        "Upgrade-Insecure-Requests": "1",
      }
    }
  },
  verifyCodeImgURL: function (token) {
    return 'https://wappass.baidu.com/cgi-bin/genimage?' + token
  },
  // 最后一步要访问的url
  finalVisitURL: function (u, authsid, verifyType) {
    return `${u}&authsid=${authsid}&fromtype=${verifyType}&bindToSmsLogin=`
  }
}