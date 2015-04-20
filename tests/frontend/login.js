process.env.NODE_ENV = 'test'
var app = require('../../app').listen(4000)
var assert = require('assert')
var Browser = require('zombie')


describe('Login page', function() {

  browser = new Browser({site: 'http://localhost:4000'})

  before(function(done) {
    browser.visit('/login', done)
  })

  it('should show login form', function() {
    assert.ok(browser.success)
    browser.assert.element('form input[name=email]')
    browser.assert.element('form input[name=password]')
  })

  it('should show signup form', function() {
    assert.ok(browser.success)
    browser.assert.element('form input[name=username]')
    browser.assert.element('form input[name=email]')
    browser.assert.element('form input[name=password]')
  })

  after(function(done) {
    app.close(done)
  })
})