const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const bcrypt = require('bcrypt');
const pg = require('pg');
const SessionStore = require('connect-pg-simple')(session);

const port = process.env.PORT || 3000
const app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    store: new SessionStore({
        pool: pool
    }),
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
}));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery/js', express.static(__dirname + '/node_modules/jquery/dist'));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', isAuthenticated, function (req, res) {
    res.render('index.html', { headline: 'Hallo Welt!' });
});

app.get('/login', function (req, res) {
    res.render('login.html');
});

app.post('/login', function (req, res) {
    pool.query("SELECT passwd FROM user_account WHERE username = $1", [req.body.username], (err, rs) => {
        if (err) {
            res.render('login.html', {msg: err});
        } else {
            if (rs.rows.length === 1) {
                bcrypt.compare(req.body.password, rs.rows[0].passwd).then(
                    result => {
                        if (result === true) {
                            req.session.user = req.body.username;
                            res.redirect('/');
                        } else {
                            res.render('login.html', {msg: 'Wrong username or password!'});
                        }
                    },
                    err => {
                        res.render('login.html', {msg: err});
                    }
                );
            } else {
                res.render('login.html', {msg: 'Wrong username or password!'});
            }
        }
    });
});

app.post('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});
