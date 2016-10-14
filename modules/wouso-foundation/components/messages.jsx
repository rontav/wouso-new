var React        = require('react');
var ReactDOM     = require('react-dom');
var ReactIntl    = require('react-intl');
var IntlProvider = require('react-intl').IntlProvider;

var locales = require('../locales/locales.js');
var config  = require('../../../config.json');

var intlData = {
  locale   : 'en-US',
  messages : locales[config.language]
};

var Messages = ReactIntl.injectIntl(React.createClass({
  getInitialState: function() {
    return {
      selectedUser    : null,
      currentMessage  : null,
      suggestedUsers  : [],
      users           : [],
      messages        : []
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
    // Check if user conversation exists
    var found = false;
    this.state.users.forEach(function(user) {
      if (user._id == id) {
        found = true;
      }
    })

    if (found) {
      $.get('/api/messages/' + id, function(res) {
        if (this.isMounted()) {
          this.setState({
            selectedUser    : id,
            messages        : res
          });
        }
      }.bind(this));

    } else {
      $.get('/api/user?id=' + id, function(res) {
        var currentUsers = this.state.users;
        currentUsers.unshift(res);

        if (this.isMounted()) {
          this.setState({
            users        : currentUsers,
            selectedUser : id,
            messages     : []
          });
        }
      }.bind(this));
    }
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
    $.get('/api/users/search?search=' + event.target.value, function(res) {
      if (this.isMounted()) {
        this.setState({
          suggestedUsers : res
        });
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div id='message-box' className='row'>
        <div className='large-4 columns' id='messages-left'>
          <div className='messages-user-search'>
            <b>Start a new conversation</b>
            <label>Search by name or email:</label>
            <input id='search' type='text' onChange={this.searchUser} />
            {this.state.suggestedUsers.length !== 0 ? <label>Suggested users:</label> : null}
            {this.state.suggestedUsers.map(function(user, i) {
              return (
                <div key={i} className='messages-user' onClick={this.handleUserSelect.bind(this, user._id)}>
                  {user.name} {user.email} {user._id}
                </div>
              );
            }, this)}
            <div className="spacer" />
          </div>
          {this.state.users.map(function(user, i) {
            if (user._id == this.state.selectedUser) {
              return (
                <div key={i} className='messages-user-selected' onClick={this.handleUserSelect.bind(this, user._id)}>
                  {user.name} {user.email} {user._id}
                </div>
              );
            } else {
              return (
                <div key={i} className='messages-user' onClick={this.handleUserSelect.bind(this, user._id)}>
                  {user.name} {user.email} {user._id}
                </div>
              );
            }
          }, this)}
        </div>
        <div className='large-8 columns'>
          {(this.state.messages.length == 0 && this.state.selectedUser != null) ? <p>{this.props.intl.formatMessage({id: 'messages_alert_nomsg'})}</p> : null}
          {this.state.messages.map(function(msg, i) {
            // Set correct name for the sender of a message
            // Can be 'Me' or the name of the sender
            var username = 'Me';
            if (msg.direction == 'recv') {
              this.state.users.forEach(function(user) {
                if (user._id === this.state.selectedUser) {
                  username = user.name;
                }
              }, this);
            }
            return (
              <p key={i}><b>{username}: </b>{msg.message}</p>
            );
          }, this)}
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
}));


if ( $('#messages').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <Messages />
    </IntlProvider>
  , document.getElementById('messages'));
}
