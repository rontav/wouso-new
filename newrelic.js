'use strict'
var fs = require('fs');

var app  = {};
app.data = null;

try {
  // Check if config.json exists
  fs.lstatSync('./config.json');
  app.data = (JSON.parse(fs.readFileSync('./config.json', 'utf8')));
}
catch (e) {
  // Read config from env var
  app.data = (JSON.parse(process.env.config));
}

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['wouso-new'],
  /**
   * Your New Relic license key.
   */
  license_key: app.data.newrelic_license_key,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info'
  }
}
