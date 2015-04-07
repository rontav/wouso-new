module.exports = function (app) {

  var qotd = require('mongoose').model('Qotd')
  var settings = require('mongoose').model('Settings')

  app.get('/qotd', function (req, res, next) {
    _self = {}
    qotd.find().exec(gotQuestions)

    function gotQuestions(err, all) {
      _self.questions = all
      settings.find().exec(gotSettings)
    }

    function gotSettings(err, settings) {
      mysettings = {}
      settings.forEach(function(option) {
        mysettings[option.key] = option.val;
      })

      res.render('qotd', {
        'questions'  : _self.questions,
        'mysettings' : mysettings,
        'user'       : req.user
      })
    }
  })
}