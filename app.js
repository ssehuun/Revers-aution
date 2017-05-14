/* jshint esversion:6 */
/* Hello nodejs*/
var _ = require('underscore');
var express = require('express');
var app = express();
var http = require('http').Server(app);
// socket.io 서버로 업그레이드
var io = require('socket.io')(http);
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
  password : 'ahffk214',
  database : 'o2'
});
conn.connect();

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

////템플릿 셈플
app.get('/default', function (req, res) {
	  res.render('test/default');
	});


app.get('/appbanner', function (req, res) {
	  res.render('test/appbanner');
	});

app.get('/banner', function (req, res) {
	  res.render('test/banner');
	});


app.get('/blog-single', function (req, res) {
	  res.render('test/blog-single');
	});

app.get('/blognews', function (req, res) {
	  res.render('test/blognews');
	});

app.get('/ComingSoon', function (req, res) {
	  res.render('test/ComingSoon');
	});

app.get('/components', function (req, res) {
	  res.render('test/components');
	});

app.get('/gallery', function (req, res) {
	  res.render('test/gallery');
	});

app.get('/home', function (req, res) {
	  res.render('test/home');
	});

app.get('/landing-banner', function (req, res) {
	  res.render('test/landing-banner');
	});

app.get('/landingbanner', function (req, res) {
	  res.render('test/landingbanner');
	});

app.get('/lecture', function (req, res) {
	  res.render('test/lecture');
	});

app.get('/mypage', function (req, res) {
	  res.render('test/mypage');
	});

app.get('/Navi', function (req, res) {
	  res.render('test/Navi');
	});

app.get('/pricing', function (req, res) {
	  res.render('test/pricing');
	});

app.get('/sectionbackground', function (req, res) {
	  res.render('test/sectionbackground');
	});

app.get('/services', function (req, res) {
	  res.render('test/services');
	});

app.get('/SidebarMenu', function (req, res) {
	  res.render('test/SidebarMenu');
	});

app.get('/sliderbackground', function (req, res) {
	  res.render('test/sliderbackground');
	});


app.get('/sliderbanner', function (req, res) {
	  res.render('test/sliderbanner');
	});

app.get('/staticbackground', function (req, res) {
	  res.render('test/staticbackground');
	});

app.get('/staticbanner', function (req, res) {
	  res.render('test/staticbanner');
	});

app.get('/team', function (req, res) {
	  res.render('test/team');
	});

app.get('/testimonial', function (req, res) {
	  res.render('test/testimonial');
	});

app.get('/typed-banner', function (req, res) {
	  res.render('test/typed-banner');
	});

app.get('/typedbanner', function (req, res) {
	  res.render('test/typedbanner');
	});

app.get('/videobackground', function (req, res) {
	  res.render('test/videobackground');
	});

//./템플릿 셈플

// about.ejs 파일 render
app.get('/about', function (req, res) {
  res.render('about', {name:'Sehun', age:'27'});

app.get('/recoFee', function(req, res){
  res.render('recoFee');
});
app.get('/recoPhone', function(req, res){
  res.render('recoPhone');
});
app.get('/reverseAuction', function(req, res){
  res.render('reverseAuction');

});
// chat.ejs 파일 render
app.get('/chat', function (req, res) {
  res.render('chat');
});
app.get('/myPage', function(req, res){
  res.send('마이페이지');
});

// about.ejs 파일 render
app.get('/about', function (req, res) {
  res.render('about', {name:'Sehun', age:'27'});
});

// static file과 라우팅
app.get('/route', function(req, res){
  res.send('Hey rounter, <img src="/static/me.jpeg">');
});

// form.ejs render
app.get('/content/add', function(req, res){
  // mysql data 목록 보여주는건 공통
  var allRows = 'select id, title from topic';
  conn.query(allRows, function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      res.render('add', {topics:rows});
    }
  });
});

// data 쓰기
app.post('/content/add', function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var insertRow = 'INSERT INTO topic (title,description,author) VALUES(?,?,?)';
  conn.query(insertRow, [title,description,author], function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      res.redirect('/content/'+rows.insertId);
    }
  });
});
// index.ejs 페이지 라우팅, data 목록 보여주기
app.get(['/', '/content/:id'], function(req, res){
  var allRows = 'select id, title from topic';
  conn.query(allRows, function(err, rows, fields){
    var id = req.params.id;
    if(id){
      var oneRow = 'select * from topic where id=?';
      conn.query(oneRow, [id], function(err, row, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          res.render('index', {topics:rows, topic:row[0]});
        }
      });
    }else{
      res.render('index', {topics:rows});
    }
  });
});


// single 미들웨어가 파일이 올라오면 req객체에 file 프로퍼티를 암시적으로 추가
// userfile은 input file타입의 name속성값과 같다
app.post('/upload', upload.single('userfile'), function(req, res){
  console.log(req.file);
  res.send('uploaded '+ req.file.originalname);
});



//conn.end();

// 3000번 포트에 접속확인
http.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});
