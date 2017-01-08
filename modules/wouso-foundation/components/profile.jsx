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

var Profile = ReactIntl.injectIntl(React.createClass({
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
        <div className="row">
          <div className="large-6 columns">
            <h3>Primary info:</h3>
            <label>User name</label>
            <h4>{this.state.user.name}</h4>
            <label>Primary email</label>
            <h4>{this.state.user.email}</h4>
          </div>
          <ProfileSocialNetworks user={this.state.user} />
        </div>
      );
    } else if (this.state.user) {
      var socialNetworks = ['Facebook', 'Twitter', 'Google', 'GitHub'];

      var availableEmails = [];
      ['local', 'facebook', 'twitter', 'google', 'github'].forEach(function(sn) {
        if (this.state.user[sn] && this.state.user[sn]['email']) {
          availableEmails.push(this.state.user[sn]['email']);
        }
      }, this);
      return (<div>
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
          <ProfileSocialNetworks user={this.state.user} />
        </div>
        <div className="row">
          <div className="large-12 columns">
            <h3> {this.props.intl.formatMessage({id: 'profile_title_info'})} </h3>
            ID: {this.state.user._id}
            <br />
            ROLE: {this.state.user.role}
          </div>
          <div className='spacer' />
        </div>
        <div className="row">
          <div className="large-12 columns">
            { socialNetworks.map(function(sn, i) {
              return (<ProfileDetails key={sn} sn={sn} user={this.state.user} />);
            }, this)}
          </div>
        </div>
      </div>);
    }
  }
}));

var ProfileDetails = ReactIntl.injectIntl(React.createClass({
  render: function() {
    if (this.props.user[this.props.sn.toLowerCase()]) {
      return (<div>
        <div className='profile-card'>
          <div className='profile-card-avatar'>
            <img src={this.props.user[this.props.sn.toLowerCase()]['avatar']} width='100px' height='100px' />
          </div>
          <div className='profile-card-name'>
            <h3> {this.props.user[this.props.sn.toLowerCase()]['name']} (id: {this.props.user[this.props.sn.toLowerCase()]['id']})</h3>
          </div>
          Email: {this.props.user[this.props.sn.toLowerCase()]['email']}
          <br />
          {this.props.intl.formatMessage({id: 'text_from'})} {this.props.sn}
        </div>
        <div className='spacer' />
      </div>);
    } else {
      return null;
    }
  }
}));

var ProfileSocialNetworks = ReactIntl.injectIntl(React.createClass({
  getInitialState: function() {
    return {
      settings : {}
    };
  },

  componentDidMount: function() {
    $.get('/api/profile/settings', function(res) {
      if (this.isMounted()) {
        this.setState({
          settings: res
        });
      }
    }.bind(this));
  },

  render: function() {
    var socialNetworks = ['Facebook', 'Twitter', 'Google', 'GitHub'];
    return (<div className="large-6 columns">
      <h5> Connected accounts </h5>
      { socialNetworks.map(function(sn, i) {
        if (this.props.user[sn.toLowerCase()]) {
          return (<p key={i}>{sn} is connected</p>);
        }
      }, this)}

      <h5> Connect social network accounts </h5>
      { socialNetworks.map(function(sn, i) {
        var snSetting = 'login-' + sn.toLowerCase();
        if (this.state.settings[snSetting] === 'true' && !this.props.user[sn.toLowerCase()]) {
          return (
            <p key={i}>
              <a href={'/wouso-social-login/connect/' + sn.toLowerCase()}>
                {this.props.intl.formatMessage({id: 'profile_connect_' + sn.toLowerCase()})}
              </a>
            </p>
          );
        }
      }, this)}
    </div>);
  }
}));


if ( $('#profile').length ) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <Profile />
    </IntlProvider>
  , document.getElementById('profile'));
}
