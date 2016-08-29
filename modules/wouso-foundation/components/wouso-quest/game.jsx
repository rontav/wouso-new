var React = require('react');

var locales = require('../../locales/locales.js');
var config = require('../../../../config.json');

var intlData = {
  locales: ['en-US'],
  messages: locales[config.language]
};

var QuestGame = React.createClass({
  mixins: [require('react-intl').IntlMixin],

  getInitialState: function() {
    return {
      questList: [],
      currentQuest: null,
      currentQuestID: null
    };
  },

  componentDidMount: function() {
    if (this.state.currentQuestID) {
      $.get('/api/wouso-quest/play?id=' + this.state.currentQuestID, function(res) {
        if (this.isMounted()) {
          this.setState({
            currentQuest: res
          });
        }
      }.bind(this));
    } else {
      $.get('/api/wouso-quest/play', function(res) {
        if (this.isMounted()) {
          this.setState({
            questList: res
          });
        }
      }.bind(this));
    }
  },

  handleQuestSelect: function(id) {
    if (typeof id !== 'undefined') {
      this.state.currentQuestID = id;
    }
    this.componentDidMount();
  },

  render: function() {
    if (this.state.currentQuestID) {
      return (<QuestGameLevel quest={this.state.currentQuest} next={this.handleQuestSelect}/>);
    } else {
      return (
        <div className="row">
          <div className="large-12 columns">
            {this.state.questList.length === 0 ? 'No quests available.' : null}
            {this.state.questList.map(function(q, i) {
              return (
                <div key={i}>
                  <a onClick={this.handleQuestSelect.bind(this, q.id)}>
                    {q.name}
                  </a>
                  <p> ({q.id}) - {q.startTime} - {q.endTIme}</p>
                </div>
              );
            }, this)}
          </div>
        </div>
      );
    }
  }
});

var QuestGameLevel = React.createClass({
  getInitialState: function() {
    return {
      response: '',
      message: ''
    };
  },

  handleInput: function(event) {
    this.setState({
      response: event.target.value
    });
  },

  handleKeyPress: function(event) {
    if (event.key === 'Enter') {
      this.handleResponseSend();
    }
  },

  handleResponseSend: function() {
    var url = '/api/wouso-quest/respond';
    url += '?id=' + this.props.quest.id + '&response=' + this.state.response;

    $.get(url, function(res) {
      if (res === 'OK') {
        // Update level
        this.props.next();
      } else {
        this.setState({
          message: 'Wrong answer. Please try again.'
        });
      }
    }.bind(this));
  },

  render: function() {
    if (this.props.quest.finished) {
      return (
        <div className="row">
          <div className="large-12 columns">
            <h2> You have finished this quest. </h2>
          </div>
        </div>
      );
    } else {
      return (
        <div className="row">
          <div className="large-12 columns">
            <h1>{this.props.quest.name}</h1>
            <p>#Level {this.props.quest.levelNumber}/{this.props.quest.levelCount}</p>
            <h4>{this.props.quest.level.question}</h4>
            <input name="answer" type="text" autoComplete="off"
                   onKeyPress={this.handleKeyPress}
                   onChange={this.handleInput}></input>
            <p>{this.state.message}</p>
            <button onClick={this.handleResponseSend}>Check</button>
          </div>
        </div>
      );
    }
  }
});

module.exports = QuestGame;
