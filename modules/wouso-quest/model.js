var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = mongoose.Schema.Types.ObjectId


var QuestQ = new Schema({
  question   : String,
  answer     : String,
  hint1      : String,
  hint2      : String,
  hint3      : String,
  tags       : [ObjectId]
})


mongoose.model('QuestQ', QuestQ)
