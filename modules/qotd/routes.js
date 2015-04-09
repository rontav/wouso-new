module.exports = function (app) {

  var mongoose = require('mongoose')
  var qotd     = mongoose.model('Qotd')
  var settings = mongoose.model('Settings')
  var util     = require('util')


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


  app.post('/api/qotd/settings', function (req, res, next) {
    query = {'key': 'qotd-defaultNoOfAns'}
    update = {$set: {'val': req.body.defaultNoOfAns}}
    settings.update(query, update, {upsert: true}).exec()

    res.redirect('/qotd')
  })


  app.get('/api/qotd/list', function (req, res, next) {
    qotd.find().exec(function (err, all) {
      res.send(all)
    })
  })


  app.get('/api/qotd/list/dates', function (req, res, next) {
    qotd.find().select({'date': 1, '_id': 0}).exec(function (err, dates) {
      dates_list = []
      dates.forEach(function(qotd) {
        dates_list.push(qotd.date.toISOString())
      })
      res.send(dates_list)
    })
  })


  app.get('/api/qotd/play', function (req, res, next) {

    start = new Date().setHours(0,0,0,0)
    end = new Date().setHours(23,59,59,999)

    qotd.find({'date': {$gte: start, $lt: end}}).exec(function (err, today) {

      if (!req.user)
        return res.send('Login')

      sent = false
      today.forEach(function (question) {
        // Convert result from mongoose object to JSON
        question = question.toJSON()

        // Check if user already saw a question and deliver the same one
        if (!sent && question.viewers.indexOf(req.user._id.toString()) > -1) {
          sent = true
          res.send(shuffleAnswers(question))
        }

        if (!sent && ((question.right_ppl.indexOf(req.user._id.toString()) > -1)
          || (question.wrong_ppl.indexOf(req.user._id.toString())) > -1)) {
          sent = true

          // Add right answer and send
          question['answer'] = question.answers.right[0]
          res.send(shuffleAnswers(question))
        }
      })

      if (!sent && today.length) {
        // Else, choose a random question from today's poll
        rand = Math.floor(Math.random() * today.length)
        // Update question viewer
        qotd.update({'_id': today[rand]._id}, {$addToSet: {'viewers': req.user._id}}).exec()

        res.send(shuffleAnswers(today[rand]))
      }
    })

    function shuffleAnswers(question) {
      // Process question answers
      answers = []
      answers = answers.concat(question.answers.wrong)
      answers = answers.concat(question.answers.right)
      // Shuffle answers
      answers = answers.sort(function() { return 0.5 - Math.random() })
      question.answers = answers

      return question
    }
  })


  app.post('/api/qotd/play', function (req, res, next) {
    ObjectId = mongoose.Types.ObjectId
    qotd.findOne({'_id': ObjectId.fromString(req.body.question_id)}).exec(gotQuestion)

    function gotQuestion(err, question) {
      update = {}
      // Checkif user has viewed the question
      if (question.viewers.indexOf(req.user._id) > -1) {
        // Check answer
        if (question.answers.right[0] == req.body.ans) {
          update = {$addToSet: {'right_ppl': req.user._id}, $pull: {'viewers': req.user._id}}
        } else {
          update = {$addToSet: {'wrong_ppl': req.user._id}, $pull: {'viewers': req.user._id}}
        }

        // Remove from viewers and add to corresponding category
        qotd.update({'_id': ObjectId.fromString(req.body.question_id)}, update).exec()
        res.redirect('/qotd')
      } else {
        res.redirect('/qotd')
      }
    }
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