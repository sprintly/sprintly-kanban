import AppDispatcher from '../dispatchers/app-dispatcher';
import FiltersConstants from '../constants/filters-constants';

var FiltersActions = {

  update: function(field, criteria) {
    AppDispatcher.dispatch({
      actionType: FiltersConstants.UPDATE_FILTER,
      field,
      criteria
    });
  }

};

export default FiltersActions;
