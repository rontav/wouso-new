var React    = require('react')
var ReactDOM = require('react-dom')
var QotdList = require('./qotd-list')
var QotdGame = require('./qotd-game')
var locales  = require('../locales/locales.js')
var config   = require('../../../config.json')


var intlData = {
    locales : ['en-US'],
    messages: locales[config.language]
};


if( $('#game-qotd').length )
  ReactDOM.render(<QotdGame />, document.getElementById('game-qotd'))
if( $('#qotd-question-list').length )
  ReactDOM.render(<QotdList {...intlData} />, document.getElementById('qotd-question-list'));
