var React = require('react');


var ListNav = React.createClass({
  refreshList: function (page) {
    AppDispatcher.handleViewAction({
      type : this.props.refreshType,
      no   : String(this.props.no),
      page : String(page)
    });
  },

  render: function() {
    this.pages = [];
    if (this.props.total) {
      this.pages = Math.ceil(this.props.total/this.props.no);
      this.pages = Array.apply(0, Array(this.pages)).map(function(j, i) {
        return i+1;
      });
    }

    return (
      <div className="questions-pages text-center">
        { this.pages.map(function (opt, i) {
          if (opt == this.props.page) {
            return (
              <b key={i}>
                <a key={i} href="#" onClick={this.refreshList.bind(this, opt)}>
                  {opt}
                </a>
              </b>
            );
          } else {
            return (
              <a key={i} href="#" onClick={this.refreshList.bind(this, opt)}>
                {opt}
              </a>
            );
          }
        }, this) }
      </div>
    );
  }
});

module.exports = ListNav;
