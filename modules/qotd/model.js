var mongoose = require('mongoose')
var Schema   = mongoose.Schema

var Qotd = new Schema({
  question   : String,
  date       : Date,
  answers    : {
    right: [String],
    wrong: [String]
  }
})

mongoose.model('Qotd', Qotd)