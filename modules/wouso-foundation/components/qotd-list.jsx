var React         = require('react');
var ReactDOM      = require('react-dom');
var MsgStore      = require('../stores/messages');
var DateStore     = require('../stores/datepicker');
var AppDispatcher = require('../dispatchers/app');


var QotdQuestionForm = React.createClass({
  getInitialState: function() {
    // Render datepicker
    $.get('/api/qotd/list/dates', function(res) {
      $('#datepicker').datepicker({
        inline: true,
        beforeShowDay: function(date) {
          formated_date = new Date(Date.parse(date)).toISOString();
          if (res.indexOf(formated_date) > -1)
            return { classes: 'activeClass' };
        }
      }).on('changeDate', function(e) {
        AppDispatcher.handleViewAction({
          type : 'refreshDate',
          date :  e.format('dd/mm/yyyy'),
        });
      });
    }.bind(this));

    return {
      question : '',
      tags     : '',
      date     : DateStore.getDate()
    }
  },

  componentDidMount: function() {
    DateStore.addChangeListener(this._onChange);

    $.get('/api/qotd/list?id=' + this.props.id, function(res) {
      if (this.isMounted()) {
        this.setState({
          question : res.question,
          tags     : res.tags.join(' ')
        });
      }
    }.bind(this));
  },

  componentWillUnmount: function() {
    DateStore.removeChangeListener(this._onChange);

    this.setState({
      question: ''
    });
  },

  render: function() {
    return (
      <form id="add-qotd-form" method='post' action='/api/qotd/add'>
        <div className="qotd-question">
          <div className="row">
            <div className="large-12 columns">
              <h2>Edit question</h2>
                <label>Question:</label>
                <input name='question' type='text' id='qotd-question' value={this.state.question}></input>
                <input name='id' type='hidden' id='qotd-id' value={this.props.id}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-12 columns">
              <label>Tags (space separated):</label>
              <input name='tags' type='text' id='qotd-tags' value={this.state.tags}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-6 columns">
              <label>Answers:</label>
              <div id="qotd-answer-list"></div>
            </div>
            <div className="large-6 columns">
              <label>Date:</label>
              <input name='date' type='text' id='qotd-date' value={this.state.date}></input>
              <div id="datepicker"></div>
            </div>
          </div>
        </div>
      </form>
    );
  },

  _onChange: function() {
    this.setState({
      date : DateStore.getDate()
    });
  }
});


var QotdListEntry = React.createClass({
  handleEditClick: function(id) {
    // Mount component and reveal modal
    ReactDOM.render(<QotdQuestionForm id={id} />, document.getElementById('qotdModal'));
    $('#qotdModal').foundation('reveal', 'open');

    // On modal close, unmount component
    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
      ReactDOM.unmountComponentAtNode(document.getElementById('qotdModal'));
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
          <a href="#" onClick={this.handleEditClick.bind(this, this.props.id)}>Edit</a>
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
      this.pages = Math.ceil(this.props.total/this.props.no);
      this.pages = Array.apply(0, Array(this.pages)).map(function(j, i) { return i+1; });
    }

    return (
      <div className="qotd-question-pages text-center">
        { this.pages.map(function (opt, i) {
          return (<a key={i} href="#" onClick={this.refreshList.bind(this, opt)}>{opt}</a>)
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
          return <QotdListEntry key={opt._id} id={opt._id} text={opt.question} date={opt.date} />
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
