/* jshint esversion:6 */
/* jshint node: true */
"use strict";

//const _ = require('underscore');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const http = require('http').Server(app);
const randomstring = require("randomstring");

// socket.io 서버로 업그레이드
const io = require('socket.io')(http);
//middleware body-parser 선언
const bodyParser = require('body-parser');
// DB들어가기전 로컬데이터를 fs를 이용해 저장해봄
const fs = require('fs');
// 파일올리는 multer함수 import
const multer = require('multer');
// multer의 diskStorage를 이용해서 저장위치, 저장할 파일이름 설정
const _storage = multer.diskStorage({
    destination: function(req, file, cb) {
        //텍스트파일, 이미지파일을 걸러서
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
//multer함수는 미들웨어를 리턴해서 upload로 제어, 업로드된 파일이 uploads/에 저장
const upload = multer({
    storage: _storage
});
// 비번 암호화
const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();
// mysql module import
const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    //password: 'ekqlscl135',
    database: 'o6'
});
conn.connect();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


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
    secret: '123',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        //password: 'ekqlscl135',
        database: 'o6'
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// 디자인 페이지 - 성민
// app.get('/index1', function (req, res) {
// 	res.render('des/index');
// });

var user_reply = [];

//1. 찾고 있는 통신사가 있습니까?
app.get('/serviceProvide', function(req, res) {
    var jsonResponse = {
    "messages": [{
        "attachment": {
            "payload": {
                "template_type": "button",
                "text": "1. 고객님이 특별히 찾고 있는 통신사가 있습니까?",
                "buttons": [{
                    "url": "https://f416d4f5.ngrok.io/currentProvide/1",
                    "type": "json_plugin_url",
                    "title": "KT"
                },{
                    "url": "https://f416d4f5.ngrok.io/currentProvide/2",
                    "type": "json_plugin_url",
                    "title": "SKT"
                },{
                    "url": "https://f416d4f5.ngrok.io/currentProvide/3",
                    "type": "json_plugin_url",
                    "title": "LGU+"
                }]
            },
            "type": "template"
        }
    }]
};
    res.send(jsonResponse);
});
//2. 현재 통신사는 무엇입니까?
app.get(['/currentProvide', '/currentProvide/:id'], function(req, res) {
    let id = req.params.id;
    if(id === 1){
        user_reply.push({
            "findProvide" : "KT"
        });
        console.log(user_reply[0]);
    }else if(id === 2){
        user_reply.push({
            "findProvide" : "SKT"
        });
        console.log(user_reply);
    }else if(id === 3){
        user_reply.push({
            "findProvide" : "LGU+"
        });
    }

    console.log(user_reply);
    var jsonResponse = {
    "messages": [{
        "attachment": {
            "payload": {
                "template_type": "button",
                "text": "2. 고객님의 현재 통신사는 무엇입니까?",
                "buttons": [{
                    "url": "https://f416d4f5.ngrok.io/selectProduct/1",
                    "type": "json_plugin_url",
                    "title": "KT"
                },{
                    "url": "https://f416d4f5.ngrok.io/selectProduct/2",
                    "type": "json_plugin_url",
                    "title": "SKT"
                },{
                    "url": "https://f416d4f5.ngrok.io/selectProduct/3",
                    "type": "json_plugin_url",
                    "title": "LGU+"
                }]
            },
            "type": "template"
        }
    }]
};
    res.send(jsonResponse);
});
// 3번 현재 요금제는 무엇입니까?
app.get('/selectFee', function(req, res) {
    var jsonResponse = {
    "messages": [{
        "attachment": {
            "payload": {
                "template_type": "button",
                "text": "3. 현재 이용중인 요금제는 무엇입니까?",
                "buttons": [{
                    "url": "https://f416d4f5.ngrok.io/selectProduct/1",
                    "type": "json_plugin_url",
                    "title": "24요금제"
                },{
                    "url": "https://f416d4f5.ngrok.io/selectProduct/2",
                    "type": "json_plugin_url",
                    "title": "45요금제"
                },{
                    "url": "https://f416d4f5.ngrok.io/selectProduct/3",
                    "type": "json_plugin_url",
                    "title": "69요금제"
                }]
            },
            "type": "template"
        }
    }]
};
    res.send(jsonResponse);
});
// 4. 현재 사용기기는 무엇입니까?
app.get('/selectProduct/:id', function(req, res){
    const sql = 'SELECT * FROM PRODUCT';
    conn.query(sql, function(err, results, fields){

        var jsonResponse = {
            "messages" : []
        };
        var message=[{
            "text": "4. 현재 사용 기기는 무엇입니까?"
        }];
        for(let i=0; i<9; i++){
            message.push({
                "text": results[i].NAME
            });
        }
        jsonResponse.messages = message;

        res.send(jsonResponse);
        //promise? async 부분
        // message = [];
        // for(let i=9; i<18; i++){
        //     message.push({
        //         "text": results[i].NAME
        //     });
        // }
        // jsonResponse.messages = message;
        // res.send(jsonResponse);



    });
});

// 5. 요금제에 가입한지 얼마나 되었습니까?
app.get('/howLongUse', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "5. 요금제에 가입한지 얼마나 되었습니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/sameFamily/1",
                            "type": "json_plugin_url",
                            "title": "1개월~6개월"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/sameFamily/2",
                            "type": "json_plugin_url",
                            "title": "6개월~1년"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/sameFamily/3",
                            "type": "json_plugin_url",
                            "title": "1년~2년"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 6. 가족중에 같은 통신사가 몇 명 있습니까?
app.get('/sameFamily/:id', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "6. 가족중에 같은 통신사가 몇 명 있습니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/adultOrNot",
                            "type": "json_plugin_url",
                            "title": "없음"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/adultOrNot",
                            "type": "json_plugin_url",
                            "title": "1~2명"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/adultOrNot",
                            "type": "json_plugin_url",
                            "title": "3명 이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 7-1번 질문
app.get('/adultOrNot', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "7-1. 고객님은 미성년자 입니까 성인입니까??",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/notAdult",
                            "type": "json_plugin_url",
                            "title": "미성년자"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/adult",
                            "type": "json_plugin_url",
                            "title": "성인"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 7-2번 질문
app.get('/notAdult', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "7-2. 고객님의 연령대는 어떻게 되십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/hotSpot",
                            "type": "json_plugin_url",
                            "title": "어린이(만 12세 이하)"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/hotSpot",
                            "type": "json_plugin_url",
                            "title": "청소년(만 18세 이하)"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});

// 7-3번 질문
app.get('/adult', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "7-3. 고객님의 연령대가 어떻게 되십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/hotSpot",
                            "type": "json_plugin_url",
                            "title": "청년(만 19세 이상 만 23세 미만)"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/hotSpot",
                            "type": "json_plugin_url",
                            "title": "성인(만 24세 이상 만 64세 이하)"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/hotSpot",
                            "type": "json_plugin_url",
                            "title": "노인(만 65세 이상)"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});

// 8번 질문
app.get('/hotSpot', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "여기서부터는 고객님의 성향을 파악하기 위한 질문입니다.\n8. 단말기의 핫스팟 기능을 많이 사용하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/whichMost",
                            "type": "json_plugin_url",
                            "title": "자주한다"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/whichMost",
                            "type": "json_plugin_url",
                            "title": "가끔 한다"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/whichMost",
                            "type": "json_plugin_url",
                            "title": "거의 안한다"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 9. 음성/데이터/문자 중 가장 많이 쓰는 유형이 무엇입니까?
app.get('/whichMost', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "9. 음성/데이터/문자 중 가장 많이 쓰는 유형이 무엇입니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/callByDay",
                            "type": "json_plugin_url",
                            "title": "음성"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/callByDay",
                            "type": "json_plugin_url",
                            "title": "데이터"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/callByDay",
                            "type": "json_plugin_url",
                            "title": "문자"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 10. 하루 통화량이 얼마나 되십니까?
app.get('/callByDay', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "10. 하루 통화량이 얼마나 되십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/textByDay",
                            "type": "json_plugin_url",
                            "title": "10분이하"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/textByDay",
                            "type": "json_plugin_url",
                            "title": "10분 이상 60분 이하"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/textByDay",
                            "type": "json_plugin_url",
                            "title": "60분 이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 11번 질문
app.get('/textByDay', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "11. 하루 문자량이 얼마나 되십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/wifiUse",
                            "type": "json_plugin_url",
                            "title": "10개이하"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/wifiUse",
                            "type": "json_plugin_url",
                            "title": "10개 이상 100개이하"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/wifiUse",
                            "type": "json_plugin_url",
                            "title": "100개 이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 12. 와이파이를 자주 사용하십니까?
app.get('/wifiUse', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "12. 와이파이를 자주 사용하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/video",
                            "type": "json_plugin_url",
                            "title": "거의 사용하지 않는다"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/video",
                            "type": "json_plugin_url",
                            "title": "와이파이 속도가 빠르다면 사용한다"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/video",
                            "type": "json_plugin_url",
                            "title": "와이파이가 있는곳에선 무조건 사용한다"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 13. 동영상을 데이터로 얼마나 사용하십니까?
app.get('/video', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "13. 동영상을 하루 평균 데이터로 얼마나 시청하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/game",
                            "type": "json_plugin_url",
                            "title": "하루평균 30분~1시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/game",
                            "type": "json_plugin_url",
                            "title": "하루평균 1시간~2시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/game",
                            "type": "json_plugin_url",
                            "title": "하루평균 2시간 이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 14. 게임을 하루 평균 데이터로 얼마나 이용하십니까?
app.get('/game', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "14. 게임을 하루 평균 데이터로 얼마나 이용하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/webSurfing",
                            "type": "json_plugin_url",
                            "title": "하루평균 30분~1시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/webSurfing",
                            "type": "json_plugin_url",
                            "title": "하루평균 1시간~2시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/webSurfing",
                            "type": "json_plugin_url",
                            "title": "하루평균 2시간 이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 15. 웹 서핑을 하루 평균 데이터로 얼마나 이용하십니까?
app.get('/webSurfing', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "15. 웹 서핑을 하루 평균 데이터로 얼마나 이용하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/recoProduct",
                            "type": "json_plugin_url",
                            "title": "하루평균 30분~1시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/recoProduct",
                            "type": "json_plugin_url",
                            "title": "하루평균 1시간~2시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/recoProduct",
                            "type": "json_plugin_url",
                            "title": "하루평균 2시간 이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
//16. 데이터 속도(3G, 4G)가 본인에게 중요합니까?
// app.get('/dataSpeed', function(req, res){
//     var jsonResponse = {
//         "messages": [{
//             "attachment": {
//                 "payload": {
//                     "template_type": "button",
//                     "text": "16. 데이터 속도(3G, 4G)가 본인에게 중요합니까?",
//                     "buttons": [{
//                             "url": "https://f416d4f5.ngrok.io/recoProduct",
//                             "type": "json_plugin_url",
//                             "title": "예"
//                         },
//                         {
//                             "url": "https://f416d4f5.ngrok.io/recoProduct",
//                             "type": "json_plugin_url",
//                             "title": "아니오"
//                         }
//                     ]
//                 },
//                 "type": "template"
//             }
//         }]
//     };
//     res.send(jsonResponse);
// });
// 17. 단말기 추천 여부 묻기
app.get('/recoProduct', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "고객님의 요금 선호도 조사가 완료되었습니다.\n\n 역경매 시스템을 통해 단말기를 추천 받고 싶으시면 '이어가기'를 선택하시고 요금제 추천만 원하신다면 '그만'을 선택해 주세요.",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/end",
                            "type": "json_plugin_url",
                            "title": "그만"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/company",
                            "type": "json_plugin_url",
                            "title": "이어가기"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 단말기 정보 없이 끝내기
app.get('/end', function(req, res){
    var jsonResponse = {
        "messages": [{
            "text": "설문이 끝났습니다. 요금제 추천이 시작됩니다."
        }]
    };
    res.send(jsonResponse);
});
// 18. 고객님께서 원하는 제조사를 선택해주세요.
app.get('/company', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "고객님께서 원하는 제조사를 선택해주세요.",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/displaySize",
                            "type": "json_plugin_url",
                            "title": "삼성"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/displaySize",
                            "type": "json_plugin_url",
                            "title": "엘지"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/displaySize",
                            "type": "json_plugin_url",
                            "title": "애플"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});

// 19. 고객님께서 원하시는 화면크기를 선택해주세요.
app.get('/displaySize', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "고객님께서 원하시는 화면크기를 선택해주세요.",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/end2",
                            "type": "json_plugin_url",
                            "title": "4인치 ~ 5인치 "
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/end2",
                            "type": "json_plugin_url",
                            "title": "5인치 ~ 5.7인치"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/end2",
                            "type": "json_plugin_url",
                            "title": "5.7인치 이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 단말기 정보 포함 후 끝내기
app.get('/end', function(req, res){
    var jsonResponse = {
        "messages": [{
            "text": "설문이 끝났습니다. 요금제 추천이 시작됩니다."
        }]
    };
    res.send(jsonResponse);
});



passport.serializeUser(function(user, done) {
    // done함수의 두번째 인자로 user를 식별하는데 이 값이 세션에 저장된다.
    done(null, user.CODE);
});
// 두번째 로그인시 세션에 저장된 user.username이 id 값으로 들어감
passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    var sql = 'SELECT * FROM MEMBER WHERE CODE=?';
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
        var sql = 'SELECT * FROM MEMBER WHERE EMAIL=?';
        //conn.query(sql, [c], function(err, results){
        conn.query(sql, [uname], function(err, results){
            console.log(results);
            if(!results[0]){
                return done('There is no user');
            }
            var user = results[0];
            //입력한 비번과 저장되어있는 salt를 인자로 받음
            return hasher({password:pwd, salt:user.SALT}, function(err, pass, salt, hash){
                if(hash === user.PASSWORD){
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
            //authId: 'local:'+req.body.username,
            code: randomstring.generate(5),
            email: req.body.username,
            password: hash,
            salt: salt,
            name: req.body.realname,
            nickname: req.body.nickname,
            phone: req.body.phone
        };
        // set? 를 통해 user객체로 사용자정보를 추가할 수 있다
        var sql = 'INSERT INTO MEMBER SET ?';
        conn.query(sql, user, function(err, results){
            if(err){
                console.log(err);
                res.status(500);
            }else{
                console.log('register completed');
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
//passport 모듈을 이용해 직접 메일, 비번 입력으로 로그인
app.post('/auth/login',
    passport.authenticate(
        'local',
        {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true
        }
    )
);
// index.ejs 페이지 라우팅, data 목록 보여주기
app.get(['/', '/content/:id'], function(req, res) {
    // passport는 원래 req가 가지고 있지 않은 객체인 user객체를 req의 소속으로 만들어줌
    // user는 deserializeUser의 done함수의 두번째 인자인 user로 부터 기인
    if(req.user && req.user.NICKNAME){
        res.render('index',{nickname:req.user.NICKNAME});
    }else{
        res.render('index',{nickname:''});
    }
});
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

/*app.get('/reverseAuction', function(req, res) {
    var cart = req.cookies.cart;
    if(!cart){
        res.send('Empty');
    }else{
        res.render('reverseAuction', {products:products});
    }
});
*/
// chat.ejs 파일 render
app.get('/chat', function(req, res) {
    res.render('chat');
});
app.get('/myPage', function(req, res) {
    res.send('마이페이지');
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
