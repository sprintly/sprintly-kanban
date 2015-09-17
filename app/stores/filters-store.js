import _ from 'lodash';
import {Collection} from 'backdash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import FiltersConstants from '../constants/filters-constants';
import filtersData from './filters-data';
import {user} from '../lib/sprintly-client';
import {EventEmitter} from 'events';

// TODO this needs it's own file eventually
let FiltersCollection = Collection.extend({
  active: function() {
    return this.where({ active: true });
  },

  flatObject: function() {
    var active = _.invoke(this.active(), 'toJSON');
    return _.zipObject(_.pluck(active, 'field'), _.pluck(active, 'criteria'));
  }
});

let filters = new FiltersCollection(filtersData);

let FiltersStore = _.assign({}, EventEmitter.prototype, {
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
  }
});

let internals = FiltersStore.internals = {
  init(members, tags) {
    filters.reset(filtersData, { silent: true });
    internals.decorateMembers(members);
    internals.decorateTags(tags);
    FiltersStore.emitChange();
  },

  decorateMembers(members) {
    filters.members = members;
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
    filters.tags = tags;
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
      internals.init(filters.members, filters.tags);
      break;
    default:
      break;
  }
});

export default FiltersStore;
