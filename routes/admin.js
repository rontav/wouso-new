var User     = require('../config/models/user')
var Tag      = require('../config/models/tag')
var Settings = require('../config/models/settings')
var log      = require('../core/logging')('core')
var app      = require('../app')
var express  = require('express')
var router   = express.Router()


router.get(['/admin', '/admin/:tab'], function (req, res, next) {
  // Check if user is logged in and is superuser
  if (!req.user || (req.user && req.user.role != 0)) return res.redirect('/login');

  User.find().exec(function (err, all) {
    if (err) return next(err);

    res.render('admin', {
      'user'       : req.user,
      'users'      : all
    });
  });
});

router.get('/api/tags', function(req, res, next) {
  Tag.find().exec(gotTags);

  function gotTags(err, all) {
    if (err) return next(err);

    res.send(all);
  }
});

// Add a new tag
// For e better organization, tags are managed independently, and they are
// just linked with the object they represent (e.g. qotd question)
router.post('/api/tags/add', function(req, res) {
  // Check if user is logged in and is superuser
  if (!req.user || (req.user && req.user.role != 0)) return res.redirect('/login')

  new Tag({
    'name' : req.body.name,
    'type' : req.body.type
  }).save(function (err) {
    if (err) return next(err)
    res.redirect('/admin/tags')
  })
})

router.get('/api/user/:user', function(req, res, next) {
  // Check if user is logged in and is superuser
  if (!req.user || (req.user && req.user.role != 0)) return res.redirect('/login')

  var conditions = {'_id': req.params.user}
  var update = {$set: {'role': req.query.role}}
  User.update(conditions, update, function (err, num) {
    if (err) return next(err);
    if (num) res.json({success: true})
  })
})

router.get('/api/settings/set', function(req, res) {
  // Check if user is logged in and is superuser
  if (!req.user || (req.user && req.user.role != 0)) return res.redirect('/login')

  for (var opt in req.query) {
    var cond = {'key': opt}
    var update = {$set: {'val': req.query[opt]}}
    Settings.update(cond, update, {'upsert': true}, function (err, num) {
      if (err) return next(err)
      if (num) {
        res.json({success: true})
        log.info('Setting ' + opt + ' set to ' + req.query[opt])
      }
    })
  }
})


module.exports = router
