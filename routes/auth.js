var passport = require('passport')
var express  = require('express')
var router   = express.Router()


// LOCAL SIGNUP
router.post('/login',
  passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
  }))

router.post('/signup',
  passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
  }))

router.get('/signup', function(req, res) {
  res.render('signup')
})

// route for logging out
router.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

module.exports = router
