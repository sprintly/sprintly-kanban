import _ from 'lodash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import {EventEmitter} from 'events';

var payload = [];
var isLoading = false;

var internals = {
  populateCounts(results) {
    results.products = _.pluck(payload, 'product');

    if (results.products.length > 0) {
      results.products = _.uniq(results.products, 'id');
    }

    _.each(payload, function(item) {
      switch(item.status) {
        case 'accepted':
          results.accepted.push(item);
          break;
        case 'completed':
          results.complete.push(item);
          break;
        case 'in-progress':
          results.current.push(item);
          break;
        case 'backlog':
          results.backlog.push(item);
          break;
        case 'someday':
          results.someday.push(item);
          break;
        default:
          break;
      }

      switch(item.type) {
        case 'story':
          results.stories.push(item);
          break;
        case 'task':
          results.tasks.push(item);
          break;
        case 'defect':
          results.defects.push(item);
          break;
        case 'test':
          results.tests.push(item);
          break;
      }
    })

    return results;
  }
};

var SearchStore = _.assign({}, EventEmitter.prototype, {
  getResults() {
    let results = {
      loading: isLoading,
      items: payload,

      stories: [],
      defects: [],
      tasks: [],
      tests: [],

      accepted: [],
      complete: [],
      current: [],
      backlog: [],
      someday: []
    };

    return internals.populateCounts(results);
  },

  emitChange() {
    this.emit('change');
  },

  addChangeListener(callback) {
    this.on('change', callback);
  },

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }
});


AppDispatcher.register(function(action) {

  switch(action.actionType) {
    case 'SEARCH_START':
      isLoading = true;
      SearchStore.emitChange();
      break;
    case 'SEARCH_SUCCESS':
      isLoading = false;
      payload = action.payload;
      SearchStore.emitChange();
      break;
    default:
      break;
  }

});

export default SearchStore;
