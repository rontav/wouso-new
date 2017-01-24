var log = require('./logging')('core');

// Ensure superuser exists
var User = require('../config/models/user');

// Available roles
var roles = ['root', 'admin', 'teacher', 'contributor', 'player'];

// Add a demo user for each available role
roles.forEach(function(role, i) {
  var email = role + '@example.com';
  var pass  = new User().generateHash(role);

  // Add to users collection only if does not already exist
  var query  = {'local.email': email};
  var update = { $set: {
    '_id'            : '00000000000000000000000' + i,
    'role'           : i,
    'local.username' : role,
    'local.email'    : email,
    'local.password' : pass
  }};
  User.update(query, update, {upsert: true}).exec(function(err) {
    if (err) log.error('Could not update demo accounts.');
  });
});
