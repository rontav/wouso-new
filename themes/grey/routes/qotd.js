module.exports = function (app) {

  var qotd = require('mongoose').model('Qotd')

  app.get('/qotd', function (req, res, next) {
    qotd.find().exec(function (err, all) {
      res.render('qotd', {
        questions: all
      });
    })
  })

}