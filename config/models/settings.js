// load the things we need
var mongoose = require('mongoose')
var bcrypt   = require('bcrypt-nodejs')

// define the schema for settings
var settingsSchema = mongoose.Schema({
	'key' 	: {type: String, required: true},
	'val'   : {type: String, required: true}
})

module.exports = mongoose.model('Settings', settingsSchema)