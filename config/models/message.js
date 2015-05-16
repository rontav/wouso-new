// load the things we need
var mongoose = require('mongoose')

// define the schema for settings
var messageSchema = mongoose.Schema({
  'source'        : {type: String, required: false},
  'destination'   : {type: String, required: true},
  'message'       : {type: String, required: true}
})

module.exports = mongoose.model('Message', messageSchema)