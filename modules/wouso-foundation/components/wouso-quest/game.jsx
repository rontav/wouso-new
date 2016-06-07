var React = require('react');

var locales = require('../../locales/locales.js');
var config = require('../../../../config.json');

var intlData = {
  locales: ['en-US'],
  messages: locales[config.language]
};

var QotdGame = React.createClass({
  mixins: [require('react-intl').IntlMixin],

  getInitialState: function() {
    return {
      questList: []
    };
  },

  componentDidMount: function() {
    $.get('/api/wouso-quest/play', function(res) {
      if (this.isMounted()) {
        this.setState({
          questList: res
        });
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div>
        {this.state.questList.map(function(q) {
          return (<p> {q.name} </p>);
        })}
      </div>
    );
  }
});

module.exports = QotdGame;
