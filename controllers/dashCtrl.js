var exec = require('child_process').exec;

exports.index = function (req, res) {
  var child;
  var vpnStatus = false;

  // child = exec("service openvpn status", function (error, stdout, stderr) {
  //     if (error !== null) {
  //         //console.log('exec error: ' + error);
  //     }else{
  //         var etatOpen = stdout.split('\n');
  //         if (etatOpen == "VPN 'openvpn' is running.,"){
  //             vpnStatus = true;
  //         }
  //     }
  //
  //     try{
  //         var usersOnline = fs.readFileSync('/var/log/openvpn-status.log', 'utf8');
  //         usersOnline = usersOnline.split("Connected Since")[1].split("ROUTING TABLE")[0].split('\n');
  //         var nbrUsersOnline = usersOnline.length - 2;
  //     }catch(e){
  //         var usersOnline = null;
  //         var nbrUsersOnline = 0;
  //     }
  //
  //     ping.ping({ address: 'google.com', port:80, attempts:3 }, function(data) {
  //         if (data[0].avg.toString() != "NaN"){
  //             data[0].avg = data[0].avg.toString().split('.')[0];
  //         }else{
  //             data[0].avg = "NaN";
  //         }
  //
  //         res.render('dashboard.ejs', { session: req.session, ping: data[0].avg, vpn: vpnStatus, nbrUsersOnline: nbrUsersOnline });
  //     });
  // });
}
