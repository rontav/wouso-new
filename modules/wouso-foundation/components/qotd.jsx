
var QotdOption = React.createClass({
  render: function() {
    return (
      <div className="qotd-play-answer">
        <input type="checkbox" name="ans" disabled></input>
        <span className="qotd-right-answer">{this.props.text}</span>
      </div>
    )
  }
})

var QotdGame = React.createClass({
  getInitialState: function() {
    return {
      options : []
    }
  },

  componentDidMount: function() {
    $.get('/api/qotd/play', function(result) {
      if (this.isMounted()) {
        this.setState({
          options: result.answers
        });
      }
    }.bind(this))
  },

  render: function() {
    return (
      <div>
        {this.state.options.map(function (opt, i) {
          return <QotdOption text={opt} />
        })}
      </div>
    )
  }
})

ReactDOM.render(<QotdGame />, document.getElementById('qotd-play-answers'))
