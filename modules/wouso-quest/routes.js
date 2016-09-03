var express  = require('express');
var mongoose = require('mongoose');

var QuestQ = mongoose.model('QuestQ');
var Quest  = mongoose.model('Quest');
var Tag    = mongoose.model('Tag');

var log = require('../../core/logging')('wouso-quest');

var router   = express.Router();
var ObjectId = mongoose.Types.ObjectId;

router.get('/wouso-quest', function(req, res) {
  res.render('wouso-quest', {
    user: req.user
  });
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
    var update = {$push: {levels: {_id: qID}}};
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

/*
* List quests or get one if id is specified.
*/
router.get('/api/wouso-quest/play', function(req, res, next) {
  // Check if user is logged in
  if (!req.user) {
    return res.redirect('/login');
  }

  var _self = {};
  var query = {};

  if (req.query.id) {
    query._id = req.query.id;
    Quest.findOne(query).exec(gotQuest);
  } else {
    Quest.find().exec(gotQuests);
  }

  /* Handle a single quest. */
  function gotQuest(err, quest) {
    if (err) {
      return next(err);
    }

    _self.quest = quest;
    _self.finished = false;

    // Check if user has finished the quest
    quest.finishers.forEach(function(finisher) {
      if (finisher._id.toString() === req.user._id.toString()) {
        _self.finished = true;
      }
    });

    if (!_self.finished) {
      // Gather current level info
      quest.levels.forEach(function(level, i) {
        level.users.forEach(function(user) {
          if (user._id.toString() === req.user._id.toString()) {
            _self.levelIndex = i;
            _self.levelID = level._id;
            _self.levelStartTime = user.startTime;
          }
        });
      });

      // No level found, send 1st level of quest
      if (!('levelIndex' in _self)) {
        if (quest.levels.length === 0) {
          _self.levelIndex = null;
          _self.levelID = null;
          log.warning('Quest [' + quest._id + '] with no levels being used.');
        } else {
          _self.levelIndex = 0;
          _self.levelID = quest.levels[_self.levelIndex]._id;
        }

        // Save current level
        var query = {'_id': req.query.id, 'levels._id': _self.levelID};
        var update = {$push: {
          'levels.$.users': {
            _id: ObjectId(req.user._id),
            startTime: Date.now()
          }
        }};
        Quest.update(query, update).exec(function(err, update) {
          console.log(err);
          console.log(update);
        });
      }
    }

    // Get questions with corresponding IDs
    QuestQ.findOne({_id: _self.levelID}).exec(gotQuestQuestion);
  }

  function gotQuestQuestion(err, question) {
    if (err) {
      return next(err);
    }

    var level = {};
    if (question) {
      level.id = question._id;
      level.question = question.question;
    }

    // Explicetly build response
    res.send({
      id: _self.quest._id,
      name: _self.quest.name,
      startTime: _self.quest.start,
      endTime: _self.quest.end,
      levelCount: _self.quest.levels.length,
      levelNumber: _self.levelIndex + 1,
      levelStartTime: _self.levelStartTime,
      finished: _self.finished,
      level: level
    });
  }

  function gotQuests(err, quests) {
    if (err) {
      return next(err);
    }

    // Explicetly build response
    var response = [];
    quests.forEach(function(quest) {
      // Check if user has finished the quest
      var finished = false;
      quest.finishers.forEach(function(finisher) {
        if (finisher._id.toString() === req.user._id.toString()) {
          finished = true;
        }
      });

      // Get level reached by user for quest
      var levelIndex = null;
      quest.levels.forEach(function(level, i) {
        level.users.forEach(function(user) {
          if (user._id.toString() === req.user._id.toString()) {
            levelIndex = i;
          }
        });
      });

      response.push({
        id: quest._id,
        name: quest.name,
        startTime: quest.start,
        endTime: quest.end,
        levelCount: quest.levels.length,
        levelNumber: levelIndex + 1,
        finished: finished
      });
    });
    res.send(response);
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
        questQuestions.push(level._id);
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
        var qID = _self.quest.levels[i]._id.toString();
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

router.post('/api/wouso-quest/reorder', function(req, res) {
  var levels = req.body.levels.split(',');
  Quest.findOne({_id: req.body.id}).exec(gotQuest);

  /**
  * Handle Quest query.
  * @param {int} err Request error.
  * @param {quest} quest object.
  * @return {void}
  */
  function gotQuest(err, quest) {
    if (err) {
      log.error('Could not get quest: ' + req.body.id);
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

      Quest.update({_id: req.body.id}, {levels: newQuestionOrder}).exec(updatedQuest);
    }

    /**
    * Handle Quest update.
    * @param {int} err Request error.
    * @return {void}
    */
    function updatedQuest(err) {
      if (err) {
        log.error('Could not reorder question of quest: ' + req.body.id);
      }
    }
  }
});

// TODO: limit access to this route
router.post('/api/wouso-quest/edit', function(req, res) {

  var update = {};
  if (req.body.start) {
    update.start = new Date(req.body.start);
  }
  if (req.body.end) {
    update.end = new Date(req.body.end);
  }
  Quest.update({_id: req.body.id}, update).exec(updatedQuest);

  /**
  * Handle Quest update.
  * @param {int} err Request error.
  * @return {void}
  */
  function updatedQuest(err) {
    if (err) {
      log.error('Could not update quest times: ' + req.body.id);
    }
  }
});

// TODO: limit access to this route
router.get('/api/wouso-quest/respond', function(req, res, next) {
  // Check if user is logged in
  if (!req.user) {
    return res.redirect('/login');
  }

  var _self = {};
  var query = {};

  if (req.query.id) {
    query._id = req.query.id;
    Quest.findOne(query).exec(gotQuest);
  }

  /* Handle a single quest. */
  function gotQuest(err, quest) {
    if (err) {
      return next(err);
    }

    _self.quest = quest;
    // Gather current level info
    quest.levels.forEach(function(level, i) {
      level.users.forEach(function(user) {
        if (user._id.toString() === req.user._id.toString()) {
          _self.levelNo = i;
          _self.levelID = level._id;
        }
      });
    });

    // No level found, send 1 level of quest
    if (!('levelNo' in _self)) {
      return res.send('ERR: you did not register for this quest');
    }

    // Get questions with corresponding IDs
    QuestQ.findOne({_id: _self.levelID}).exec(gotQuestQuestion);
  }

  function gotQuestQuestion(err, question) {
    log.debug('Given answer: ' + req.query.response);
    log.debug('Expected answer: ' + question.answer);

    if (question.answer === req.query.response) {

      // Build query attributes
      var pushKey = 'levels.' + (_self.levelNo+1) + '.users';

      // Move user to next level
      var query = {_id: ObjectId(req.query.id)};
      var update = {$push: {}};
      var value = {
        _id: ObjectId(req.user._id),
        startTime: Date.now()
      };

      // If user finished last level, add him to finishers
      if ((_self.levelNo + 1) === _self.quest.levels.length) {
        update.$push.finishers = value;
      // Else advance to next level
      } else {
        update.$push[pushKey] = value;
      }
      Quest.update(query, update).exec(moveUser);
    } else {
      return res.send('NOK');
    }
  }

  function moveUser(err, update) {
    return res.send('OK');
  }
});

module.exports = router;
