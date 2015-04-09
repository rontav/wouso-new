var mongoose = require('mongoose')
var Schema   = mongoose.Schema

var Qotd = new Schema({
  question   : String,
  date       : Date,
  answers    : {
    right: [String],
    wrong: [String]
  },
  viewers    : [String],
  right_ppl  : [String],
  wrong_ppl  : [String]
})

mongoose.model('Qotd', Qotd)