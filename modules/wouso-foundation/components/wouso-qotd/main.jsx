import  React from 'react';
import  ReactDOM from 'react-dom';
import  {IntlProvider} from 'react-intl';

import  QotdGame from './game';
import QotdList   from'./contribute';
import QotdTeach  from './teacher';
import QotdAdmin from './admin';

import locales from '../../locales/locales.js';
import  config  from '../../../../config.json';


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
