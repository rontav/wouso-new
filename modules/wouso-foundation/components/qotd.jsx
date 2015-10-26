
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
      options : [],
      answer  : ''
    }
  },

  componentDidMount: function() {
    $.get('/api/qotd/play', function(result) {
      console.log(result)
      if (this.isMounted()) {
        this.setState({
          options : result.answers,
          answer  : result.answer
        });
      }
    }.bind(this))
  },

  render: function() {
    var answer = this.state.answer

    return (
      <div>
        {this.state.options.map(function (opt, i) {
          return <QotdOption key={i} text={opt} ans={answer}/>
        })}
      </div>
    )
  }
})

if( $('#qotd-play-answers').length )
  ReactDOM.render(<QotdGame />, document.getElementById('qotd-play-answers'))
