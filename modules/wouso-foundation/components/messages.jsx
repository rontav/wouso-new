var React        = require('react');
var ReactDOM     = require('react-dom');
var IntlProvider = require('react-intl').IntlProvider;

var locales = require('../locales/locales.js');
var config  = require('../../../config.json');

var intlData = {
  locale   : 'en-US',
  messages : locales[config.language]
};

var Messages = React.createClass({
  getInitialState: function() {
    return {
      selectedUser   : null,
      currentMessage : null,
      users          : [],
      messages       : []
    };
  },

  componentDidMount: function() {
    $.get('/api/messages', function(res) {
      if (this.isMounted()) {
        this.setState({
          users: res.users
        });
      }
    }.bind(this));
  },

  handleUserSelect: function(id) {
    $.get('/api/messages/' + id, function(res) {
      if (this.isMounted()) {
        this.setState({
          selectedUser : id,
          messages     : res
        });
      }
    }.bind(this));
  },

  sendMessage: function() {
    var params = {
      'to'      : this.state.selectedUser,
      'message' : this.state.currentMessage
    }
    $.post('/api/messages/send', params);
    this.handleUserSelect(this.state.selectedUser);
  },

  searchUser: function(event) {
    alert(event.target.value)
  },

  render: function() {
    return (
      <div id='message-box' className='row'>
        <div className='large-4 columns' id='messages-left'>
          <div className='messages-user'>
            <p>Start a new conversation</p>
            <input id='search' type='text' onChange={this.searchUser} />
          </div>
          {this.state.users.map(function(user) {
            return (
              <div className='messages-user' onClick={this.handleUserSelect.bind(this, user._id)}>
                {user._id}
              </div>
            );
          }, this)}
        </div>
        <div className='large-8 columns'>
          {this.state.messages.map(function(msg) {
            var user = 'Me';
            if (msg.direction == 'recv') {
              user = 'Him';
            }
            return (
              <p><b>{user}: </b>{msg.message}</p>
            );
          })}
        </div>
        <div className='large-8 columns'>
          <div className="row collapse">
            <div className='small-10 columns'>
              <textarea id='message' type='text' rows='1' onChange={this.editMessage} />
            </div>
            <div className='small-2 columns'>
              <input className="button postfix"
                type='submit' value='Send' onClick={this.sendMessage} />
            </div>
          </div>
        </div>
      </div>
    );
  },

  editMessage: function(event) {
    this.setState({
      currentMessage: event.target.value
    });
  }
});

if ( $('#messages').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <Messages />
    </IntlProvider>
  , document.getElementById('messages'));
}
