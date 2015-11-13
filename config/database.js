var log = require('../core/logging')('core')

module.exports = {
  check: function() {
      log.error('Could not connect to mongo.')
      process.exit(1)
  }
}
