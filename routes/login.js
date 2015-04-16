var Settings = require('../config/models/settings')

module.exports = function (app) {

  app.get('/login', function (req, res, next) {
    Settings.find({'key': /login-.*/}).exec(gotSettings)

    function gotSettings(err, all) {
      mysettings = {}
      all.forEach(function(set) {
        mysettings[set.key] = set.val
      })

      res.render('login', {
        'username'   : (req.user ? req.user : null),
        'mysettings' : mysettings
      })
    }
  })
}