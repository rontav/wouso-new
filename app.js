var fs       = require('fs');
var express  = require('express');
var mongoose = require('mongoose')
var app = module.exports = express();

// Read config file
var data = (JSON.parse(fs.readFileSync("./config.json", "utf8")));

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
mongoose.connect(configDB.url);


// Ensure superuser exists
var User = require('./config/models/user')
// Get first superuser from config dict
root = Object.keys(data.superuser)[0]
pass = data.superuser[root]
// Add to users collection only if does not already exist
User.findOne({'local.username': root}).exec(function(err, him) {
  if (!him) new User({'local.username': root, 'password': pass}).save()
})


// Include all mongo schemas
for (module in data.modules) {
  var schema_file = './modules/' + module + '/model.js'
  if (data.modules[module] && fs.existsSync(schema_file)) {
    available_modules.push(module)
    require(schema_file)
  }
}

// Override res.render to use views dir within called module
// As described here: https://gist.github.com/mrlannigan/5051687
app.use(function(req, res, next) {
  var render = res.render;

  res.render = function(view, options, fn) {
    var self = this,
      options = options || {},
      req = this.req,
      app = req.app,
      defaultFn;

    if ('function' == typeof options) {
      fn = options, options = {};
    }

    defaultFn = function(err, str){
      if (err) return req.next(err);
      self.send(str);
    };

    if ('function' != typeof fn) {
      fn = defaultFn;
    }

    // Raise error to get the stacktrace and find from which module
    // is res.render called. Use path of views in that module.
    var stack = new Error().stack
    var pattern = new RegExp(/.*\/themes\/(.*?)\/.*/);
    var match = stack.match(pattern)
    var view_path = view

    if (match) view_path = __dirname + '/themes/' + match[1] + '/views/' + view

    render.call(self, view_path, options, function(err, str) {
      fn(err, str);
    });
  };
  next();
});







// Configuring Passport
var passport = require('passport');
require('./config/passport')(passport)
var expressSession = require('express-session');

app.use(expressSession({
  cookie: { maxAge: 1800000 }, //30 min
  secret: 'mySecretKey',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


// FACEBOOK LOGIN
app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope : 'email'
  }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/login'
    }));

app.get('/connect/facebook',
  passport.authorize('facebook', {
    scope : 'email'
  }));

// handle the callback after twitter has authorized the user
app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));


// TWITTER LOGIN
app.get('/auth/twitter',
  passport.authenticate('twitter', {
    scope : 'email'
  }));

app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/login'
    }));

app.get('/connect/twitter',
  passport.authorize('twitter', {
    scope : 'email'
  }));

app.get('/connect/twitter/callback',
    passport.authorize('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));


// GOOGLE LOGIN
app.get('/auth/google',
  passport.authenticate('google', {
    scope : 'email'
  }));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/login'
    }));

app.get('/connect/google',
  passport.authorize('google', {
    scope : 'email'
  }));

app.get('/connect/google/callback',
    passport.authorize('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));


// GITHUB LOGIN
app.get('/auth/github',
  passport.authenticate('github', {
    scope : 'email'
  }));

app.get('/auth/github/callback',
    passport.authenticate('github', {
        successRedirect : '/profile',
        failureRedirect : '/login'
    }));

app.get('/connect/github',
  passport.authorize('github', {
    scope : 'email'
  }));

app.get('/connect/github/callback',
    passport.authorize('github', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));



// route for logging out
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}










// Configure app
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());

app.use(app.router);
app.set('modules', available_modules);
app.set('theme', used_theme)
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/modules'));
app.use(express.static(__dirname + '/themes'));


// Base routes
app.get('/', function (req, res, next) {
  User.find().exec(function (err, users) {
    res.render('index', {
      modules: Object.keys(data.modules),
      users:   users
    })
  })
})


// Import routes specified in config file
for (module in data.modules) {
  if (data.modules[module]) {

    var routes_file = './modules/' + module + '/routes.js'

    if (fs.existsSync(routes_file))
      require(routes_file)(app)
    else
      console.log('Missing module files for: ' + module)
  }
}

// Include theme routes
views_dir = './themes/' + used_theme + '/routes'
var views = fs.readdirSync(views_dir);
for (i in views) {
  view = views_dir + '/' + views[i]
  require(view)(app)
}


// 404 page
app.use(function(req, res, next){
  res.status(404).type('txt').send('Not found');
});


// Launch server
app.listen(process.env.PORT || 3000, function() {
  console.log('Server listening on port 3000.');
});
