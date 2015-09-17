import AppDispatcher from '../dispatchers/app-dispatcher'
import FiltersConstants from '../constants/filters-constants'

let FiltersActions = {
  init: function(product) {
    let members = product.members
    let tags = product.tags
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
    })
  },

  update: function(field, criteria, options={}) {
    AppDispatcher.dispatch({
      actionType: FiltersConstants.UPDATE_FILTER,
      unset: options.unset === true,
      field,
      criteria
    })
  },

  clear: function() {
    AppDispatcher.dispatch({
      actionType: FiltersConstants.CLEAR_FILTERS
    })
  }
}

export default FiltersActions
