var passport = require('passport')
var express  = require('express')
var router   = express.Router()


// FACEBOOK LOGIN
router.get('/wouso-social-login/auth/facebook',
  passport.authenticate('facebook', {
    scope : 'email'
  }))

// handle the callback after facebook has authenticated the user
router.get('/wouso-social-login/auth/facebook/callback',
  passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

router.get('/wouso-social-login/connect/facebook',
  passport.authorize('facebook', {
    scope : 'email'
  }))

// handle the callback after facebook has authorized the user
router.get('/wouso-social-login/connect/facebook/callback',
  passport.authorize('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


// TWITTER LOGIN
router.get('/wouso-social-login/auth/twitter',
  passport.authenticate('twitter', {
    scope : 'email'
  }))

router.get('/wouso-social-login/auth/twitter/callback',
  passport.authenticate('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

router.get('/wouso-social-login/connect/twitter',
  passport.authorize('twitter', {
    scope : 'email'
  }))

router.get('/wouso-social-login/connect/twitter/callback',
  passport.authorize('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


// GOOGLE LOGIN
router.post('/wouso-social-login/auth/google/callback',
  passport.authenticate('google'), function(req, res) {
  // Return user back to client
  res.send('profile')
})


// GITHUB LOGIN
router.get('/wouso-social-login/auth/github',
  passport.authenticate('github', {
    scope : 'email'
  }))

router.get('/wouso-social-login/auth/github/callback',
  passport.authenticate('github', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

router.get('/wouso-social-login/connect/github',
  passport.authorize('github', {
    scope : 'email'
  }))

router.get('/wouso-social-login/connect/github/callback',
  passport.authorize('github', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


module.exports = router