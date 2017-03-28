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
  debug: {

  },
  mongo_url: {
    dev: 'mongodb://localhost/wouso-new-dev',
    test: 'mongodb://localhost/wouso-new-test',
    prod: 'mongodb://localhost/wouso-new-prod'
  },
  credentials: {
    facebook: {
      clientID: '',
      clientSecret: ''
    },
    twitter: {
      clientID: '',
      clientSecret: ''
    },
    google: {
      clientID: '',
      clientSecret: ''
    },
    github: {
      clientID: '',
      clientSecret: ''
    }
  },
  newrelicLicenseKey: ''
}

var config = {};
var secrets = {};

try {
  config = require('./config.json');
  secrets = require('./secret.json');
}
catch (e) {
  console.error('Config or secret file is invalid');
}
config = _.merge(defaults, config);

config.hostname = config.host + config.port;

for (var i = 0; i < Object.keys(secrets).length; i++) {
  var keys = Object.keys(secrets);
  if (process.browser) {
    delete config[keys[i]];
  }
  else {
    config[keys[i]] = secrets[keys[i]];
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