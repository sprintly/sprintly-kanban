import client from 'sprintly-search';
import AppDispatcher from '../dispatchers/app-dispatcher';

var SearchActions = {

  search(query, sort, order) {
    let options = client.getOptions(query, {
      token: window.__token
    });

    if (sort) {
      options.qs.sort = sort
    }

    if (order) {
      options.qs.order = order;
    }

    client.search(options).then(function(results) {
      AppDispatcher.dispatch({
        actionType: 'SEARCH',
        payload: results
      })
    });
  }

};

export default SearchActions;
