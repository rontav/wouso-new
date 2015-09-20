var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = mongoose.Schema.Types.ObjectId

var Qotd = new Schema({
  question   : String,
  date       : Date,
  choices    : [QOption],
  answers    : [QResponse],
  tags 		 : [ObjectId]
})

var QOption = new Schema({
  text       : String,
  val        : Boolean
})

var QResponse = new Schema({
  user       : ObjectId,
  res        : [QOption],
  date       : Date
})

mongoose.model('Qotd', Qotd)
mongoose.model('QOption', QOption)