var LocalStrategy = require('passport-local').Strategy


var DEFAULT_ROUTE = 'http://%s/wouso-social-login/auth/%s/callback'

// load up the user model
var User = require('../config/models/user')
// load up the settings
var Settings = require('../config/models/settings')

var config = require('../config.js');

module.exports = function(app, passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })
  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user)
    })
  })


  // LOCAL LOGIN
  passport.use('local-login', new LocalStrategy({
    usernameField     : 'email',
    passwordField     : 'password',
    passReqToCallback : true

  }, function(req, email, password, done) {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    Settings.find({'key': /login-.*/}, function(err, settings) {
      if (err) return done(null, false, req.flash('error', err))

      User.findOne({'local.email': email}, function(err, user) {
        if (err) return done(null, false, req.flash('error', err))

        // Check if user is returned
        if (!user)
          return done(null, false, req.flash('error', req.i18n.__('login-wrong-user')))

        // Check if password is correct
        if (!user.validPassword(password))
          return done(null, false, req.flash('error', req.i18n.__('login-wrong-pass')))

        // Check user privilege level
        settings.forEach(function (set) {
          if (set.key == 'login-level' && user && user.role > set.val)
            return done(null, false, req.flash('error', req.i18n.__('login-level-disabled')))
          if (set.key == 'login-local' && set.val == 'false')
            return done(null, false, req.flash('error', req.i18n.__('login-local-disabled')))
        })

        // Return successful user
        return done(null, user)
      })
    })
  }))


  // LOCAL SIGNUP
  passport.use('local-signup', new LocalStrategy({
    usernameField     : 'email',
    passwordField     : 'password',
    passReqToCallback : true

  }, function(req, email, password, done) {
    process.nextTick(function() {
      Settings.find({'key': /login-.*/}, function(err, settings) {
        if (err) return done(null, false, req.flash('error', err))

        User.findOne({'local.email': email}, function(err, user) {
          if (err) return done(null, false, req.flash('error', err))

          // Check if signup is enabled
          settings.forEach(function (set) {
            if (set.key == 'login-signup' && set.val == 'false')
              return done(null, false, req.flash('error', req.i18n.__('login-signup-disabled')))
          })

          // Check if there is another user with that email
          if (user) {
            return done(null, false, req.flash('error', req.i18n.__('login-wrong-email')))

          // Create new user
          } else {
            var newUser = new User()
            newUser.local.email    = email
            newUser.local.password = newUser.generateHash(password)

            newUser.save(function(err) {
              if (err) throw err
              return done(null, newUser)
            })
          }

        })
      })
    })
  }))

  // Add social login if available and needed
  if ('wouso-social-login' in config.modules)
    require('wouso-social-login').social(app, passport)
}
