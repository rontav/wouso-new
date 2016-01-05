var React = require('react');


var QotdAdmin = React.createClass({
  mixins: [require('react-intl').IntlMixin],

  render: function () {
    return (
      <div className="row">
        <div className="large-12 columns">
          <h3> { this.getIntlMessage('qotd_title_settings') } </h3>
          <form method='post' action='/api/qotd/settings'>
            <label> { this.getIntlMessage('qotd_settings_default_ans') } </label>
            <input name='defaultNoOfAns' type='text' defaultValue={noOfOptions}></input>
            <label> { this.getIntlMessage('qotd_settings_timelimit') } </label>
            <input name='countdownTimer' type='text' defaultValue={countdownTimer}></input>
            <label> { this.getIntlMessage('qotd_settings_points') } </label>
            <input name='points' type='text' defaultValue={qotdPoints}></input>
            <input className="button small" type='submit' defaultValue={ this.getIntlMessage('button_save') }></input>
          </form>
        </div>
      </div>
    )
  }
})

module.exports = QotdAdmin;
