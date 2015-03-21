import _ from 'lodash';
import Promise from 'bluebird';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import { products, user } from '../lib/sprintly-client';

var ProductStore = module.exports = {
  getAll: function() {
    let activeProducts = products.where({ archived: false });
    return _.sortBy(_.invoke(activeProducts, 'toJSON'), 'name');
  },
  getItemsForProduct: function(product, status, filters) {
    var items = product.getItemsByStatus(status);
    var updatedFilters = internals.mergeFilters(items.config, filters);

    if(status === 'accepted') {
      updatedFilters.limit = 5;
    }

    // Set additional defaults for fetching products
    updatedFilters.limit = 25;
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

var internals = ProductStore.internals = {
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

  ingestItem(product, item_data) {
    var item = product.items.get(item_data.number);
    if (item) {
      // Ignore stale timestamps. By using optimistic timestamps, items stay in
      // the correct positions relative to one another.
      if (item_data.last_modified < item.get('last_modified')) {
        item_data.last_modified = item.get('last_modified');
      }
      _.each(['closed_at', 'started_at', 'accepted_at'], function(attr) {
        if (item.get('progress') && item_data[attr] < item.get('progress')[attr]) {
          item_data.progress[attr] = item.get('progress')[attr];
        }
      });

      item.set(item.parse(_.omit(item_data, 'number')));
    } else {
      internals.createItem(product, item_data.number, item_data);
    }

    product.items.trigger('change', item);
  },

  updateItem(productId, itemId, payload) {
    let product = products.get(productId);
    let item = product.items.get(itemId);
    item.save(payload);
  },

  createItem(product, item_data) {
    let item = product.createItem(item_data);
    let collection = product.getItemsByStatus(item.get('status'))
    if (collection) {
      collection.add(item);
    }
  },

  createSubscription(product) {
    product.items.on('change', function(model) {
      model.attributes.last_modified = +new Date();
    });

    product.items.on('change:status', function(model) {
      let previousStatus = model.previous('status');
      let status = model.get('status');

      // Set the timestamp affected by the status change. This is happening
      // "now" so setting this optimistically to the current timestamp makes
      // items stay in the correct relative positions. This will get reset by
      // any filter change that triggers a reset.
      if (model.attributes.progress) {
        if (status === 'in-progress') {
          model.attributes.progress.started_at = +new Date();
        } else if (status === 'completed') {
          model.attributes.progress.closed_at = +new Date();
        } else if (status === 'accepted') {
          model.attributes.progress.accepted_at = +new Date();
        }
      }

      let collection = product._filters[status];
      let config = collection.config.toJSON();

      var filterCount = 0;
      var matchesFilter = _.filter(['tags', 'assigned_to', 'created_by', 'estimate', 'type'], function(field) {
        let criteria = config[field];
        if (criteria) {
          filterCount++;
          if (_.isArray(criteria)) {
            if (_.isArray(model.get(field))) {
              return _.intersection(criteria, model.get(field)).length > 0;
            } else {
              return _.contains(criteria, model.get(field))
            }
          } else {
            if (field === 'assigned_to' || field === 'created_by') {
              return model.get(field).id === criteria;
            } else {
              return model.get(field) === criteria;
            }
          }
        } else {
          return false;
        }
      });

      if (matchesFilter.length === filterCount) {
        // Swap items between status collections.
        let previousCollection = product._filters[previousStatus];
        previousCollection.remove(model);
        collection.add(model);
      }

    });

    // TODO: move config value into server rendered js
    var channelName = `api-product_sprintly-development-justinlilly_${product.id}`
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
          internals.ingestItem(product, msg.data);
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

    case ProductConstants.UPDATE_ITEM:
      internals.updateItem(action.productId, action.itemId, action.payload);
      break;

    default:
      break;
  }

});
