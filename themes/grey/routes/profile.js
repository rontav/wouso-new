module.exports = function (app) {

  app.get('/profile', function (req, res, next) {
    res.render('profile', {
      'user': req.user
    })
  })

}