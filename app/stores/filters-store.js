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
    type: 'checkbox',
    label: 'Estimate',
    active: false,
    alwaysVisible: true,
    defaultCriterLabel: 'All',
    field: 'estimate',
    criteria: [],
    criteriaOptions: [
      { field: '~', label: 'Unestimated', default: true },
      { field: 's', label: 'Small', default: true },
      { field: 'm', label: 'Medium', default: true },
      { field: 'l', label: 'Large', default: true },
      { field: 'xl', label: 'Extra Large', default: true }
    ]
  },
  {
    type: 'tags',
    label: 'Tagged with',
    active: false,
    alwaysVisible: false,
    defaultCriteriaLabel: 'None',
    field: 'tags',
    criteria: '',
    criteriaOptions: []
  },
  {
    type: 'members',
    label: 'Assigned to',
    active: false,
    alwaysVisible: false,
    defaultCriteriaLabel: 'None',
    field: 'assigned_to',
    criteria: '',
    criteriaOptions: [
      { field: 'unassigned', value: '', label: 'Unassigned', default: false }
    ]
  },
  {
    type: 'members',
    label: 'Created by',
    active: false,
    alwaysVisible: false,
    defaultCriteriaLabel: 'None',
    field: 'created_by',
    criteria: '',
    criteriaOptions: []
  }
]);

var internals = {
  init: function(product, user) {
    Promise.all([
      product.members.fetch(),
      product.tags.fetch()
    ])
    .then(function() {
      // TODO this should be broadened to all filters that need members data
      let needsMembers = filters.where({ type: 'members' })
      if (needsMembers.length > 0) {
        _.each(needsMembers, function(filter) {
          let options = _.clone(filter.get('criteriaOptions'));
          let members = _.invoke(product.members.where({ revoked: false }), 'toJSON');
          options.unshift({ field: 'me', value: user.id, label: 'Me', default: false });
          options.unshift({ members: members });
          filter.set('criteriaOptions', options);
        })
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
        filter.set({ active: false, criteria });
      } else {
        filter.set({ active: true, criteria });
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
  },

  all: function() {
    return filters.toJSON();
  },
};

var proxyMethods = ['on', 'off', 'once', 'listenTo', 'stopListening']

proxyMethods.forEach(function(method) {
  FiltersStore[method] = filters[method].bind(filters);
});

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case FiltersConstants.INIT_FILTERS:
      internals.init(action.product, action.user, action.query);
      break;
    case FiltersConstants.UPDATE_FILTER:
      internals.update(action.field, action.criteria, action.unset);
      break;
    default:
      break;
  }
});

export default FiltersStore;
