module.exports = function (app) {

  app.get('/login', function (req, res, next) {
  	console.log(req.user)
    res.render('login', {
      'username': (req.user ? req.user.username : null)
    })
  })

}