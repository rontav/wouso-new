// Set testing env
process.env.NODE_ENV = 'testing';

var request  = require('supertest');
var should   = require('should');
var mongoose = require('mongoose');
var fs       = require('fs');

var common     = require('./common');
var Settings   = require('../../../config/models/settings');
var QuestModel = require('../model');

var app;

var Quest  = mongoose.model('Quest');
var QuestQ = mongoose.model('QuestQ');

// Read config file
var data = (JSON.parse(fs.readFileSync('./config.json', 'utf8')));


describe('Quest settings endpoint:', function() {
  before(function(done) {
    // Drop DB and start app
    common.dropDB(data.mongo_url.test, droppedDB);

    function droppedDB() {
      // Start app
      app = require('../../../app').listen();
      // Login as root
      setTimeout(common.login(app, 'root', done), 300);
    }
  });

  it('Save single setting', function(done) {
    // Save setting
    var body = {'foo': 'bar'};
    common.requestPost(app, '/api/wouso-quest/settings', body, savedSetting);

    function savedSetting() {
      Settings.findOne({'key': 'quest-foo'}).exec(gotSetting);
    }

    function gotSetting(err, key) {
      key.val.should.equal('bar');
      done();
    }
  });

  it('Update single setting', function(done) {
    // Update previous setting
    var body = {'foo': 'test'};
    common.requestPost(app, '/api/wouso-quest/settings', body, savedSetting);

    function savedSetting() {
      Settings.findOne({'key': 'quest-foo'}).exec(gotSetting);
    }

    function gotSetting(err, key) {
      key.val.should.equal('test');
      done();
    }
  });

  it('Save multiple settings', function(done) {
    // Save 2 settings
    var body = {'foo': 'bar', 'ceva': 'altceva'};
    common.requestPost(app, '/api/wouso-quest/settings', body, savedSetting);

    function savedSetting() {
      // First setting
      Settings.findOne({'key': 'quest-foo'}).exec(gotFirstSetting);
    }

    function gotFirstSetting(err, key) {
      key.val.should.equal('bar');
      // Second setting
      Settings.findOne({'key': 'quest-ceva'}).exec(gotSecondSetting);
    }

    function gotSecondSetting(err, key) {
      key.val.should.equal('altceva');
      done();
    }
  });

  it('Restrict settings acccess for roles under Admin', function(done) {
    // Login as teacher
    common.login(app, 'teacher', actAsPlayer);
    // Save settings as teacher
    function actAsPlayer() {
      var body = {'foo': 'bar', 'ceva': 'altceva'};
      common.requestPost(app, '/api/wouso-quest/settings', body, savedSetting);
    }
    // Check response
    function savedSetting(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest questions list endpoint:', function() {
  it('List quest questions; no ID provided', function(done) {
    // Add quest
    new QuestQ({
      'question' : 'Foo',
      'answer'   : 'Bar'
    }).save(getQuestQ);

    function getQuestQ() {
      // Get quest
      common.requestGet(app, '/api/wouso-quest/list', {}, checkQuestQList);
    }

    function checkQuestQList(err, res) {
      res.body.should.be.empty;
      done();
    }
  });

  it('List quest questions with invalid ID', function(done) {
    // Get qotd
    common.requestGet(app, '/api/wouso-quest/list?id=111', {}, checkQuestQList);

    function checkQuestQList(err, res) {
      res.body.should.be.empty;
      done();
    }
  });

  it('List quest questions with valid ID', function(done) {
    // Look for a valid ID
    QuestQ.findOne({'question': 'Foo'}).exec(getQuestQ);

    function getQuestQ(err, questQ) {
      // Get quest
      common.requestGet(app, '/api/wouso-quest/list?id=' + questQ._id, {}, checkQuestQ);
    }

    function checkQuestQ(err, res) {
      res.body.question.should.equal('Foo');
      done();
    }
  });

  it('Restrict list quest questions acccess for roles under Teacher', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Get quest
    function actAsPlayer() {
      common.requestGet(app, '/api/wouso-quest/list?id=', {}, checkResponse);
    }
    // Check response
    function checkResponse(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest questions paginated list endpoint:', function() {
  before(function(done) {
    // Login as Contributor
    common.login(app, 'contributor', dropDatabase);

    // Drop DB and start app
    function dropDatabase() {
      common.dropCollection(data.mongo_url.test, 'questqs', addFirstEntry);
    }

    function addFirstEntry() {
      new QuestQ({
        'question' : 'Foo1',
        'answer'   : 'Bar1'
      }).save(addSecondEntry);
    }

    function addSecondEntry() {
      new QuestQ({
        'question' : 'Foo2',
        'answer'   : 'Bar2'
      }).save(addThirdEntry);
    }

    function addThirdEntry() {
      new QuestQ({
        'question' : 'Foo3',
        'answer'   : 'Bar3'
      }).save(done);
    }
  });

  it('Paginate quest questions list', function(done) {
    // Get qotd paginated list
    common.requestGet(app, '/api/wouso-quest/list/2/2', {}, checkResult);

    function checkResult(err, res) {
      res.body.questions[0].question.should.be.equal('Foo3');
      res.body.count.should.be.equal(3);
      done()
    }
  });

  it('Paginate quest questions search', function(done) {
    common.requestGet(app, '/api/wouso-quest/list/1/1?search=foo2', {}, checkResult);

    function checkResult(err, res) {
      res.body.questions[0].question.should.be.equal('Foo2');
      done();
    }
  });


  it('Restrict filter quest questions acccess for roles under Teacher', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Get quest questions
    function actAsPlayer() {
      common.requestGet(app, '/api/wouso-quest/list/1/1', {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest play endpoint:', function() {
  before(function(done) {
    this.timeout(4000);
    // Login as Player
    common.login(app, 'player', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      common.dropCollection(data.mongo_url.test, 'quests', done);
    }
  });

  it('Should return nothing', function(done) {
    common.requestGet(app, '/api/wouso-quest/play', {}, checkResult);

    function checkResult(err, res) {
      res.body.should.be.empty;
      done();
    }
  });

  before(function(done) {
    // Add 2 quests starting today, ending tomorrow
    var today    = new Date().getDate();
    var tomorrow = new Date().getDate() + 1;

    today = (new Date().getMonth()+1) + '.' + today;
    today += '.' + new Date().getFullYear().toString().substring(2,4);

    tomorrow = (new Date().getMonth()+1) + '.' + tomorrow;
    tomorrow += '.' + new Date().getFullYear().toString().substring(2,4);

    // Start adding questions
    addFirstQuestion();

    function addFirstQuestion() {
      new QuestQ({
        'question' : 'Foo',
        'answer'   : 'Bar'
      }).save(getQuestQ);
    }

    function getQuestQ() {
      QuestQ.findOne().exec(addFirstEntry);
    }

    function addFirstEntry(err, questq) {
      new Quest({
        'name'   : 'Foo1',
        'start'  : today,
        'end'    : tomorrow,
        'levels' : [{
          '_id'   : questq._id,
          'users' : []
        }]
      }).save(addSecondEntry);
    }

    function addSecondEntry() {
      new Quest({
        'name'  : 'Foo2',
        'start' : today,
        'end'   : tomorrow,
        'levels' : []
      }).save(done);
    }
  });

  it('Should return the list of quests', function(done) {
    // Get quests
    common.requestGet(app, '/api/wouso-quest/play', {}, checkResult);

    function checkResult(err, res) {
      res.body.length.should.be.equal(2);
      res.body[0].name.should.be.equalOneOf(['Foo1', 'Foo2']);
      done();
    }
  });

  it('Should return first question in first quest', function(done) {
    // Get first quest ID
    Quest.findOne().exec(getQuest);

    function getQuest(err, quest) {
      common.requestGet(app, '/api/wouso-quest/play?id=' + quest._id, {}, checkResult);
    }

    function checkResult(err, res) {
      res.body.level.question.should.be.equal('Foo')
      done();
    }
  });

  it('Should add user to question viewers', function(done) {
    // Get first quest ID
    Quest.findOne().exec(getQuest);

    function getQuest(err, quest) {
      quest.levels[0].users.should.not.be.empty;
      done();
    }
  });
});

describe('Quest play POST endpoint:', function() {
  before(function(done) {
    this.timeout(4000);
    // Save today's and tomorrow's date
    var today = new Date().getDate();
    var tomorrow = new Date().getDate() + 1;
    // Login as Player
    common.login(app, 'player', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      // Set dates correctly
      today = (new Date().getMonth()+1) + '.' + today;
      today += '.' + new Date().getFullYear().toString().substring(2,4);
      tomorrow = (new Date().getMonth()+1) + '.' + tomorrow;
      tomorrow += '.' + new Date().getFullYear().toString().substring(2,4);
      // Drop collection
      common.dropCollection(data.mongo_url.test, 'quests', addFirstQuestion);
    }
    // Add a question
    function addFirstQuestion() {
      new QuestQ({
        'question' : 'Foo',
        'answer'   : 'Bar'
      }).save(getQuestQ);
    }
    // Add a quest
    function getQuestQ() {
      QuestQ.findOne().exec(addFirstEntry);
    }

    function addFirstEntry(err, questq) {
      new Quest({
        'name'   : 'Foo1',
        'start'  : today,
        'end'    : tomorrow,
        'levels' : [{
          '_id'   : questq._id,
          'users' : []
        }]
      }).save(done);
    }
  });

  it('Should return an error, because user did not view question before answering', function(done) {
    // Get first quest ID
    Quest.findOne().exec(getQuest);

    function getQuest(err, quest) {
      common.requestGet(app, '/api/wouso-quest/respond?id=' + quest._id, {}, checkResult);
    }

    function checkResult(err, res) {
      res.body.message.should.be.equal('Permission denied');
      done();
    }
  });

  it('Should answer incorrectly to first question', function(done) {
    // Store quest ID
    var questID = null;
    // Get first quest ID
    Quest.findOne().exec(getQuest);
    // Look at question
    function getQuest(err, quest) {
      questID = quest._id;
      common.requestGet(app, '/api/wouso-quest/play?id=' + questID, {}, answerQuest);
    }
    // Send correct answer
    function answerQuest() {
      var url = '/api/wouso-quest/respond?id=' + questID + '&response=' + 'Boo';
      common.requestGet(app, url, {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.text.should.equal('NOK');
      done();
    }
  });

  it('Should answer correctly to first question', function(done) {
    // Get first quest ID
    Quest.findOne().exec(answerQuest);
    // Send correct answer
    function answerQuest(err, quest) {
      var url = '/api/wouso-quest/respond?id=' + quest._id + '&response=' + 'Bar';
      common.requestGet(app, url, {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.text.should.equal('OK');
      done();
    }
  });

  it('Should add user to finishers list', function(done) {
    // Get first quest ID
    Quest.findOne().exec(answerQuest);
    // Send correct answer
    function answerQuest(err, quest) {
      quest.finishers[0]._id.toString().should.be.equal('000000000000000000000004');
      done();
    }
  });
});

describe('Quest add endpoint:', function() {
  before(function(done) {
    // Login as Contributor
    common.login(app, 'contributor', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      common.dropCollection(data.mongo_url.test, 'quests', done);
    }
  });

  it('Should add a new quest', function(done) {
    var body = {
      'name' : 'Foo'
    };
    // Add quest
    common.requestPost(app, '/api/wouso-quest/add-quest', body, checkQuest);
    // Check quest
    function checkQuest() {
      Quest.findOne().exec(checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.name.should.be.equal('Foo')
      done();
    }
  });

  it('Restrict add quest action for roles under Contributor', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Get quest questions
    function actAsPlayer() {
      common.requestPost(app, '/api/wouso-quest/add-quest', {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest Question add endpoint:', function() {
  before(function(done) {
    this.timeout(4000);
    // Save today's and tomorrow's date
    var today = new Date().getDate();
    var tomorrow = new Date().getDate() + 1;
    // Login as Contributor
    common.login(app, 'contributor', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      // Set dates correctly
      today = (new Date().getMonth()+1) + '.' + today;
      today += '.' + new Date().getFullYear().toString().substring(2,4);
      tomorrow = (new Date().getMonth()+1) + '.' + tomorrow;
      tomorrow += '.' + new Date().getFullYear().toString().substring(2,4);
      // Drop collection
      common.dropCollection(data.mongo_url.test, 'quests', addFirstEntry);
    }
    // Add sample Quest
    function addFirstEntry() {
      new Quest({
        'name'   : 'Foo1',
        'start'  : today,
        'end'    : tomorrow,
        'levels' : []
      }).save(done);
    }
  });

  it('Should add question to quest', function(done) {
    // Get first quest ID
    Quest.findOne().exec(answerQuest);
    // Add question to quest
    function answerQuest(err, quest) {
      var body = {
        question : 'Foo?',
        quest    : quest._id,
        tags     : ''
      };
      common.requestPost(app, '/api/wouso-quest/add', body, checkQuest);
    }
    // Check quest
    function checkQuest() {
      Quest.findOne().exec(checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.levels.should.not.be.empty();
      done();
    }
  });

  it('Should update quest question', function(done) {
    // Get quest question
    QuestQ.findOne().exec(getQuestion);
    // Add question to quest
    function getQuestion(err, q) {
      var body = {
        id       : q._id,
        question : 'Bar?',
        quest    : q.quest,
        tags     : ''
      };
      common.requestPost(app, '/api/wouso-quest/add', body, checkQuestQ);
    }
    // Check quest
    function checkQuestQ() {
      QuestQ.findOne().exec(checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.question.should.be.equal('Bar?');
      done();
    }
  });

  it('Restrict add quest question action for roles under Contributor', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Get quest questions
    function actAsPlayer() {
      common.requestPost(app, '/api/wouso-quest/add', {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest Question remove endpoint:', function() {
  before(function(done) {
    this.timeout(4000);
    // Save today's and tomorrow's date
    var today = new Date().getDate();
    var tomorrow = new Date().getDate() + 1;
    // Login as Contributor
    common.login(app, 'contributor', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      // Set dates correctly
      today = (new Date().getMonth()+1) + '.' + today;
      today += '.' + new Date().getFullYear().toString().substring(2,4);
      tomorrow = (new Date().getMonth()+1) + '.' + tomorrow;
      tomorrow += '.' + new Date().getFullYear().toString().substring(2,4);
      // Drop collection
      common.dropCollection(data.mongo_url.test, 'quests', addFirstQuestion);
    }
    // Add a question
    function addFirstQuestion() {
      new QuestQ({
        'question' : 'Foo1',
        'answer'   : 'Bar1'
      }).save(addSecondQuestion);
    }
    // Add second question
    function addSecondQuestion() {
      new QuestQ({
        'question' : 'Foo2',
        'answer'   : 'Bar2'
      }).save(addThirdQuestion);
    }
    // Add thid question
    function addThirdQuestion() {
      new QuestQ({
        'question' : 'Foo3',
        'answer'   : 'Bar3'
      }).save(getFirstQuestQ);
    }
    // Get quest question ID
    function getFirstQuestQ() {
      QuestQ.findOne().exec(addFirstQuest);
    }
    function addFirstQuest(err, questq) {
      new Quest({
        'name'   : 'Foo',
        'start'  : today,
        'end'    : tomorrow,
        'levels' : [{
          '_id'   : questq._id,
          'users' : []
        }]
      }).save(done);
    }
  });

  it('Should remove first question', function(done) {
    // Get first quest question ID
    QuestQ.findOne().exec(answerQuest);
    // Remove question
    function answerQuest(err, q) {
      common.requestDelete(app, '/api/wouso-quest/delete?id=' + q._id, {}, checkQuestQ);
    }
    // Check quest questions
    function checkQuestQ() {
      QuestQ.find().exec(checkResult);
    }
    // Check response
    function checkResult(err, all) {
      all[0].question.should.be.equal('Foo2');
      all[1].question.should.be.equal('Foo3');
      done();
    }
  });

  it('Should unlink the removed question from quests', function(done) {
    // Check quest questions
    Quest.findOne().exec(checkResult);
    // Check response
    function checkResult(err, quest) {
      quest.levels.length.should.be.equal(0);
      done();
    }
  });

  it('Should remove all two questions', function(done) {
    // Get quest question IDs
    QuestQ.find().exec(answerQuest);
    // Remove question
    function answerQuest(err, all) {
      var url = '/api/wouso-quest/delete?id=' + all[0]._id + ',' + all[1]._id;
      common.requestDelete(app, url, {}, checkQuestQ);
    }
    // Check quest questions
    function checkQuestQ() {
      QuestQ.find().exec(checkResult);
    }
    // Check response
    function checkResult(err, all) {
      all.should.be.empty();
      done();
    }
  });

  it('Restrict remove quest question action for roles under Contributor', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Remove quest question
    function actAsPlayer() {
      common.requestDelete(app, '/api/wouso-quest/delete', {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest edit endpoint:', function() {
  before(function(done) {
    this.timeout(4000);
    // Save today's and tomorrow's date
    var today = new Date().getDate();
    var tomorrow = new Date().getDate() + 1;
    // Login as Contributor
    common.login(app, 'contributor', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      // Set dates correctly
      today = (new Date().getMonth()+1) + '.' + today;
      today += '.' + new Date().getFullYear().toString().substring(2,4);
      tomorrow = (new Date().getMonth()+1) + '.' + tomorrow;
      tomorrow += '.' + new Date().getFullYear().toString().substring(2,4);
      // Drop collection
      common.dropCollection(data.mongo_url.test, 'quests', addFirstQuest);
    }
    // Add a quest
    function addFirstQuest() {
      new Quest({
        'name'   : 'Foo',
        'start'  : today,
        'end'    : tomorrow,
        'levels' : []
      }).save(done);
    }
  });

  it('Should edit quest start and end time', function(done) {
    // Send request
    var testDate = new Date().toString();
    // Get quest ID
    Quest.findOne().exec(sendRequest);

    function sendRequest(err, quest) {
      var body = {
        'id'    : quest._id,
        'start' : testDate,
        'end'   : testDate
      };
      common.requestPost(app, '/api/wouso-quest/edit', body, checkQuest);
    }

    // Check quest
    function checkQuest() {
      Quest.findOne().exec(checkResult);
    }
    // Check response
    function checkResult(err, quest) {
      quest.start.toString().should.be.equal(testDate);
      quest.end.toString().should.be.equal(testDate);
      done();
    }
  });

  it('Restrict edit quest action for roles under Contributor', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Remove quest question
    function actAsPlayer() {
      common.requestPost(app, '/api/wouso-quest/edit', {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest Question reorder endpoint:', function() {
  before(function(done) {
    this.timeout(4000);
    // Login as Contributor
    common.login(app, 'contributor', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      // Drop collection
      common.dropCollection(data.mongo_url.test, 'quests', addFirstQuestion);
    }
    // Add a question
    function addFirstQuestion() {
      new QuestQ({
        'question' : 'Foo1',
        'answer'   : 'Bar1'
      }).save(addSecondQuestion);
    }
    // Add second question
    function addSecondQuestion() {
      new QuestQ({
        'question' : 'Foo2',
        'answer'   : 'Bar2'
      }).save(addThirdQuestion);
    }
    // Add thid question
    function addThirdQuestion() {
      new QuestQ({
        'question' : 'Foo3',
        'answer'   : 'Bar3'
      }).save(getFirstQuestQ);
    }
    // Get quest question ID
    function getFirstQuestQ() {
      QuestQ.find().exec(addFirstQuest);
    }
    function addFirstQuest(err, qs) {
      new Quest({
        'name'   : 'Foo',
        'start'  : Date.now(),
        'end'    : Date.now(),
        'levels' : [{
          '_id'   : qs[0]._id,
          'users' : []
        },{
          '_id'   : qs[1]._id,
          'users' : []
        },{
          '_id'   : qs[2]._id,
          'users' : []
        }]
      }).save(done);
    }
  });

  it('Should reorder questions inside quest', function(done) {
    var qID   = null;
    var qList = null;
    // Get quest ID
    Quest.findOne().exec(sendRequest);
    // Save quest ID
    function sendRequest(err, quest) {
      qID = quest._id;
      QuestQ.find().exec(getQuestions);
    }
    // Build reorder request
    function getQuestions(err, qs) {
      qList = [qs[0]._id, qs[1]._id, qs[2]._id];
      var body = {
        'id'     : qID,
        'levels' : qList.reverse().join(',')
      };
      common.requestPost(app, '/api/wouso-quest/reorder', body, checkQuest);
    }
    // Check quest
    function checkQuest() {
      Quest.findOne().exec(checkResult);
    }
    // Check response
    function checkResult(err, quest) {
      quest.levels[0]._id.toString().should.be.equal(qList[0].toString());
      quest.levels[1]._id.toString().should.be.equal(qList[1].toString());
      quest.levels[2]._id.toString().should.be.equal(qList[2].toString());
      done();
    }
  });

  it('Restrict reorder quest questions action for roles under Contributor', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Remove quest question
    function actAsPlayer() {
      common.requestPost(app, '/api/wouso-quest/reorder', {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest details endpoint:', function() {
  before(function(done) {
    this.timeout(4000);
    // Login as Contributor
    common.login(app, 'contributor', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      // Drop collection
      common.dropCollection(data.mongo_url.test, 'quests', addFirstQuestion);
    }
    // Add a question
    function addFirstQuestion() {
      new QuestQ({
        'question' : 'Foo1',
        'answer'   : 'Bar1'
      }).save(getFirstQuestQ);
    }
    // Get quest question ID
    function getFirstQuestQ() {
      QuestQ.find().exec(addFirstQuest);
    }
    function addFirstQuest(err, qs) {
      new Quest({
        'name'   : 'Foo',
        'start'  : Date.now(),
        'end'    : Date.now(),
        'levels' : [{
          '_id'   : qs[0]._id,
          'users' : []
        }]
      }).save(done);
    }
  });

  it('Should get quest including questions', function(done) {
    // Get quest ID
    Quest.findOne().exec(sendRequest);
    // Build reorder request
    function sendRequest(err, quest) {
      common.requestGet(app, '/api/wouso-quest/quest?id=' + quest._id, {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.levels[0].question.question.should.be.equal('Foo1');
      res.body.levels[0].question.answer.should.be.equal('Bar1');
      done();
    }
  });

  it('Restrict reorder quest questions action for roles under Contributor', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Remove quest question
    function actAsPlayer() {
      common.requestPost(app, '/api/wouso-quest/reorder', {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('Quest list endpoint:', function() {
  before(function(done) {
    this.timeout(4000);
    // Save today's and tomorrow's date
    var today = new Date().getDate();
    var tomorrow = new Date().getDate() + 1;
    // Login as Contributor
    common.login(app, 'contributor', dropQuestions);
    // Drop quest questions collection
    function dropQuestions() {
      common.dropCollection(data.mongo_url.test, 'questqs', dropQuests);
    }
    // Drop quests collection
    function dropQuests() {
      // Set dates correctly
      today = (new Date().getMonth()+1) + '.' + today;
      today += '.' + new Date().getFullYear().toString().substring(2,4);
      tomorrow = (new Date().getMonth()+1) + '.' + tomorrow;
      tomorrow += '.' + new Date().getFullYear().toString().substring(2,4);
      // Drop collection
      common.dropCollection(data.mongo_url.test, 'quests', addFirstEntry);
    }
    // Add first quest
    function addFirstEntry() {
      new Quest({
        'name'   : 'Foo1',
        'start'  : today,
        'end'    : tomorrow,
        'levels' : []
      }).save(addSecondEntry);
    }
    // Add second quest
    function addSecondEntry() {
      new Quest({
        'name'  : 'Foo2',
        'start' : today,
        'end'   : tomorrow,
        'levels' : []
      }).save(done);
    }
  });

  it('Should return the list of quest names', function(done) {
    // Get quests
    common.requestGet(app, '/api/wouso-quest/qlist', {}, checkResult);

    function checkResult(err, res) {
      res.body[0].name.should.be.equal('Foo1');
      res.body[1].name.should.be.equal('Foo2');
      done();
    }
  });

  it('Should return a single quest', function(done) {
    // Get quest ID
    Quest.findOne().exec(sendRequest);
    // Build reorder request
    function sendRequest(err, quest) {
      common.requestGet(app, '/api/wouso-quest/qlist?id=' + quest._id, {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body[0].name.should.be.equal('Foo1');
      done();
    }
  });

  it('Restrict quest list action for roles under Contributor', function(done) {
    // Login as Player
    common.login(app, 'player', actAsPlayer);
    // Remove quest question
    function actAsPlayer() {
      common.requestPost(app, '/api/wouso-quest/reorder', {}, checkResult);
    }
    // Check response
    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});
