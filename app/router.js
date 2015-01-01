var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;


var App = require('./views/app');
var ProductSelector = require('./views/pages/product-selector');
var Items = require('./views/pages/items');

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

