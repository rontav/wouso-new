var React        = require('react');
var ReactDOM     = require('react-dom');
var IntlProvider = require('react-intl').IntlProvider;

var QotdGame  = require('./qotd-game');
var QotdList  = require('./qotd-list');
var QotdTeach = require('./qotd-teacher');
var QotdAdmin = require('./qotd-admin');

var locales   = require('../locales/locales.js');
var config    = require('../../../config.json');


var intlData = {
    locale   : 'en-US',
    messages : locales[config.language]
};


if ( $('#qotd-game').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <QotdGame />
    </IntlProvider>
  , document.getElementById('qotd-game'));
}

if ( $('#qotd-contrib').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <QotdList />
    </IntlProvider>
  , document.getElementById('qotd-contrib'));
}

if ( $('#qotd-teacher').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <QotdTeach />
    </IntlProvider>
  , document.getElementById('qotd-teacher'));
}

if ( $('#qotd-admin').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <QotdAdmin />
    </IntlProvider>
  , document.getElementById('qotd-admin'));
}
