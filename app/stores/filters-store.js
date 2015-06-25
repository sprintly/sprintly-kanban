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
  init: function(members, tags) {
    filters.reset(filtersData, { silent: true });
    internals.decorateMembers(members);
    internals.decorateTags(tags);
    FiltersStore.emitChange();
  },

  decorateMembers: function(members) {
    let needsMembers = filters.where({ type: 'members' });
    if (needsMembers.length > 0) {
      let activeMembers = internals.membersWithAccess(members);

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

  membersWithAccess: function(members) {
    let access = {revoked: false};

    if(_.isArray(members)) {
      return _.where(members, access);
    } else {
      return _.invoke(members.where(access), 'toJSON');
    }
  },

  decorateTags: function(tags) {
    let needsTags = filters.findWhere({ type: 'tags' });
    if (needsTags) {
      if(!_.isArray(tags)) {
        tags = tags.toJSON();
      }
      needsTags.set('criteriaOptions', tags);
    }
  },

  update: function(field, criteria, unset) {
    let filter = filters.findWhere({ field: field });
    if (filter) {
      filter.set({ active: unset !== true, criteria });
      FiltersStore.emitChange();
    }
  }
};

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case FiltersConstants.INIT_FILTERS:
      internals.init(action.members, action.tags);
      break;
    case FiltersConstants.UPDATE_FILTER:
      internals.update(action.field, action.criteria, action.unset);
      break;
    case FiltersConstants.CLEAR_FILTERS:
      internals.init(action.members, action.tags);
      break;
    default:
      break;
  }
});
