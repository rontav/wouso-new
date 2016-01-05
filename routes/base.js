var User     = require('../config/models/user')
var fs       = require('fs')
var express  = require('express')
var log      = require('../core/logging')('core')
var router   = express.Router()



router.get('/', function (req, res, next) {
  res.render('index')
})

// 404 page
router.use(function (req, res, next){
  log.error('[404] Not found: ' + req.originalUrl)
  res.status(404).type('txt').send('Not found!')
})

// Error handling middleware
router.use(function (err, req, res, next) {
  if (err) {
    log.error(err.stack)
    res.status(500).send('Something went wrong')
  }
})


module.exports = router
