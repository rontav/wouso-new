// Set testing env
process.env.NODE_ENV = 'testing';

var request  = require('supertest');
var should   = require('should');
var mongoose = require('mongoose');
var fs       = require('fs');

var Cookies;
var app;


// Read config file
var data = (JSON.parse(fs.readFileSync('./config.json', 'utf8')));

describe('Superuser login tests:', function () {
  before(function (done) {
    // Drop DB and start app
    var conn = mongoose.createConnection(data.mongo_url.test)
    conn.on('open', function (ref) {
      conn.db.dropDatabase(function (err, result) {
        if (!err) {
          // Start app
          app = require('../app').listen(4000)
          done()
        }
      })
    })
  })
  it('should create user session for valid user', function (done) {
    // Wait for app to start and user to be added
    setTimeout(function() {
      request(app)
        .post('/login')
        .set('Accept','application/json')
        .send({"email": "root@root.com", "password": "marius"})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.headers['location'].should.equal('/profile')
          Cookies = res.headers['set-cookie'].pop().split(';')[0]
          done()
        })
    }, 300);
  })
  it('should redirect /login to /profile after auth', function (done) {
    req = request(app).get('/login')
    req.cookies = Cookies;
    req.set('Accept','application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        res.headers['location'].should.equal('/profile')
        done()
      })
  })
  after(function (done) {
    app.close()
    done()
  })
})
