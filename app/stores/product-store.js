import Promise from 'bluebird';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import { products, user } from '../lib/sprintly-client';

function initProducts() {
  if (products.length > 0 && user.id) {
    return products.trigger('change');
  }

  Promise.all([
    user.fetch(),
    products.fetch({ silent: true })
  ]).then(() => {
    products.trigger('change')
  });
}


var ProductStore = {
  getAll: function() {
    return products.toJSON();
  },
  getItemsForProduct: function(product, status) {
    var items = product.getItemsByStatus(status);

    switch(status) {
      case 'accepted':
        items.config.set({ limit: 5 });
        break;

      default:
        items.config.set({ limit: 50 });
        break;
    }

    return items;
  }
}

var proxyMethods = ['get', 'on', 'off', 'listenTo', 'stopListening']

proxyMethods.forEach(function(method) {
  ProductStore[method] = products[method].bind(products);
});

AppDispatcher.register(function(action) {

  switch(action.actionType) {
    case ProductConstants.INIT_PRODUCTS:
      initProducts();
      break;

    case ProductConstants.GET_ITEMS:
      action.itemCollection.fetch();
      break;

    default:
      break;
  }

});

export default ProductStore;
