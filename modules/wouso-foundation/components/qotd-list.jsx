var React         = require('react');
var ReactDOM      = require('react-dom');
var QStore        = require('../stores/qotds');
var DateStore     = require('../stores/datepicker');
var AppDispatcher = require('../dispatchers/app');


var QotdQuestionOption = React.createClass({
  getInitialState: function() {
    return {
      val  : null
    }
  },

  render: function() {
    if (this.state.val != null) {
      optionState = this.state.val;
    } else {
      optionState = this.props.val;
    }

    var default_class = "button postfix qotd-check";
    var optionClass   = optionState ? default_class + " success" : default_class;
    var value         = optionState ? "true" : "false";
    var valueText     = optionState ? "True" : "False";

    return (
      <div className="row collapse qotd-answer">
        <input name="valid" type="hidden" value={value} hidden></input>
        <div className="small-10 columns">
          <label>
            <input name="answer" type="text" value={this.props.text}></input>
          </label>
        </div>
        <div className="small-2 columns">
          <a className={optionClass} href="javascript:void(0);" name="check" onClick={this.changeOptionValueTo.bind(this, !optionState)}>{valueText}</a>
        </div>
      </div>
    );
  },

  changeOptionValueTo: function(value) {
    this.setState({
      val : value
    });
  }
});


var QotdQuestionForm = React.createClass({
  getInitialState: function() {
    // Render datepicker
    $.get("/api/qotd/list/dates", function(res) {
      $('#datepicker').datepicker({
        inline: true,
        beforeShowDay: function(date) {
          formated_date = new Date(Date.parse(date)).toISOString();
          if (res.indexOf(formated_date) > -1)
            return { classes: 'activeClass' };
        }
      }).on('changeDate', function(e) {
        AppDispatcher.handleViewAction({
          type : "refreshDate",
          date :  e.format("dd/mm/yyyy"),
        });
      });
    }.bind(this));

    return {
      question : "",
      tags     : "",
      date     : DateStore.getDate(),
      options  : Array.apply(0, Array(noOfOptions)).map(function(j, i) { return i+1; })
    }
  },

  componentDidMount: function() {
    DateStore.addChangeListener(this._onChange);

    if (this.props.id) {
      $.get('/api/qotd/list?id=' + this.props.id, function(res) {
        if (this.isMounted()) {
          this.setState({
            question : res.question,
            tags     : res.tags.join(" "),
            date     : QotdListEntry.shortenDate(res.date),
            options  : res.choices
          });
        }
      }.bind(this));
    }
  },

  componentWillUnmount: function() {
    DateStore.removeChangeListener(this._onChange);

    this.setState({
      question: ""
    });
  },

  render: function() {
    var modalTitle  = this.props.id ? "Edit question" : "Add question";
    var modalSubmit = this.props.id ? "Update" : "Add";
    return (
      <form id="add-qotd-form" method="post" action="/api/qotd/add">
        <div className="qotd-question">
          <div className="row">
            <div className="large-12 columns">
              <h2>{modalTitle}</h2>
                <label>Question:</label>
                <input name="question" type="text" value={this.state.question} onChange={this.editQuestion}></input>
                <input name="id" type="hidden" value={this.props.id}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-12 columns">
              <label>Tags (space separated):</label>
              <input name="tags" type="text" id="qotd-tags" value={this.state.tags} onChange={this.editTags}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-6 columns">
              <label>Answers:</label>
              <div id="qotd-answer-list">
                { this.state.options.map(function(opt, i) {
                  return (
                    <QotdQuestionOption key={i} text={this.state.options[i].text} val={this.state.options[i].val}/>
                  );
                }, this) }
              </div>
            </div>
            <div className="large-6 columns">
              <label>Date:</label>
              <input name="date" type="text" id="qotd-date" value={this.state.date}></input>
              <div id="datepicker"></div>
            </div>
          </div>
          <div className="spacer"></div>
          <div className="row controls">
            <div className="large-10 left">
              <input className="button small left" onClick={this.addOption} type="button" value="ADD"></input>
            </div>
            <div className="large-2 right">
              <input className="button small right" type="submit" value={modalSubmit}></input>
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
  },

  addOption: function() {
    this.setState({
      options  : Array.apply(0, Array(this.state.options.length+1)).map(function(j, i) { return i+1; })
    });
  },

  editQuestion: function(event) {
    this.setState({
      question: event.target.value
    });
  },

  editTags: function(event) {
    this.setState({
      tags: event.target.value
    });
  }
});


var QotdListEntry = React.createClass({
  statics: {
    shortenDate: function(date) {
      if (!date) return null;

      var qdate = new Date(date);
      var shortDate = ("0" + qdate.getDate()).slice(-2) + "/";
      shortDate += ("0" + (qdate.getMonth()+1)).slice(-2) + "/";
      shortDate += qdate.getFullYear();
      return shortDate;
    },

    handleEditClick: function(id) {
      // Mount component and reveal modal
      ReactDOM.render(<QotdQuestionForm id={id} />, document.getElementById("qotdModal"));
      $('#qotdModal').foundation("reveal", "open");

      // On modal close, unmount component
      $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
        ReactDOM.unmountComponentAtNode(document.getElementById("qotdModal"));
      });
    },
  },

  render: function() {
    var entryDate = "--/--/--";

    if (this.props.date)
      entryDate = QotdListEntry.shortenDate(this.props.date);

    return (
      <div>
        <div className="large-9 columns qotd-question-li">{this.props.text}</div>
        <div className="large-1 columns">
          <a href="#" onClick={QotdListEntry.handleEditClick.bind(this, this.props.id)}>Edit</a>
        </div>
        <div className="large-2 columns text-center">{entryDate}</div>
      </div>
    );
  }
});


var QotdListNav = React.createClass({
  refreshList: function (page) {
    AppDispatcher.handleViewAction({
      type : "refreshPage",
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
          if (opt == this.props.page)
            return (<b><a key={i} href="#" onClick={this.refreshList.bind(this, opt)}>{opt}</a></b>)
          else
            return (<a key={i} href="#" onClick={this.refreshList.bind(this, opt)}>{opt}</a>)
        }, this) }
      </div>
    );
  }
});


var QotdListSearch = React.createClass({
  handleChange: function(event) {
    AppDispatcher.handleViewAction({
      type : "searchQotd",
      term : String(event.target.value)
    });
  },

  render: function() {
    return (
      <div>
        Search:
        <input name="search" type="text" onChange={this.handleChange}></input>
      </div>
    );
  }
});


var QotdList = React.createClass({
  getInitialState: function() {
    return {
      questions : [],
      total     : null,
      no        : null,
      page      : null
    }
  },

  componentDidMount: function() {
    QStore.addChangeListener(this._onChange);
    AppDispatcher.handleViewAction({
      type : "refreshPage"
    });
  },

  componentWillUnmount: function() {
    QStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return (
      <div>
        <div className="row">
          <QotdListSearch />
        </div>
        <div className="row">
          <div className="reveal-modal" id="qotdModal" data-reveal aria-hidden="true" role="dialog"></div>
          <div className="large-10 columns">
            <a className="radius button" href="#" onClick={QotdListEntry.handleEditClick.bind(this, null)}>Add qotd</a>
            <h2>Qotd list:</h2>
            { this.state.total == 0 ? "No questions" : null}
            { this.state.questions.map(function (opt) {
              return <QotdListEntry key={opt._id} id={opt._id} text={opt.question} date={opt.date} />
            }, this)}
            <div className="spacer"></div>
            <QotdListNav key="0" total={this.state.total} no={this.state.no} page={this.state.page} />
          </div>
          <div className="large-2 columns">
            <h2>Tags:</h2>
          </div>
        </div>
      </div>
    );
  },

  _onChange: function() {
    this.setState({
      questions : QStore.getCurrent(),
      total     : QStore.getCount(),
      no        : QStore.getNumber(),
      page      : QStore.getPage()
    });
  }
});


module.exports = QotdList;
