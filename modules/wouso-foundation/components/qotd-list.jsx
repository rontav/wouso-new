var React      = require('react');
var MsgStore = require('../stores/messages');
var AppDispatcher = require('../dispatchers/app');


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
  refreshList: function (page) {
    AppDispatcher.handleViewAction({
      type : 'refreshPage',
      no   : String(this.props.no),
      page : String(page)
    });
  },

  render: function() {
    this.pages = [];
    if (this.props.total) {
      this.pages = parseInt(this.props.total/this.props.no, 10) + 1;
      this.pages = Array.apply(0, Array(this.pages)).map(function(j, i) { return i+1; })
    }

    return (
      <div className="qotd-question-pages text-center">
        { this.pages.map(function (opt, i) {
          return <a key={i} href="#" onClick={this.refreshList.bind(this, opt)}>{opt}</a>
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

  componentDidMount: function() {
    MsgStore.addChangeListener(this._onChange);
    AppDispatcher.handleViewAction({
      type : 'refreshPage',
      no   : String(this.props.no),
      page : String(this.props.page),
    });
  },

  componentWillUnmount: function() {
    MsgStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return (
      <div>
        { this.state.total == 0 ? 'No questions' : null}
        { this.state.questions.map(function (opt, i) {
          return <QotdListEntry key={opt._id} text={opt.question} date={opt.date} />
        }, this)}
        <div className='spacer'></div>
        <QotdListNav key='0' total={this.state.total} no={this.props.no} page={this.props.page} />
      </div>
    );
  },

  _onChange: function() {
    this.setState({
      questions : MsgStore.getCurrent(),
      total     : MsgStore.getCount()
    });
  }
});

module.exports = QotdList;
