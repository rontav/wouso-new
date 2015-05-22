/*
This script imports qotds from old wouso format into the new app.
It imports question and options (but not tags).
*/

var fs       = require('fs')
var mongoose = require('mongoose')

// Connect to db
var configDB = require('../config/database.js')
mongoose.connect(configDB.url)

// Import models
require('../modules/qotd/model.js')
var qotd     = mongoose.model('Qotd')
var QOption  = mongoose.model('QOption')

IMPORT_FILE = './imports/question_qotd_export.txt'
var array = fs.readFileSync(IMPORT_FILE).toString().split('\n')
var total = parseInt(array.length/7)
var count = 0

for (var i=0; i<array.length-1; i+=7) {
  //console.log('#' + array[i].slice(2))
  options = []
  for (var j=i+2; j<=i+5; j++) {
    // We have '+' if option is correct, '-' otherwise
    validity = false
    if (array[j].slice(0,1) == '+')
      validity = true

    // Define qotd options
    options.push(new QOption({
      'text' : array[j].slice(2),
      'val'  : validity
    }))
  }

  // Define qotd
  new qotd ({
    'question'  : array[i].slice(2),
    'choices'   : options
  }).save(function (err) {
    if (err) {
      console.log(err)
      process.exit(1)
    } else {
      count ++
      console.log('Successfully imported ' + count + '/' + total)
    }

    if (count == total)
      process.exit(0)
  })
}
