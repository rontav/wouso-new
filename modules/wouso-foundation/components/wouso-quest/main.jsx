var React        = require('react');
var ReactDOM     = require('react-dom');
var IntlProvider = require('react-intl').IntlProvider;

var QuestAdmin   = require('./admin');
var QuestContrib = require('./contribute');
var QuestGame    = require('./game');

var locales = require('../../locales/locales.js');
var config  = require('config');

var intlData = {
  locale   : 'en-US',
  messages : locales[config.language]
};


if ( $('#quest-admin').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <QuestAdmin />
    </IntlProvider>
  , document.getElementById('quest-admin'));
}

if ( $('#quest-contrib').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <QuestContrib />
    </IntlProvider>
  , document.getElementById('quest-contrib'));
}

if ( $('#quest-game').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <QuestGame />
    </IntlProvider>
  , document.getElementById('quest-game'));
}
