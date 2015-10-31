var fs            = require('fs')
var express       = require('express')
var bodyParser    = require('body-parser')
var cookieParser  = require('cookie-parser')
var cookieSession = require('cookie-session')
var exprSession   = require('express-session')
var passport      = require('passport')
var favicon       = require('serve-favicon')
var flash         = require('connect-flash')
var app = module.exports = express()


// Set up logger
var winston = require('winston')
var log = new (winston.Logger)({
  levels: {
    crit    : 0,
    error   : 1,
    warning : 2,
    notice  : 3,
    game    : 4,
    info    : 5,
    debug   : 6
  },
  colors: {
    crit    : "red",
    error   : "red",
    warning : "yellow",
    notice  : "white",
    game    : "green",
    info    : "white",
    debug   : "white"
  },
  transports: [
    new (winston.transports.Console)({
      level: 'debug',
      colorize: true,
      timestamp: function() {
        var d = new Date()
        // Define time format
        // DD-MM-YYYY hh:mm
        return ("0" + d.getDate()).slice(-2) + "-" +
               ("0"+(d.getMonth()+1)).slice(-2) + "-" +
               d.getFullYear() + " " +
               ("0" + d.getHours()).slice(-2) + ":" +
               ("0" + d.getMinutes()).slice(-2);
      },
      formatter: function(options) {
        // Require config to use colors in custom formatter
        var config = require('winston/lib/winston/config');
        // Define custom log formater
        // [LEVEL] My log message
        var msg = '[' + options.level.toUpperCase() + '] ' +
                  (undefined !== options.message ? options.message : '') +
                  (options.meta && Object.keys(options.meta).length ? '\n\t' +
                  JSON.stringify(options.meta) : '' );

        return options.timestamp() + ' ' + config.colorize(options.level, msg)
      }
    }),
    new (winston.transports.File)({
      level: 'info',
      filename: 'main.log'
    })
  ]
})


// Read config file
app.data = (JSON.parse(fs.readFileSync('./config.json', 'utf8')))

// List of enabled and available modules and games
var available_games = []
var available_modules = []

// Used theme
var used_theme = null
for (theme in app.data.themes) {
  if (app.data.themes[theme])
    used_theme = theme
}

// Init db connection
var Mongoose = require('mongoose')
var configDB = require('./config/database.js')
Mongoose.connection.on('error', configDB.check)
// Connect to proper db
if (process.env.NODE_ENV == 'production') {
  Mongoose.connect(app.data.mongo_url.prod)
} else if (process.env.NODE_ENV == 'testing'){
  Mongoose.connect(app.data.mongo_url.test)
} else {
  Mongoose.connect(app.data.mongo_url.dev)
}


// Require db schemas
var Settings = require('./config/models/settings')
var Tag      = require('./config/models/tag')
var Badges   = require('./config/models/badges')

// Ensure superuser exists
var User = require('./config/models/user')
// Get first superuser from config dict
root = Object.keys(app.data.superuser)[0]
pass = app.data.superuser[root]
// Add to users collection only if does not already exist
update = {$set: {
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
app.use('/components', express.static(__dirname + '/node_modules/' + used_theme + '/components'))
app.use(favicon('public/img/favicon.ico'))
app.use(exprSession({
  secret            : 'MySecret',
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
  directory: 'locales',
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
      '_id':  0,
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
  log.debug(req.url)

  // Save selected role to session
  if (req.query.role) {
    req.session.ROLE = req.query.role
  }

  // Transfer vars to view
  res.locals.ROLE = req.session.ROLE
  res.locals.URL = req.url.split('?')[0]

  // Merge core locales with module locales, for current module page
  var current_module = req.url.split('/')[1].split('?')[0]

  // If current_module is api, get second argument
  if (current_module == 'api') current_module = req.url.split('/')[2].split('?')[0]
  // If current_module is not a game, skip
  if (!(current_module in app.data.games)) return next()

  if (req.app.get('games').indexOf(current_module) > -1) {
    req.i18n.locales = mergeLocales(req.i18n.locales, current_module)
  }

  function mergeLocales(locales, module) {
    // Stores merged locales
    var new_locales = {}

    for (var locale in locales) {
      var module_locales_path = './modules/' + module + '/locales/' + locale + '.json'
      var core_locales_path   = './locales/' + locale + '.json'

      var module_locales = JSON.parse(fs.readFileSync(module_locales_path, 'utf8'))
      var core_locales   = JSON.parse(fs.readFileSync(core_locales_path, 'utf8'))

      // Merge module strings with core ones
      for (var attr in module_locales)
        // Do not overwrite core locales
        if (!(attr in core_locales))
          core_locales[attr] = module_locales[attr]

      new_locales[locale] = core_locales
    }

    return new_locales
  }

  // Set preferred locale
  req.i18n.setLocale(req.app.data.language)

  next()
})

// Load enabled games
for (game in app.data.games) {
  if (app.data.games[game]) {
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
for (module in app.data.modules) {
  if (app.data.modules[module]) {
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
app.set('view engine', 'jade')
app.set('modules', available_modules)
app.set('games', available_games)
app.set('theme', used_theme)
// Pretty print html rendered with Jade
app.locals.pretty = true

// Launch server
if (process.env.NODE_ENV != 'testing') {
  server = app.listen(process.env.PORT || 4000, function() {
    log.info('Server listening on port 4000')
  })

  // Socket.io
  var io = require('socket.io').listen(server)
  io.sockets.on('connection', function(client) {
    io.sockets.emit('message', { message: 'welcome to the app' })
  })
}
