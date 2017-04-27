/* jshint esversion:6 */
/* Hello nodejs*/
var _ = require('underscore');
var express = require('express');
var app = express();
//middleware body-parser 선언
var bodyParser = require('body-parser');
app.locals.pretty = true;
//public 디렉토리에 있는 정적 파일을 '/static'으로 사용
app.use('/static', express.static('public'));
// template 엔진 ejs 사용
app.set('view engine', 'ejs');
// ejs 파일은 views 디렉토리에 들어감
app.set('views', './views');
// middleware가 대기하고 있다가 post request오면 먼저처리
app.use(bodyParser.urlencoded({ extended: true }));


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
// query 객체사용
app.get('/query', function(req, res){
  res.send(req.query.id);
});
// query 객체할용
app.get('/topic', function(req, res){
  //DB가 올자리
  var topics = [
    'revrerse',
    'auction',
    'thrid'
  ];
  var output = `
    <a href=/topic/id=0>reverse</a>
    <a href=/topic/id=1>auction</a>
    <a href=/topic/id=2>third</a>
    ${topics[req.query.id]}
  `;
  res.send(output);
});
// query 객체를 path방식으로 바꾸기
app.get('/topic/:id/:mode', function(req, res){
  res.send(req.params.id+','+req.params.mode);
});
// form.ejs render
app.get('/form', function(req, res){
  res.render('form');
});
// form에서 get방식으로 서버에 날리면 받는다
app.get('/form_receiver', function(req, res){
  var title = req.query.title;
  var description = req.query.description;
  res.send(title+','+description);
});
// form에서 post방식으로 서버에 날리면 받는다
app.post('/form_receiver', function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  res.send(title+','+description);
});















// 3000번 포트에 접속확인
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
