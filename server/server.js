/**
 * @file web端主文件
 * @description 请求主要可以分为 提交登录请求 提交发送验证码请求 提交接收到的验证码的请求
 */
var express = require('express');
var config = require('./config.json');
var ip = require('../utils/ip');
var app = express();

app.use(express.static('public'));
app.get('/', function (req, res) {
  res.status(200);
  // res.json({ error: "Bad request." });
  res.sendFile(__dirname + '/public/index.html')
});


// app.use(express.favicon());

app.listen(config.port, function () {
  console.log('[' + new Date().toLocaleDateString() + '] App listening on http://' + ip + ':' + config.port);
});
