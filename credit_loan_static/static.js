/*
* 很多同学将项目打包后喜欢本地浏览一下，以确保自己的项目”万无一失“
* 然而我们的React项目多数是单页面应用，路由使用的是 BrowserHistory
* 此时当你请求二级页面时候再刷新就会找不到页面而出错，因为此时浏览器直接请求的是你的二级页面
* 但是你的二级页面根本不存在，当然就出错了。
* 解决方案就是建立一个Express的http服务器，然后将所有路径的访问都以index.html作为返回
* */

const express = require('express');
const path = require('path');

const app = express();

// serve our static stuff like index.css
app.use(express.static(path.join(__dirname, 'dist')));

// send all requests to index.html so browserHistory works
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
});

const PORT = 8886;
app.listen(PORT, function() {
  console.log('运行打包后的文件？浏览器直接输入：localhost:' + PORT)
});