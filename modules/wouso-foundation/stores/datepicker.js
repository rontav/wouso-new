import  AppDispatcher from '../dispatchers/app';
import  {EventEmitter} from 'events';
import  assign   from 'object-assign';

var CHANGE_EVENT = 'change';

var _date = null;


var DateStore = assign({}, EventEmitter.prototype, {

  getDate: () => {
    return _date;
  },

  emitChange: () => {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  dispatcherIndex: AppDispatcher.register((payload) => {
    switch(payload.action.type) {
      case 'refreshDate':
        _date = payload.action.date;
        DateStore.emitChange();
        break;
    }

    // No errors. Needed by promise in Dispatcher.
    return true;
  })
});

module.exports = DateStore;
