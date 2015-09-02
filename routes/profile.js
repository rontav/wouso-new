var Settings = require('../config/models/settings')
var Badges   = require('../config/models/badges')

module.exports = function (app) {

  app.get('/profile', function (req, res, next) {
    _self = {}
    Settings.find({'key': /login-.*/}).exec(gotSettings)

    function gotSettings(err, all) {
      if (err) return next(err)

      _self.mysettings = {}
      all.forEach(function(set) {
        _self.mysettings[set.key] = set.val
      })

      Badges.find({'history.userId': req.user._id}).exec(gotBadges)
    }

    function gotBadges(err, badges) {

      res.render('profile', {
        'user'       : req.user,
        'badges'     : badges,
        'mysettings' : _self.mysettings
      })
    }
  })

}