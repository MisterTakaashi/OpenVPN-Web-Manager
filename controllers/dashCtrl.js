var serverService = require('../services/serverService.js');

exports.index = function (req, res) {
  serverService.getVpnStatus((status) => {
    res.render('dashboard.ejs', { session: req.session, ping: status.ping, vpn: status.vpn, nbrUsersOnline: status.nbrUsersOnline });
  });
}
