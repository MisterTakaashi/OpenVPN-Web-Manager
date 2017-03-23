var fs = require('fs');
var sha256 = require('js-sha256');
var yaml = require('js-yaml');
var express = require('express');

exports.login = function (req, res) {
  var email = req.body.inputEmail.toLowerCase();
  var password = req.body.inputPassword;
  var hashedPassword = sha256(req.body.inputPassword);
  fs.readdir(global.staticFolder + '/members', function(err, files){
    for (var i = 0; i < files.length; i++) {
      if (files[i] == email){
        console.log("Tentative de connexion de l\'utilisateur '"+email+"'");
        try {
          var doc = yaml.safeLoad(fs.readFileSync(global.staticFolder + '/members/' + files[i] + '/user.yml', 'utf8'));
          /*console.log(doc)
          console.log(doc.pass + '|' + hashedPassword)*/
          if (doc.pass == hashedPassword){
            console.log("Connexion de '"+doc.email+"' réussie");
            req.session.email = doc.email;
            req.session.pseudo = doc.pseudo;
            req.session.fromecole = doc.fromecole;
            req.session.ecole = doc.ecole;
            req.session.classe = doc.classe;
            req.session.account = doc.account;
            req.session.datecrea = doc.datecrea;
            req.session.finpremium = doc.finpremium;
            //console.log(req.session)
            res.redirect('/');
          }else{
            res.redirect('/login#badpass');
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  });
};

exports.register = function (req, res) {
  var email = req.body.email;
  var pseudo = req.body.pseudo;
  var password = req.body.password;
  var confpassword = req.body.confpassword;
  var boolecole = req.body.boolecole;
  var datecrea = new Date() * 1;
  var ecole = null;
  var classe = null;
  var fromecole = false;
  if (boolecole == "on"){
      ecole = req.body.ecole;
      classe = req.body.classe;
      fromecole = true;
  }

  var exists = fs.existsSync(global.staticFolder + "/members/" + email);

  if(exists === true){
      res.redirect('/register#exists');
  }

  if(password != confpassword){
      res.redirect('/register#badpass');
  }

  fs.mkdirSync(global.staticFolder + "/members/" + email);
  fs.mkdirSync(global.staticFolder + "/members/" + email + "/keys/");

  var toWrite = "email: " + email + "\npass: " + sha256(password) + "\npseudo: " + pseudo + "\nfromeecole: " + fromecole + "\necole: " + ecole + "\nclasse: " + classe + "\ndatecrea: " + datecrea + "\naccount: basique\nfinpremium: null";

  fs.writeFile(global.staticFolder + "/members/" + email + "/user.yml", toWrite, function(err) {
      console.log("Utilisateur '"+email+"' créé !");
  });

  res.redirect('/#newaccount');
  // console.log("Inscription de '"+email+"' : "+ecole+" : "+classe+"")
}

exports.loginIndex = function (req, res) {
  res.render('login.ejs', { session: req.session });
}

exports.registerIndex = function (req, res) {
  res.render('register.ejs', { session: req.session });
}
