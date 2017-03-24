var tcpp = require('tcp-ping');
var fs = require('fs');
var exec = require('child_process').exec;

exports.getVpnStatus = function (callback) {
  this.canPing((ping) => {
    // On poursuit les test
    exec("ps ax | grep openvpn", function (error, stdout, stderr) {
      if (error !== null) {
        callback({ping: ping, vpn: false});
      }else{
        if (stdout.includes("ovpn-server")){
          try{
            var usersOnline = fs.readFileSync('/var/log/openvpn-status.log', 'utf8');
            usersOnline = usersOnline.split("Connected Since")[1].split("ROUTING TABLE")[0].split('\n');
            var nbrUsersOnline = usersOnline.length - 2;
          }catch(e){
            var usersOnline = null;
            var nbrUsersOnline = 0;
          }
          callback({ping: ping, vpn: true, nbrUsersOnline: nbrUsersOnline});
        }else{
          callback({ping: ping, vpn: false, nbrUsersOnline: 0});
        }
      }
    });
  });
}

exports.canPing = function (callback) {
  tcpp.ping({address: '8.8.8.8', port: 53, attempts: 3, timeout: 2000}, function(err, data) {
    if (err){
      callback('NaN');
    }else{
      callback(Math.floor(data.avg));
    }
  });
}
