import React from 'react';
import Router, { Route, DefaultRoute } from 'react-router';

import App from './views/app';
import ProductSelector from './views/pages/product-selector';
import Items from './views/pages/items';
import ItemDetail from './views/pages/item-detail';
import Settings from './views/pages/settings';
import Search from './views/pages/search';

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="product" path="product/:id" handler={Items} >
      <Route name="item/:number" handler={ItemDetail} />
    </Route>
    <Route name="search" path="search" handler={Search} />
    <DefaultRoute handler={ProductSelector} />
  </Route>
);

function analytics(state) {
  if (typeof ga !== 'undefined') {
    window.ga('send', 'pageview', {
      'page': state.path
    });
  }
}

export default function(sprintlyClient) {
  sprintlyClient.router = Router.run(routes, Router.HistoryLocation, function(Handler, state) {
    React.render(<Handler user={sprintlyClient.user} />, document.getElementById('manifold'));
    analytics(state);
  });

  return sprintlyClient;
}
