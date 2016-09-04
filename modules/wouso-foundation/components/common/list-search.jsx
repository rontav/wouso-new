var React         = require('react');
var AppDispatcher = require('../../dispatchers/app');


var ListSearch = React.createClass({
  handleDeleteClick: function() {
    if (this.props.selected.length == 0) {
      alert('First select the questions that you need to delete.');
    } else {
      var refreshType = this.props.refreshType;
      var conf = confirm('Are you sure you want to permanently delete selected questions?');
      if (conf) {
        $.ajax({
          type    : "DELETE",
          url     : '/api/wouso-quest/delete?id=' + this.props.selected.join(','),
          data    : null,
          success : gotResponse
        });
      }

      function gotResponse(res) {
        AppDispatcher.handleViewAction({
          type: refreshType
        });
      }
    }
  },

  handleClearClick: function() {
    AppDispatcher.handleViewAction({
      type : this.props.searchType,
      term : ''
    });
    AppDispatcher.handleViewAction({
      type : this.props.refreshType
    });
    this.clearButton.value = '';
  },

  handleChange: function(event) {
    AppDispatcher.handleViewAction({
      type : this.props.searchType,
      term : String(event.target.value)
    });
  },

  render: function() {
    return (
      <div>
        <a className="radius button" href="#"
           onClick={this.handleDeleteClick}>Delete</a>
        <div className="row">
          <div className="large-12 columns">
            <div className="row collapse">
              <div className="small-4 columns">
                <input type="text" ref={(ref) => this.clearButton = ref}
                       onChange={this.handleChange} placeholder="Search">
                </input>
              </div>
              <div className="small-1 columns">
                <a href="#" className="button postfix"
                   onClick={this.handleClearClick}>Clear</a>
              </div>
              <div className="small-7 columns"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ListSearch;
