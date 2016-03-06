var express  = require('express');
var mongoose = require('mongoose');

var QuestQ = mongoose.model('QuestQ');
var Tag    = mongoose.model('Tag');

var router  = express.Router();


router.get('/wouso-quest', function (req, res, next) {
  res.render('wouso-quest', {});
});

router.post('/api/wouso-quest/add', function (req, res, next) {
  // Get tags
  tags = req.body.tags.split(' ')
  Tag.find({'name': {$in: tags}, 'type': 'wouso-quest'}).exec(gotTags)

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

    new_questq = {
      'question' : req.body.question,
      'answer'   : req.body.answer,
      'hint1'    : req.body.hint1,
      'hint2'    : req.body.hint2,
      'hint3'    : req.body.hint3,
      'tags'     : tag_ids
    }

    // If id is provided, we are in edit mode; else we create a new object
    if (req.body.id) {
      QuestQ
      .update({'_id': req.body.id}, new_questq, {upsert: true})
      .exec(questqSaved)
    } else {
      new QuestQ(new_questq).save(questqSaved)
    }
  }

  function questqSaved(err) {
    if (err) return next(err)
    res.redirect('/wouso-quest')
  }
})


router.get('/api/wouso-quest/list', function (req, res, next) {
  if (!req.query.id) return res.send({})

  _self = {}
  QuestQ.findOne({_id: req.query.id}).exec(gotQuestQ);

  function gotQuestQ(err, quest) {
    _self.quest = quest;
    Tag.find({'type': 'wouso-quest'}).exec(gotTags);
  }

  function gotTags(err, tags) {
    // Replace tag ids with tag names
    tags.forEach(function(tag) {
      var i = _self.quest.tags.indexOf(tag._id);
      if (i > -1) {
        _self.quest.tags[i] = tag.name;
      }
    })
    res.send(_self.quest);
  }
})


router.get('/api/wouso-quest/list/:perPage/:page', function (req, res, next) {
  _self = {}
  show = req.params.perPage
  skip = (req.params.page - 1) * show

  query = {}
  if (req.query.id) query['_id'] = req.query.id
  if (req.query.tags) query['tags'] = {$in: req.query.tags.split(',')}
  if (typeof req.query.search !== 'undefined')
    query['question'] = { '$regex': req.query.search, '$options': 'i' }

  _self.query = query
  QuestQ.find(query).skip(skip).limit(show).exec(gotQuestQ)

  function gotQuestQ(err, all) {
    if (err) return next(err)

    _self.questions = all
    Tag.find({'type': 'wouso-quest'}).exec(gotTags)
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

    QuestQ.count(_self.query).exec(gotCount)
  }

  function gotCount(err, count) {
    response = {}
    response.questions = _self.questions
    response.count = count
    res.send(response)
  }
})


module.exports = router;
