import AppDispatcher from '../dispatchers/app-dispatcher';
import FiltersConstants from '../constants/filters-constants';
import {products, user} from '../lib/sprintly-client';

var FiltersActions = {
  init: function(product, user, query) {
    let members = product.members;
    let tags = product.tags;
    return Promise.all([
      members.fetch(),
      tags.fetch()
    ])
    .then(function() {
      AppDispatcher.dispatch({
        actionType: FiltersConstants.INIT_FILTERS,
        product,
        members,
        tags
      })
    });
  },

  update: function(field, criteria, options={}) {
    AppDispatcher.dispatch({
      actionType: FiltersConstants.UPDATE_FILTER,
      unset: options.unset === true,
      field,
      criteria,
    });
  },

  clear: function(members, tags) {
    AppDispatcher.dispatch({
      actionType: FiltersConstants.CLEAR_FILTERS,
      members,
      tags
    });
  }
};

export default FiltersActions;
