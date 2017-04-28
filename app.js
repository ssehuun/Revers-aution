/* jshint esversion:6 */
/* Hello nodejs*/
var _ = require('underscore');
var express = require('express');
var app = express();
//middleware body-parser 선언
var bodyParser = require('body-parser');
// DB들어가기전 로컬데이터를 fs를 이용해 저장해봄
var fs = require('fs');
// 파일올리는 multer함수 import
var multer = require('multer');
// multer의 diskStorage를 이용해서 저장위치, 저장할 파일이름 설정
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //텍스트파일, 이미지파일을 걸러서
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
//multer함수는 미들웨어를 리턴해서 upload로 제어, 업로드된 파일이 uploads/에 저장
var upload = multer({storage:_storage});
// mysql module import
var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'ekqlscl135',
  database : 'o2'
});
conn.connect();

conn.query('select * from topic',
  function (error, results, fields) {
    if (error){
      console.log(error);
    }else{
      console.log('rows', results);
      console.log('columns', fields);
    }
});

conn.end();

app.locals.pretty = true;
//public 디렉토리에 있는 정적 파일을 '/static'으로 사용
app.use('/static', express.static('public'));
// uploads 디렉토리에 있는 정적 파일을 사용자가 불러올 수 있음
app.use('/user', express.static('uploads'));
// template 엔진 ejs 사용
app.set('view engine', 'ejs');
// ejs 파일은 views 디렉토리에 들어감
app.set('views', './views');
// middleware가 대기하고 있다가 post request오면 먼저처리
app.use(bodyParser.urlencoded({ extended: true }));



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
  //DB data
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
app.get('/form/new', function(req, res){
  // data 목록 보여주는건 공통
  fs.readdir('data', function(err, files){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.render('form', {topics:files});
  });
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

// file 쓰기
app.post('/form_receiver_data', function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  fs.writeFile('data/'+title, description, function(err){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.redirect('/content/'+title);
  });
});
// index.ejs 페이지 라우팅, data 목록 보여주기
app.get(['/', '/content/:id'], function(req, res){
  // data 목록 보여주는건 공통
  fs.readdir('data', function(err, files){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    var id = req.params.id;
    // id값이 있을때만 파일을 읽음
    if(id){
      // 목록의 파일을 읽음
      fs.readFile('data/'+id, function(err, data){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        res.render('index', {topics:files, title:id, description:data});
      });
    }else{
      res.render('index', {topics:files, title:'Welcome', description:'Reverse Auction Platform'});
    }
  });
});


// single 미들웨어가 파일이 올라오면 req객체에 file 프로퍼티를 암시적으로 추가
// userfile은 input file타입의 name속성값과 같다
app.post('/upload', upload.single('userfile'), function(req, res){
  console.log(req.file);
  res.send('uploaded '+ req.file.originalname);
});












// 3000번 포트에 접속확인
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
