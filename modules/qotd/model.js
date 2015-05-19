var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = mongoose.Schema.Types.ObjectId

var Qotd = new Schema({
  question   : String,
  date       : Date,
  choices    : [QOption],
  viewers    : [String],
  right_ppl  : [String],
  wrong_ppl  : [String],
  tags 		 : [ObjectId]
})

var QOption = new Schema({
  text       : String,
  val        : Boolean
})

mongoose.model('Qotd', Qotd)
mongoose.model('QOption', QOption)