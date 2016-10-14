// load the things we need
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// define the schema for settings
var messageSchema = mongoose.Schema({
  'source'      : {
    type     : ObjectId,
    required : false
  },
  'destination' : {
    type     : ObjectId,
    required : true
  },
  'message'     : {
    type     : String,
    required : true
  }
});

module.exports = mongoose.model('Message', messageSchema);
