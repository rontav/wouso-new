// load the things we need
var mongoose = require('mongoose')
var bcrypt   = require('bcrypt-nodejs')

// User roles (by priviledge level)
// 0 - root
// 1 - admin
// 2 - teacher
// 3 - contributor
// 4 - player

// define the schema for our user model
var userSchema = mongoose.Schema({
    role             : {
        type         : Number,
        default      : 4,
        min          : 0,
        max          : 4
    },
    local            : {
        username     : String,
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        avatar       : String
    },
    github           : {
        id           : String,
        token        : String,
        email        : String,
        displayName  : String,
        name         : String
    }
})

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password)
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema)
