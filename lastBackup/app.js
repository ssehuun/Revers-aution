/* jshint esversion:6 */
/* Hello nodejs*/
var _ = require('underscore');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
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
    destination: function(req, file, cb) {
        //텍스트파일, 이미지파일을 걸러서
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
//multer함수는 미들웨어를 리턴해서 upload로 제어, 업로드된 파일이 uploads/에 저장
var upload = multer({
    storage: _storage
});
// 비번 암호화
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
// mysql module import
var mysql = require('mysql');
// var conn = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'ekqlscl135',
//     database: 'o2'
// });
// conn.connect();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


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
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
//mysql 과 session 연결
app.use(session({
    //key: 'session_cookie_name',
    secret: 'aswelrkke',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'ekqlscl135',
        database: 'o2'
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// 디자인 페이지 - 성민
// app.get('/index1', function (req, res) {
// 	res.render('des/index');
// });

// index.ejs 페이지 라우팅, data 목록 보여주기
app.get(['/', '/content/:id'], function(req, res) {
    // passport는 원래 req가 가지고 있지 않은 객체인 user객체를 req의 소속으로 만들어줌
    // user는 deserializeUser의 done함수의 두번째 인자인 user로 부터 기인
    if(req.user && req.user.displayName){
        res.render('index',{displayName:req.user.displayName});
    }else{
        res.render('index',{displayName:''});
    }
});


passport.serializeUser(function(user, done) {
    // done함수의 두번째 인자로 user를 식별하는데 이 값이 세션에 저장된다.
    done(null, user.authId);
});
// 두번째 로그인시 세션에 저장된 user.username이 id 값으로 들어감
passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [id], function(err, results){
        if(!results[0]){
            done('There is no user');
        }else{
            done(null, results[0]);
        }
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        var uname = username;
        var pwd = password;
        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, ['local:'+uname], function(err, results){
            if(!results[0]){
                console.log(err);
                return done('There is no user');
            }
            var user = results[0];
            //입력한 비번과 저장되어있는 salt를 인자로 받음
            return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                if(hash === user.password){
                    // 비번까지 맞으면, done함수의 인자인 user가 serializeUser로 넘어감
                    console.log('LocalStrategy', user);
                    done(null, user);
                    // req.session.displayName = user.displayName;
                    // req.session.save(function(){
                    //     res.redirect('/');
                    // });
                }else{
                    done(null, false);
                    //res.send('누구? <a href="/auth/login">login</a>');
                }
            });
        });
    }
));

app.get('/auth/register', function(req, res){
    res.render('register');
});
app.post('/auth/register', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
            authId: 'local:'+req.body.username,
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        // set? 를 통해 user객체로 사용자정보를 추가할 수 있다
        var sql = 'INSERT INTO users SET ?';
        conn.query(sql, user, function(err, results){
            if(err){
                console.log(err);
                res.status(500);
            }else{
                // passport에서 처리하는 세션, 등록후 바로 로그인
                req.login(user, function(err){
                    req.session.save(function(){
                        res.redirect('/');
                    });
                });
            }
        });
    });
});
app.get('/auth/login', function(req, res){
    res.render('login');
});

//passport 모듈을 이용해 직접 메일, 비번 입력으로 로그인
app.post('/auth/login',
    passport.authenticate(
        'local',
        {
            successRedirect: '/',
            failureRedirect: '/auth/login',
            failureFlash: true
        }
    )
);

app.get('/auth/logout', function(req, res){
    //delete req.session.displayName;
    // req.session.save(function(){
    //     res.redirect('/');
    // });
    req.logout();
    req.session.save(function(){
        res.redirect('/');
    });
});


app.get('/recoFee', function(req, res) {
    if(req.session.count){
        req.session.count++;
    }else{
        req.session.count=1;
    }
    res.render('recoFee', {count:req.session.count});
});
app.get('/recoPhone', function(req, res) {
    res.render('recoPhone');
});

app.get('/reverseAuction', function(req, res) {
    var cart = req.cookies.cart;
    if(!cart){
        res.send('Empty');
    }else{
        res.render('reverseAuction', {products:products});
    }
});

// chat.ejs 파일 render
app.get('/chat', function(req, res) {
    res.render('chat');
});
app.get('/myPage', function(req, res) {
    res.send('마이페이지');
});

// 3000번 포트에 접속확인
http.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});



/*
// cookie test
var products = {
    1:{title:'toy'},
    2:{title:'kitchen'},
    3:{title:'car'}
};
app.get('/cart', function(req, res){
    var cart = req.cookies.cart;
    if(!cart) {
        res.rend('Empty!');
    } else {
        var output = '';
        for(var id in cart){
            output += `<li>${products[id].title} (${cart[id]})</li>`;
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <a href="/reverseAuction">reverseAuction</a>
    `);
 });
app.get('/cart/:id',function(req, res){
    var id = req.params.id;
    if(req.cookies.cart){
        cart = req.cookies.cart;
    }else{
        cart = {};
    }
    if(!cart[id]){
        cart[id]=0;
    }
    cart[id] = parseInt(cart[id])+1;
    res.cookie('cart', cart);
    res.redirect('/cart');
});
*/


// static file과 라우팅
app.get('/route', function(req, res) {
    res.send('Hey rounter, <img src="/static/me.jpeg">');
});

// form.ejs render
app.get('/content/add', function(req, res) {
    // mysql data 목록 보여주는건 공통
    var allRows = 'select id, title from topic';
    conn.query(allRows, function(err, rows, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('add', {
                topics: rows
            });
        }
    });
});

// data 쓰기
app.post('/content/add', function(req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var insertRow = 'INSERT INTO topic (title,description,author) VALUES(?,?,?)';
    conn.query(insertRow, [title, description, author], function(err, rows, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/content/' + rows.insertId);
        }
    });
});

// single 미들웨어가 파일이 올라오면 req객체에 file 프로퍼티를 암시적으로 추가
// userfile은 input file타입의 name속성값과 같다
app.post('/upload', upload.single('userfile'), function(req, res) {
    console.log(req.file);
    res.send('uploaded ' + req.file.originalname);
});

//conn.end();



// var users = [
//     {
//         authId:'123123',
//         username : 'sehun',
//         password : 'ixHP8/eq3ySKrsCI00YaREwquLAV0LSVwJiCppX5D2N6vzs0GgEHY+Afzw/cuCX1C9ClkqfmMb3E8rCKn3g1XXfC8VVL+D6U7dBpMp631v10CIKWe/uDSSfWnyQJ/EPXBno5+E9PctqLb50RJvp2YmzydEB7YYQn98SMrxyDwy4=',
//         salt : 'TjYXkWUtOsVflLFM0D8TS0r/EaPZqaYoj5SE2TrqKLH48Bd1DDadgACdqfbYklgTqCidt8axGD250vEKBrBnJw==',
//         displayName : '싸나이'
//     }
// ];

// app.get(['/', '/content/:id'], function(req, res) {
//     var allRows = 'select id, title from topic';
//     conn.query(allRows, function(err, rows, fields) {
//         var id = req.params.id;
//         if (id) {
//             var oneRow = 'select * from topic where id=?';
//             conn.query(oneRow, [id], function(err, row, fields) {
//                 if (err) {
//                     console.log(err);
//                     res.status(500).send('Internal Server Error');
//                 } else {
//                     res.render('index', {
//                         topics: rows,
//                         topic: row[0]
//                     });
//                 }
//             });
//         } else {
//             res.render('index', {
//                 topics: rows
//             });
//         }
//     });
// });



// app.post('/auth/login', function(req, res){
//     var uname = req.body.username;
//     var pwd = req.body.password;
//     for(var i=0; i<users.length; i++){
//         var user = users[i];
//         if(user.username === uname){
//             //입력한 비번과 저장되어있는 salt를 인자로 받음
//             return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
//                 console.log(pass, salt, hash);
//                 if(hash === user.password){
//                     req.session.displayName = user.displayName;
//                     req.session.save(function(){
//                         res.redirect('/');
//                     });
//                 }else{
//                     res.send('누구? <a href="/auth/login">login</a>');
//                 }
//             });
//         }
//     }
// });
