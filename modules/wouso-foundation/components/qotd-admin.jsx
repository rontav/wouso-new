var React     = require('react');
var ReactIntl = require('react-intl');


var QotdAdmin = React.createClass({
  render: function () {
    return (
      <div className="row">
        <div className="large-12 columns">

          <h3> {this.props.intl.formatMessage({id: 'qotd_title_settings'})} </h3>
          <form method='post' action='/api/qotd/settings'>

            <label> {this.props.intl.formatMessage({id: 'qotd_settings_default_ans'})} </label>
            <input name='defaultNoOfAns' type='text' defaultValue={noOfOptions} />

            <label> {this.props.intl.formatMessage({id: 'qotd_settings_timelimit'})} </label>
            <input name='countdownTimer' type='text' defaultValue={countdownTimer} />

            <label> {this.props.intl.formatMessage({id: 'qotd_settings_points'})} </label>
            <input name='points' type='text' defaultValue={qotdPoints} />

            <input className="button small" type='submit'
              defaultValue={this.props.intl.formatMessage({id: 'button_save'})} />
          </form>
        </div>
      </div>
    )
  }
})

module.exports = ReactIntl.injectIntl(QotdAdmin);
