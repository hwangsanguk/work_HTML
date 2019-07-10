const express = require('express');
const path = require('path');
const app = express();
const cookieparser = require('cookie-parser');
const port = 3000;
const session = require('express-session');
const FileStore = require('session-file-store')(session);
var hasher = require('pbkdf2-password')();
const morgan = require('morgan');
const fs = require('fs')

//html 렌더링 설정 ,ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); //ejs view engine을 express를 통해 사용한다
app.engine('html', require('ejs').renderFile);//engine setting

//session 사용
app.use(session({
    secret: '1A@W#E$E',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));

//coockie사용 
app.use(cookieparser());

//morgan사용
app.use(morgan('dev'));

app.use(function(req,res,next) {
    res.locals.user = req.session.user;
    next();
 });

var sampleuserList = {};

// fs.writeFileSync('data/userlist.json' ,JSON.stringify( sampleuserList, null, 2));

if (fs.existsSync('data/userlist.json')) {
    let rawdata = fs.readFileSync('data/userlist.json');
    sampleuserList = JSON.parse(rawdata);
    console.log(sampleuserList);
}

app.use(express.urlencoded({
    extended: false//querystring 모듈 사용
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// index
app.get('/',(req,res)=>{
    res.render('index.html');
})

app.post('/',(req,res)=>{
    res.render('index.html')
})

//Login_session 시작
app.get('/login', function (req, res) {
    res.render('login_form.html');
})

app.post('/login', (req, res) => {
    console.log(req.body);
    let userid=req.body.id;
    let password = req.body.password;
    console.log('userid = ', userid);
    console.log('password = ', password);
    console.log('userlist = ', sampleuserList);

    let user = sampleuserList[userid];

    if (user){
        hasher({
            password: password,
            salt: user.salt
        }, function(err, pass, salt, hash){
            if (err){
                console.log('ERR', err);
                req.flash('fmsg','에러발생');
        
            }
            if (hash === user.password){
                console.log('INFO :', userid, ' 로그인 성공');

                req.session.user = sampleuserList[userid];
                req.session.save(function(){
                    res.redirect('/');
                })
                return;
            } else{
                console.log('패스워드 오류');
    
                res.redirect('/login')
                
            }
        });
    }else{
        console.log('망할 실패');
        res.redirect('/login');
    }

});

//Login 끝




//회원가입, pbkdf2 사용 패스워드 암호화
app.get('/signin', function (req, res) {
    res.render('sign_form.html');
});


app.post('/sign', (req, res) => {
    let userid = req.body.id;
    let password = req.body.password;
    let name = req.body.name;
    let pnumber = req.body.pnumber;
    let email = req.body.email;
    console.log('userid =', userid);
    console.log('password =', password);
    console.log('name = ', name);
    console.log('pnumber = ', pnumber);
    console.log('email =', email);

    hasher({
        password: req.body.password
    }, (err, pass, salt, hash) => {
        if (err) {
            console.log('ERR = ', err);
            res.redirect('/signin_form');
        }
        let user = {
            userid: userid,
            password: hash,
            salt: salt,
            name: name,
            pnumber: pnumber,
            email: email
        }
        sampleuserList[userid] = user;
        fs.writeFileSync('data/userlist.json', JSON.stringify(sampleuserList, null, 2));

        console.log('user added : ', user);
        res.redirect('/');
    });

});
// 암호화 종료

app.get('/login',(req,res)=>{
    res.render('login_form.html');
})





// test.session 시작
app.get('/test/setsession', (req, res) => {
    console.log('/test/setsession');
    req.session.myname = '홍길동';
    req.session.myid = 'hong'
    req.session.save(function () {
        res.redirect('/test/getsession');
    })
})

app.get('/test/getsession', (req, res) => {
    console.log('/test/getsession');
    console.log('session.myname = ', req.session.myname);
    res.render('test/getsession.html', {
        myname: req.session.myname,
        myid: req.session.myid
    });
})

//session


app.listen(port, () => {
    console.log('server listening ...' + port);

})