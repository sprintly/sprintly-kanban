import _ from 'lodash';
import {Model, Collection} from 'backdash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import FiltersConstants from '../constants/filters-constants';

// TODO this needs it's own file eventually
export var FiltersModel = Model.extend({

});

// TODO this needs it's own file eventually
export var FiltersCollection = Collection.extend({
  model: FiltersModel,

  active: function() {
    return this.where({ active: true });
  },

  flatObject: function() {
    var active = _.invoke(this.active(), 'toJSON');
    return _.zipObject(_.pluck(active, 'field'), _.pluck(active, 'criteria'));
  }
});

var filters = new FiltersCollection([

  {
    field: 'type',
    label: 'Type',
    active: false,
    default: true,
    criteria: [],
    criteriaOptions: [
      { field: 'story', label: 'Story', default: true },
      { field: 'task', label: 'Task', default: true },
      { field: 'defect', label: 'Defect', default: true},
      { field: 'test', label: 'Test', default: true }
    ]
  }

]);

var FiltersStore = {
  getActiveOrDefault: function() {
    return _.invoke(filters.filter(function(model) {
      return model.get('active') || model.get('default');
    }), 'toJSON');
  },

  getFlatObject: function() {
    return filters.flatObject();
  }
};

var proxyMethods = ['on', 'off', 'once', 'listenTo', 'stopListening']

proxyMethods.forEach(function(method) {
  FiltersStore[method] = filters[method].bind(filters);
});

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case FiltersConstants.UPDATE_FILTER:
      let filter = filters.findWhere({ field: action.field });
      if (filter) {
        filter.set({
          active: true,
          criteria: action.criteria
        });
      }
      break;
    default:
      break;
  }
});

export default FiltersStore;
