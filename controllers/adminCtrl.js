var yaml = require('js-yaml');
var fs = require('fs');

var keysService = require('../services/keysService.js');

exports.index = function (req, res) {
  var users = fs.readdirSync(global.staticFolder + "/members/");

  var usersOnline = null;
  var usersOnline2 = null;
  var nbrUsersOnline = 0;

  try{
    usersOnline = fs.readFileSync('/var/log/openvpn-status.log', 'utf8');
    usersOnline2 = usersOnline.split("Last Ref")[1].split("GLOBAL STATS")[0].split('\n');
    usersOnline = usersOnline.split("Connected Since")[1].split("ROUTING TABLE")[0].split('\n');
    nbrUsersOnline = usersOnline.length - 2;
  }catch(e){

  }

  if (req.session.email == "soapmctravich@gmail.com"){
    res.render('admin.ejs', { session: req.session, users: users, usersOnline: usersOnline, usersOnline2: usersOnline2, nbrUsersOnline: nbrUsersOnline });
  }else{
    res.redirect('/');
  }
}

exports.addPremium = function (req, res) {
  if (req.session.email == "soapmctravich@gmail.com"){
      var account = req.body.account;

      var doc = yaml.safeLoad(fs.readFileSync(__dirname + '/static/members/' + account + '/user.yml', 'utf8'));
      var accountNoMail = doc.pseudo;

      var fichiercompte = fs.readFileSync(__dirname + '/static/members/' + account + '/user.yml', 'utf8');
      var fichiercompteNew = fichiercompte.replace(/basique/g, "premium");

      var dateNow = new Date() * 1;

      if (doc.finpremium !== null && doc.finpremium != "null"){
          dateNow = new Date(doc.finpremium) * 1;
      }
      dateNow = dateNow + 2678400000;

      fichiercompteNew = fichiercompteNew.replace(/finpremium: \d+/g, "finpremium: " + dateNow);
      fichiercompteNew = fichiercompteNew.replace(/finpremium: null/g, "finpremium: " + dateNow);

      fs.writeFileSync(__dirname + "/static/members/" + account + "/user.yml", fichiercompteNew);

      keysService.generateKeys(accountNoMail, account, () => {
        console.log("Clés générées pour '" + account + "'");
        res.redirect('/admin#newkey');
      });
  }
}
