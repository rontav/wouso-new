module.exports = function (app) {
  var User     = require('../config/models/user')
  var fs       = require('fs')

  // This must be loaded first
  // Transfer variables to view
  app.use(function(req, res, next) {
    // Save selected role to session
    if (req.query.role) {
      req.session.ROLE = req.query.role
    }

    // Transfer vars to view
    res.locals.ROLE = req.session.ROLE
    res.locals.URL = req.url.split('?')[0]

    // Merge core locales with module locales, for current module page
    var current_module = req.url.split('/')[1]
    if (app.get('modules').indexOf(current_module) > -1) {
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
    req.i18n.setLocale('en')

    next()
  })

  app.get('/', function (req, res, next) {
    User.find().exec(function (err, users) {
      if (err) return next(err)

      res.render('index', {
        'users'   : users
      })
    })
  })

  // 404 page
  app.use(function(req, res, next){
    res.status(404).type('txt').send('Not found')
  })

  // Error handling middleware
  app.use(function(err, req, res, next) {
    if (err) {
      log.error(err.stack)
      res.status(500).send('Something went wrong')
    }
  })
}
