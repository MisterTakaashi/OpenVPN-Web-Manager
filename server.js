var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var fs   = require('fs')
var session = require('cookie-session')
var sha256 = require('js-sha256')

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express()

app.use(session({ secret: 's3cr3tind3chiffrabl3' }))

.use(express.static(__dirname + '/static'))

.get('/', function(req, res){
    res.render('index.ejs', { session: req.session })
})

.get('/login', function(req, res){
    res.render('login.ejs', { session: req.session })
})

app.listen(8080)
