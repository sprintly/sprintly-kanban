import AppDispatcher from '../dispatchers/app-dispatcher';
import FiltersConstants from '../constants/filters-constants';

var FiltersActions = {
  init: function(product, user, query) {
    AppDispatcher.dispatch({
      actionType: FiltersConstants.INIT_FILTERS,
      product,
      user,
      query
    })
  },

  update: function(field, criteria, options={}) {
    AppDispatcher.dispatch({
      actionType: FiltersConstants.UPDATE_FILTER,
      unset: options.unset === true,
      field,
      criteria,
    });
  }

};

export default FiltersActions;
