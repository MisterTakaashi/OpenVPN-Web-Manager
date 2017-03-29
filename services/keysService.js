var exec = require('child_process').exec;

exports.generateKeys = function (accountNoMail, account, callback) {
  exec("cd ./scripts/; ./addkey.sh " + accountNoMail + " " + account, function (error, stdout, stderr) {
    callback();
  });
}
