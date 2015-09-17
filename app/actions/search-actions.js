import client from 'sprintly-search'
import AppDispatcher from '../dispatchers/app-dispatcher'
import {BASE_URL} from '../config'

var SearchActions = {

  search(query, sort, order) {
    AppDispatcher.dispatch({
      actionType: 'SEARCH_START',
      query
    })

    let options = client.getOptions(query, {
      baseUrl: BASE_URL,
      token: window.__token
    })

    if (sort) {
      options.qs.sort = sort
    }

    if (order) {
      options.qs.order = order
    }

    client.search(options)
      .then(function(results) {
        AppDispatcher.dispatch({
          actionType: 'SEARCH_SUCCESS',
          payload: results
        })
      })
      .catch(function() {
        AppDispatcher.dispatch({
          actionType: 'SEARCH_ERROR'
        })
      })
  }

}

export default SearchActions
