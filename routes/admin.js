var User     = require('../config/models/user')
var Tag      = require('../config/models/tag')
var Settings = require('../config/models/settings')
var app      = require('../app')
var express  = require('express')
var router   = express.Router()


router.get('/admin', function (req, res, next) {
  // Check if user is logged in and is superuser
  if (!req.user || (req.user && req.user.role != 0)) return res.redirect('/login')

  User.find().exec(function (err, all) {
    if (err) return next(err)

    res.render('admin', {
      'user'       : req.user,
      'users'      : all
    })
  })
})

router.get('/admin/:tab', function (req, res, next) {
  // Check if user is logged in and is superuser
  if (!req.user || (req.user && req.user.role != 0)) return res.redirect('/login')

  _self = {}
  if (req.params.tab == 'users')
    User.find().exec(gotUsers)
  else if (req.params.tab == 'settings')
    Settings.find().exec(gotSettings)
  else if (req.params.tab == 'tags')
    Tag.find().exec(gotTags)
  else
    renderPage()

  function gotUsers(err, all) {
    if (err) return next(err)

    _self.users = all
    renderPage()
  }

  function gotSettings(err, all) {
    if (err) return next(err)

    _self.mysettings = {}
    all.forEach(function(set) {
      _self.mysettings[set.key] = set.val
    })
    renderPage()
  }

  function gotTags(err, all) {
    if (err) return next(err)

    _self.tags = all
    renderPage()
  }

  function renderPage() {
    res.render('admin', {
      'user'       : req.user,
      'people'     : _self.users,
      'mytags'     : _self.tags,
      'mysettings' : _self.mysettings,
      'tab'        : req.params.tab,
      'app_data'   : app.data
    })
  }
})


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

router.get('/api/user/:user', function(req, res) {
  // Check if user is logged in and is superuser
  if (!req.user || (req.user && req.user.role != 0)) return res.redirect('/login')

  var conditions = {'_id': req.params.user}
  var update = {$set: {'role': req.query.role}}
  User.update(conditions, update, function (err, num) {
    if (err) return next(err)
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
