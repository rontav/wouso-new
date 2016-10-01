// Set testing env
process.env.NODE_ENV = 'testing';

var request  = require('supertest');
var should   = require('should');
var mongoose = require('mongoose');
var fs       = require('fs');

var Settings = require('../../../config/models/settings');

var app, conn, cookie;


// Read config file
var data = (JSON.parse(fs.readFileSync('./config.json', 'utf8')));


describe('Superuser login tests:', function () {
  before(function (done) {
    // Drop DB and start app
    conn = mongoose.createConnection(data.mongo_url.test);
    conn.on('open', function () {
      conn.db.dropDatabase(function (err) {
        if (!err) {
          // Start app
          app = require('../../../app').listen(4000);

          // Login as root
          setTimeout(function() {
            login('root', done);
          }, 300);
        }
      });
    });
  });

  it('Save single setting', function (done) {
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

  it('Update single setting', function (done) {
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

  it('Save multiple settings', function (done) {
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

  it('Restrict roles under Admin', function (done) {
    // Login as teacher
    login('teacher', saveSettingAsTeacher)

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
