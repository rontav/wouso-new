
var QotdOption = React.createClass({
  render: function() {
    return (
      <div className="qotd-play-answer">
        <input type="checkbox" name="ans" disabled></input>
        <span className="qotd-right-answer">{this.props.data}</span>
      </div>
    )
  }
})

var QotdGame = React.createClass({
  render: function() {
    var options = []
    $.get('/api/qotd/play', function(result) {
      return (
        <div>
          {result.answers.map(function(res, i) {
            return (<QotdOption key={i} data={res} />)
          })}
        </div>
      )

      // for (var i=0; i < result.answers.length; i++) {
      //   options.push(<QotdOption text={result.answers[i]} />)
      // }
    })

    // options.map(function (opt) {
    //   return <div>{opt}, </div>
    // })


      // <div className="qotd-play-answer">
      //   <input type="checkbox" name="ans" disabled></input>
      //   <span className="qotd-right-answer">ca</span>
      // </div>
    //)
  }
})

ReactDOM.render(<QotdGame />, document.getElementById('qotd-play-answers'))
