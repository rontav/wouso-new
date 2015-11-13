var AppDispatcher = require('../dispatchers/app');
var EventEmitter  = require('events').EventEmitter;
var assign        = require('object-assign');

var CHANGE_EVENT = 'change';

var _qlist = [];
var _count = null;

function getData(no, page) {
  var url = '/api/qotd/list/' + no + '/' + page;
  $.get(url, function(res) {
    _qlist = res.questions;
    _count = res.count;
    QStore.emitChange();
  });
}

var QStore = assign({}, EventEmitter.prototype, {

  getCurrent: function() {
    return _qlist;
  },

  getCount: function() {
    return _count;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    switch(payload.action.type) {
      case 'refreshPage':
        getData(payload.action.no, payload.action.page);
        break;
    }

    // No errors. Needed by promise in Dispatcher.
    return true;
  })
});

module.exports = QStore;
