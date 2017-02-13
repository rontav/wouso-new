var request  = require('supertest');
var mongoose = require('mongoose');

var cookie;

module.exports = {
  requestPost: function(app, url, body, callback) {
    var req     = request(app).post(url);
    req.cookies = cookie;
    req.set('Accept','application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .end(callback);
  },

  requestGet: function(app, url, body, callback) {
    var req = request(app).get(url);
    req.cookies = cookie;
    req.set('Accept','application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .end(callback);
  },

  requestDelete: function(app, url, body, callback) {
    var req = request(app).delete(url);
    req.cookies = cookie;
    req.set('Accept','application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .end(callback);
  },

  login: function(app, role, callback) {
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
  },

  dropDB: function(url, callback) {
    var conn = mongoose.createConnection(url);

    conn.on('open', function() {
      conn.db.dropDatabase(function (err) {
        if (!err) {
          callback();
        }
      });
    });
  },

  dropCollection: function(url, collection, callback) {
    var conn = mongoose.createConnection(url);

    conn.on('open', function() {
      conn.db.dropCollection(collection, function (err) {
        // Ignore 'ns not found' errors
        if (err && err.code !== 26) {
          console.log(err);
        }
        callback();
      });
    });
  }
}
