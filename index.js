const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const bcrypt = require('bcrypt');

const port = process.env.PORT || 3000
const app = express();

const users = {
    bob: '$2b$10$XkcjcNt.UlVFZqD4o3L57eTfWLIMuDZdjYp0gHkH0qQyRqF2yTq9u',
    admin: '$2b$10$5B7.p/ocCP4Z9dnANf2/EOnejRr8KiKRKJfa5sHpCHaSRp0pChk/e'
};

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "Your secret key",
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
    bcrypt.compare(req.body.password, users[req.body.username] || '').then(
        result => {
            if (result === true) {
                req.session.user = req.body.username;
                res.redirect('/');
            } else {
                res.render('login.html', {msg: 'Wrong username or password!'});
            }
        },
        err => {
            console.log(err);
            res.sendStatus(500);
        }
    );
});

app.post('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});
