var LocalStrategy    = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var TwitterStrategy  = require('passport-twitter').Strategy
var GoogleStrategy   = require('passport-google-plus')
var GitHubStrategy   = require('passport-github').Strategy
var util             = require('util')


var DEFAULT_ROUTE = 'http://%s/wouso-social-login/auth/%s/callback'

// load up the user model
var User = require('./models/user')
// load up the settings
var Settings = require('./models/settings')


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


  // FACEBOOK
  passport.use(new FacebookStrategy({
    clientID          : app.data.credentials.facebook.clientID,
    clientSecret      : app.data.credentials.facebook.clientSecret,
    callbackURL       : util.format(DEFAULT_ROUTE, app.data.hostname, 'facebook'),
    passReqToCallback : true

  }, function(req, token, refreshToken, profile, done) {
    process.nextTick(function() {
      Settings.find({'key': /login-.*/}, function (err, settings) {
        if (err) return done(null, false, req.flash('error', err))

        User.findOne({'facebook.id': profile.id}, function(err, user) {
          if (err) return done(null, false, req.flash('error', err))

          // Check user privilege and if login is enabled
          settings.forEach(function (set) {
            if (set.key == 'login-level' && user && user.role > set.val)
              return done(null, false, req.flash('error', req.i18n.__('login-level-disabled')))
            if (set.key == 'login-fb' && set.val == 'false')
              return done(null, false, req.flash('error', req.i18n.__('login-fb-disabled')))
          })

          // User is not logged in, but found in db
          if (!req.user && user) {
            user.facebook.token = token
            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName
            user.facebook.email = profile.emails[0].value

            user.save(function(err) {
              if (err)
                log.error('Could not login Facebook user.')
            })

          // User is not logged in and not found in db
          } else if (!req.user && !user) {
            user                = new User()
            user.facebook.id    = profile.id
            user.facebook.token = token
            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName
            user.facebook.email = profile.emails[0].value

            user.save(function(err) {
              if (err)
                log.error('Could not register new Facebook user.')
            })

          // User is logged in and connected an account
          } else {

            // If that accound was already in db, remove it and add detailes to the new one
            if (user) User.remove({'_id': user._id}).exec()

            user                = req.user
            user.facebook.id    = profile.id
            user.facebook.token = token
            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName
            user.facebook.email = profile.emails[0].value

            user.save(function(err) {
              if (err)
                log.error('Could not connect Facebook user.')
            })
          }

          // Return one happy user
          return done(null, user)
        })
      })
    })
  }))


  // TWITTER
  passport.use(new TwitterStrategy({
    consumerKey       : app.data.credentials.twitter.clientID,
    consumerSecret    : app.data.credentials.twitter.clientSecret,
    callbackURL       : util.format(DEFAULT_ROUTE, app.data.hostname, 'twitter'),
    passReqToCallback : true

  }, function(req, token, tokenSecret, profile, done) {
    process.nextTick(function() {
      Settings.find({'key': /login-.*/}, function (err, settings) {
        if (err) return done(null, false, req.flash('error', err))

        User.findOne({'twitter.id': profile.id}, function(err, user) {
          if (err) return done(null, false, req.flash('error', err))

          // Check user privilege and if login is enabled
          settings.forEach(function (set) {
            if (set.key == 'login-level' && user && user.role > set.val)
              return done(null, false, req.flash('error', req.i18n.__('login-level-disabled')))
            if (set.key == 'login-tw' && set.val == 'false')
              return done(null, false, req.flash('error', req.i18n.__('login-tw-disabled')))
          })

          // User is not logged in, but found in db
          if (!req.user && user) {
            user.twitter.token       = token
            user.twitter.username    = profile.username
            user.twitter.displayName = profile.displayName

            user.save(function(err) {
              if (err)
                log.error('Could not login Twitter user.')
            })

          // User is not logged in and not found in db
          } else if (!req.user && !user) {
            user                     = new User()
            user.twitter.id          = profile.id
            user.twitter.token       = token
            user.twitter.username    = profile.username
            user.twitter.displayName = profile.displayName

            user.save(function(err) {
              if (err)
                log.error('Could not register new Twitter user.')
            })

          // User is logged in and connected an account
          } else {

            // If that accound was already in db, remove it and add detailes to the new one
            if (user) User.remove({'_id': user._id}).exec()

            user                     = req.user
            user.twitter.id          = profile.id
            user.twitter.token       = token
            user.twitter.username    = profile.username
            user.twitter.displayName = profile.displayName

            user.save(function(err) {
              if (err)
                log.error('Could not connect Twitter user.')
            })
          }

          // Return one happy user
          return done(null, user)
        })
      })
    })
  }))


  // GOOGLE
  passport.use(new GoogleStrategy({
    clientId          : app.data.credentials.google.clientID,
    clientSecret      : app.data.credentials.google.clientSecret,
    callbackURL       : util.format(DEFAULT_ROUTE, app.data.hostname, 'google'),
    passReqToCallback : true

  }, function(req, tokens, profile, done) {
    process.nextTick(function() {
      Settings.find({'key': /login-.*/}, function (err, settings) {
        if (err) return done(null, false, req.flash('error', err))

        User.findOne({'google.id': profile.id}, function(err, user) {
          if (err) return done(null, false, req.flash('error', err))

          // Check user privilege and if login is enabled
          settings.forEach(function (set) {
            if (set.key == 'login-level' && user && user.role > set.val)
              return done(null, false, req.flash('error', req.i18n.__('login-level-disabled')))
            if (set.key == 'login-gp' && set.val == 'false')
              return done(null, false, req.flash('error', req.i18n.__('login-gp-disabled')))
          })

          // User is not logged in, but found in db
          if (!req.user && user) {
            user.google.token  = tokens.access_token
            user.google.name   = profile.displayName
            user.google.email  = profile.email
            user.google.avatar = profile.image.url.split('?')[0]

            user.save(function(err) {
              if (err)
                log.error('Could not login Google user.')
            })

          // User is not logged in and not found in db
          } else if (!req.user && !user) {
            user               = new User()
            user.google.id     = profile.id
            user.google.token  = tokens.access_token
            user.google.name   = profile.displayName
            user.google.email  = profile.email
            user.google.avatar = profile.image.url.split('?')[0]

            user.save(function(err) {
              if (err)
                log.error('Could not register new Google user.')
            })

          // User is logged in and connected an account
          } else {

            // If that accound was already in db, remove it and add detailes to the new one
            if (user) User.remove({'_id': user._id}).exec()

            user               = req.user
            user.google.id     = profile.id
            user.google.token  = tokens.access_token
            user.google.name   = profile.displayName
            user.google.email  = profile.email
            user.google.avatar = profile.image.url.split('?')[0]

            user.save(function(err) {
              if (err)
                log.error('Could not connect Google user.')
            })
          }

          // Return one happy user
          return done(null, user)
        })
      })
    })
  }))


  // GITHUB
  passport.use(new GitHubStrategy({
    clientID          : app.data.credentials.github.clientID,
    clientSecret      : app.data.credentials.github.clientSecret,
    callbackURL       : util.format(DEFAULT_ROUTE, app.data.hostname, 'github'),
    passReqToCallback : true

  }, function(req, token, refreshToken, profile, done) {
    process.nextTick(function() {
      Settings.find({'key': /login-.*/}, function (err, settings) {
        if (err) return done(null, false, req.flash('error', err))

        User.findOne({'github.id': profile.id}, function(err, user) {
          if (err) return done(null, false, req.flash('error', err))

          // Check user privilege and if login is enabled
          settings.forEach(function (set) {
            if (set.key == 'login-level' && user && user.role > set.val)
              return done(null, false, req.flash('error', req.i18n.__('login-level-disabled')))
            if (set.key == 'login-gh' && set.val == 'false')
              return done(null, false, req.flash('error', req.i18n.__('login-gh-disabled')))
          })

          // User is not logged in, but found in db
          if (!req.user && user) {
            user.github.id          = profile.id
            user.github.token       = token
            user.github.username    = profile.username
            user.github.name        = profile.displayName
            user.github.email       = profile.emails[0].value

            user.save(function(err) {
              if (err)
                log.error('Could not login GitHub user.')
            })

          // User is not logged in and not found in db
          } else if (!req.user && !user) {
            user                    = new User()
            user.github.id          = profile.id
            user.github.token       = token
            user.github.username    = profile.username
            user.github.name        = profile.displayName
            user.github.email       = profile.emails[0].value

            user.save(function(err) {
              if (err)
                log.error('Could not register new GitHub user.')
            })

          // User is logged in and connected an account
          } else {

            // If that accound was already in db, remove it and add detailes to the new one
            if (user) User.remove({'_id': user._id}).exec()

            user                    = req.user
            user.github.id          = profile.id
            user.github.token       = token
            user.github.username    = profile.username
            user.github.name        = profile.displayName
            user.github.email       = profile.emails[0].value

            user.save(function(err) {
              if (err)
                log.error('Could not connect GitHub user.')
            })
          }

          // Return one happy user
          return done(null, user)
        })
      })
    })
  }))

}