var React     = require('react')
var ReactDOM  = require('react-dom')
var QotdList  = require('./qotd-list')
var QotdGame  = require('./qotd-game')
var QotdAdmin = require('./qotd-admin')
var locales   = require('../locales/locales.js')
var config    = require('../../../config.json')


var intlData = {
    locales : ['en-US'],
    messages: locales[config.language]
};


if( $('#qotd-game').length )
  ReactDOM.render(<QotdGame />, document.getElementById('qotd-game'));
if( $('#qotd-contrib').length )
  ReactDOM.render(<QotdList {...intlData} />, document.getElementById('qotd-contrib'));
if( $('#qotd-admin').length )
  ReactDOM.render(<QotdAdmin {...intlData} />, document.getElementById('qotd-admin'));
