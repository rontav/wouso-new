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
    common.login(app, 'teacher', saveSettingAsTeacher);

    function saveSettingAsTeacher() {
      // Save settings as teacher
      var body = {'foo': 'bar', 'ceva': 'altceva'};
      common.requestPost(app, '/api/wouso-quest/settings', body, savedSetting);
    }

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
    common.login(app, 'player', saveSettingAsTeacher);

    function saveSettingAsTeacher() {
      // Get quest
      common.requestGet(app, '/api/wouso-quest/list?id=', {}, checkResponse);
    }

    function checkResponse(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});
