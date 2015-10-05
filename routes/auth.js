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

// FACEBOOK LOGIN
router.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope : 'email'
  }))

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

router.get('/connect/facebook',
  passport.authorize('facebook', {
    scope : 'email'
  }))

// handle the callback after facebook has authorized the user
router.get('/connect/facebook/callback',
  passport.authorize('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


// TWITTER LOGIN
router.get('/auth/twitter',
  passport.authenticate('twitter', {
    scope : 'email'
  }))

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

router.get('/connect/twitter',
  passport.authorize('twitter', {
    scope : 'email'
  }))

router.get('/connect/twitter/callback',
  passport.authorize('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


// GOOGLE LOGIN
router.post('/auth/google/callback',
  passport.authenticate('google'), function(req, res) {
  // Return user back to client
  res.send('profile')
})


// GITHUB LOGIN
router.get('/auth/github',
  passport.authenticate('github', {
    scope : 'email'
  }))

router.get('/auth/github/callback',
  passport.authenticate('github', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

router.get('/connect/github',
  passport.authorize('github', {
    scope : 'email'
  }))

router.get('/connect/github/callback',
  passport.authorize('github', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


router.get('/signup', function(req, res) {
  res.render('signup')
})

// route for logging out
router.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
      return next()

  // if they aren't redirect them to the home page
  res.redirect('/')
}


module.exports = router
