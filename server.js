var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var yaml = require('js-yaml');
var fs   = require('fs');
var session = require('cookie-session');
var sha256 = require('js-sha256');
var http = require('http');

// Controllers
var homeCtrl = require('./controllers/homeCtrl.js');
var authCtrl = require('./controllers/authCtrl.js');
var dashCtrl = require('./controllers/dashCtrl.js');
var adminCtrl = require('./controllers/adminCtrl.js');
var meCtrl = require('./controllers/meCtrl.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express();

global.staticFolder = __dirname + '/static';
global.scriptFolder = __dirname + '/scripts';

app.use(session({ secret: 's3cr3tind3chiffrabl3' }))

.use(express.static(global.staticFolder))

.get('/', homeCtrl.index)

.post('/login', urlencodedParser, authCtrl.login)

.get('/login', authCtrl.loginIndex)

.post('/register', urlencodedParser, authCtrl.register)

.get('/register', authCtrl.registerIndex)

.get('/dash', dashCtrl.index)

.get('/admin', adminCtrl.index)

.post('/admin', urlencodedParser, adminCtrl.addPremium)

.get('/me', meCtrl.index)

.get('/me/keys', meCtrl.keys);

app.listen(8080);
console.log("Le serveur est lancé et écoute sur le port 8080");
