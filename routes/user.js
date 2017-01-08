var Users    = require('../config/models/user');
var express  = require('express');
var router   = express.Router();


router.get('/api/user', function (req, res, next) {
  if (req.query.id) {
    var query = {'_id': req.query.id};
    Users.findOne(query).exec(sendResponse);
  } else {
    return res.send(req.user);
  }

  function sendResponse(err, user) {
    if (err) return next(err)

    return res.send(user);
  }
});

router.get('/api/users', function (req, res, next) {
  Users.find().exec(sendResponse);

  function sendResponse(err, users) {
    if (err) return next(err);

    return res.send(users);
  }
});

router.get('/api/users/search', function (req, res, next) {
  var query = {'$or': [
    {'name'  : { '$regex': req.query.search, '$options': 'i' }},
    {'email' : { '$regex': req.query.search, '$options': 'i' }}
  ]};
  Users.find(query).exec(sendResponse);

  function sendResponse(err, all) {
    if (err) return next(err)

    res.send(all);
  }
});

module.exports = router;
