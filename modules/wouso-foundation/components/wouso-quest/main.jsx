var React = require('react');
var ReactDOM = require('react-dom');

var QuestGame = require('./game');
var QuestContrib = require('./contribute');

var locales   = require('../../locales/locales.js')
var config    = require('../../../../config.json')

var intlData = {
  locales : ['en-US'],
  messages: locales[config.language]
};

if ( $('#quest-game').length ) {
  ReactDOM.render(<QuestGame {...intlData} />, document.getElementById('quest-game'));
}

if ($('#quest-contrib').length) {
  ReactDOM.render(<QuestContrib {...intlData} />, document.getElementById('quest-contrib'));
}
