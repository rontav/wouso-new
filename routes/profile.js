var Settings = require('../config/models/settings')
var Badges   = require('../config/models/badges')
var express  = require('express')
var router   = express.Router()


router.get('/profile', function (req, res, next) {
    _self = {}
    Settings.find({'key': /login-.*/}).exec(gotSettings)

    function gotSettings(err, all) {
      if (err) return next(err)

      _self.mysettings = {}
      all.forEach(function(set) {
        _self.mysettings[set.key] = set.val
      })

      if (req.user) {
        query = {'history.userId': req.user._id}
        projection = {
          '_id'     : 0,
          'name'    : 1,
          'levels'  : 1,
          'history' : {'$elemMatch': {'userId': req.user._id}}}
        Badges.find(query, projection).exec(gotBadges)
      } else {
        gotBadges(null, [])
      }
    }

    function gotBadges(err, badges) {
      _self.badges = []

      badges.forEach(function(badge) {
        // Init temporary badge
        var tmp_badge = {'limit': 0}
        // Get badge level
        badge.levels.forEach(function(level) {
          // Update ttemporary badge object biggest level available
          if (level.limit < badge.history[0].count && level.limit > tmp_badge.limit) {
            tmp_badge.limit = level.limit
            tmp_badge.name  = badge.name
            tmp_badge.level = level.name
          }
        })
        // Save badge if count got beyond first limit
        if (tmp_badge.limit != 0)
          _self.badges.push(tmp_badge)
      })

      res.render('profile', {
        'user'       : req.user,
        'badges'     : _self.badges,
        'mysettings' : _self.mysettings
      })
    }
  })


module.exports = router
