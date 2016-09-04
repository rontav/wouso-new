var React = require('react');
var ReactDOM = require('react-dom');

var QuestAdmin = require('./admin');
var QuestContrib = require('./contribute');
var QuestGame = require('./game');

var locales   = require('../../locales/locales.js')
var config    = require('../../../../config.json')

var intlData = {
  locales : ['en-US'],
  messages: locales[config.language]
};


if ($('#quest-admin').length) {
  ReactDOM.render(
    <QuestAdmin {...intlData} />, document.getElementById('quest-admin')
  );
}

if ($('#quest-contrib').length) {
  ReactDOM.render(
    <QuestContrib {...intlData} />, document.getElementById('quest-contrib')
  );
}

if ( $('#quest-game').length ) {
  ReactDOM.render(
    <QuestGame {...intlData} />, document.getElementById('quest-game')
  );
}
