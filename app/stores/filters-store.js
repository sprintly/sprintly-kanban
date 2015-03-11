import _ from 'lodash';
import {Model, Collection} from 'backdash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import FiltersConstants from '../constants/filters-constants';
import Promise from 'bluebird';

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
    type: 'checkbox',
    label: 'Type',
    active: false,
    alwaysVisible: true,
    field: 'type',
    criteria: [],
    criteriaOptions: [
      { field: 'story', label: 'Story', default: true },
      { field: 'task', label: 'Task', default: true },
      { field: 'defect', label: 'Defect', default: true},
      { field: 'test', label: 'Test', default: true }
    ]
  },
  {
    type: 'dropdown',
    label: 'Assigned to',
    active: false,
    alwaysVisible: false,
    defaultCriteriaLabel: 'None',
    field: 'assigned_to',
    criteria: '',
    criteriaOptions: [
      { field: 'unassigned', label: 'Unassigned', default: false }
    ]
  },
  {
    type: 'tags',
    label: 'Tagged with',
    active: false,
    alwaysVisible: true,
    defaultCriteriaLabel: 'None',
    field: 'tags',
    criteria: '',
    criteriaOptions: []
  }
]);

var internals = {
  init: function(product) {
    Promise.all([
      product.members.fetch(),
      product.tags.fetch()
    ])
    .then(function() {
      // TODO this should be broadened to all filters that need members data
      let needsMembers = filters.findWhere({ field: 'assigned_to' })
      if (needsMembers) {
        let options = _.clone(needsMembers.get('criteriaOptions'));
        options.unshift({ members: product.members.toJSON() });
        needsMembers.set('criteriaOptions', options);
      }

      let needsTags = filters.findWhere({ field: 'tags' });
      if (needsTags) {
        needsTags.set('criteriaOptions', product.tags.toJSON());
      }
    });
  },

  update: function(field, criteria, unset) {
    let filter = filters.findWhere({ field: field });
    if (filter) {
      if (unset) {
        filter.set({ active: false });
      } else {
        filter.set({ active: true, criteria: criteria });
      }
    }
  },
};

var FiltersStore = {
  getActiveOrDefault: function() {
    return _.invoke(filters.filter(function(model) {
      return model.get('active') || model.get('alwaysVisible');
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
    case FiltersConstants.INIT_FILTERS:
      internals.init(action.product);
      break;
    case FiltersConstants.UPDATE_FILTER:
      internals.update(action.field, action.criteria, action.unset);
      break;
    default:
      break;
  }
});

export default FiltersStore;
