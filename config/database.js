module.exports = {
  url: 'mongodb://localhost/wouso-new',

  check: function (err) {
      log.error('Could not connect to mongo:', err)
      process.exit(1)
  }
}
