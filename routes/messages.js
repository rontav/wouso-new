var Message  = require('../config/models/message');
var Users    = require('../config/models/user');
var express  = require('express');
var mongoose = require('mongoose');
var router   = express.Router();


router.get('/messages', function(req, res) {
  res.render('messages', {
    user: req.user
  });
});

router.get('/api/messages', function (req, res, next) {
  var ObjectId = mongoose.Types.ObjectId;

  var _self = {};
  var query = {'$or': [{'source': ObjectId(req.user._id)}, {'destination': ObjectId(req.user._id)}]}
  Message.find(query).exec(gotMessages);

  function gotMessages(err, all) {
    if (err) return next(err);

    _self.users = [];
    var userIDs = [];
    all.forEach(function (message) {
      if (userIDs.indexOf(message.source.toString()) < 0) {
        userIDs.push(message.source.toString());
        _self.users.push(message.source);
      }
      if (userIDs.indexOf(message.destination.toString()) < 0) {
        userIDs.push(message.destination.toString());
        _self.users.push(message.destination);
      }
    });

    _self.messages = all;
    Users.find({'_id': {$in: _self.users}}).exec(getUserDetails);
  }

  function getUserDetails(err, people) {
    _self.messages.forEach(function (message) {
      people.forEach(function (peep) {
        if (peep._id == message.source)
          message.source = getAvailableName(peep)
        if (peep._id == message.destination)
          message.destination = getAvailableName(peep)
      })
    })

    res.send({
      'users'    : people,
      'messages' : _self.messages
    });
  }

  function getAvailableName(peep) {
    if (peep.facebook && peep.facebook.name)
      return peep.facebook.name
    if (peep.twitter && peep.twitter.displayName)
      return peep.twitter.displayName
    if (peep.google && peep.google.name)
      return peep.google.name
    if (peep.github && peep.github.displayName)
      return peep.github.displayName
    if (peep.local && peep.local.username)
      return peep.local.username
    if (peep.local && peep.local.email)
      return peep.local.email
  }
});

router.get('/api/messages/:userID', function (req, res, next) {
  var ObjectId = mongoose.Types.ObjectId;

  var query = {'$or': [
    {'$and': [{'source': ObjectId(req.user._id)}, {'destination': ObjectId(req.params.userID)}]},
    {'$and': [{'source': ObjectId(req.params.userID)}, {'destination': ObjectId(req.user._id)}]}
  ]};
  Message.find(query).exec(gotMessages);

  function gotMessages(err, all) {
    var messages = [];
    // Clenup message; keep only text and direction (sent or recv)
    all.forEach(function(msg) {
      var cleanMsg = {};
      // Save message text
      cleanMsg.message = msg.message;
      // Determine message direction; assume it's received and check
      cleanMsg.direction = 'recv';
      if (msg.source == req.user._id) {
        cleanMsg.direction = 'sent';
      }
      // Push message to final list
      messages.push(cleanMsg);
    });
    res.send(messages);
  }
});

router.post('/api/messages/send', function (req, res, next) {
  new Message({
    'source'       : req.user._id,
    'destination'  : req.body.to,
    'message'      : req.body.message
  }).save(function (err) {
    if (err) return next(err);

    res.redirect('/messages');
  })
})


module.exports = router
