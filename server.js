var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var yaml = require('js-yaml');
var fs   = require('fs')
var session = require('cookie-session')
var sha256 = require('js-sha256')
var sys = require('sys')

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
                        req.session.account = doc.account
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

app.listen(8080)
