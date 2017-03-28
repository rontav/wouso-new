var AppDispatcher = require('../dispatchers/app');
var EventEmitter  = require('events').EventEmitter;
var assign        = require('object-assign');

var CHANGE_EVENT = 'change';
var _date = null;

var QuestStore = assign({}, EventEmitter.prototype, {

  getDate: function() {
    return _date;
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
      case 'updateQuestionOrder':
        QuestStore.emitChange();
        break;
    }

    // No errors. Needed by promise in Dispatcher.
    return true;
  })
});

module.exports = QuestStore;
