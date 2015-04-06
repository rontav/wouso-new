var User = require('../config/models/user')

module.exports = function (app) {

  app.get('/admin', function (req, res, next) {
    User.find().exec(function (err, all) {
      res.render('admin', {
        users: all
      })
    })
  })

  app.get('/admin/users', function (req, res, next) {
    User.find().exec(function (err, all) {
      res.render('admin_users', {
        users: all
      })
    })
  })

  app.get('/api/user/:user', function(req, res) {
    var conditions = {'_id': req.params.user}
    var update = {$set: {'role': req.query.role}}
    User.update(conditions, update, function (err, num) {
      if (num) res.json({success: true});
    })
  })
}