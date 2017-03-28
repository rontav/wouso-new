import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, browserHistory } from 'react-router';

import ReactIntl from 'react-intl';
import { IntlProvider } from 'react-intl';

import locales from '../locales/locales.js';
import config from '../../../config.json';


var intlData = {
  locale: 'en-US',
  messages: locales[config.language]
};


var Settings = ReactIntl.injectIntl(React.createClass({
  getInitialState: function () {
    return {
      settings: {},
      loginLevel: null,
      loginError: false,
      noLoginMethods: 0,
      loginSignup: false,
      localLogin: false,
      facebookLogin: false,
      twitterLogin: false,
      googleLogin: false,
      githubLogin: false
    };
  },

  componentDidMount: function () {
    $.get('/api/profile/settings', function (res) {
      this.setState({
        settings: res,
        loginLevel: res['login-level'],
        loginSignup: (res['login-signup'] == 'true'),
        localLogin: (res['login-local'] == 'true'),
        facebookLogin: (res['login-facebook'] == 'true'),
        twitterLogin: (res['login-twitter'] == 'true'),
        googleLogin: (res['login-google'] == 'true'),
        githubLogin: (res['login-github'] == 'true')
      });

      // Count number of active login methods
      var sum = 0;
      ['local', 'facebook', 'twitter', 'google', 'github'].forEach(function (sn) {
        if (res['login-' + sn] == 'true') { sum++; }
      });

      // Save sum
      this.setState({ noLoginMethods: sum });

    }.bind(this));

  },

  handleCheckboxChange: function (sn, event) {
    // Do not allow all login methods to be disabled
    if (this.state.noLoginMethods == 1 && !this.state[sn] || this.state.noLoginMethods > 1) {
      // Toggle checkbox value
      this.setState({ [sn]: !this.state[sn] });
      // Update number of social methods available
      if (this.state[sn]) {
        this.setState({ noLoginMethods: this.state.noLoginMethods - 1 });
      } else {
        this.setState({ noLoginMethods: this.state.noLoginMethods + 1 });
      }
      // Save new value to DB
      $.get('/api/settings/set?' + event.target.id + '=' + !this.state[sn]);

    } else {
      this.setState({ loginError: true });
    }
  },

  handleDropdownChange: function (event) {
    // Save new value to DB
    $.get('/api/settings/set?' + event.target.id + '=' + event.target.value);
  },

  render: function () {
    return (
      <div>
        <div className="row">
          <div className="large-12 columns">
            <h1> {this.props.intl.formatMessage({ id: 'admin_app_title' })} </h1>
            {this.state.loginError ? (<div className='small login-message-nologin error'>
              {this.props.intl.formatMessage({ id: 'settings-nologin' })}</div>) : null}
          </div>
        </div>
        <div className="row">
          <div className="large-6 columns">
            <h4> {this.props.intl.formatMessage({ id: 'admin_app_login' })} </h4>
            <label htmlFor='login-level'>
              {this.props.intl.formatMessage({ id: 'admin_app_login_level' })}
            </label>
            <select className='login-level-select' id='login-level' defaultValue={this.state.loginLevel} onChange={this.handleDropdownChange}>
              {['Root', 'Admin', 'Teacher', 'Contributor', 'Player'].map(function (role, i) {
                if (i == this.state.loginLevel) {
                  return (<option key={i} value={i} selected>
                    {this.props.intl.formatMessage({ id: 'role_' + role.toLowerCase() })}
                  </option>);
                } else {
                  return (<option key={i} value={i}>
                    {this.props.intl.formatMessage({ id: 'role_' + role.toLowerCase() })}
                  </option>);
                }
              }, this)};
            </select>
            <input className='setting' type='checkbox' id='login-signup'
              onChange={this.handleCheckboxChange.bind(this, 'loginSignup')}
              checked={this.state.loginSignup} />
            {this.props.intl.formatMessage({ id: 'admin_app_signup' })}
          </div>
          <div className="large-6 columns">
            <input className='setting' type='checkbox' id='login-local'
              onChange={this.handleCheckboxChange.bind(this, 'localLogin')}
              checked={this.state.localLogin} />
            {this.props.intl.formatMessage({ id: 'admin_app_local' })}
            <br />
            <input className='setting' type='checkbox' id='login-facebook'
              onChange={this.handleCheckboxChange.bind(this, 'facebookLogin')}
              checked={this.state.facebookLogin} />
            {this.props.intl.formatMessage({ id: 'admin_app_facebook' })}
            <br />
            <input className='setting' type='checkbox' id='login-twitter'
              onChange={this.handleCheckboxChange.bind(this, 'twitterLogin')}
              checked={this.state.twitterLogin} />
            {this.props.intl.formatMessage({ id: 'admin_app_twitter' })}
            <br />
            <input className='setting' type='checkbox' id='login-google'
              onChange={this.handleCheckboxChange.bind(this, 'googleLogin')}
              checked={this.state.googleLogin} />
            {this.props.intl.formatMessage({ id: 'admin_app_google' })}
            <br />
            <input className='setting' type='checkbox' id='login-github'
              onChange={this.handleCheckboxChange.bind(this, 'githubLogin')}
              checked={this.state.githubLogin} />
            {this.props.intl.formatMessage({ id: 'admin_app_github' })}
          </div>
        </div>
      </div>
    );
  }
}));

var Users = ReactIntl.injectIntl(React.createClass({
  getInitialState: function () {
    return {
      users: []
    };
  },

  componentDidMount: function () {
    $.get('/api/users', function (res) {
      if (this.isMounted()) {
        this.setState({
          users: res
        });
      }
    }.bind(this));
  },

  handleDropdownChange: function (event) {
    // Save new role to DB
    $.get('/api/user/' + event.target.id + '?role=' + event.target.value);
  },

  render: function () {
    return (<div>
      <div className="row">
        <div className="large-12 columns">
          <h1> {this.props.intl.formatMessage({ id: 'admin_users_title' })} </h1>
          {this.state.users.map(function (user, i) {
            return (<div className='profile-card' key={i}>
              ID: {user._id}
              <br />
              Name: {user.name}
              <select className='role-select' id={user._id} defaultValue={user.role} onChange={this.handleDropdownChange}>
                {['Root', 'Admin', 'Teacher', 'Contributor', 'Player'].map(function (role, i) {
                  return (<option key={i} value={i}>
                    {this.props.intl.formatMessage({ id: 'role_' + role.toLowerCase() })}
                  </option>);
                }, this)};
              </select>
              <div className='spacer' />
            </div>)
          }, this)}
        </div>
      </div>
    </div>);
  }
}));

var Tags = ReactIntl.injectIntl(React.createClass({
  getInitialState: function () {
    return {
      tags: []
    };
  },

  componentDidMount: function () {
    $.get('/api/tags', function (res) {
      if (this.isMounted()) {
        this.setState({
          tags: res
        });
      }
    }.bind(this));
  },

  render: function () {
    return (<div>
      <div className="row">
        <div className="large-12 columns">
          <h1> {this.props.intl.formatMessage({ id: 'admin_tags_title' })} </h1>
          <h4> {this.props.intl.formatMessage({ id: 'admin_tags_title_add' })} </h4>
          <form method='post' action='/api/tags/add'>
            <label> {this.props.intl.formatMessage({ id: 'admin_tags_add_name' })} </label>
            <input name='name' type='text' />
            <label> {this.props.intl.formatMessage({ id: 'admin_tags_add_game' })} </label>
            <input name='type' type='text' />
            <input className='button small' type='submit' value={this.props.intl.formatMessage({ id: 'button_save' })} />
          </form>
        </div>
      </div>
      <div className='spacer' />
      <div className="row">
        <div className="large-12 columns">
          <h4> {this.props.intl.formatMessage({ id: 'admin_tags_title_list' })} </h4>
          {this.state.tags.map(function (tag, i) {
            return (<div key={i}>
              <div className="large-4 columns"> {tag.name} </div>
              <div className="large-4 columns"> {tag.type} </div>
              <div className="large-4 columns"> {tag.count} </div>
            </div>);
          })}
        </div>
      </div>
    </div>);
  }
}));

if ($('#admin').length) {
  ReactDOM.render(
    <IntlProvider locale={intlData.locale} messages={intlData.messages}>
      <Router history={history}>
        <Redirect from="/admin" to="/admin/settings" />
        <Route path="/admin/settings" component={Settings} />
        <Route path="/admin/users" component={Users} />
        <Route path="/admin/tags" component={Tags} />
        <Redirect from="/admin/*" to="/admin/settings" />
      </Router>
    </IntlProvider>
    , document.getElementById('admin'));
}
