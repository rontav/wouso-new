var mongoose = require('mongoose')
var Schema   = mongoose.Schema

var Qotd = new Schema({
  question   : String,
  date       : Date,
  choices    : [QOption],
  viewers    : [String],
  right_ppl  : [String],
  wrong_ppl  : [String]
})

var QOption = new Schema({
  text       : String,
  val        : Boolean
})

mongoose.model('Qotd', Qotd)
mongoose.model('QOption', QOption)