import React from 'react';
import ReactIntl from 'react-intl';


class QotdCountdown extends React.Component {
  // static propTypes = {
  //   timer: React.propTypes
  // }
  render() {
    return (
      <div id="progress-bar" data-time={this.props.timer}>
        <div className="pbar" />
      </div>
    )
  }
}

class QotdSubmit extends React.Component {
  render() {
    // Start countdown
    $('#progress-bar').anim_progressbar()

    return (
      <input className="button small" id="qotd-form-submit" type="submit" value="Send" />
    )
  }
}

class QotdQuestion extends React.Component {
  // static propTypes = {
  //   text: React.propTypes
  //  id: React.propTypes
  // }
  render() {
    return (<div>
      <p id='qotd-play-question'>{this.props.text}</p>
      <input name='question_id' type='hidden' value={this.props.id} />
    </div>);
  }
}

class QotdOption extends React.Component {
  // static propTypes = {
  //  ans: React.propTypes
  //  text: React.propTypes
  // }
  render() {
    var checkboxDisable = false;
    var spanClass = '';

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
}

class QotdGame extends React.Component {
  constructor() {
    super();

    this.state = {
      id: '',
      question: '',
      options: [],
      answer: '',
      submit: false,
      duration: null
    }
  }
  // static propTypes = {
  //   intl: React.propTypes.
  // }


  componentDidMount() {
    $.get('/api/wouso-qotd/play', function (res) {
      if (this.isMounted()) {
        this.setState({
          id: (res._id ? res._id : ''),
          question: (res.question ? res.question : null),
          options: (res.options ? res.options : []),
          submit: ((!res.answer && res.question) ? true : false),
          answer: res.answer,
          duration: (res.diff ? res.diff : null)
        });
      }
    }.bind(this))
  }

  render() {
    var qotdQuestion = null;
    var qotdGameIntro = null;
    var qotdNoQuestionWarn = null;
    // Compute time left to answer question
    var remainingTime = countdownTimer - Math.ceil(this.state.duration / 1000);

    if (this.state.question) {
      qotdQuestion = <QotdQuestion id={this.state.id} text={this.state.question} />
      qotdGameIntro = <p className='grey-title'>{this.props.intl.formatMessage({ id: 'qotd_game_text' })}</p>
    } else {
      qotdNoQuestionWarn = <p className='grey-title'>{this.props.intl.formatMessage({ id: 'qotd_alert_noquestion' })}</p>
    }

    return (
      <div className="row">
        <div className="large-12 columns">
          <form className="qotd-form" id="qotd" method="post" action="/api/wouso-qotd/play">
            {countdownTimer > 0 ? <QotdCountdown timer={remainingTime} /> : null}

            {qotdNoQuestionWarn}
            {qotdGameIntro}
            {qotdQuestion}

            <div id='qotd-play-options'>
              <div id='qotd-play-options-box'>
                {this.state.options.map(function (opt, i) {
                  return <QotdOption key={i} text={opt} ans={this.state.answer} />
                }, this)}
              </div>
            </div>
            <div className="spacer" />
            <div id='qotd-play-submit'>
              {this.state.submit ? <QotdSubmit /> : null}
            </div>
          </form>
          <div className='game-help'>
            <div className="spacer" />
            <hr />
            <p className='grey-title'>{this.props.intl.formatMessage({ id: 'qotd_game_help_title' })}</p>
            <p>{this.props.intl.formatMessage({ id: 'qotd_game_help_text' })}</p>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = ReactIntl.injectIntl(QotdGame);
