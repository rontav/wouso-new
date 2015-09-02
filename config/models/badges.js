// load the things we need
var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId

// define the schema for badges
var badgeSchema = mongoose.Schema({
  'name'          : {type: String, required: true},
  'description'   : {type: String, required: false},
  'required'      : {type: Number, default: null},
  'history'       : {type: [userInfo], default: []}
})

var userInfo = mongoose.Schema({
  'userId'       : ObjectId,
  'count'        : Number,
  'lastUpdate'   : Date,
  'data'         : String
})

module.exports = mongoose.model('Badge', badgeSchema)