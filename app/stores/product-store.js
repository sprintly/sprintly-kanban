import _ from 'lodash';
import Promise from 'bluebird';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import { products, user } from '../lib/sprintly-client';

var internals = {
  initProducts() {
    if (products.length > 0 && user.id) {
      return products.trigger('change');
    }

    return Promise.all([
      user.fetch(),
      products.fetch({ silent: true })
    ]).then(() => {
      products.trigger('change')
    });
  },

  updateItem(product, item_data) {
    var item = product.items.get(item_data.number);
    item.ingest(_.omit(item_data, 'number'));

    if (item.hasChanged('status')) {
      let prevCollection = product._filters[item.previous('status')];
      if (prevCollection) {
        prevCollection.remove(item);
      }

      let newCollection = product._filters[item.get('status')];
      if (newCollection) {
        newCollection.add(item);
      }

      return;
    }

    product.items.trigger('change', item);
  },

  createItem(product, item_data) {
    let item = product.createItem(item_data);
    let collection = product.getItemsByStatus(item.get('status'))
    if (collection) {
      collection.add(item);
    }
  },

  createSubscription(product) {
    // TODO: move config value into server rendered js
    var channelName = `private-product_sprintly-development-justinlilly_${product.id}`
    var options = {
      encrypted: false,
      auth: {
        params: {
          product: product.id
        }
      }
    };

    // TODO: move config value into server rendered js
    var socket = new window.Pusher('***REMOVED***', options);
    var productChannel = socket.subscribe(channelName);

    productChannel.bind('changed', function(msg) {
      console.log(msg)
      let model = msg['class'];

      switch(model) {
        case 'Item':
          if (msg.created) {
            internals.createItem(product, msg.api_payload);
          } else {
            internals.updateItem(product, msg.api_payload);
          }
          break
      }
    });

    productChannel.bind('deleted', function(data) {
      console.log(data);
    });
  }
};

var ProductStore = {
  getAll: function() {
    return products.toJSON();
  },
  getItemsForProduct: function(product, status, filters) {
    var items = product.getItemsByStatus(status);
    var defaultFilters = items.config.defaults();
    items.config.set(_.extend(defaultFilters, filters));

    switch(status) {
      case 'accepted':
        items.config.set({ limit: 5 });
        break;

      default:
        items.config.set({
          children: true,
          limit: 25
        });
        break;
    }

    return items;
  },
  getItemsByFilter: function(product, filter) {
    return product.items.filter(function(model) {
      if (filter.type && _.contains(filter.type, model.get('type'))) {
        return true;
      }

      if (filter.status && model.get('status') === filter.status) {
        return true;
      }

      if (filter.tags && _.intersection(model.get('tags'), filter.tags).length > 0) {
        return true;
      }
      return false;
    });
  }
};

var proxyMethods = ['get', 'on', 'off', 'once', 'listenTo', 'stopListening']

proxyMethods.forEach(function(method) {
  ProductStore[method] = products[method].bind(products);
});

AppDispatcher.register(function(action) {

  switch(action.actionType) {
    case ProductConstants.INIT_PRODUCTS:
      internals.initProducts();
      break;

    case ProductConstants.GET_ITEMS:
      action.itemCollection.fetch({ reset: true });
      break;

    case ProductConstants.SUBSCRIBE:
      internals.createSubscription(action.id);
      break;

    default:
      break;
  }

});

export default ProductStore;

if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
