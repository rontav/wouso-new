var React     = require('react');
var ReactIntl = require('react-intl');


var QuestAdmin = React.createClass({
  render: function () {
    return (
      <div className="row">
        <div className="large-12 columns">
          <h3> {this.props.intl.formatMessage({id: 'quest_title_settings'})} </h3>
          <form method='post' action='/api/wouso-quest/settings'>
            <label> {this.props.intl.formatMessage({id: 'quest_settings_tth'})} </label>
            <input name='timeToHint' type='text' defaultValue={timeToHint} />

            <input className="button small" type='submit'
              defaultValue={this.props.intl.formatMessage({id: 'button_save'})} />
          </form>
        </div>
      </div>
    )
  }
})

module.exports = ReactIntl.injectIntl(QuestAdmin);
