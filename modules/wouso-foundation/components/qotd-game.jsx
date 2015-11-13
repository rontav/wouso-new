var React = require('react');


var QotdCountdown = React.createClass({
  render: function () {
    return (
      <div id="progress-bar" data-time={countdownTimer}>
        <div className="pbar"></div>
      </div>
    )
  }
})

var QotdSubmit = React.createClass({
  render: function () {
    // Start countdown
    $('#progress-bar').anim_progressbar()

    return (
      <input className="button small" id="qotd-form-submit" type="submit" value="Send"></input>
    )
  }
})

var QotdQuestion = React.createClass({
  render: function() {
    return (
      <div className="qotd-play-question">
        <p>{this.props.text}</p>
        <input name="question_id" type="hidden" value={this.props.id} hidden></input>
      </div>
    )
  }
})

var QotdOption = React.createClass({
  render: function() {
    var checkboxDisable = false
    var spanClass = ""

    // Disable checkboes if questions answered
    if (this.props.ans) {
      checkboxDisable = true
    }
    // Mark right answers
    if (this.props.ans == this.props.text)
      spanClass = "qotd-right-answer"

    return (
      <div className="qotd-play-answer">
        <input type="checkbox" name="ans" value={this.props.text} disabled={checkboxDisable}></input>
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
    $.get('/api/qotd/play', function(res) {
      if (this.isMounted()) {
        this.setState({
          id       : (res._id      ? res._id      : ""),
          question : (res.question ? res.question : res),
          options  : (res.answers  ? res.answers  : []),
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
          <form className="qotd-form" id="qotd" method="post" action="/api/qotd/play">
            { countdownTimer > 0 ? <QotdCountdown timer={countdownTimer}/> : null }
            <QotdQuestion id={this.state.id} text={this.state.question}/>
            { this.state.options.map(function (opt, i) {
              return <QotdOption key={i} text={opt} ans={this.state.answer} />
            }, this)}
            { this.state.submit ? <QotdSubmit /> : null }
          </form>
        </div>
      </div>
    )
  }
})

module.exports = QotdGame;
