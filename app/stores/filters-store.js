import _ from 'lodash';
import {Model, Collection} from 'backdash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import FiltersConstants from '../constants/filters-constants';
import Promise from 'bluebird';
import filtersData from './filters-data';
import ProductStore from '../stores/product-store';
import {products, user} from '../lib/sprintly-client';
import {EventEmitter} from 'events';

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

var FiltersStore = module.exports = _.assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit('change');
  },

  addChangeListener(callback) {
    this.on('change', callback);
  },

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  },

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
});

var internals = FiltersStore.internals = {
  init: function(product) {
    product = products.get(product);
    filters.reset(filtersData, { silent: true });
    let members = product.members;
    let tags = product.tags;
    return Promise.all([
      members.fetch(),
      tags.fetch()
    ])
    .then(function() {
      internals.decorateMembers(members);
      internals.decorateTags(tags);
      FiltersStore.emitChange();
    });
  },

  decorateMembers: function(members) {
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
      FiltersStore.emitChange();
    }
  },
};

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case 'INIT_PRODUCTS':
      if (action.product) {
        internals.init(action.product);
      }
      break;
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
