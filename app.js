var fs           = require('fs')
var express      = require('express')
var mongoose     = require('mongoose')
var bodyParser   = require('body-parser')
var cookieParser = require('cookie-parser')
var exprSession  = require('express-session')
var app = module.exports = express()

// Read config file
var data = (JSON.parse(fs.readFileSync('./config.json', 'utf8')))

// List of enabled and available modules
var available_modules = []

// Used theme
var used_theme = null
for (theme in data.themes) {
  if (data.themes[theme])
    used_theme = theme
}

// Connect to database
var configDB = require('./config/database.js')
mongoose.connect(configDB.url)


// Ensure superuser exists
var User = require('./config/models/user')
// Get first superuser from config dict
root = Object.keys(data.superuser)[0]
pass = data.superuser[root]
// Add to users collection only if does not already exist
User.findOne({'local.username': root}).exec(function(err, him) {
  if (!him) new User({'local.username': root, 'password': pass}).save()
})


// Load enabled modules
for (module in data.modules) {
  if (data.modules[module]) {
    // Build list of enabled modules
    available_modules.push(module)
    // Load module shema
    require(module + '/model.js')
    // Load module routes
    require(module)(app)
  }
}

// Load theme routes
views_dir = './themes/' + used_theme + '/routes'
var views = fs.readdirSync(views_dir);
for (i in views) {
  view = views_dir + '/' + views[i]
  require(view)(app)
}


// PATCH to used multiple view directories in express 3.0
// URL: http://stackoverflow.com/questions/11315351/multiple-view-paths-on-node-js-express
function enable_multiple_view_folders() {
    // Monkey-patch express to accept multiple paths for looking up views.
    // this path may change depending on your setup.
    var View = require("./node_modules/express/lib/view"),
        lookup_proxy = View.prototype.lookup;

    View.prototype.lookup = function(viewName) {
        var context, match;
        if (this.root instanceof Array) {
            for (var i = 0; i < this.root.length; i++) {
                context = {root: this.root[i]};
                match = lookup_proxy.call(context, viewName);
                if (match) {
                    return match;
                }
            }
            return null;
        }
        return lookup_proxy.call(this, viewName);
    };
}
enable_multiple_view_folders();


// Configure app
app.set('views', ['views', 'themes/' + used_theme + '/views'])
app.set('view engine', 'jade')
app.set('modules', available_modules)
app.set('theme', used_theme)

app.use(exprSession({
  cookie: { maxAge: 1800000 }, //30 min
  secret: 'mySecretKey',
  resave: true,
  saveUninitialized: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/modules'))
app.use(express.static(__dirname + '/themes'))


// Configuring Passport
var passport = require('passport')
require('./config/passport')(passport)
app.use(passport.initialize())
app.use(passport.session())


// LOCAL SIGNUP
app.post('/login',
  passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
  }))

app.post('/signup',
  passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }))

// FACEBOOK LOGIN
app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope : 'email'
  }))

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

app.get('/connect/facebook',
  passport.authorize('facebook', {
    scope : 'email'
  }))

// handle the callback after facebook has authorized the user
app.get('/connect/facebook/callback',
  passport.authorize('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


// TWITTER LOGIN
app.get('/auth/twitter',
  passport.authenticate('twitter', {
    scope : 'email'
  }))

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

app.get('/connect/twitter',
  passport.authorize('twitter', {
    scope : 'email'
  }))

app.get('/connect/twitter/callback',
  passport.authorize('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


// GOOGLE LOGIN
app.get('/auth/google',
  passport.authenticate('google', {
    scope : 'email'
  }))

app.get('/auth/google/callback',
  passport.authenticate('google', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

app.get('/connect/google',
  passport.authorize('google', {
    scope : 'email'
  }))

app.get('/connect/google/callback',
  passport.authorize('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


// GITHUB LOGIN
app.get('/auth/github',
  passport.authenticate('github', {
    scope : 'email'
  }))

app.get('/auth/github/callback',
  passport.authenticate('github', {
      successRedirect : '/profile',
      failureRedirect : '/login'
  }))

app.get('/connect/github',
  passport.authorize('github', {
    scope : 'email'
  }))

app.get('/connect/github/callback',
  passport.authorize('github', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }))


app.get('/signup', function(req, res) {
  res.render('signup')
})

// route for logging out
app.get('/logout', function(req, res) {
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


// Base routes
app.get('/', function (req, res, next) {
  User.find().exec(function (err, users) {
    res.render('index', {
      modules: Object.keys(data.modules),
      users:   users
    })
  })
})


app.use(app.router)

// 404 page
app.use(function(req, res, next){
  res.status(404).type('txt').send('Not found')
})


// Launch server
app.listen(process.env.PORT || 3000, function() {
  console.log('Server listening on port 3000.')
})
