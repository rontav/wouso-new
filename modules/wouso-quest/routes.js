var express  = require('express');
var mongoose = require('mongoose');

var QuestQ = mongoose.model('QuestQ');
var Quest  = mongoose.model('Quest');
var Tag    = mongoose.model('Tag');

var log = require('../../core/logging')('wouso-quest');

var router = express.Router();

router.get('/wouso-quest', function(req, res) {
  res.render('wouso-quest', {});
});

router.post('/api/wouso-quest/add', function(req, res, next) {
  // Get tags
  var tags = req.body.tags.split(' ');
  Tag.find({name: {$in: tags}, type: 'wouso-quest'}).exec(gotTags);

  /**
  * Add Tags query response.
  * @param {int} err Request error.
  * @param {int} all Response.
  * @return {void}
  */
  function gotTags(err, all) {
    if (err) {
      return next(err);
    }

    var tagIDs = [];
    all.forEach(function(tag) {
      // Increment tag count
      Tag.update({_id: tag._id}, {$inc: {count: 1}}).exec(function(err) {
        if (err) {
          return next(err);
        }
      });

      // Save to list
      tagIDs.push(tag._id);
    });

    var newQuestQ = {
      question: req.body.question,
      quest: req.body.quest,
      answer: req.body.answer,
      hint1: req.body.hint1,
      hint2: req.body.hint2,
      hint3: req.body.hint3,
      tags: tagIDs
    };

    // If id is provided, we are in edit mode; else we create a new object
    if (req.body.id) {
      QuestQ
      .update({_id: req.body.id}, newQuestQ, {upsert: true})
      .exec(questqSaved);
    } else {
      new QuestQ(newQuestQ).save(questqSaved);
    }
  }

  /**
  * Add new Quest Question response.
  * @param {int} err Request error.
  * @return {void}
  */
  function questqSaved(err, questQ) {
    var qID = req.body.id || questQ._id;

    if (err) {
      return next(err);
    }

    // Find newly added question and update quest question list
    var query = {_id: req.body.quest};
    var update = {$push: {levels: {question: qID}}};
    Quest.update(query, update).exec(function(err) {
      if (err) {
        return next(err);
      }
    });

    // Redirect back
    res.redirect('/wouso-quest');
  }
});

router.post('/api/wouso-quest/add-quest', function(req, res, next) {
  var newQuest = {
    name: req.body.name
  };

  new Quest(newQuest).save(questSaved);

  /**
  * Add new Quest response.
  * @param {int} err Request error.
  * @return {void}
  */
  function questSaved(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/wouso-quest');
  }
});


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

router.get('/api/wouso-quest/qlist', function(req, res, next) {
  var query = {};
  var fields = {};

  if (req.query.id) {
    query._id = req.query.id;
  } else {
    fields.name = 1;
  }

  Quest.find(query, fields).exec(gotQuest);

 /**
 * Handle Quest response.
 * @param {int} err Request error.
 * @param {int} questNames Response.
 * @return {void}
 */
  function gotQuest(err, questNames) {
    if (err) {
      return next(err);
    }

    res.send(questNames);
  }
});

/**
* Get quest object, expanding included questions.
*/
router.get('/api/wouso-quest/quest', function(req, res, next) {
  var _self = {};
  var query = {};

  if (req.query.id) {
    query._id = req.query.id;
  }

  // Get lean object of the quest so we can replace question IDs with
  // question info.
  Quest.findOne(query).lean().exec(gotQuest);

 /**
 * Handle Quest response.
 * @param {int} err Request error.
 * @param {Quest} quest Response.
 * @return {void}
 */
  function gotQuest(err, quest) {
    if (err) {
      return next(err);
    }

    _self.quest = quest;
    if (quest.levels) {
      var questQuestions = [];
      quest.levels.forEach(function(level) {
        questQuestions.push(level.question);
      });

      QuestQ.find({_id: {$in: questQuestions}}).exec(gotQuestions);
    }
  }

  /**
  * Handle Quest Questions response.
  * @param {int} err Request error.
  * @param {[QuestQ]} all Response.
  * @return {void}
  */
  function gotQuestions(err, questions) {
    if (err) {
      return next(err);
    }

    // Go through each quest level and add qestion details
    for (var i=0; i<_self.quest.levels.length; i++) {
      questions.forEach(function(question) {
        var qID = _self.quest.levels[i].question.toString();
        if (qID === question._id.toString()) {
          _self.quest.levels[i].question = question;
        }
      });
    }

    res.send(_self.quest);
  }
});

router.get('/api/wouso-quest/list/:perPage/:page', function(req, res, next) {
  var _self = {};
  var show = req.params.perPage;
  var skip = (req.params.page - 1) * show;

  var query = {};
  if (req.query.id) query['_id'] = req.query.id;
  if (req.query.tags) query['tags'] = {$in: req.query.tags.split(',')};
  if (typeof req.query.search !== 'undefined')
    query.question = {$regex: req.query.search, $options: 'i'};

  _self.query = query;
  QuestQ.find(query).skip(skip).limit(show).exec(gotQuestQ);

  /**
  * Handle Quest Question response.
  * @param {int} err Request error.
  * @param {int} all Response.
  * @return {void}
  */
  function gotQuestQ(err, all) {
    if (err) {
      return next(err);
    }

    _self.questions = all;
    Tag.find({type: 'wouso-quest'}).exec(gotTags);
  }

  /**
  * Handle Tags query response.
  * @param {int} err Request error.
  * @param {int} tags Response.
  * @return {void}
  */
  function gotTags(err, tags) {
    if (err) {
      return next(err);
    }

    // Replace tag ids with tag names
    _self.questions.forEach(function(q) {
      tags.forEach(function(tag) {
        var i = q.tags.indexOf(tag._id);
        if (i > -1) {
          q.tags[i] = tag.name;
        }
      });
    });

    QuestQ.count(_self.query).exec(gotCount);
  }

  /**
  * Handle Quest Question count response.
  * @param {int} err Request error.
  * @param {int} count Response.
  * @return {void}
  */
  function gotCount(err, count) {
    if (err) {
      return next(err);
    }

    var response = {};
    response.questions = _self.questions;
    response.count = count;
    res.send(response);
  }
});

router.delete('/api/wouso-quest/delete', function(req, res) {
  var delList = req.query.id.split(',');
  QuestQ.remove({_id: {$in: delList}}).exec(removedQotd);

  /**
  * Handle Quest delete response.
  * @param {int} err Request error.
  * @return {void}
  */
  function removedQotd(err) {
    if (err) {
      log.error('Could not remove quest questions: ' + delList);
      return res.send('NOK');
    }
    log.info('Removed quest question: ' + delList);
    return res.send('OK');
  }
});

router.get('/api/wouso-quest/reorder', function(req, res) {
  var levels = req.query.levels.split(',');
  Quest.findOne({_id: req.query.id}).exec(gotQuest);

  /**
  * Handle Quest query.
  * @param {int} err Request error.
  * @param {quest} quest object.
  * @return {void}
  */
  function gotQuest(err, quest) {
    if (err) {
      log.error('Could not get quest: ' + req.query.id);
    } else {
      // Reorder questions in quest
      var newQuestionOrder = [];
      levels.forEach(function(level) {
        // Search current level in question list
        var cLevel = quest.levels.filter(function(l) {
          return l._id.toString() === level;
        })[0];
        newQuestionOrder.push(cLevel);
      });

      Quest.update({_id: req.query.id}, {levels: newQuestionOrder}).exec(updatedQuest);
    }

    /**
    * Handle Quest update.
    * @param {int} err Request error.
    * @return {void}
    */
    function updatedQuest(err) {
      if (err) {
        log.error('Could not reorder question of quest: ' + req.query.id);
      }
    }
  }
});

module.exports = router;
