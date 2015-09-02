module.exports = function (app) {

  var mongoose = require('mongoose')
  var qotd     = mongoose.model('Qotd')
  var QOption  = mongoose.model('QOption')
  var settings = mongoose.model('Settings')
  var Tag      = mongoose.model('Tag')
  var Badges   = mongoose.model('Badge')
  var util     = require('util')
  var fs       = require('fs')


  app.get('/qotd', function (req, res, next) {
    _self = {}
    qotd.find().exec(gotQuestions)

    function gotQuestions(err, all) {
      if (err) return next(err)

      _self.questions = all
      Tag.find({'type': 'qotd'}).exec(gotTags)
    }

    function gotTags(err, tags) {
      if (err) return next(err)

      _self.qtags = tags
      settings.find().exec(gotSettings)
    }

    function gotSettings(err, settings) {
      if (err) return next(err)

      mysettings = {}
      settings.forEach(function(option) {
        mysettings[option.key] = option.val
      })

      res.render('qotd', {
        'questions'  : _self.questions,
        'mysettings' : mysettings,
        'qtags'       : _self.qtags,
        'user'       : req.user
      })
    }
  })


  app.post('/api/qotd/settings', function (req, res, next) {
    for (var key in req.body) {
      query = {'key': 'qotd-' + key}
      update = {$set: {'val': req.body[key]}}
      settings.update(query, update, {upsert: true}).exec()
    }

    res.redirect('/qotd')
  })


  app.get('/api/qotd/list/:perPage/:page', function (req, res, next) {
    _self = {}
    show = req.params.perPage
    skip = (req.params.page - 1) * show

    query = {}
    if (req.query.id) query['_id'] = req.query.id
    if (req.query.tags) query['tags'] = {$in: req.query.tags.split(',')}

    _self.query = query
    qotd.find(query).skip(skip).limit(show).exec(gotQotd)

    function gotQotd(err, all) {
      if (err) return next(err)

      _self.questions = all
      Tag.find({'type': 'qotd'}).exec(gotTags)
    }

    function gotTags(err, tags) {
      // Replace tag ids with tag names
      _self.questions.forEach(function(q) {
        tags.forEach(function(tag) {
          var i = q.tags.indexOf(tag._id)
          if (i > -1) {
            q.tags[i] = tag.name
          }
        })
      })

      qotd.count(_self.query).exec(gotCount)
    }

    function gotCount(err, count) {
      response = {}
      response.questions = _self.questions
      response.count = count
      res.send(response)
    }
  })


  app.get('/api/qotd/list/dates', function (req, res, next) {
    qotd.find().select({'date': 1, '_id': 0}).exec(function (err, dates) {
      if (err) return next(err)

      dates_list = []
      dates.forEach(function(qotd) {
        if (qotd.date)
          dates_list.push(qotd.date.toISOString())
      })
      res.send(dates_list)
    })
  })


  app.get('/api/qotd/play', function (req, res, next) {

    start = new Date().setHours(0,0,0,0)
    end = new Date().setHours(23,59,59,999)

    qotd.find({'date': {$gte: start, $lt: end}}).exec(function (err, today) {

      // Update qotd-streak
      query = {
        'name'           : 'qotd-streak',
        'history.userId' : req.user._id
      }
      Badges.findOne(query).exec(function(err, user) {
        if (!user) {
          // Init user to badge db
          query = {'name': 'qotd-streak'}
          update = {$push: {'history': {
            'userId'      : req.user._id,
            'count'       : 1,
            'lastUpdate'  : Date.now(),
            'data'        : ''
          }}}
          Badges.update(query, update, {upsert: true}).exec(function (err, update) {
            if (err) console.log('Could not init badge')
          })
        } else {
          // Increment badge count
          query = {'name': 'qotd-streak', 'history.userId': req.user._id}
          update = {$inc: {'history.$.count': 1}}
          Badges.update(query, update, {upsert: true}).exec(function (err, update) {
            if (err) console.log('Could not increment badge count')
          })
        }
      })

      if (!req.user)
        return res.send('Login')

      if (!today.length)
        return res.send('No question for today.')

      sent = false
      today.forEach(function (question) {
        // Convert result from mongoose object to JSON
        question = question.toJSON()

        // Check if user already saw a question and deliver the same one
        if (!sent && question.viewers.indexOf(req.user._id.toString()) > -1) {
          sent = true
          res.send(shuffleAnswers(question))
        }

        // User answered (right or wrong)
        if (!sent && ((question.right_ppl.indexOf(req.user._id.toString()) > -1)
          || (question.wrong_ppl.indexOf(req.user._id.toString())) > -1)) {
          sent = true

          // Add right answers and send
          question['answer'] = []
          question.choices.forEach(function(ans) {
            if (ans.val == true) question['answer'].push(ans.text)
          })
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
      question.choices.forEach(function(ans) {
        answers.push(ans.text)
      })
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
      if (err) return next(err)

      var update = {}
      var right = wrong = rightCount = 0
      // Checkif user has viewed the question
      if (question.viewers.indexOf(req.user._id) > -1) {
        if (req.body.ans) {
          question.choices.forEach(function(ans) {
            if (ans.val == true) rightCount++

            if (req.body.ans.indexOf(ans.text) > -1) {
              right++
            } else {
              wrong++
            }
          })
        }

        // Check answers
        if (right == rightCount) {
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

    options = []
    for (i in req.body.answer) {
      validity = false
      // Ignore empty answers
      if (req.body.answer[i] != '') {
        if (req.body.valid[i] == 'true') validity = true

        options.push(new QOption({
          'text' : req.body.answer[i],
          'val'  : validity
        }))
      }
    }

    // Format received date
    if (req.body.date)
      formatted_date = util.format('%d.%d.%d',
        req.body.date.split('/')[1],
        req.body.date.split('/')[0],
        req.body.date.split('/')[2]
      )
    else
      formatted_date = null

    // Get tags
    tags = req.body.tags.split(' ')
    Tag.find({'name': {$in: tags}, 'type': 'qotd'}).exec(gotTags)

    function gotTags(err, all) {
      tag_ids = []
      all.forEach(function(tag) {
        // Increment tag count
        Tag.update({'_id': tag._id}, {$inc: {'count': 1}}).exec(function (err) {
          if (err) return next(err)
        })

        // Save to list
        tag_ids.push(tag._id)
      })

      new_qotd = {
        'question'  : req.body.question,
        'choices'   : options,
        'date'      : formatted_date,
        'tags'      : tag_ids
      }

      // If id is provided, we are in edit mode; else we create a new object
      if (req.body.id) {
        qotd.update({'_id': req.body.id}, new_qotd, {upsert: true}).exec(qotdSaved)
      } else {
        new qotd(new_qotd).save(qotdSaved)
      }
    }

    function qotdSaved(err) {
      if (err) return next(err)
      res.redirect('/qotd')
    }
  })

}