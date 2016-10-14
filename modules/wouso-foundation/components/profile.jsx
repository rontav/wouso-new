var React        = require('react');
var ReactDOM     = require('react-dom');
var IntlProvider = require('react-intl').IntlProvider;

var locales = require('../locales/locales.js');
var config  = require('../../../config.json');

var intlData = {
  locale   : 'en-US',
  messages : locales[config.language]
};

var Profile = React.createClass({
  getInitialState: function() {
    return {
      user : {}
    };
  },

  componentDidMount: function() {
    $.get('/api/user', function(res) {
      if (this.isMounted()) {
        this.setState({
          user: res
        });
      }
    }.bind(this));
  },

  render: function() {
    if (this.state.user.name || this.state.user.email) {
      return (
        <div>
          <h3>Primary info:</h3>
          <label>User name</label>
          <h4>{this.state.user.name}</h4>
          <label>Primary email</label>
          <h4>{this.state.user.email}</h4>
        </div>
      );
    } else if (this.state.user) {
      var availableEmails = [];
      ['local', 'facebook', 'github'].forEach(function(sn) {
        if (this.state.user[sn] && this.state.user[sn]['email']) {
          availableEmails.push(this.state.user[sn]['email']);
        }
      }, this);
      return (
        <div className="row">
          <div className="large-6 columns">
            <form method="post" action="/api/profile/primary">
              <h3>Let's set your primary name and email:</h3>
              <label>Real name:</label>
              <input name='primary_name' type='text' />
              <label>Primary email:</label>
              <select name='primary_email'>
                {availableEmails.map(function(email, i) {
                  return (<option key={i} value={email}> {email} </option>);
                })}
              </select>
              <input className="button small right" type="submit" value='Save' />
            </form>
          </div>
        </div>
      );
    }
  }
});

if ( $('#profile').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <Profile />
    </IntlProvider>
  , document.getElementById('profile'));
}
