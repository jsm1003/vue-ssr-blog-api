/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 *
 * @author wangxiao
 */

'use strict';

const domain = require('domain');
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const cors = require('cors')
//跨域中间件
const apiRouter = require('./router');

const AV = require('leanengine');
const app = express();

// 如果你的node版本低于7.0，需要babel 编译
//require('babel-core/register');

// 各个模块
//const config = require('./config');

var corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
  maxAge: '1728000'
  //这一项是为了跨域专门设置的
}
app.use(cors(corsOptions))
//设置跨域

// 使用 LeanEngine 中间件
app.use(AV.express());


app.use(AV.Cloud.CookieSession({ 
  secret: 'mySecret', 
  maxAge: 3600000, 
  fetchUser: false
 }));
 
app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({ extended: false }))
//现在应该是用不到这个解析表单的中间件
//请求体解析中间件

// 强制开启 https 的中间件
// app.enable('trust proxy');
// app.use(AV.Cloud.HttpsRedirect());


app.use(express.static('public'));



// api
app.use('/api', apiRouter);

// 服务端所有路由指向 index
// app.use((req, res) => {
//   // 统一指向 Public 目录
//   const url = path.dirname(require.main.filename).replace('/server', '');
//   res.sendFile(`${url}/public/index.html`);
//   // res.status(404);
// });

// 捕获所有异常错误
process.on('unhandledRejection', (reason, p) => {
  console.warn('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});

module.exports = app;
