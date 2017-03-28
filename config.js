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
    mongodb: {
        link: 'mongodb://localhost/wouso-new-test',
        username: '',
        password: ''
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

module.exports = config;