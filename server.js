var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var yaml = require('js-yaml');
var fs   = require('fs')
var session = require('cookie-session')
var sha256 = require('js-sha256')
var sys = require('sys')
var http = require('http');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express()

app.use(session({ secret: 's3cr3tind3chiffrabl3' }))

.use(express.static(__dirname + '/static'))

.get('/', function(req, res){
    var ping = require('ping-net');
    var exec = require('child_process').exec;
    var child;

    var vpnStatus = false

    child = exec("service openvpn status", function (error, stdout, stderr) {
        if (error !== null) {
            //console.log('exec error: ' + error);
        }else{
            // var etatOpen = stdout.split(' ]')[0].split('[ ')[1]
            var etatOpen = stdout.split('\n')
            if (etatOpen == "VPN 'openvpn' is running.,"){
                vpnStatus = true
            }
            // console.log("'" +etatOpen+ "' : '"+vpnStatus+"'")
        }

        try{
            var usersOnline = fs.readFileSync('/var/log/openvpn-status.log', 'utf8')
            usersOnline = usersOnline.split("Connected Since")[1].split("ROUTING TABLE")[0].split('\n')
            var nbrUsersOnline = usersOnline.length - 2
        }catch(e){
            var usersOnline = null
            var nbrUsersOnline = 0
        }
        //console.log(usersOnline)

        ping.ping({ address: 'google.com', port:80, attempts:3 }, function(data) {
            if (data[0].avg.toString() != "NaN"){
                data[0].avg = data[0].avg.toString().split('.')[0]
            }else{
                data[0].avg = "NaN"
            }

            res.render('index.ejs', { session: req.session, ping: data[0].avg, vpn: vpnStatus, nbrUsersOnline: nbrUsersOnline })
        });
    });
})

.post('/login', urlencodedParser, function(req, res){
    /*console.log(req.body.inputEmail)
    console.log(req.body.inputPassword)*/
    var email = req.body.inputEmail.toLowerCase()
    var password = req.body.inputPassword
    var hashedPassword = sha256(req.body.inputPassword)
    fs.readdir(__dirname + '/static/members', function(err, files){
        for (var i = 0; i < files.length; i++) {
            if (files[i] == email){
                console.log("Tentative de connexion de l\'utilisateur '"+email+"'")
                try {
                    var doc = yaml.safeLoad(fs.readFileSync(__dirname + '/static/members/' + files[i] + '/user.yml', 'utf8'));
                    /*console.log(doc)
                    console.log(doc.pass + '|' + hashedPassword)*/
                    if (doc.pass == hashedPassword){
                        console.log("Connexion de '"+doc.email+"' réussie")
                        req.session.email = doc.email
                        req.session.pseudo = doc.pseudo
                        req.session.fromecole = doc.fromecole
                        req.session.ecole = doc.ecole
                        req.session.classe = doc.classe
                        req.session.account = doc.account
                        req.session.datecrea = doc.datecrea
                        req.session.finpremium = doc.finpremium
                        //console.log(req.session)
                        res.redirect('/')
                    }else{
                        res.redirect('/login#badpass')
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
    })
})

.get('/login', function(req, res){
    res.render('login.ejs', { session: req.session })
})

.post('/register', urlencodedParser, function(req, res){
    var email = req.body.email
    var pseudo = req.body.pseudo
    var password = req.body.password
    var confpassword = req.body.confpassword
    var boolecole = req.body.boolecole
    var datecrea = new Date() * 1
    if (boolecole == "on"){
        var ecole = req.body.ecole
        var classe = req.body.classe
        var fromecole = true
    }else{
        var ecole = null
        var classe = null
        var fromecole = false
    }

    var exists = fs.existsSync(__dirname + "/static/members/" + email)

    if(exists == true){
        res.redirect('/register#exists')
    }

    if(password != confpassword){
        res.redirect('/register#badpass')
    }

    fs.mkdirSync(__dirname + "/static/members/" + email)
    fs.mkdirSync(__dirname + "/static/members/" + email + "/keys/")

    var toWrite = "email: " + email + "\npass: " + sha256(password) + "\npseudo: " + pseudo + "\nfromeecole: " + fromecole + "\necole: " + ecole + "\nclasse: " + classe + "\ndatecrea: " + datecrea + "\naccount: basique\nfinpremium: null"

    fs.writeFile(__dirname + "/static/members/" + email + "/user.yml", toWrite, function(err) {
        console.log("Utilisateur '"+email+"' créé !");
    });

    res.redirect('/#newaccount')
    //console.log("Inscription de '"+email+"' : "+ecole+" : "+classe+"")
})

.get('/register', function(req, res){
    res.render('register.ejs', { session: req.session })
})

.get('/dash', function(req, res){
    var ping = require('ping-net');
    var exec = require('child_process').exec;
    var child;

    var vpnStatus = false

    child = exec("service openvpn status", function (error, stdout, stderr) {
        if (error !== null) {
            //console.log('exec error: ' + error);
        }else{
            var etatOpen = stdout.split('\n')
            if (etatOpen == "VPN 'openvpn' is running.,"){
                vpnStatus = true
            }
        }

        try{
            var usersOnline = fs.readFileSync('/var/log/openvpn-status.log', 'utf8')
            usersOnline = usersOnline.split("Connected Since")[1].split("ROUTING TABLE")[0].split('\n')
            var nbrUsersOnline = usersOnline.length - 2
        }catch(e){
            var usersOnline = null
            var nbrUsersOnline = 0
        }

        ping.ping({ address: 'google.com', port:80, attempts:3 }, function(data) {
            if (data[0].avg.toString() != "NaN"){
                data[0].avg = data[0].avg.toString().split('.')[0]
            }else{
                data[0].avg = "NaN"
            }

            res.render('dashboard.ejs', { session: req.session, ping: data[0].avg, vpn: vpnStatus, nbrUsersOnline: nbrUsersOnline })
        });
    });
})

.get('/admin', function(req, res){
    var users = fs.readdirSync(__dirname + "/static/members/")

    try{
        var usersOnline = fs.readFileSync('/var/log/openvpn-status.log', 'utf8')
        usersOnline2 = usersOnline.split("Last Ref")[1].split("GLOBAL STATS")[0].split('\n')
        usersOnline = usersOnline.split("Connected Since")[1].split("ROUTING TABLE")[0].split('\n')
        var nbrUsersOnline = usersOnline.length - 2
    }catch(e){
        var usersOnline = null
        var usersOnline2 = null
        var nbrUsersOnline = 0
    }

    if (req.session.email == "soapmctravich@gmail.com"){
        res.render('admin.ejs', { session: req.session, users: users, usersOnline: usersOnline, usersOnline2: usersOnline2, nbrUsersOnline: nbrUsersOnline })
    }else{
        res.redirect('/')
    }
})

.post('/admin', urlencodedParser, function(req, res){
    if (req.session.email == "soapmctravich@gmail.com"){
        var account = req.body.account

        var doc = yaml.safeLoad(fs.readFileSync(__dirname + '/static/members/' + account + '/user.yml', 'utf8'))
        var accountNoMail = doc.pseudo

        var fichiercompte = fs.readFileSync(__dirname + '/static/members/' + account + '/user.yml', 'utf8')
        var fichiercompteNew = fichiercompte.replace(/basique/g, "premium");

        if (doc.finpremium != null && doc.finpremium != "null"){
            var dateNow = new Date(doc.finpremium) * 1
        }else{
            var dateNow = new Date() * 1
        }

        var dateNow = new Date() * 1
        dateNow = dateNow + 2678400000

        var fichiercompteNew = fichiercompteNew.replace(/finpremium: \d+/g, "finpremium: " + dateNow)
        var fichiercompteNew = fichiercompteNew.replace(/finpremium: null/g, "finpremium: " + dateNow)

        fs.writeFileSync(__dirname + "/static/members/" + account + "/user.yml", fichiercompteNew)

        var exec = require('child_process').exec;
        var child;

        child = exec("cd ./scripts/; ./addkey.sh " + accountNoMail + " " + account, function (error, stdout, stderr) {
            console.log("Clés générées pour '" + account + "'")
            res.redirect('/admin#newkey')
        })
    }
})

.get('/me', function(req, res){
    var confClient = fs.readFileSync(__dirname + "/scripts/conf_client", 'utf8')

    if (typeof(req.session.email) != "undefined"){
        res.render('user.ejs', { session: req.session, conf: confClient })
    }else{
        res.redirect('/#connection')
    }
})

.get('/me/keys', function(req, res){
    var accountNoMail = req.session.pseudo

    res.download(__dirname + "/static/members/" + req.session.email + "/keys/" + accountNoMail + ".zip");
})

app.listen(8080)
