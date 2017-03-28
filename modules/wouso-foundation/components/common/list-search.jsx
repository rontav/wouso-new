import React from 'react';
import AppDispatcher from '../../dispatchers/app';


class ListSearch extends React.Component {

  constructor() {
    super();
    this.gotResponse = this.gotResponse.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleClearClick = this.handleClearClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  // static propTypes = {
  // selected: React.PropTypes,
  // searchType: React.PropTypes,
  // refreshType : React.PropTypes,
  // }

  gotResponse() {
    AppDispatcher.handleViewAction({
      type: refreshType
    });
  }
  handleDeleteClick() {
    if (this.props.selected.length == 0) {
      alert('First select the questions that you need to delete.');
    } else {
      //var refreshType = this.props.refreshType; ?? 
      var conf = confirm('Are you sure you want to permanently delete selected questions?');

      if (conf) {
        $.ajax({
          type: "DELETE",
          url: '/api/wouso-quest/delete?id=' + this.props.selected.join(','),
          data: null,
          success: gotResponse
        });
      }
    }
  }

  handleClearClick() {
    AppDispatcher.handleViewAction({
      type: this.props.searchType,
      term: ''
    });
    AppDispatcher.handleViewAction({
      type: this.props.refreshType
    });
    this.clearButton.value = '';
  }

  handleChange(event) {
    AppDispatcher.handleViewAction({
      type: this.props.searchType,
      term: String(event.target.value)
    });
  }

  render() {
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
};

module.exports = ListSearch;
