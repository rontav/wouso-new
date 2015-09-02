module.exports = {
  url: 'mongodb://localhost/wouso-new',
  //url: 'mongodb://admin:admin@ds039271.mongolab.com:39271/heroku_jjp74lcx',

  check: function (err) {
      log.error('Could not connect to mongo:', err)
      process.exit(1)
  }
}
