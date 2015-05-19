var Message = require('../config/models/message')

module.exports = function (app, io) {
  app.get('/messages', function (req, res, next) {

    query = (req.user? req.user._id : null)
    Message.find(query).exec(gotMessages)

    function gotMessages(err, all) {
      if (err) return next(err)

      res.render('messages', {
        'user'     : req.user,
        'messages' : all
      })
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
      io.sockets.emit(req.body.destination, { message: 'new mwssage' })

      res.redirect('/messages')
    })
  })
}