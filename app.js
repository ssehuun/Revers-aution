/* jshint esversion:6 */
/* Hello nodejs*/
var _ = require('underscore');
var express = require('express');
var app = express();

app.locals.pretty = true;
//public 디렉토리에 있는 정적 파일을 '/static'으로 사용
app.use('/static', express.static('public'));
// template 엔진 ejs 사용
app.set('view engine', 'ejs');
// ejs 파일은 views 디렉토리에 들어감
app.set('views', './views');



// index.ejs 페이지 라우팅
app.get('/', function(req, res){
  res.render('index', {tagline:'hello'});
});
// about.ejs 파일 render
app.get('/about', function (req, res) {
  res.render('about', {name:'Sehun', age:'27'});
});
// static file과 라우팅
app.get('/route', function(req, res){
  res.send('Hey rounter, <img src="/static/me.jpeg">');
});
//redner about.ejs file
app.get('/template', function(req, res){
  res.render('about', {name:'Fuck', age:'27'});//render template ejs file in views
});
// 3000번 포트에 접속확인
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
