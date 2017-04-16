var path = require('path');
var _ = require('lodash');

var defaults = {
  secret: 'secret',
  production: false,
  host: 'localhost',
  port: 4000,
  language: 'en',
  modules: {
    'wouso-social-login': true
  },
  games: {
    'wouso-qotd': true,
    'wouso-quest': true
  },
  themes: {
    'wouso-foundation': true
  },
  superuser: {
    'root@root.com': 'marius'
  },
  debug: {},
  mongo_url: {
    dev: 'mongodb://localhost/wouso-new-dev',
    test: 'mongodb://localhost/wouso-new-test',
    prod: 'mongodb://localhost/wouso-new-prod'
  },
  credentials: {
    facebook: {
      clientID: 'x',
      clientSecret: 'x'
    },
    twitter: {
      clientID: 'x',
      clientSecret: 'x'
    },
    google: {
      clientID: 'x',
      clientSecret: 'x'
    },
    github: {
      clientID: 'x',
      clientSecret: 'x'
    }
  },
  newrelicLicenseKey: ''
};
var secretKeys = ['credentials', 'mongo_url', 'newrelicLicenseKey', 'superuser', 'secret'];

var config = {};
var secrets = {};

try {
  config = require('./config.json');
}
catch (e) {
  console.error('config.json is missing or is invalid.');
}
try {
  secrets = require('./secret.json');
  secretKeys = secretKeys.concat(Object.keys(secrets));
}
catch (e) {
  console.error('secret.json is missing or is invalid.');
}
config = _.defaultsDeep(secrets, config, defaults);

config.hostname = config.host + config.port;

for (var i = 0; i < secretKeys.length; i++) {
  if (process.browser) {
    delete config[secretKeys[i]];
  }
}

if (process.browser) {
  module.exports = function () {
    return {
      code: 'module.exports=' + JSON.stringify(config) + ';',
      cacheable: true,
      dependencies: [
        path.resolve('./config.json'),
        path.resolve('./secret.json')
      ]
    };
  };
}
else {
  module.exports = config;
}