var User = require('../../../config/models/user')

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
}