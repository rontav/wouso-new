var Message = require('../config/models/message')
var Users   = require('../config/models/user')

module.exports = function (app, io) {
  app.get('/messages', function (req, res, next) {

    _self = {}
    query = (req.user? req.user._id : null)
    Message.find(query).exec(gotMessages)

    function gotMessages(err, all) {
      if (err) return next(err)

      users = []
      all.forEach(function (message){
        if (users.indexOf(message.source) < 0)
          users.push(message.source)
        if (users.indexOf(message.destination) < 0)
          users.push(message.destination)
      })

      _self.messages = all
      Users.find({'_id': {$in: users}}).exec(gotUsers)
    }

    function gotUsers(err, people) {
      _self.messages.forEach(function (message) {
        people.forEach(function (peep) {
          if (peep._id == message.source)
            message.source = getAvailableName(peep)
          if (peep._id == message.destination)
            message.destination = getAvailableName(peep)
        })
      })

      res.render('messages', {
        'user'     : req.user,
        'messages' : _self.messages
      })
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
  })

  app.post('/messages/send', function (req, res, next) {
    new Message({
      'source'       : req.user._id,
      'destination'  : req.body.destination,
      'message'      : req.body.message
    }).save(function (err) {
      if (err) return next(err)

      // Alert
      io.sockets.emit(req.body.destination, { message: 'new message' })

      res.redirect('/messages')
    })
  })
}
