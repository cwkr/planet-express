const express = require('express');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');

const port = process.env.PORT || 3000
const app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function(req, res) {
    res.render('index.html', {headline: 'Hallo Welt!'});
});

app.listen(port, () => {
    console.log(`Runnung on port ${port}`);
});
