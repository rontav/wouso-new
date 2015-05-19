// load the things we need
var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId

// define the schema for settings
var tagSchema = mongoose.Schema({
  'name'          : {type: String, required: true},
  'type'          : {type: String, required: false},
  'count'         : {type: Number, default: 0}
})

module.exports = mongoose.model('Tag', tagSchema)