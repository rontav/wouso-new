var React = require('react')


var QotdListEntry = React.createClass({
  handleEditClick: function() {
    this.setState({
    });
  },

  shortenDate: function(date) {
    var qdate = new Date(date);
    var shortDate = ('0' + qdate.getDate()).slice(-2) + '/';
    shortDate += ('0' + (qdate.getMonth()+1)).slice(-2) + '/';
    shortDate += qdate.getFullYear();
    return shortDate;
  },

  render: function() {
    var entryDate = '--/--/--';

    if (this.props.date)
      entryDate = this.shortenDate(this.props.date);

    return (
      <div>
        <div className="large-9 columns qotd-question-li">{this.props.text}</div>
        <div className="large-1 columns">
          <a href="#" onclick={this.handleEditClick}>Edit</a>
        </div>
        <div className="large-2 columns text-center">{entryDate}</div>
      </div>
    );
  }
});

var QotdListNav = React.createClass({
  render: function() {
    this.pages = [];
    if (this.props.total) {
      this.pages = parseInt(this.props.total/this.props.no, 10) + 1;
      this.pages = Array.apply(0, Array(this.pages)).map(function(j, i) { return i+1; })
    }

    return (
      <div className="qotd-question-pages text-center">
        { this.pages.map(function (opt, i) {
          return <a key={i} href="#" onClick={this.props.onClick}>{opt}</a>
        }, this) }
      </div>
    );
  }
});

var QotdList = React.createClass({
  getInitialState: function() {
    return {
      questions : [],
      total     : null
    }
  },

  componentDidMount: function(page, no) {
    if (typeof page === 'undefined')
      page = 1
    if (typeof no === 'undefined')
      no = 3

    var url = '/api/qotd/list/' + no + '/' + page
    $.get(url, function(res) {
      if (this.isMounted()) {
        this.setState({
          questions : res.questions,
          total     : res.count
        });
      }
    }.bind(this));
  },

  handlePgeSwitch: function() {
    this.componentDidMount(2, 3)
  },

  render: function() {
    var boundClick = this.handlePgeSwitch.bind(this, 0);

    return (
      <div>
        { this.state.questions.length == 0 ? 'No questions' : null}
        { this.state.questions.map(function (opt, i) {
          return <QotdListEntry key={opt._id} text={opt.question} date={opt.date} />
        }, this)}
        <div className='spacer'></div>
        <QotdListNav key='0' total={this.state.total} no={this.props.no} page={this.props.page} onClick={boundClick}/>
      </div>
    );
  }
});

module.exports = QotdList

// if( $('#qotd-question-list').length )
//   ReactDOM.render(<QotdList no='3' page='1' />, document.getElementById('qotd-question-list'));
