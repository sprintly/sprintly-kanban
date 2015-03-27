import _ from 'lodash';
import {Model, Collection} from 'backdash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import FiltersConstants from '../constants/filters-constants';
import Promise from 'bluebird';
import filtersData from './filters-data';

// TODO this needs it's own file eventually
var FiltersCollection = Collection.extend({
  active: function() {
    return this.where({ active: true });
  },

  flatObject: function() {
    var active = _.invoke(this.active(), 'toJSON');
    return _.zipObject(_.pluck(active, 'field'), _.pluck(active, 'criteria'));
  }
});

var filters = new FiltersCollection(filtersData);

var FiltersStore = module.exports = {
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

var internals = FiltersStore.internals = {
  init: function(product, user) {
    let members = product.members;
    let tags = product.tags;
    return Promise.all([
      members.fetch(),
      tags.fetch()
    ])
    .then(function() {
      internals.decorateMembers(members, user);
      internals.decorateTags(tags);
    });
  },

  decorateMembers: function(members, user) {
    let needsMembers = filters.where({ type: 'members' });
    if (needsMembers.length > 0) {
      let activeMembers = _.invoke(members.where({ revoked: false }), 'toJSON');
      _.each(needsMembers, function(filter) {
        let options = _.clone(filter.get('criteriaOptions'));
        let prevMembers = _.findWhere(options, function(opt) {
          return _.has(opt, 'members');
        });

        if (prevMembers) {
          prevMembers.members = activeMembers;
        } else {
          options.unshift({
            field: 'me',
            label: 'Me',
            default: false,
            value: user.id
          });
          options.unshift({ members: activeMembers });
        }

        filter.set('criteriaOptions', options);
      });
    }
  },

  decorateTags: function(tags) {
    let needsTags = filters.findWhere({ type: 'tags' });
    if (needsTags) {
      needsTags.set('criteriaOptions', tags.toJSON());
    }
  },

  update: function(field, criteria, unset) {
    let filter = filters.findWhere({ field: field });
    if (filter) {
      filter.set({ active: unset !== true, criteria });
    }
  },
};

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
