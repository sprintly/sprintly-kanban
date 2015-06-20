import client from 'sprintly-search';
import AppDispatcher from '../dispatchers/app-dispatcher';

var SearchActions = {

  search(query, sort, order) {
    AppDispatcher.dispatch({
      actionType: 'SEARCH_START',
      query
    });
    
    let options = client.getOptions(query, {
      baseUrl: process.env.NODE_ENV === 'production' ? 'https://sprint.ly' : 'https://local.sprint.ly:9000',
      token: window.__token
    });

    if (sort) {
      options.qs.sort = sort
    }

    if (order) {
      options.qs.order = order;
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
        });
      });
  }

};

export default SearchActions;
