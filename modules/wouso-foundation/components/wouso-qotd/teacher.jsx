var React = require('react');


var QotdTeachListEntry = React.createClass({
  render: function() {
    // Compute no of correct Answers
    var correct_ans = 0;
    for (var a in this.props.qotd.answers) {
      var ans = this.props.qotd.answers[a];
      for (var r in ans.res) {
        if (ans.res[r].val == true)
          correct_ans += 1;
      }
    }

    return(
      <div>
        <p> { this.props.qotd.question}</p>
        <p>
          { "Responses: " + this.props.qotd.answers.length + " (" + correct_ans + " correct)"}
        </p>
      </div>
    );
  }
});


var QotdTeach = React.createClass({
  getInitialState: function() {
    return {
      today: []
    }
  },

  componentDidMount: function() {
    var date = new Date();
    // Get previous day's date
    var start = [date.getMonth()+1, date.getDate()-1, date.getFullYear()].join('.');

    $.get('/api/wouso-qotd/list/100/1?start=' + start, function(res) {
      if (this.isMounted()) {
        this.setState({
          today: res.questions
        });
      }
    }.bind(this));
  },

  render: function() {
    return(
      <div>
        <div className="row">
          <div className="large-12 columns">
            <h2>Questions for today:</h2>
            { this.state.today.map(function (q, i) {
              return <QotdTeachListEntry key={i} qotd={q} />
            }, this)}
          </div>
        </div>
      </div>
    );
  }
});


module.exports = QotdTeach;
