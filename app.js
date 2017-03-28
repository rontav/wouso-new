require('newrelic');

var fs            = require('fs');
var express       = require('express');
var bodyParser    = require('body-parser');
var exprSession   = require('express-session');
var mongoose      = require('mongoose');
var passport      = require('passport');
var favicon       = require('serve-favicon');
var flash         = require('connect-flash');

var log           = require('./core/logging')('core');

var app = module.exports = express();


var config = require('./config.js');

// List of enabled and available modules and games
var available_games = [];
var available_modules = [];

// Used theme
var used_theme = null;
for (var theme in config.themes) {
  if (config.themes[theme]) {
    used_theme = theme;
  }
}

// Init db connection
var configDB = require('./config/database.js');
// Skip mongoose deprication warning on startup:
// Mongoose: mpromise (mongoose's default promise library) is deprecated, plug
// in your own promise library instead: http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;
mongoose.connection.on('error', configDB.check);
mongoose.connect(config.mongodb.link);


// Require db schemas
var Settings = require('./config/models/settings');
var Tag      = require('./config/models/tag');
var Badges   = require('./config/models/badges');

// Ensure superuser exists
var User = require('./config/models/user');
// Get first superuser from config dict
var root = Object.keys(config.superuser)[0];
var pass = config.superuser[root];
// Add to users collection only if does not already exist
var update = { $set: {
  'role'           : 0,
  'local.username' : 'root',
  'local.email'    : root,
  'local.password' : new User().generateHash(pass)
}}
User.update({'local.email': root}, update, {upsert: true}).exec(function() {})
// Enable local login by default
Settings.findOne({'key': 'login-local'}).exec(function (err, num) {
  if (!num) new Settings({
    'key': 'login-local',
    'val': true
  }).save()
})

// Add test accounts in development or testing
if (process.env.NODE_ENV != 'development' || process.env.NODE_ENV != 'testing') {
  require('./core/demo.js');
}

// Configuring Passport
require('./core/auth')(app, passport)

// Init badges
query = {'name': 'qotd-streak'}
update = {$set: {'levels': [{
  'name'   : 'I',
  'limit'  : 5
}, {
  'name'   : 'II',
  'limit'  : 20
}]}}
Badges.update(query, update, {upsert: true}).exec(function (err) {
  if (err) log.error('Could not init badges.')
})


app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(flash())
app.use(bodyParser.json())
app.use('/public',  express.static(__dirname + '/public'))
app.use('/modules', express.static(__dirname + '/modules'))
app.use('/theme',  express.static(__dirname + '/node_modules/' + used_theme))
app.use(favicon('public/img/favicon.ico'))
app.use(exprSession({
  secret            : config.secret,
  name              : "mycookie",
  resave            : true,
  saveUninitialized : true,
  cookie: {
    secure: false,
    maxAge: 1800000 //30 min
  }
}))
app.use(passport.initialize())
app.use(passport.session())


// Localization
var i18n = require('i18n-2')
i18n.expressBind(app, {
  // setup some locales
  locales: ['ro', 'en'],
  // set the default locale
  defaultLocale: 'en',
  // set location
  directory: './node_modules/' + used_theme + '/locales',
  extension: '.json',
  // do not automatically resolve unknown strings
  devMode: false
})


// Store available views
// Views in the themes directory have the highest priority and can overwrite
// core or module views
views = ['views', './node_modules/' + used_theme + '/views']


// Auto login with dummy user in development if 'login'
// argument is provided
app.use(function (req, res, next) {
  if (req.app.get('env') == 'development' && process.argv[2] == 'login') {
    req.user = {
      '_id':  '000000000000000000000000',
      'name': 'Dev User',
      'email': 'user@user.com',
      'role': 0,
      'facebook': {
        'id': 0
      },
      'twitter': {
        'id': 0
      },
      'google': {
        'id': 0
      },
      'github': {
        'id': 0
      },
      'local': {
        'email': 'user@user.com'
      }
    }
  }

  return next()
})

app.use(function (req, res, next) {
  log.debug(req.method + ' ' + req.url)

  // Save selected role to session
  if (req.query.role) {
    req.session.ROLE = req.query.role
  }

  // Transfer vars to view
  res.locals.ROLE = req.session.ROLE
  res.locals.URL = req.url.split('?')[0]

  // Set preferred locale
  req.i18n.setLocale(req.config.language)

  next()
})

// Load enabled games
for (game in config.games) {
  if (config.games[game]) {
    // Build list of enabled modules
    available_games.push(game)

    // Load module shema, if exists
    // Modules such as wouso-social-login do not provide any shema
    try {
      require(game + '/model.js')
    } catch (err) {}

    // Load module routes
    app.use(require(game + '/routes.js'))
    // Load module views
    views.push('node_modules/' + game)
  }
}

// Load enabled modules
for (module in config.modules) {
  if (config.modules[module]) {
    // Build list of enabled modules
    available_modules.push(module)

    // Load module shema, if exists
    // Modules such as wouso-social-login do not provide any shema
    try {
      require(module + '/model.js')
    } catch (err) {}

    // Load module routes
    app.use(require(module + '/routes.js'))
    // Load module views
    views.push('node_modules/' + module)
  }
}

// Load core routes
var routes_dir = './routes'
var routes = fs.readdirSync(routes_dir);
for (var i in routes) {
  var route = routes_dir + '/' + routes[i]
  // Load middleware in the end
  if (route != './routes/base.js')
    app.use(require(route))
}


// Load middleware
app.use(require('./routes/base'))


// Set app settings
app.set('views', views)
app.set('view engine', 'pug')
app.set('modules', available_modules)
app.set('games', available_games)
app.set('theme', used_theme)
// Pretty print html rendered with Jade
app.locals.pretty = true

// Launch server
if (process.env.NODE_ENV != 'testing') {
  server = app.listen(process.env.PORT || 4000, function() {
    log.notice('Server listening on port 4000')
  })
}
