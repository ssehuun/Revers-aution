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

app.use(function(req, res, next) {
    res.header('Acess-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    (req.method === 'OPTIONS') ? res.send(200): next();
});

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

let userInfo = [];

//1. 찾고 있는 통신사가 있습니까?
app.get('/serviceProvide', function(req, res) {
    var jsonResponse = {
    "messages": [{
        "attachment": {
            "payload": {
                "template_type": "button",
                "text": "1. 고객님이 특별히 찾고 있는 통신사가 있습니까?",
                "buttons": [{
                    "url": "https://f416d4f5.ngrok.io/findProvide/1",
                    "type": "json_plugin_url",
                    "title": "KT"
                },{
                    "url": "https://f416d4f5.ngrok.io/findProvide/2",
                    "type": "json_plugin_url",
                    "title": "SKT"
                },{
                    "url": "https://f416d4f5.ngrok.io/findProvide/3",
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
app.get('/findProvide/:id', function(req, res) {
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "findProvide" : "K"
        });
    }else if(id === '2'){
        userInfo.push({
            "findProvide" : "S"
        });
    }else if(id === '3'){
        userInfo.push({
            "findProvide" : "L"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
    "messages": [{
        "attachment": {
            "payload": {
                "template_type": "button",
                "text": "2. 고객님의 현재 통신사는 무엇입니까?",
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
// 3번 현재 요금제는 무엇입니까?
app.get(['/currentProvide', '/currentProvide/:id'], function(req, res) {
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "currentProvide" : "KT"
        });
    }else if(id === '2'){
        userInfo.push({
            "currentProvide" : "SKT"
        });
    }else if(id === '3'){
        userInfo.push({
            "currentProvide" : "LGU+"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
    "messages": [{
        "attachment": {
            "payload": {
                "template_type": "button",
                "text": "3. 현재 이용중인 요금제는 무엇입니까?",
                "buttons": [{
                    "url": "https://f416d4f5.ngrok.io/currentFee/1",
                    "type": "json_plugin_url",
                    "title": "24요금제"
                },{
                    "url": "https://f416d4f5.ngrok.io/currentFee/2",
                    "type": "json_plugin_url",
                    "title": "45요금제"
                },{
                    "url": "https://f416d4f5.ngrok.io/currentFee/3",
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
// app.get(['/currentFee', '/currentFee/:id'], function(req, res){
//     const sql = 'SELECT * FROM PRODUCT';
//     conn.query(sql, function(err, results, fields){
//
//         var jsonResponse = {
//             "messages" : []
//         };
//         var message=[{
//             "text": "4. 현재 사용 기기는 무엇입니까?"
//         }];
//         for(let i=0; i<9; i++){
//             message.push({
//                 "text": results[i].NAME
//             });
//         }
//         jsonResponse.messages = message;
//
//         res.send(jsonResponse);
//         //promise? async 부분
//         // message = [];
//         // for(let i=9; i<18; i++){
//         //     message.push({
//         //         "text": results[i].NAME
//         //     });
//         // }
//         // jsonResponse.messages = message;
//         // res.send(jsonResponse);
//
//
//
//     });
// });

// 5. 요금제에 가입한지 얼마나 되었습니까?
app.get(['/currentFee', '/currentFee/:id'], function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "5. 통신사에 가입한지 얼마나 되었습니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/howLongUse/1",
                            "type": "json_plugin_url",
                            "title": "7년 이상"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/howLongUse/2",
                            "type": "json_plugin_url",
                            "title": "10~14년 이상"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/howLongUse/3",
                            "type": "json_plugin_url",
                            "title": "15년 이상"
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
app.get('/howLongUse/:id', function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "howLongUse" : "7"
        });
    }else if(id === '2'){
        userInfo.push({
            "howLongUse" : "10"
        });
    }else if(id === '3'){
        userInfo.push({
            "howLongUse" : "15"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "6. 가족중에 같은 통신사가 몇 명 있습니까?(본인제외)",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/sameFamily/1",
                            "type": "json_plugin_url",
                            "title": "없음"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/sameFamily/2",
                            "type": "json_plugin_url",
                            "title": "1명"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/sameFamily/3",
                            "type": "json_plugin_url",
                            "title": "2명 이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 7-1.고객님은 미성년자 입니까 성인입니까??
app.get('/sameFamily/:id', function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "sameFamily" : "0"
        });
    }else if(id === '2'){
        userInfo.push({
            "sameFamily" : "1"
        });
    }else if(id === '3'){
        userInfo.push({
            "sameFamily" : "2"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "7-1. 고객님은 미성년자 입니까 성인입니까?",
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
// 7-2-1. 미성년자 고객님의 연령대는 어떻게 되십니까?
app.get(['/notAdult', '/notAdult/:id'], function(req, res){
    let id = req.params.id;
    if(id){
        if(id === '1'){
            userInfo.push({
                "age" : "D"
            });
        }else if(id === '2'){
            userInfo.push({
                "age" : "B"
            });
        }
        console.log(userInfo);
        let jsonResponse = {
            "messages": [{
                "attachment": {
                    "payload": {
                        "template_type": "button",
                        "text": "여기서부터는 고객님의 성향을 파악하기 위한 질문입니다.\n\n8. 단말기의 핫스팟 기능을 많이 사용하십니까?",
                        "buttons": [{
                                "url": "https://f416d4f5.ngrok.io/hotSpot/1",
                                "type": "json_plugin_url",
                                "title": "자주한다"
                            },
                            {
                                "url": "https://f416d4f5.ngrok.io/hotSpot/2",
                                "type": "json_plugin_url",
                                "title": "가끔 한다"
                            },
                            {
                                "url": "https://f416d4f5.ngrok.io/hotSpot/3",
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
    }else{
        let jsonResponse = {
            "messages": [{
                "attachment": {
                    "payload": {
                        "template_type": "button",
                        "text": "7-2. 미성년자 고객님의 연령대는 어떻게 되십니까?",
                        "buttons": [{
                                "url": "https://f416d4f5.ngrok.io/notAdult/1",
                                "type": "json_plugin_url",
                                "title": "어린이(만12세 이하)"
                            },
                            {
                                "url": "https://f416d4f5.ngrok.io/notAdult/2",
                                "type": "json_plugin_url",
                                "title": "청소년(만18세 이하)"
                            }
                        ]
                    },
                    "type": "template"
                }
            }]
        };
        res.send(jsonResponse);
    }
});

// 7-2-2. 성인 고객님의 연령대가 어떻게 되십니까? & 8.단말기의 핫스팟 기능
app.get(['/adult','/adult/:id'], function(req, res){
    let id = req.params.id;
    if(id){
        if(id === '1'){
            userInfo.push({
                "age" : "A"
            });
        }else if(id === '2'){
            userInfo.push({
                "age" : "G"
            });
        }else if(id === '3'){
            userInfo.push({
                "age" : "C"
            });
        }
        console.log(userInfo);
        let jsonResponse = {
            "messages": [{
                "attachment": {
                    "payload": {
                        "template_type": "button",
                        "text": "여기서부터는 고객님의 성향을 파악하기 위한 질문입니다.\n\n8. 단말기의 핫스팟 기능을 많이 사용하십니까?",
                        "buttons": [{
                                "url": "https://f416d4f5.ngrok.io/hotSpot/1",
                                "type": "json_plugin_url",
                                "title": "거의 안한다"
                            },
                            {
                                "url": "https://f416d4f5.ngrok.io/hotSpot/2",
                                "type": "json_plugin_url",
                                "title": "가끔 한다"
                            },
                            {
                                "url": "https://f416d4f5.ngrok.io/hotSpot/3",
                                "type": "json_plugin_url",
                                "title": "자주한다"
                            }
                        ]
                    },
                    "type": "template"
                }
            }]
        };
        res.send(jsonResponse);
    }else{
        let jsonResponse = {
            "messages": [{
                "attachment": {
                    "payload": {
                        "template_type": "button",
                        "text": "7-3. 성인 고객님의 연령대가 어떻게 되십니까?",
                        "buttons": [{
                                "url": "https://f416d4f5.ngrok.io/adult/1",
                                "type": "json_plugin_url",
                                "title": "청년(만19세 이상 만24세 미만)"
                            },
                            {
                                "url": "https://f416d4f5.ngrok.io/adult/2",
                                "type": "json_plugin_url",
                                "title": "성인(만25세 이상 만64세 이하)"
                            },
                            {
                                "url": "https://f416d4f5.ngrok.io/adult/3",
                                "type": "json_plugin_url",
                                "title": "노인(만65세 이상)"
                            }
                        ]
                    },
                    "type": "template"
                }
            }]
        };
        res.send(jsonResponse);
    }
});

// 9. 음성/데이터/문자 중 가장 많이 쓰는 유형이 무엇입니까?
app.get(['/hotSpot/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "hotSpot" : "0"
        });
    }else if(id === '2'){
        userInfo.push({
            "hotSpot" : "1"
        });
    }else if(id === '3'){
        userInfo.push({
            "hotSpot" : "2"
        });
    }
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "9. 음성/데이터/문자 중 가장 많이 쓰는 유형이 무엇입니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/whichMost/1",
                            "type": "json_plugin_url",
                            "title": "음성"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/whichMost/2",
                            "type": "json_plugin_url",
                            "title": "데이터"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/whichMost/3",
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
app.get(['/whichMost','/whichMost/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "whichMost" : "call"
        });
    }else if(id === '2'){
        userInfo.push({
            "whichMost" : "data"
        });
    }else if(id === '3'){
        userInfo.push({
            "whichMost" : "text"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "10. 하루 통화량이 얼마나 되십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/callByDay/1",
                            "type": "json_plugin_url",
                            "title": "10분이하"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/callByDay/2",
                            "type": "json_plugin_url",
                            "title": "60분이하"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/callByDay/3",
                            "type": "json_plugin_url",
                            "title": "60분이상"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 11. 하루 문자량이 얼마나 되십니까?
app.get(['/callByDay','/callByDay/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "callByDay" : "0"
        });
    }else if(id === '2'){
        userInfo.push({
            "callByDay" : "1"
        });
    }else if(id === '3'){
        userInfo.push({
            "callByDay" : "2"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "11. 하루 문자량이 얼마나 되십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/textByDay",
                            "type": "json_plugin_url",
                            "title": "10개이하"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/textByDay",
                            "type": "json_plugin_url",
                            "title": "10개 이상 100개이하"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/textByDay",
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
// 12. 동영상을 하루 평균 데이터로 얼마나 시청하십니까?
app.get(['/textByDay','/textByDay/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "textByDay" : "0"
        });
    }else if(id === '2'){
        userInfo.push({
            "textByDay" : "1"
        });
    }else if(id === '3'){
        userInfo.push({
            "textByDay" : "2"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "12. 동영상을 하루 평균 데이터로 얼마나 시청하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/video/1",
                            "type": "json_plugin_url",
                            "title": "하루평균 30분~1시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/video/2",
                            "type": "json_plugin_url",
                            "title": "하루평균 1시간~2시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/video/3",
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
// 13. 게임을 하루 평균 데이터로 얼마나 이용하십니까?
app.get(['/video', '/video/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "video" : "0"
        });
    }else if(id === '2'){
        userInfo.push({
            "video" : "1"
        });
    }else if(id === '3'){
        userInfo.push({
            "video" : "2"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "13. 게임을 하루 평균 데이터로 얼마나 이용하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/game/1",
                            "type": "json_plugin_url",
                            "title": "하루평균 30분~1시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/game/2",
                            "type": "json_plugin_url",
                            "title": "하루평균 1시간~2시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/game/3",
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
// 14. 웹 서핑을 하루 평균 데이터로 얼마나 이용하십니까?
app.get(['/game', '/game/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "game" : "0"
        });
    }else if(id === '2'){
        userInfo.push({
            "game" : "1"
        });
    }else if(id === '3'){
        userInfo.push({
            "game" : "2"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "14. 웹 서핑을 하루 평균 데이터로 얼마나 이용하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/webSurfing/1",
                            "type": "json_plugin_url",
                            "title": "하루평균 30분~1시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/webSurfing/2",
                            "type": "json_plugin_url",
                            "title": "하루평균 1시간~2시간"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/webSurfing/3",
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
// 15. 와이파이를 자주 사용하십니까?
app.get(['/webSurfing','/webSurfing/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "webSurfing" : "0"
        });
    }else if(id === '2'){
        userInfo.push({
            "webSurfing" : "1"
        });
    }else if(id === '3'){
        userInfo.push({
            "webSurfing" : "2"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "15. 와이파이를 자주 사용하십니까?",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/wifiUse/1",
                            "type": "json_plugin_url",
                            "title": "거의 사용하지 않는다"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/wifiUse/2",
                            "type": "json_plugin_url",
                            "title": "와이파이 속도가 빠르다면 사용한다"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/wifiUse/3",
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

//  단말기 추천 여부 묻기
app.get('/wifiUse/:id', function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "wifiUse" : "0"
        });
    }else if(id === '2'){
        userInfo.push({
            "wifiUse" : "1"
        });
    }else if(id === '3'){
        userInfo.push({
            "wifiUse" : "2"
        });
    }
    console.log(userInfo);
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
                            "url": "https://f416d4f5.ngrok.io/going",
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
// 16. 고객님께서 원하는 제조사를 선택해주세요.
app.get('/going', function(req, res){
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "16. 고객님께서 원하는 제조사를 선택해주세요.",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/company/1",
                            "type": "json_plugin_url",
                            "title": "삼성"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/company/2",
                            "type": "json_plugin_url",
                            "title": "엘지"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/company/3",
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

// 17. 고객님께서 원하시는 화면크기를 선택해주세요.
app.get(['/company', '/company/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "company" : "S"
        });
    }else if(id === '2'){
        userInfo.push({
            "company" : "L"
        });
    }else if(id === '3'){
        userInfo.push({
            "company" : "A"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "17. 고객님께서 원하시는 화면크기를 선택해주세요.",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/displaySize/1",
                            "type": "json_plugin_url",
                            "title": "4인치 ~ 5인치(작음)"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/displaySize/2",
                            "type": "json_plugin_url",
                            "title": "5인치 ~ 5.7인치(보통)"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/displaySize/3",
                            "type": "json_plugin_url",
                            "title": "5.7인치 이상(넓음)"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
// 18. 최신폰 기준 출시일 추천
app.get(['/displaySize','/displaySize/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "displaySize" : "4"
        });
    }else if(id === '2'){
        userInfo.push({
            "displaySize" : "5"
        });
    }else if(id === '3'){
        userInfo.push({
            "displaySize" : "5.7"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "18. 단말기 출시일을 선택해주세요(갤럭시8 기준(17.04.21)).",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/releaseDate/1",
                            "type": "json_plugin_url",
                            "title": "6개월 전까지"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/releaseDate/2",
                            "type": "json_plugin_url",
                            "title": "6개월~1년전까지"
                        },
                        {
                            "url": "https://f416d4f5.ngrok.io/releaseDate/3",
                            "type": "json_plugin_url",
                            "title": "1년~2년전까지"
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
app.get(['/releaseDate','/releaseDate/:id'], function(req, res){
    let id = req.params.id;
    if(id === '1'){
        userInfo.push({
            "releaseDate" : "6"
        });
    }else if(id === '2'){
        userInfo.push({
            "releaseDate" : "12"
        });
    }else if(id === '3'){
        userInfo.push({
            "releaseDate" : "24"
        });
    }
    console.log(userInfo);
    var jsonResponse = {
        "messages": [{
            "attachment": {
                "payload": {
                    "template_type": "button",
                    "text": "설문이 끝났습니다. 요금제 추천을 시작할까요?.",
                    "buttons": [{
                            "url": "https://f416d4f5.ngrok.io/recoPage",
                            "type": "json_plugin_url",
                            "title": "추천 시작하기"
                        }
                    ]
                },
                "type": "template"
            }
        }]
    };
    res.send(jsonResponse);
});
userInfo = [
    { findProvide: 'S' },
    { currentProvide: 'S' },
    { howLongUse: '10' },
    { sameFamily: '2' },
    { age: 'G' },
    { hotSpot: '1' },
    { whichMost: 'data' },
    { callByDay: '1' },
    { video: '0' },
    { game: '0' },
    { webSurfing: '0' },
    { wifiUse: '1' },
    { company: 'S' },
    { displaySize: '5' },
    { releaseDate: '730' }
];

// reco.ejs 추천페이지로 이동, 기본질의
app.get('/recoPage', function(req, res) {
    let recoCost;
    let sql = "SELECT COCODE, CONAME, SPCODE, SPNAME, COPRICE, TALK, MSN, DATASIZE, FLOOR((DATASIZE/COPRICE)*100) AS DATARATE, ABS((DATASIZE-4000)/4000) as DATANEAR \
    FROM COSTVIEW \
    WHERE SPCODE = ? \
    AND (APCODE = ?) \
    AND (DATASIZE >= 4000*0.7 AND ABS((DATASIZE-4000)/4000)<1) \
    AND (TALK=-1 OR TALK >=30*10) \
    AND (MSN=-1 OR MSN >=30*5) \
    ORDER BY COPRICE ASC LIMIT 3";

    conn.query(sql, [userInfo[0].findProvide, userInfo[4].age], function(err, rows, fields){
        if(!err){
            //console.log(rows);
            let list = [];
            for(let i in rows){
                let spName = rows[i].SPNAME;
                let coName = rows[i].CONAME;
                list.push(parseInt(i)+1+'. '+spName + ' ' + coName);
            }
            // let jsonResponse = {
            //     "messages": [{"text": "추천이 완료되었습니다. 고객님의 추천 요금제는 홈페이지에서 확인 가능합니다."}]
            // };
            // for(let i in list){
            //     jsonResponse.messages.push({
            //         "text":(parseInt(i)+1)+". "+list[i]
            //     });
            // }
            console.log(list);

            res.render('reco', {basicReco:list, nickname:req.user.NICKNAME, userInfo:userInfo});

            //res.redirect('/recoPage/?rows='+rows);

        }else{
            console.log(err);
        }
    });
});

// 데이터 안심 추가옵션
app.get('/addOption', function(req, res){
    let sql = "SELECT COCODE,CONAME,SPCODE,SPNAME,COPRICE,TALK,MSN,DATASIZE,EXTRA,APCODE,AGNAME,FLOOR((DATASIZE/COPRICE)*100) AS DATARATE, ABS((DATASIZE-4000)/4000) as DATANEAR\
    FROM COSTVIEW\
    WHERE\
    SPCODE = ? \
    AND (APCODE = ?)\
    AND DATASIZE > 4000*0.2\
    AND COPRICE<=   (( SELECT MIN(COPRICE) FROM COSTVIEW\
                        WHERE\
                            SPCODE=? \
                            AND (APCODE=?)\
                            AND (DATASIZE >= 4000*0.7 AND abs((DATASIZE-4000)/4000)<1)\
                            AND (TALK=-1 OR TALK >=30*10)\
                            AND (MSN=-1 OR MSN >=30*5)\
                    )-5500\
                )\
    AND (TALK=-1 OR TALK >=30*10)\
    AND (MSN=-1 OR MSN >=30*5)\
    ORDER BY COPRICE DESC\
    LIMIT 3";

    conn.query(sql, [userInfo[0].findProvide, userInfo[4].age, userInfo[0].findProvide, userInfo[4].age], function(err, rows, fields){
        if(!err){
            let list = [];
            for(var i in rows){
                let spName = rows[i].SPNAME;
                let coName = rows[i].CONAME;
                list.push({spName, coName});
            }
            console.log(list);

            res.send(list);
            //res.render('reco', {combiReco:list, nickname:req.user.NICKNAME});

        }else{
            console.log(err);
        }
    });
});
// 가족체크 했을때 가족할인옵션
app.get('/familyDc', function(req, res){
    let sql = "SELECT DICODE,DINAME,SPCODE,DPNAME,DPCODE,DPNAME,DISCOUNT,PERIOD,FAMILY,COST,CONTENT \
    FROM DISCOUNTVIEW \
    WHERE FAMILY<=? AND SPCODE= ?\
    ORDER BY DISCOUNT DESC;";

    conn.query(sql, [userInfo[3].sameFamily, userInfo[0].findProvide], function(err, rows, fields){
        if(!err){
            let list = [];
            for(var i in rows){
                let diName = rows[i].DINAME;
                let content = rows[i].CONTENT;
                list.push({diName,content});
            }
            console.log(list);
            res.send(list);
            //res.render('reco', {combiReco:list, nickname:req.user.NICKNAME});

        }else{
            console.log(err);
        }
    });
});
// 장기할인 체크 했을때
app.get('/longUseDc', function(req, res){
    let sql = "SELECT DICODE,DINAME,SPCODE,DPNAME,DPCODE,DPNAME,DISCOUNT,PERIOD,FAMILY,COST,CONTENT\
    FROM DISCOUNTVIEW\
    WHERE PERIOD<=? AND SPCODE=?\
    ORDER BY DISCOUNT DESC;";

    conn.query(sql, [userInfo[2].howLongUse, userInfo[0].findProvide], function(err, rows, fields){
        if(!err){
            let list = [];
            for(var i in rows){
                let diName = rows[i].DINAME;
                let content = rows[i].CONTENT;
                list.push({diName,content});
            }
            console.log(list);
            res.send(list);
            //res.render('reco', {combiReco:list, nickname:req.user.NICKNAME});

        }else{
            console.log(err);
        }
    });
});
// 단말기 정보 가져오기
app.get('/productInfo', function(req, res){
    let sql = "SELECT PDCODE,PDNAME,MEMORYSIZE,CPNAME,PDPRICE,GRPRICE\
    FROM GRANTSVIEW\
    WHERE SPCODE = ? AND CPCODE = ? AND ONDATE <= DATE_SUB(NOW(), INTERVAL ? DAY);";

    conn.query(sql, [userInfo[0].findProvide, userInfo[12].company, userInfo[14].releaseDate], function(err, rows, fields){
        if(!err){
            let list = [];
            for(var i in rows){
                let pdcode = rows[i].PDCODE;
                let pdname = rows[i].PDNAME;
                let memsize = rows[i].MEMORYSIZE;
                let cpname = rows[i].CPNAME;
                let pdprice = rows[i].PDPRICE;
                let grprice = rows[i].GRPRICE;
                list.push({pdcode, pdname, memsize, cpname, pdprice, grprice});
            }
            console.log(list);
            res.send(list);
            //res.render('reco', {combiReco:list, nickname:req.user.NICKNAME});

        }else{
            console.log(err);
        }
    });
});

// board.ejs 페이지 라우팅
app.get('/boardPage', function(req, res) {
    // passport는 원래 req가 가지고 있지 않은 객체인 user객체를 req의 소속으로 만들어줌
    // user는 deserializeUser의 done함수의 두번째 인자인 user로 부터 기인
    if(req.user && req.user.NICKNAME){
        res.render('board',{nickname:req.user.NICKNAME});
    }else{
        res.render('board',{nickname:''});
    }
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
app.get('/myPage', function(req, res) {
    if(req.user && req.user.NICKNAME){
        res.render('myPage', {nickname:req.user.NICKNAME});
    }else{
        res.render('myPage', {nickname:''});
    }
});
app.get('/tradeDetail', function(req,res){
    if(req.user && req.user.NICKNAME){
        res.render('tradeDetail', {nickname:req.user.NICKNAME});
    }else{
        res.render('tradeDetail', {nickname:''});
    }
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
app.get('/recoFee', function(req, res) {
    if(req.session.count){
        req.session.count++;
    }else{
        req.session.count=1;
    }
    res.render('recoFee', {count:req.session.count});
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
*/
//conn.end();





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
