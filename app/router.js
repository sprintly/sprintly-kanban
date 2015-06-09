import React from 'react'
import Router, { Route, DefaultRoute } from 'react-router';

import App from './views/app';
import ProductSelector from './views/pages/product-selector';
import Items from './views/pages/items';
import Search from './views/pages/search';
import AddItem from './views/pages/add-item';

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="product" path="product/:id" handler={Items} />
    <Route name="search" path="search" handler={Search} />
    <Route name="add" path="add" handler={AddItem} />
    <DefaultRoute handler={ProductSelector} />
  </Route>
);

function analytics(state) {
  if (typeof ga !== 'undefined') {
    ga('send', 'pageview', {
      'page': state.path
    });
  }
}

module.exports = function(sprintlyClient) {
  sprintlyClient.router = Router.run(routes, Router.HistoryLocation, function(Handler, state) {
    React.render(<Handler user={sprintlyClient.user} />, document.getElementById('manifold'));
    analytics(state);
  });

  return sprintlyClient;
};
