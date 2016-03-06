var React     = require('react')
var ReactDOM  = require('react-dom')

var locales   = require('../locales/locales.js')
var config    = require('../../../config.json')

var QStore        = require('../stores/quests');
var AppDispatcher = require('../dispatchers/app');


var intlData = {
  locales  : ['en-US'],
  messages : locales[config.language]
};

var QuestQuestionForm = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  getInitialState: function() {
    return {
      question : "",
      answer   : "",
      tags     : "",
    }
  },

  componentDidMount: function() {
    if (this.props.id) {
      $.get('/api/wouso-quest/list?id=' + this.props.id, function(res) {
        if (this.isMounted()) {
          this.setState({
            question : res.question,
            answer   : res.answer,
            hint1    : res.hint1,
            hint2    : res.hint2,
            hint3    : res.hint3,
            tags     : res.tags.join(" "),
          });
        }
      }.bind(this));
    }
  },

  render: function() {
    var modalTitle  = this.getIntlMessage('quest_list_modal_title_add');
    var modalSubmit = this.getIntlMessage('button_text_add');

    // Change text if we are editing an existing question
    if (this.props.id) {
      modalTitle  = this.getIntlMessage('quest_list_modal_title_edit');
      modalSubmit = this.getIntlMessage('button_text_edit');
    }

    return (
      <form method="post" action="/api/wouso-quest/add">
        <div className="quest-question">
          <div className="row">
            <div className="large-12 columns">
              <h2>{modalTitle}</h2>
              <label>Question:</label>
              <input name="question" type="text" value={this.state.question}
                     onChange={this.editQuestion}></input>
              <input name="id" type="hidden" value={this.props.id}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-12 columns">
              <label>Tags (space separated):</label>
              <input name="tags" type="text" value={this.state.tags}
                     onChange={this.editTags}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-12 columns">
              <label>Answer:</label>
              <input name="answer" type="text" value={this.state.answer}
                     onChange={this.editAnswer}></input>
            </div>
          </div>
          <div className="spacer"></div>
          <div className="row">
            <div className="large-12 columns">
              <label>Hint #1:</label>
              <input name="hint1" type="text" value={this.state.hint1}
                     onChange={this.editHint1}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-12 columns">
              <label>Hint #2:</label>
              <input name="hint2" type="text" value={this.state.hint2}
                     onChange={this.editHint2}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-12 columns">
              <label>Hint #3:</label>
              <input name="hint3" type="text" value={this.state.hint3}
                     onChange={this.editHint3}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-2 right">
              <input className="button small right"
                     type="submit" value={modalSubmit}></input>
            </div>
          </div>
        </div>
      </form>
    );
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
  },

  editAnswer: function(event) {
    this.setState({
      answer: event.target.value
    });
  },

  editHint1: function(event) {
    this.setState({
      hint1: event.target.value
    });
  },

  editHint2: function(event) {
    this.setState({
      hint2: event.target.value
    });
  },

  editHint3: function(event) {
    this.setState({
      hint3: event.target.value
    });
  }
});


var QuestListEntry = React.createClass({
  statics: {
    selected_qotd : [],

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
      ReactDOM.render(<QuestQuestionForm {...intlData} id={id} />, document.getElementById("questModal"));
      $('#questModal').foundation("reveal", "open");

      // On modal close, unmount component
      $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
        ReactDOM.unmountComponentAtNode(document.getElementById("questModal"));
      });
    },
  },

  handleChange: function(event) {
    if (QuestListEntry.selected_qotd.indexOf(event.target.value) < 0) {
      QuestListEntry.selected_qotd.push(event.target.value);
    } else {
      QuestListEntry.selected_qotd.pop(event.target.value);
    }
  },

  render: function() {
    var entryDate = "--/--/--";

    if (this.props.date)
      entryDate = QuestListEntry.shortenDate(this.props.date);

    return (
      <div>
        <div className="large-9 columns qotd-question-li">
          <input type="checkbox" name="qotd" value={this.props.id} key={this.props.id} onChange={this.handleChange}></input>
          {this.props.text}
        </div>
        <div className="large-1 columns">
          <a href="#" onClick={QuestListEntry.handleEditClick.bind(this, this.props.id)}>Edit</a>
        </div>
        <div className="large-2 columns text-center">{entryDate}</div>
      </div>
    );
  }
});


var QuestGame = React.createClass({
  render: function() {
    return(<div> Play Challenge gaame!</div>);
  }
});


var QuestListSearch = React.createClass({
  handleDeleteClick: function() {
    if (QuestListEntry.selected_qotd.length == 0) {
      alert('First select the questions that you need to delete.');
    } else {
      var conf = confirm('Are you sure you want to permanently delete selected questions?');
      if (conf) {
        $.ajax({
          type    : "DELETE",
          url     : '/api/wouso-quest/delete?id=' + QuestListEntry.selected_qotd.join(','),
          data    : null,
          success : gotResponse
        });
      }

      function gotResponse(res) {
        AppDispatcher.handleViewAction({
          type : "refreshPage"
        });
      }
    }
  },

  handleClearClick: function() {
    AppDispatcher.handleViewAction({
      type : "searchQuest",
      term : ''
    });
    AppDispatcher.handleViewAction({
      type : "refreshPage"
    });
    this.clearButton.value = '';
  },

  handleChange: function(event) {
    AppDispatcher.handleViewAction({
      type : "searchQuest",
      term : String(event.target.value)
    });
  },

  render: function() {
    return (
      <div>
        <a className="radius button" href="#" onClick={this.handleDeleteClick}>Delete</a>
        <div className="row">
          <div className="large-12 columns">
            <div className="row collapse">
              <div className="small-4 columns">
                <input type="text" ref={(ref) => this.clearButton = ref} onChange={this.handleChange} placeholder="Search"></input>
              </div>
              <div className="small-1 columns">
                <a href="#" className="button postfix" onClick={this.handleClearClick}>Clear</a>
              </div>
              <div className="small-7 columns"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


var QuestListNav = React.createClass({
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


var QuestContrib = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  getInitialState: function() {
    return {
      questions : [],
      total     : null,
      no        : null,
      page      : null,
      term      : ''
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
    return(
      <div>
        <div className="row">
          <QuestListSearch />
        </div>
        <div className="row">
          <div className="reveal-modal" id="questModal"
               data-reveal aria-hidden="true" role="dialog">
          </div>
          <div className="large-12 columns">
            <a className="radius button" href="#"
              onClick={QuestListEntry.handleEditClick.bind(this, null)}>
              Add question
            </a>

            { this.state.questions.map(function (opt) {
              return <QuestListEntry key={opt._id} id={opt._id}
                                     text={opt.question} date={opt.date} />
            }, this)}
            <div className="spacer"></div>
            <QuestListNav total={this.state.total}
                         no={this.state.no} page={this.state.page} />
          </div>
        </div>
        <div className="spacer"></div>
      </div>
    );
  },

  _onChange: function() {
    this.setState({
      questions : QStore.getCurrent(),
      total     : QStore.getCount(),
      no        : QStore.getNumber(),
      page      : QStore.getPage(),
      term      : QStore.getTerm()
    });
  }
});


// if( $('#quest-game').length )
//   ReactDOM.render(<ChallengeGame />, document.getElementById('quest-game'));
if( $('#quest-contrib').length )
  ReactDOM.render(<QuestContrib />, document.getElementById('quest-contrib'));
