module.exports = function (app) {
  var qotd = require('mongoose').model('Qotd')
  var settings = require('mongoose').model('Settings')
  var util = require('util')


  app.post('/api/qotd/settings', function (req, res, next) {
    query = {'key': 'qotd-defaultNoOfAns'}
    update = {$set: {'val': req.body.defaultNoOfAns}}
    settings.update(query, update, {upsert: true}).exec()

    res.redirect('/qotd')
  })

  app.get('/api/qotd/list', function (req, res, next) {
    qotd.find().exec(function (err, all) {
      res.send(all);
    })
  })

  app.post('/api/qotd/add', function (req, res, next) {

    final_answers = {'right': [], 'wrong': []}
    for (i in req.body.answer)
      // Ignore empty answers
      if (req.body.answer[i] != '') {
        if (req.body.valid[i] == 'true')
          final_answers.right.push(req.body.answer[i])
        else
          final_answers.wrong.push(req.body.answer[i])
      }


    // Format received date
    formatted_date = util.format('%d.%d.%d',
      req.body.date.split('/')[1],
      req.body.date.split('/')[0],
      req.body.date.split('/')[2]
    )

    new qotd ({
      'question'  : req.body.question,
      'answers'   : final_answers,
      'date'      : new Date(formatted_date)
    }).save()

    res.redirect('/qotd');
  })

}