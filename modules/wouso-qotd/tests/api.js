// Set testing env
process.env.NODE_ENV = 'testing';

var request  = require('supertest');
var should   = require('should');
var mongoose = require('mongoose');
var fs       = require('fs');

var Settings = require('../../../config/models/settings');
var Qotd     = require('../model');

var app, conn, cookie;

Qotd = mongoose.model('Qotd');

// Read config file
var data = (JSON.parse(fs.readFileSync('./config.json', 'utf8')));


describe('Superuser login tests:', function() {
  before(function(done) {
    // Drop DB and start app
    conn = mongoose.createConnection(data.mongo_url.test);
    conn.on('open', function() {
      conn.db.dropDatabase(function (err) {
        if (!err) {
          // Start app
          app = require('../../../app').listen(4000);
          // Login as root
          setTimeout(login('root', done), 300);
        }
      });
    });
  });

  it('Save single setting', function(done) {
    // Save setting
    var body = {'foo': 'bar'};
    requestPost('/api/wouso-qotd/settings', cookie, body, savedSetting);

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
    requestPost('/api/wouso-qotd/settings', cookie, body, savedSetting);

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
    requestPost('/api/wouso-qotd/settings', cookie, body, savedSetting);

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
      requestPost('/api/wouso-qotd/settings', cookie, body, savedSetting);
    }

    function savedSetting(err, res) {
      res.body.message.should.equal('Permission denied');
      done();
    }
  });

  it('List qotd; no ID provided', function(done) {
    // Add qotd
    new Qotd({
      'date'     : '01.10.16',
      'question' : 'Is this a qustion ?',
      'choices'  : [{
        'text'     : 'yes',
        'validity' : true
      }, {
        'text'     : 'no',
        'validity' : false
      }]
    }).save(qotdSaved);

    function qotdSaved() {
      // Get qotd
      requestGet('/api/wouso-qotd/list', cookie, {}, gotQotd);
    }

    function gotQotd(err, res) {
      res.body.should.be.empty;
      done();
    }
  });

  it('List qotd with invalid ID', function(done) {
    // Get qotd
    requestGet('/api/wouso-qotd/list?id=111', cookie, {}, gotQotd);

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
      requestGet('/api/wouso-qotd/list?id=' + qotd._id, cookie, {}, gotQotd);
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
      requestGet('/api/wouso-qotd/list?id=', cookie, {}, savedSetting);
    }

    function savedSetting(err, res) {
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
