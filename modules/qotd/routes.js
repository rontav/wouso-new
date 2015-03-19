module.exports = function (app) {
  var qotd = require('mongoose').model('Qotd')

  app.get('/api/qotd/list', function (req, res, next) {
    qotd.find().exec(function (err, all) {
      res.send(all);
    })
  })

  app.post('/api/qotd/add', function (req, res, next) {

    console.log(req.body)

    final_answers = {'right': [], 'wrong': []}
    for (i in req.body.answer)
      if (i == req.body.valid)
        final_answers.right.push(req.body.answer[i])
      else
        final_answers.wrong.push(req.body.answer[i])

    new qotd ({
      question: req.body.question,
      answers: final_answers
    }).save()

    res.redirect('/qotd');
  })

}