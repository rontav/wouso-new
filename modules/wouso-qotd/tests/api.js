// Set testing env
process.env.NODE_ENV = 'testing';

var request  = require('supertest');
var should   = require('should');
var mongoose = require('mongoose');
var fs       = require('fs');

var Settings  = require('../../../config/models/settings');
var QotdModel = require('../model');

var app, cookie;

var QOption  = mongoose.model('QOption');
var Qotd     = mongoose.model('Qotd');

// Read config file
var data = (JSON.parse(fs.readFileSync('./config.json', 'utf8')));


describe('QOTD settings endpoint:', function() {
  before(function(done) {
    // Drop DB and start app
    dropDB(data.mongo_url.test, droppedDB);

    function droppedDB() {
      // Start app
      app = require('../../../app').listen();
      // Login as root
      setTimeout(login('root', done), 300);
    }
  });

  it('Save single setting', function(done) {
    // Save setting
    var body = {'foo': 'bar'};
    requestPost(app, '/api/wouso-qotd/settings', cookie, body, savedSetting);

    function savedSetting() {
      Settings.findOne({'key': 'qotd-foo'}).exec(gotSetting);
    }

    function gotSetting(err, key) {
      key.val.should.equal('bar');
      done();
    }
  });

  it('Update single setting', function(done) {
    // Update previous setting
    var body = {'foo': 'test'};
    requestPost(app, '/api/wouso-qotd/settings', cookie, body, savedSetting);

    function savedSetting() {
      Settings.findOne({'key': 'qotd-foo'}).exec(gotSetting);
    }

    function gotSetting(err, key) {
      key.val.should.equal('test');
      done();
    }
  });

  it('Save multiple settings', function(done) {
    // Save 2 settings
    var body = {'foo': 'bar', 'ceva': 'altceva'};
    requestPost(app, '/api/wouso-qotd/settings', cookie, body, savedSetting);

    function savedSetting() {
      // First setting
      Settings.findOne({'key': 'qotd-foo'}).exec(gotFirstSetting);
    }

    function gotFirstSetting(err, key) {
      key.val.should.equal('bar');
      // Second setting
      Settings.findOne({'key': 'qotd-ceva'}).exec(gotSecondSetting);
    }

    function gotSecondSetting(err, key) {
      key.val.should.equal('altceva');
      done();
    }
  });

  it('Restrict settings acccess for roles under Admin', function(done) {
    // Login as teacher
    login('teacher', saveSettingAsTeacher);

    function saveSettingAsTeacher() {
      // Save settings as teacher
      var body = {'foo': 'bar', 'ceva': 'altceva'};
      requestPost(app, '/api/wouso-qotd/settings', cookie, body, savedSetting);
    }

    function savedSetting(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('QOTD list endpoint:', function() {
  it('List qotd; no ID provided', function(done) {
    // Add qotd
    new Qotd({
      'date'     : '01.10.16',
      'question' : 'Is this a qustion ?',
      'choices'  : [
        {'text': 'yes', 'validity' : true},
        {'text': 'no', 'validity' : false}]
    }).save(qotdSaved);

    function qotdSaved() {
      // Get qotd
      requestGet(app, '/api/wouso-qotd/list', cookie, {}, gotQotd);
    }

    function gotQotd(err, res) {
      res.body.should.be.empty;
      done();
    }
  });

  it('List qotd with invalid ID', function(done) {
    // Get qotd
    requestGet(app, '/api/wouso-qotd/list?id=111', cookie, {}, gotQotd);

    function gotQotd(err, res) {
      res.body.should.be.empty;
      done();
    }
  });

  it('List qotd with valid ID', function(done) {
    // Look for a valid ID
    Qotd.findOne({'question': 'Is this a qustion ?'}).exec(gotID);

    function gotID(err, qotd) {
      // Get qotd
      requestGet(app, '/api/wouso-qotd/list?id=' + qotd._id, cookie, {}, gotQotd);
    }

    function gotQotd(err, res) {
      res.body.choices[0].text.should.equal('yes');
      done();
    }
  });

  it('Restrict list qotd acccess for roles under Teacher', function(done) {
    // Login as Player
    login('player', saveSettingAsTeacher);

    function saveSettingAsTeacher() {
      // Get qotd
      requestGet(app, '/api/wouso-qotd/list?id=', cookie, {}, savedSetting);
    }

    function savedSetting(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('QOTD paginated list endpoint:', function() {
  before(function(done) {
    // Login as Contributor
    login('contributor', dropDatabase);

    // Drop DB and start app
    function dropDatabase() {
      dropQotd(data.mongo_url.test, addFirstEntry);
    }

    function addFirstEntry() {
      new Qotd({
        'date'     : '01.10.16',
        'question' : 'One?',
        'choices'  : []
      }).save(addSecondEntry);
    }

    function addSecondEntry() {
      new Qotd({
        'date'     : '02.10.16',
        'question' : 'Two?',
        'choices'  : []
      }).save(addThirdEntry);
    }

    function addThirdEntry() {
      new Qotd({
        'date'     : '03.10.16',
        'question' : 'Three?',
        'choices'  : []
      }).save(done);
    }
  });

  it('Paginate qotd list', function(done) {
    // Get qotd paginated list
    requestGet(app, '/api/wouso-qotd/list/2/2', cookie, {}, checkResult);

    function checkResult(err, res) {
      res.body.questions[0].question.should.be.equal('Three?');
      res.body.count.should.be.equal(3);
      done()
    }
  });

  it('Paginate qotd search', function(done) {
    requestGet(app, '/api/wouso-qotd/list/1/1?search=two', cookie, {}, checkResult);

    function checkResult(err, res) {
      res.body.questions[0].question.should.be.equal('Two?');
      done();
    }
  });

  it('Paginate qotd in a certain day', function(done) {
    var params = '?start=03.09.2016&end=03.11.2016'
    requestGet(app, '/api/wouso-qotd/list/1/1' + params, cookie, {}, checkResult);

    function checkResult(err, res) {
      res.body.questions[0].question.should.be.equal('Three?');
      done();
    }
  });

  it('Restrict filter qotd acccess for roles under Teacher', function(done) {
    // Login as Player
    login('player', saveSettingAsTeacher);

    function saveSettingAsTeacher() {
      // Get qotd
      requestGet(app, '/api/wouso-qotd/list/1/1', cookie, {}, checkResult);
    }

    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('QOTD dates list endpoint:', function() {
  before(function(done) {
    // Login as Contributor
    login('contributor', done);
  });

  it('Should return all available dates', function(done) {
    // Get dates list
    requestGet(app, '/api/wouso-qotd/list/dates', cookie, {}, checkResult);

    function checkResult(err, res) {
      res.body.length.should.equal(3);
      done();
    }
  });

  it('Restrict qotd dates list acccess for roles under Teacher', function(done) {
    // Login as Player
    login('player', saveSettingAsTeacher);

    function saveSettingAsTeacher() {
      // Get qotd
      requestGet(app, '/api/wouso-qotd/list/dates', cookie, {}, checkResult);
    }

    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('QOTD play endpoint:', function() {
  before(function(done) {
    // Login as Player
    login('player', dropDatabase);

    // Drop DB and start app
    function dropDatabase() {
      dropQotd(data.mongo_url.test, done);
    }
  });

  it('Should return nothing', function(done) {
    requestGet(app, '/api/wouso-qotd/play', cookie, {}, checkResult);

    function checkResult(err, res) {
      res.body.should.be.empty;
      done();
    }
  });

  before(function(done) {
    // Add 2 qotds for today and one for tomorrow
    var today    = new Date().getDate();
    var tomorrow = new Date().getDate() + 1;

    today = (new Date().getMonth()+1) + '.' + today;
    today += '.' + new Date().getFullYear().toString().substring(2,4);

    tomorrow = (new Date().getMonth()+1) + '.' + tomorrow;
    tomorrow += '.' + new Date().getFullYear().toString().substring(2,4);

    // Start adding questions
    addFirstEntry();

    function addFirstEntry() {
      new Qotd({
        'date'     : today,
        'question' : 'One?',
        'choices'  : []
      }).save(addSecondEntry);
    }

    function addSecondEntry() {
      new Qotd({
        'date'     : today,
        'question' : 'Two?',
        'choices'  : []
      }).save(addThirdEntry);
    }

    function addThirdEntry() {
      new Qotd({
        'date'     : tomorrow,
        'question' : 'Three?',
        'choices'  : []
      }).save(done);
    }
  });

  it('Should return question from today on two separate calls', function(done) {
    var previousID = null;
    requestGet(app, '/api/wouso-qotd/play', cookie, {}, checkResult);

    function checkResult(err, res) {
      previousID = res.body._id;
      res.body.question.should.be.equalOneOf(['One?', 'Two?']);
      // Recheck
      requestGet(app, '/api/wouso-qotd/play', cookie, {}, recheckResult);
    }

    function recheckResult(err, res) {
      res.body._id.should.be.equal(previousID);
      done();
    }
  });
});

describe('QOTD play POST endpoint:', function() {
  before(function(done) {
    // Login as Player
    login('player', dropDatabase);

    // Drop DB and start app
    function dropDatabase() {
      dropQotd(data.mongo_url.test, addQuestion);
    }

    // Add a single question
    function addQuestion() {
      // Add 1 qotd for today
      var today = new Date().getDate();
      today = (new Date().getMonth()+1) + '.' + today;
      today += '.' + new Date().getFullYear().toString().substring(2,4);

      // Add question
      new Qotd({
        'date'     : today,
        'question' : 'One?',
        'choices'  : [new QOption({
          'text' : '1',
          'val'  : true
        }), new QOption({
          'text' : '2',
          'val'  : false
        })]
      }).save(done);
    }
  });

  it('Should add user to qotd responders', function(done) {

    // Look at qotd
    requestGet(app, '/api/wouso-qotd/play', cookie, {}, getQotdInfo);

    function getQotdInfo() {
      Qotd.findOne().exec(sendResponse);
    }

    function sendResponse(err, q) {
      var body = {
        'question_id' : q._id.toString(),
        'ans'         : '1'
      };
      requestPost(app, '/api/wouso-qotd/play', cookie, body, getQotd);
    }

    function getQotd() {
      Qotd.findOne().exec(checkResult);
    }

    function checkResult(err, res) {
      res.answers[0].res[0].text.should.be.equal('1');
      done();
    }
  });
});

describe('QOTD add endpoint:', function() {
  before(function(done) {
    // Login as Contributor
    login('contributor', dropDatabase);

    // Drop DB and start app
    function dropDatabase() {
      dropQotd(data.mongo_url.test, done);
    }
  });

  it('Should add qotd to db', function(done) {
    var body = {
      'question' : 'Foo ?',
      'answer'   : ['Bar', 'Tar'],
      'valid'    : ['true', 'false'],
      'date'     : '',
      'tags'     : ''
    };
    requestPost(app, '/api/wouso-qotd/add', cookie, body, getQotd);

    function getQotd() {
      Qotd.findOne().exec(checkExistance);
    }

    function checkExistance(err, qotd) {
      qotd.question.should.be.equal('Foo ?');
      done();
    }
  });

  it('Should edit qotd from db', function(done) {
    // Get qotd info
    Qotd.findOne().exec(editQotd);

    function editQotd(err, qotd) {
      var body = {
        'id'       : qotd._id,
        'question' : 'Bar ?',
        'answer'   : ['Bar', 'Tar'],
        'valid'    : ['true', 'false'],
        'date'     : '',
        'tags'     : ''
      };
      requestPost(app, '/api/wouso-qotd/add', cookie, body, getQotd);
    }

    function getQotd() {
      Qotd.findOne().exec(checkQotd);
    }

    function checkQotd(err, qotd) {
      qotd.question.should.be.equal('Bar ?');
      done();
    }
  });

  it('Restrict qotd add acccess for roles under Contributor', function(done) {
    // Login as Player
    login('player', addQotdAsPlayer);

    function addQotdAsPlayer() {
      // Get qotd
      requestPost(app, '/api/wouso-qotd/add', cookie, {}, checkResult);
    }

    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});

describe('QOTD remove endpoint:', function() {
  before(function(done) {
    // Login as Contributor
    login('contributor', dropDatabase);

    // Drop DB and start app
    function dropDatabase() {
      dropQotd(data.mongo_url.test, addQotd);
    }

    function addQotd() {
      new Qotd({
        'question' : 'Bar ?',
        'answer'   : ['Bar', 'Tar'],
        'valid'    : ['true', 'false'],
        'date'     : Date.now()
      }).save(done);
    }
  });

  it('Should remove qotd', function(done) {
    // Check that qotd exists
    Qotd.findOne().exec(removeQotd);

    function removeQotd(err, qotd) {
      qotd.question.should.be.string;
      requestDelete('/api/wouso-qotd/delete?id=' + qotd._id, cookie, {}, getQotd)
    }

    function getQotd() {
      Qotd.findOne().exec(checkQotd);
    }

    function checkQotd(err, qotd) {
      should.not.exist(qotd);
      done();
    }
  });

  it('Restrict qotd remove acccess for roles under Contributor', function(done) {
    // Login as Player
    login('player', addQotdAsPlayer);

    function addQotdAsPlayer() {
      // Get qotd
      requestDelete('/api/wouso-qotd/delete', cookie, {}, checkResult);
    }

    function checkResult(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });
});


// UTILS
function requestPost(url, cookie, body, callback) {
  var req = request(app).post(url);
  req.cookies = cookie;
  req.set('Accept','application/json')
    .send(body)
    .expect('Content-Type', /json/)
    .end(callback);
}

function requestGet(url, cookie, body, callback) {
  var req = request(app).get(url);
  req.cookies = cookie;
  req.set('Accept','application/json')
    .send(body)
    .expect('Content-Type', /json/)
    .end(callback);
}

function requestDelete(url, cookie, body, callback) {
  var req = request(app).delete(url);
  req.cookies = cookie;
  req.set('Accept','application/json')
    .send(body)
    .expect('Content-Type', /json/)
    .end(callback);
}

function login(role, callback) {
  request(app)
    .post('/login')
    .set('Accept','application/json')
    .send({"email": role + "@example.com", "password": role})
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      cookie = res.headers['set-cookie'].pop().split(';')[0];

      // Advance
      callback();
    });
}

function dropDB(url, callback) {
  var conn = mongoose.createConnection(url);

  conn.on('open', function() {
    conn.db.dropDatabase(function (err) {
      if (!err) {
        callback();
      }
    });
  });
}

function dropQotd(url, callback) {
  var conn = mongoose.createConnection(url);

  conn.on('open', function() {
    conn.db.dropCollection('qotds', function (err) {
      if (!err) {
        callback();
      }
    });
  });
}
