var Settings = require('../config/models/settings');
var Users    = require('../config/models/user');
var Badges   = require('../config/models/badges');
var express  = require('express');
var router   = express.Router();


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
  });


router.post('/api/profile/primary', function (req, res, next) {
  var query  = {'_id': req.user._id};
  var update = {'$set': {
    'name'  : req.body.primary_name,
    'email' : req.body.primary_email
  }}
  Users.update(query, update).exec(redirectUser);

  function redirectUser(err) {
    if (err) return next(err);

    res.redirect('/profile');
  }
});


router.get('/api/profile/settings', function (req, res, next) {
  Settings.find({'key': /login-.*/}).exec(gotSettings);

  function gotSettings(err, all) {
    if (err) return next(err)

    var mysettings = {}
    all.forEach(function(set) {
      mysettings[set.key] = set.val;
    });

    res.send(mysettings);
  }

});


module.exports = router
