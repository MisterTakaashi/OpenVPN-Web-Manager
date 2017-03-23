var fs = require('fs');

exports.index = function (req, res) {
  var confClient = fs.readFileSync(global.scriptFolder + "/conf_client", 'utf8');

  if (typeof(req.session.email) != "undefined"){
      res.render('user.ejs', { session: req.session, conf: confClient });
  }else{
      res.redirect('/#connection');
  }
}

exports.keys = function (req, res) {
  var accountNoMail = req.session.pseudo;

  res.download(global.staticFolder + "/members/" + req.session.email + "/keys/" + accountNoMail + ".zip");
}
