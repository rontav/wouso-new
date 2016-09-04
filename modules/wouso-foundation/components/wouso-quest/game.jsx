var React = require('react');

var locales = require('../../locales/locales.js');
var config = require('../../../../config.json');

var intlData = {
  locales: ['en-US'],
  messages: locales[config.language]
};

/*
* Main Quest Game component. Loads active quest list initially and
* a single quest when one is selected.
*/
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
      var url = '/api/wouso-quest/play?id=' + this.state.currentQuestID;
      $.get(url, function(res) {
        if (this.isMounted()) {
          this.setState({ currentQuest: res });
        }
      }.bind(this));
    } else {
      $.get('/api/wouso-quest/play', function(res) {
        if (this.isMounted()) {
          this.setState({ questList: res });
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
      return (
        <QuestGameLevel quest={this.state.currentQuest}
          next={this.handleQuestSelect} />
      );
    } else {
      return (
        <QuestGameList questList={this.state.questList}
          onQuestClick={this.handleQuestSelect} />
      );
    }
  }
});

/*
* Loads active quests list with some stats for each one.
*/
var QuestGameList = React.createClass({
  mixins: [require('react-intl').IntlMixin],

  render: function() {
    var noQuest = null;
    if (this.props.questList.length === 0) {
      noQuest = this.getIntlMessage('quest_game_no_quests');
    }

    return (
      <div className='row'>
        <div className='large-12 columns'>
          <h2>{noQuest}</h2>

          {this.props.questList.map(function(q, i) {
            // Build quest status message
            var questStatus = this.getIntlMessage('quest_game_status_progress');
            questStatus += ' ' + q.levelNumber + '/' + q.levelCount;
            if (q.finished) {
              questStatus = this.getIntlMessage('quest_game_status_complete');
            }

            return (
              <div key={i}>
                <a onClick={this.props.onQuestClick.bind(null, q.id)}>
                  {q.name}
                </a>
                <p> {q.levelCount} LEVELS. {questStatus}</p>
                <p>Start: {q.startTime} - End: {q.endTIme}</p>
              </div>
            );
          }, this)}
        </div>
      </div>
    );
  }
});

/*
* Quest game logic.
*/
var QuestGameLevel = React.createClass({
  mixins: [require('react-intl').IntlMixin],

  getInitialState: function() {
    return {
      response: '',
      message: ''
    };
  },

  componentDidMount: function() {
    setInterval(this.props.next, 5000);
  },

  handleInput: function(event) {
    this.setState({
      response: event.target.value
    });
  },

  handleKeyPress: function(event) {
    if (event.key === 'Enter') {
      this.handleResponseSend();
    } else {
      this.setState({message: ''});
    }
  },

  handleResponseSend: function() {
    var url = '/api/wouso-quest/respond';
    url += '?id=' + this.props.quest.id + '&response=' + this.state.response;

    $.get(url, function(res) {
      if (res === 'OK') {
        // Clear response and advance level
        this.setState({response: ''});
        this.props.next();
      } else {
        // Clear response and show message
        this.setState({
          message: this.getIntlMessage('quest_game_wrong_answer'),
          response: ''
        });
      }
    }.bind(this));
  },

  render: function() {
    if (this.props.quest.finished) {
      return (
        <div className='row'>
          <div className='large-12 columns'>
            <h2>{this.getIntlMessage('quest_game_finish')}</h2>
          </div>
        </div>
      );
    } else {
      var questProgess = this.props.quest.levelNumber + '/';
      questProgess += this.props.quest.levelCount;

      return (
        <div className='row'>
          <div className='large-12 columns'>
            <h1>{this.props.quest.name}</h1>
            <p>#Level {questProgess}</p>
            <h4>{this.props.quest.level.question}</h4>
            <input name='answer' type='text' autoComplete='off'
              value={this.state.response}
              onKeyPress={this.handleKeyPress}
              onChange={this.handleInput}></input>
            <p>{this.state.message}</p>
            <button onClick={this.handleResponseSend}>
              {this.getIntlMessage('button_check')}
            </button>
            <h4>Hints</h4>
            {this.props.quest.levelHints.map(function(hint, i) {
              return(
                <div key={i}>
                  <h5>Hint {i+1}</h5>
                  <p>{hint}</p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  }
});

module.exports = QuestGame;
