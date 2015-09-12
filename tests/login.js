var request = require('supertest')
var should  = require('should')
var app     = require('../app')

var Cookies;

describe('Login tests:', function () {
  it('should create user session for valid user', function (done) {
    request(app)
      .post('/login')
      .set('Accept','application/json')
      .send({"email": "root@root.com", "password": "marius"})
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        Cookies = res.headers['set-cookie'].pop().split(';')[0];
        done();
      });
  });
  it('should redirect /login to /profile', function (done) {
    req = request(app).get('/login');
    req.cookies = Cookies;
    req.set('Accept','application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        res.header['location'].should.equal('/profile')
        done()
      });
  });
});