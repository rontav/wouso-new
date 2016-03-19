var React = require('react')
var ReactDOM = require('react-dom')

var locales = require('../locales/locales.js')
var config = require('../../../config.json')

var QStore = require('../stores/questions');
var AppDispatcher = require('../dispatchers/app');

// Common components
var ListNav = require('./common/list-nav.jsx');
var ListSearch = require('./common/list-search.jsx');

var intlData = {
  locales: ['en-US'],
  messages: locales[config.language]
};

var QuestQuestionForm = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  getInitialState: function() {
    return {
      questList: [{name: '---', _id: '---'}],
      question: "",
      answer: "",
      tags: ""
    };
  },

  componentDidMount: function() {
    $.get('/api/wouso-quest/qlist', function(res) {
      if (this.isMounted()) {
        this.setState({
          questList: this.state.questList.concat(res)
        });
      }
    }.bind(this));
    if (this.props.id) {
      $.get('/api/wouso-quest/list?id=' + this.props.id, function(res) {
        if (this.isMounted()) {
          this.setState({
            question: res.question,
            quest: res.quest,
            answer: res.answer,
            hint1: res.hint1,
            hint2: res.hint2,
            hint3: res.hint3,
            tags: res.tags.join(" ")
          });
        }
      }.bind(this));
    }
  },

  render: function() {
    var modalTitle = this.getIntlMessage('quest_list_modal_title_add');
    var modalSubmit = this.getIntlMessage('button_text_add');

    // Change text if we are editing an existing question
    if (this.props.id) {
      modalTitle = this.getIntlMessage('quest_list_modal_title_edit');
      modalSubmit = this.getIntlMessage('button_text_edit');
    }

    var defaultQuestValue = this.props.qID;
    if (this.state.quest) {
      defaultQuestValue = this.state.quest;
    }

    console.log('#' + this.props.qID)
    console.log('@' + this.state.quest)

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
              <label>Quest</label>
              <select name="quest" value={defaultQuestValue} onChange={this.editQuest}>
                {this.state.questList.map(function(q, i) {
                  return (<option key={i} value={q._id}>{q.name}</option>);
                })}
              </select>
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

  editQuest: function(event) {
    this.setState({
      quest: event.target.value
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


var QuestManageForm = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  getInitialState: function() {
    return {
      name : ""
    }
  },

  componentDidMount: function() {
    // if (this.props.id) {
    //   $.get('/api/wouso-quest/list?id=' + this.props.id, function(res) {
    //     if (this.isMounted()) {
    //       this.setState({
    //         question : res.question,
    //         answer   : res.answer,
    //         hint1    : res.hint1,
    //         hint2    : res.hint2,
    //         hint3    : res.hint3,
    //         tags     : res.tags.join(" "),
    //       });
    //     }
    //   }.bind(this));
    // }
  },

  render: function() {
    return (
      <form method="post" action="/api/wouso-quest/add-quest">
        <div className="quest-question">
          <div className="row">
            <div className="large-12 columns">
              <h2>Add new quest</h2>
              <label>Name:</label>
              <input name="name" type="text" value={this.state.name}
                     onChange={this.editName}></input>
              <input name="id" type="hidden" value={this.props.id}></input>
            </div>
          </div>
          <div className="row">
            <div className="large-2 right">
              <input className="button small right"
                     type="submit" value="Save"></input>
            </div>
          </div>
        </div>
      </form>
    );
  },

  editName: function(event) {
    this.setState({
      name: event.target.value
    });
  }
});


var QuestListEntry = React.createClass({
  statics: {
    selected_quests : [],

    shortenDate: function(date) {
      if (!date) return null;

      var qdate = new Date(date);
      var shortDate = ("0" + qdate.getDate()).slice(-2) + "/";
      shortDate += ("0" + (qdate.getMonth()+1)).slice(-2) + "/";
      shortDate += qdate.getFullYear();
      return shortDate;
    },

    handleEditClick: function(id, questID) {
      // Mount component and reveal modal
      ReactDOM.render(<QuestQuestionForm {...intlData} id={id} qID={questID}/>, document.getElementById("questModal"));
      $('#questModal').foundation("reveal", "open");

      // On modal close, unmount component
      $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
        ReactDOM.unmountComponentAtNode(document.getElementById("questModal"));
      });
    },
  },

  handleChange: function(event) {
    if (QuestListEntry.selected_quests.indexOf(event.target.value) < 0) {
      QuestListEntry.selected_quests.push(event.target.value);
    } else {
      QuestListEntry.selected_quests.pop(event.target.value);
    }
  },

  render: function() {
    var entryDate = "--/--/--";

    if (this.props.date)
      entryDate = QuestListEntry.shortenDate(this.props.date);

    return (
      <div>
        <div className="large-9 columns question-li">
          <input type="checkbox" name="quest" value={this.props.id} key={this.props.id} onChange={this.handleChange}></input>
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


var QuestContribManage = React.createClass({
  getInitialState: function() {
    return {
      currentQuestID: null,
      currentQuest: null,
      questList: [{name: '---', _id: '---'}],
      questLevels: []
    };
  },

  handleAddClick: function(id) {
    // Mount component and reveal modal
    ReactDOM.render(<QuestManageForm {...intlData} id={id} />, document.getElementById("questManageModal"));
    $('#questManageModal').foundation("reveal", "open");

    // On modal close, unmount component
    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
      ReactDOM.unmountComponentAtNode(document.getElementById("questManageModal"));
    });
  },

  componentDidMount: function(qID) {
    if (qID) {
      $.get('/api/wouso-quest/quest?id=' + qID, function(res) {
        if (this.isMounted()) {
          this.setState({
            currentQuestID: qID,
            currentQuest: res,
            questLevels: res.levels
          });
        }
      }.bind(this));
    } else {
      $.get('/api/wouso-quest/qlist', function(res) {
        if (this.isMounted()) {
          this.setState({
            questList: this.state.questList.concat(res),
            questLevels: this.state.questLevels
          });
        }
      }.bind(this));
    }
  },

  render: function() {
    var alert = null;
    if (!this.state.currentQuest) {
      alert = "Please select quest.";
    } else if (this.state.questLevels.length === 0) {
      alert = "Quest is empty. Start adding questions.";
    }

    return (<div>
      <div className="row">
        <div className="large-12 columns">
          <div className="reveal-modal" id="questManageModal"
               data-reveal aria-hidden="true" role="dialog">
          </div>
          <a className="radius button small right" href="#"
            onClick={this.handleAddClick.bind(this, null)}>
            Add quest
          </a>
          <h2> Edit Quest</h2>
          <select onChange={this.changeQuest}>
            {this.state.questList.map(function(q, i) {
              return (<option key={i} value={q._id}>{q.name}</option>);
            })}
          </select>
        </div>
      </div>
      <div className="row">
        <div id="quest-edit" className="large-12 columns">
          {(alert ? <div id="quest-edit-alert">{alert}</div> : null)}
          {this.state.questLevels.map(function(q, i) {
            return (
              <div key={i} className="quest-edit-entry">
                <div className="quest-edit-entry-no">{"QUESTION #" + (i+1)}</div>
                <div>{q.question.question}</div>
              </div>
            );
          })}
          <div id="quest-edit-add">
            <a className="radius button small" href="#"
               onClick={QuestListEntry.handleEditClick.bind(this, null, this.state.currentQuestID)}>
              Add new question
            </a>
          </div>
        </div>
      </div>
    </div>);
  },

  changeQuest: function(event) {
    // Reload component for values different from default
    if (event.target.value !== this.state.questList[0]._id) {
      this.componentDidMount(event.target.value);
    } else {
      // No quest selected, clear state.
      this.setState(this.getInitialState());
      this.componentDidMount();
    }
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
      type : "refreshQuest"
    });
  },

  componentWillUnmount: function() {
    QStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return(
      <div>
        {<QuestContribManage {...intlData} />}
        <div className="spacer"></div>
        <div className="row">
          <ListSearch searchType='searchQuest' refreshType='refreshQuest'
                      selected={QuestListEntry.selected_quests} />
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

            <h2>
              { this.getIntlMessage('qotd_list_title') + " (" + this.state.total
                + " results" + (this.state.term != '' ? " for \""
                + this.state.term + "\"": '') + ")" }
            </h2>

            { this.state.questions.map(function (opt) {
              return <QuestListEntry key={opt._id} id={opt._id}
                                     text={opt.question} date={opt.date} />
            }, this)}
            <div className="spacer"></div>
            <ListNav total={this.state.total} no={this.state.no}
                     page={this.state.page} refreshType='refreshQuest' />
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
  ReactDOM.render(<QuestContrib {...intlData} />, document.getElementById('quest-contrib'));
