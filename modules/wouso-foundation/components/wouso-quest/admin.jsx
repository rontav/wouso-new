var React = require('react');


var QuestAdmin = React.createClass({
  mixins: [require('react-intl').IntlMixin],

  render: function () {
    return (
      <div className="row">
        <div className="large-12 columns">
          <h3> { this.getIntlMessage('quest_title_settings') } </h3>
          <form method='post' action='/api/wouso-quest/settings'>
            <label> { this.getIntlMessage('quest_settings_tth') } </label>
            <input name='timeToHint' type='text' defaultValue={timeToHint}></input>

            <input className="button small" type='submit'
              defaultValue={ this.getIntlMessage('button_save') }></input>
          </form>
        </div>
      </div>
    )
  }
})

module.exports = QuestAdmin;
