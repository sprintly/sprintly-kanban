import _ from 'lodash';
import Promise from 'bluebird';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import { products, user } from '../lib/sprintly-client';

export var internals = {
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

  loadMoreItems(coll) {
    var currentOffset = coll.config.get('offset');
    var newOffset = coll.config.get('status') === 'accepted' ? currentOffset + 5 :
      currentOffset + 25;

    coll.config.set({ offset: newOffset });
    coll.fetch({ silent:true, remove:false}).then((res) => {
      coll.trigger('change', { count: res.length });
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
    var socket = new window.Pusher('97b75cf8a05a1faa7ee7', options);
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
  },

  mergeFilters(configModel, filters) {
    var defaultFilters = configModel.toJSON();
    var updatedFilters = _.extend(defaultFilters, filters);

    // unset previously-set global filters
    _.each(['tags', 'assigned_to', 'created_by', 'estimate', 'members'], function(field) {
      if (_.has(filters, field) === false && _.has(updatedFilters, field)) {
        configModel.unset(field, { silent: true });
        delete updatedFilters[field];
      }
    });
    return updatedFilters;
  }
};


var ProductStore = {

  getAll: function() {
    return products.toJSON();
  },
  getItemsForProduct: function(product, status, filters) {
    var items = product.getItemsByStatus(status);
    var updatedFilters = internals.mergeFilters(items.config, filters);

    // Set additional defaults for fetching products
    updatedFilters.limit = status === 'accepted' ? 5 : 25;
    updatedFilters.children = true;

    items.config.set(updatedFilters);
    return items;
  },
  getMembers: function(product) {
    return product.members.toJSON();
  }
};

var proxyMethods = ['get', 'on', 'off', 'once', 'listenTo', 'stopListening']

proxyMethods.forEach(function(method) {
  ProductStore[method] = products[method].bind(products);
});

ProductStore.dispatchToken = AppDispatcher.register(function(action) {

  switch(action.actionType) {
    case ProductConstants.INIT_PRODUCTS:
      internals.initProducts();
      break;

    case ProductConstants.GET_ITEMS:
      action.itemCollection.fetch({ reset: true });
      break;

    case ProductConstants.LOAD_MORE:
      internals.loadMoreItems(action.itemCollection);
      break;

    case ProductConstants.SUBSCRIBE:
      internals.createSubscription(action.id);
      break;

    default:
      break;
  }

});

export default ProductStore;
