var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var QuestQ = new Schema({
  question: String,
  quest: ObjectId,
  answer: String,
  hint1: String,
  hint2: String,
  hint3: String,
  tags: [ObjectId]
});

var QuestLevel = new Schema({
  question: ObjectId,
  users: [{
    _id: ObjectId,
    startTime: Date
  }]
});

var Quest = new Schema({
  name: String,
  start: Date,
  end: Date,
  levels: [QuestLevel],
  finishers: [{
    _id: ObjectId,
    startTime: Date
  }]
});

mongoose.model('QuestQ', QuestQ);
mongoose.model('Quest', Quest);
