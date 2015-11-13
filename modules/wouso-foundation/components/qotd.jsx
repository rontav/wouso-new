var React = require('react')
var ReactDOM = require('react-dom')
var QotdList = require('./qotd-list')
var QotdGame = require('./qotd-game')


if( $('#game-qotd').length )
  ReactDOM.render(<QotdGame />, document.getElementById('game-qotd'))
if( $('#qotd-question-list').length )
  ReactDOM.render(<QotdList no='3' page='1' />, document.getElementById('qotd-question-list'));
