import React from 'react'
import Router, { Route, DefaultRoute } from 'react-router';

import App from './views/app';
import ProductSelector from './views/pages/product-selector';
import Items from './views/pages/items';

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="product" path="product/:id" handler={Items} />
    <DefaultRoute handler={ProductSelector} />
  </Route>
);

module.exports = function(sprintlyClient) {
  sprintlyClient.router = Router.run(routes, function(Handler, state) {
    var params = state.params
    React.render(
      <Handler user={sprintlyClient.user} products={sprintlyClient.products} params={params}/>,
      document.body
    );
  });

  return sprintlyClient;
};

