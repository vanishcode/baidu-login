/**
 * @file web端主文件
 * @description 请求主要可以分为 提交登录请求 提交发送验证码请求 提交接收到的验证码的请求
 */
var express = require('express');
var config = require('./config.json');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(config.port, function () {
  console.log('Example app listening on port 3000!');
});
