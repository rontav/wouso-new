var React     = require('react');
var ReactIntl = require('react-intl');


var QotdCountdown = React.createClass({
  render: function () {
    return (
      <div id="progress-bar" data-time={countdownTimer}>
        <div className="pbar" />
      </div>
    )
  }
})

var QotdSubmit = React.createClass({
  render: function () {
    // Start countdown
    $('#progress-bar').anim_progressbar()

    return (
      <input className="button small" id="qotd-form-submit" type="submit" value="Send" />
    )
  }
})

var QotdQuestion = React.createClass({
  render: function() {
    return (
      <div>
        <p id='qotd-play-question'>{this.props.text}</p>
        <input name='question_id' type='hidden' value={this.props.id} />
      </div>
    )
  }
})

var QotdOption = React.createClass({
  render: function() {
    var checkboxDisable = false;
    var spanClass = "";

    // Disable checkboes if questions answered
    if (this.props.ans) {
      checkboxDisable = true;
    }
    // Mark right answers
    if (this.props.ans == this.props.text) {
      spanClass = 'qotd-right-answer';
    }

    return (
      <div className='qotd-play-answer'>
        <input type='checkbox' name='ans' value={this.props.text} disabled={checkboxDisable} />
        <span className={spanClass}>{this.props.text}</span>
      </div>
    )
  }
})

var QotdGame = React.createClass({
  getInitialState: function() {
    return {
      id       : "",
      question : "",
      options  : [],
      answer   : "",
      submit   : false,
    }
  },

  componentDidMount: function() {
    $.get('/api/wouso-qotd/play', function(res) {
      if (this.isMounted()) {
        this.setState({
          id       : (res._id      ? res._id      : ""),
          question : (res.question ? res.question : res),
          options  : (res.options  ? res.options  : []),
          submit   : ((!res.answer && res.question)  ? true : false),
          answer   : res.answer
        });
      }
    }.bind(this))
  },

  render: function() {
    return (
      <div className="row">
        <div className="large-12 columns">
          <form className="qotd-form" id="qotd" method="post" action="/api/wouso-qotd/play">
            { countdownTimer > 0 ? <QotdCountdown timer={countdownTimer} /> : null }
            { this.state.question == "" ? this.props.intl.formatMessage({id: 'qotd_alert_noquestion'}) : null }

            { this.state.question == "" ? null : <p className='grey-title'>{this.props.intl.formatMessage({id: 'qotd_game_text'})}</p> }
            <QotdQuestion id={this.state.id} text={this.state.question} />
            <div id='qotd-play-options'>
              <div id='qotd-play-options-box'>
                { this.state.options.map(function (opt, i) {
                  return <QotdOption key={i} text={opt} ans={this.state.answer} />
                }, this)}
              </div>
            </div>
            <div className="spacer" />
            <div id='qotd-play-submit'>
              { this.state.submit ? <QotdSubmit /> : null }
            </div>
          </form>
          <div className='game-help'>
            <div className="spacer" />
            <hr />
            <p className='grey-title'>{this.props.intl.formatMessage({id: 'qotd_game_help_title'})}</p>
            <p>{this.props.intl.formatMessage({id: 'qotd_game_help_text'})}</p>
          </div>
        </div>
      </div>
    )
  }
})

module.exports = ReactIntl.injectIntl(QotdGame);
