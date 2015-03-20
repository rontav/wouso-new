// load all the things we need
var LocalStrategy    = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var TwitterStrategy  = require('passport-twitter').Strategy
var GoogleStrategy   = require('passport-google-plus')
var GitHubStrategy   = require('passport-github').Strategy

// load up the user model
var User = require('./models/user')

// load the auth variables
var configAuth = require('./auth')

module.exports = function(passport) {

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
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({'local.email': email}, function(err, user) {
            if (err) return done(err)

            // if no user is found, return the message
            if (!user)
                return done(null, false, 'No user found.')

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, 'Oops! Wrong password.')

            // all is well, return successful user
            return done(null, user)
        })
    }))


    // LOCAL SIGNUP
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        process.nextTick(function() {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({'local.email': email}, function(err, user) {
                if (err) return done(err)

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, 'That email is already taken.')
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUser            = new User()

                    // set the user's local credentials
                    newUser.local.email    = email
                    newUser.local.password = newUser.generateHash(password)

                    // save the user
                    newUser.save(function(err) {
                        if (err) throw err
                        return done(null, newUser)
                    })
                }

            })
        })
    }))

    // FACEBOOK
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true
    },

    function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {
                User.findOne({'facebook.id' : profile.id}, function(err, user) {
                    if (err) return done(err)

                    if (user) {
                        if (!user.facebook.token) {
                            user.facebook.token = token
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName
                            user.facebook.email = profile.emails[0].value

                            user.save(function(err) {
                                if (err) throw err
                                return done(null, user)
                            })
                        }

                        return done(null, user)
                    } else {
                        // if there is no user, create them
                        var newUser            = new User()

                        newUser.facebook.id    = profile.id
                        newUser.facebook.token = token
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName
                        newUser.facebook.email = profile.emails[0].value

                        newUser.save(function(err) {
                            if (err) throw err
                            return done(null, newUser)
                        })
                    }
                })

            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user

                user.facebook.id    = profile.id
                user.facebook.token = token
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName
                user.facebook.email = profile.emails[0].value

                user.save(function(err) {
                    if (err) throw err
                    return done(null, user)
                })
            }
        })
    }))


    // TWITTER
    passport.use(new TwitterStrategy({
        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true
    },

    function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {
                User.findOne({'twitter.id' : profile.id}, function(err, user) {
                    if (err) return done(err)

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token
                            user.twitter.username    = profile.username
                            user.twitter.displayName = profile.displayName

                            user.save(function(err) {
                                if (err) throw err
                                return done(null, user)
                            })
                        }

                        return done(null, user)
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User()

                        newUser.twitter.id          = profile.id
                        newUser.twitter.token       = token
                        newUser.twitter.username    = profile.username
                        newUser.twitter.displayName = profile.displayName

                        newUser.save(function(err) {
                            if (err) throw err
                            return done(null, newUser)
                        })
                    }
                })

            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user

                user.twitter.id          = profile.id
                user.twitter.token       = token
                user.twitter.username    = profile.username
                user.twitter.displayName = profile.displayName

                user.save(function(err) {
                    if (err) throw err
                    return done(null, user)
                })
            }
        })
    }))


    // GOOGLE
    passport.use(new GoogleStrategy({
        clientId          : configAuth.googleAuth.clientID,
        clientSecret      : configAuth.googleAuth.clientSecret,
        passReqToCallback : true
    },

    function(req, tokens, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({'google.id' : profile.id}, function(err, user) {
                    if (err) return done(err)

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = tokens.access_token
                            user.google.name  = profile.displayName
                            user.google.email = profile.email
                            user.google.avatar = profile.image.url.split('?')[0]

                            user.save(function(err) {
                                if (err) throw err
                                return done(null, user)
                            })
                        }

                        return done(null, user)
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User()

                        newUser.google.id    = profile.id
                        newUser.google.token = tokens.access_token
                        newUser.google.name  = profile.displayName
                        newUser.google.email = profile.email
                        newUser.google.avatar = profile.image.url.split('?')[0]

                        newUser.save(function(err) {
                            if (err) throw err
                            return done(null, newUser)
                        })
                    }
                })

            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user

                user.google.id = profile.id
                user.google.token = tokens.access_token
                user.google.name  = profile.displayName
                user.google.email = profile.email
                user.google.avatar = profile.image.url.split('?')[0]

                user.save(function(err) {
                    if (err) throw err
                    return done(null, user)
                })
            }
        })
    }))


    // GITHUB
    passport.use(new GitHubStrategy({
        clientID          : configAuth.githubAuth.clientID,
        clientSecret      : configAuth.githubAuth.clientSecret,
        callbackURL       : configAuth.githubAuth.callbackURL,
        passReqToCallback : true,
    },

    function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {
                User.findOne({'github.id' : profile.id}, function(err, user) {
                    if (err) return done(err)

                    if (user) {
                        if (!user.github.token) {
                            user.github.id          = profile.id
                            user.github.token       = token
                            user.github.username    = profile.username
                            user.github.displayName = profile.displayName
                            user.github.email       = profile.emails[0].value

                            user.save(function(err) {
                                if (err) throw err
                                return done(null, user)
                            })
                        }

                        return done(null, user)
                    } else {
                        var newUser = new User()

                        newUser.github.id          = profile.id
                        newUser.github.token       = token
                        newUser.github.username    = profile.username
                        newUser.github.displayName = profile.displayName
                        newUser.github.email       = profile.emails[0].value

                        newUser.save(function(err) {
                            if (err) throw err
                            return done(null, newUser)
                        })
                    }
                })

            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user

                user.github.id          = profile.id
                user.github.token       = token
                user.github.username    = profile.username
                user.github.displayName = profile.displayName
                user.github.email       = profile.emails[0].value

                user.save(function(err) {
                    if (err) throw err
                    return done(null, user)
                })
            }
        })
    }))

}