var User     = require('../config/models/user')
var Tag      = require('../config/models/tag')
var Settings = require('../config/models/settings')

module.exports = function (app) {

  app.get('/admin', function (req, res, next) {
    User.find().exec(function (err, all) {
      if (err) return next(err)

      res.render('admin', {
        'user'       : req.user,
        'users'      : all
      })
    })
  })

  app.get('/admin/:tab', function (req, res, next) {
    _self = {}

    if (req.params.tab == 'users')
      User.find().exec(gotUsers)
    else if (req.params.tab == 'settings')
      Settings.find().exec(gotSettings)
    else if (req.params.tab == 'tags')
      Tag.find().exec(gotTags)

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
        'users'      : _self.users,
        'mytags'     : _self.tags,
        'mysettings' : _self.mysettings,
        'tab'        : req.params.tab
      })
    }
  })


  // Add a new tag
  // For e better organization, tags are managed independently, and they are
  // just linked with the object they represent (e.g. qotd question)
  app.post('/api/tags/add', function(req, res) {
    new Tag({
      'name' : req.body.name,
      'type' : req.body.type
    }).save(function (err) {
      if (err) return next(err)
      res.redirect('/admin/tags')
    })
  })

  app.get('/api/user/:user', function(req, res) {
    var conditions = {'_id': req.params.user}
    var update = {$set: {'role': req.query.role}}
    User.update(conditions, update, function (err, num) {
      if (err) return next(err)
      if (num) res.json({success: true})
    })
  })

  app.get('/api/settings/set', function(req, res) {
    for (q in req.query) {
      var conditions = {'key': q}
      var update = {$set: {'val': req.query[q]}}
      Settings.update(conditions, update, {'upsert': true}, function (err, num) {
        if (err) return next(err)
        if (num) res.json({success: true})
      })
    }
  })
}