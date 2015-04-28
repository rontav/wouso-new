var Settings = require('../config/models/settings')

module.exports = function (app) {

  app.get('/profile', function (req, res, next) {
    Settings.find({'key': /login-.*/}).exec(gotSettings)

    function gotSettings(err, all) {
      if (err) return next(err)

      mysettings = {}
      all.forEach(function(set) {
        mysettings[set.key] = set.val
      })

      res.render('profile', {
        'user'       : req.user,
        'mysettings' : mysettings
      })
    }
  })

}