/**
 * @file 程序入口，命令行模式，附带HTML页面操作模式
 * @author vanishcode
 * @license MIT
 */
const process = require('process')
const url = require('url')
const { spawn } = require('child_process')
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const log = console.log

const data = require('./data/constant')
const request = require('./utils/request')
const cipher = require('./lib/cipher')

const getServerTime = require('./lib/getServerTime')
const getTraceID = require('./lib/getTraceID')
const getTimeStamp = require('./lib/getTimeStamp')
const downloadVerifyCodeImg = require('./utils/downloadImg')

let verifyCode = ''
let vcodeStr = ''
// b376qHF8iOA6ijFW0fhy5xm1IRklM2psioqBoK5SInxwZE0Mr0blWNK0vf5KsC0UEXi8OLbhTxirUoDWrAu31lnxww7nsi5RVXItedVqa5blpWGT6mdarLdITqWTtfkWPfO7C4Dx%2By8%2FStsUN9v0Phjpz3G7LQDL2%2
// FeYKjB%2FCUdXtAwmtWoNeJ6iV7yw20c0og8lwJqeeG7VTp%2FiXZz4d9qyINTpkRL0dPFKQk%2BFuE1P7YtgU26in03Ca2skusHfwPI3K%2B3efbDkcMF99H9MZJ9zdZykNvEOfi%2FlHJf8SpdwLnf0uz9yqPz3%2FPxJ
// M8Q21%2BTdVQIMTCIphT8mqEtu3n04sJjyECqFxPbOVHo%2B6WeXIkyn3Z%2F7Utp%2F 
// https://wappass.baidu.com/wp/login/proxy?u=https%3A%2F%2Fwappass.baidu.com%2F&tpl=wi&ltoken=70d28fb336d0c729757391547f6f1f80&lstr=c77eWxVNRdj4QiVEDgbQSJ7PRMMqJkKTvDT0GwkRSiNQUauYXhAD9ONjV6ar0SgubqV1L7Y6zAjMgCNkKUXr&adapter=&skin=default_v2&clientfrom=&client=&actiontype=1&traceid=5BC75F03&adapter=&skin=default_v2&tpl=wi&clientfrom=&client=
var token = ''
var u = ''
// var authsid = ''

const https = require('https')

// 直接登陆
async function login() {
  let serverTime = await getServerTime
  let traceID = await getTraceID

  let encryptedPassword = cipher(data.password + serverTime)
  let timeStamp = getTimeStamp()
  let rawRes = await request(data.loginOptions,
    data.loginData(data.username, encryptedPassword, verifyCode, vcodeStr, timeStamp, serverTime, traceID))

  // 是json对象
  let resObj = JSON.parse(rawRes)
  log("**********************login info********************")
  log(resObj)

  if (resObj.errInfo.no == '500001') {
    log(resObj.errInfo.msg)
    // 保存
    vcodeStr = resObj.data.codeString
    // 打开图片
    downloadVerifyCodeImg(data.verifyCodeImgURL(resObj.data.codeString)).then(spawn('open ./data/code.png'))

    rl.on('line', (input) => {
      verifyCode = input
      rl.close()
      // 再次进行请求
      Login()
    })
  }

  if (resObj.errInfo.no == '400023' || resObj.errInfo.no == '400021') {
    // token、u
    token = resObj.data.gotoUrl.match('token=(.*?)&u=(.*?)&secstate=')[1]
    u = (url.parse(resObj.data.gotoUrl.match('token=(.*?)&u=(.*?)&secstate=')[2])).path

    log('需要验证短信或邮箱！')
    sendCode2User()
  }

}

async function sendCode2User() {
  // 设置为email方式（mobile）
  let codeURL = data.verifyCodeSendURL('email', token)
  let body = ''
  https.get('https://wappass.baidu.com' + codeURL, res => {
    res.on('data', (chunk) => body += chunk)
    res.on('end', () => {
      verifyUserCode()
    })
  })
  // let rawRes = await request(data.verifyCodeSendOptions(codeURL))

  // let resObj = JSON.parse(rawRes)
  // log('***********************发送验证码了*********************')
  // log(resObj)

}
function verifyUserCode() {
  rl.on('line', (input) => {
    vcode = input
    rl.close()
    request(data.verifyCodeCheckOptions(data.verifyCodeCheckURL(getTimeStamp(), vcode, token, u))).then(res => {
      let authsid = JSON.parse(res.toString().slice(7, -2)).data.authsid
      log(authsid)
      let body = ''
      https.get(data.finalVisitURL(decodeURIComponent(u), authsid, 'email'), res => {
        log(res.headers["set-cookie"].join())
        res.on('data', (chunk) => body += chunk)
        res.on('end', () => {
          log(body)
        })
      })
    })
  })

  // let resObj = JSON.parse(rawRes)
  // log('***********************发送了*********************')
  // log(resObj)

}



// link start!
login()









if (process.argv0 == 'web') {
  spawn('open ./public/index.html')
}
