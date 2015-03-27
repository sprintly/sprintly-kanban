import _ from 'lodash';
import Promise from 'bluebird';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import { products, user } from '../lib/sprintly-client';
import FiltersAction from '../actions/filter-actions';

var ProductStore = module.exports = {
  getAll: function() {
    let activeProducts = products.where({ archived: false });
    return _.sortBy(_.invoke(activeProducts, 'toJSON'), 'name');
  },
  getSortCriteria: function(collection) {
    let orderBy = collection.config.get('order_by');
    let direction;
    let field = orderBy;

    switch(orderBy) {
      case 'stale':
        field = 'last_modified';
        direction = 'asc';
        break;
      case 'recent':
        field = 'last_modified';
        direction = 'desc';
        break;
      case 'oldest':
        field = 'created_at';
        direction = 'asc';
        break;
      case 'newest':
        field = 'created_at'
        direction = 'desc';
        break;
      case 'priority':
        direction = 'asc';
        break;
      default:
        break;
    }

    return [field, direction]
  },
  getItemsForProduct: function(product, status, filters) {
    var items = product.getItemsByStatus(status);
    // Set "Recent" as the default sort
    if (items.config.get('order_by')) {
      items.config.set('order_by', 'recent');
    }
    var updatedFilters = internals.mergeFilters(items.config, filters);

    // Set additional defaults for fetching products
    updatedFilters.limit = 25;
    updatedFilters.children = true;
    updatedFilters.offset = 0;

    if(status === 'accepted') {
      updatedFilters.limit = 5;
    }

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
  initProducts(productId) {
    var dependencies;
    if (products.length > 0 && user.id) {
      dependencies = [true];
    } else {
      dependencies = [
        user.fetch(),
        products.fetch({ silent: true })
      ]
    }

    return Promise.all(dependencies).then(() => {
      if (!productId) {
        products.trigger('change');
        return;
      }
      var product = products.get(productId);
      FiltersAction.init(product, user);
      internals.createSubscription(product);
      products.trigger('change');
      return product;
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

  changeSortCriteria: function(collection, field, direction) {
    internals.setComparator(collection, field, direction);

    if (field === 'last_modified') {
      field = direction === 'asc' ? 'stale' : 'recent';
    }

    if (field === 'created_at') {
      field = direction === 'asc' ? 'oldest' : 'newest';
    }

    collection.config.set({
      order_by: field,
      offset: 0
    });

    collection.fetch({ reset: true, silent: true }).then(function() {
      collection.trigger('change');
    })
  },

  setComparator: function(collection, field, direction) {
    var presenter = (o) => +new Date(o);

    collection.comparator = (model) => {
      let criteria = model.get(field);
      if (field === 'priority') {
        return model.get('sort');
      }
      let value = presenter(criteria)
      return direction === 'desc' ? -value : value;
    };
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

  getUpdatedTimestamps(model, status) {
    // Set the timestamp affected by the status change. This is happening
    // "now" so setting this optimistically to the current timestamp makes
    // items stay in the correct relative positions. This will get reset by
    // any filter change that triggers a reset.
    let attrs = {
      last_modified: +new Date()
    };
    let progress = model.get('progress');

    if (progress) {
      if (status === 'in-progress') {
        progress.started_at = +new Date();
      } else if (status === 'completed') {
        progress.closed_at = +new Date();
      } else if (status === 'accepted') {
        progress.accepted_at = +new Date();
      }
      attrs.progress = progress;
    }

    return attrs
  },

  matchesFilter(item, filter) {
    let fields = ['tags', 'assigned_to', 'created_by', 'estimate', 'type'];
    let activeFilters = 0;
    let matchingFilters = _.filter(fields, function(field) {
      let criteria = filter[field];
      if (criteria) {
        activeFilters++;
        if (_.isArray(criteria)) {
          if (_.isArray(item.get(field))) {
            return _.intersection(criteria, item.get(field)).length > 0;
          } else {
            return _.contains(criteria, item.get(field))
          }
        } else {
          if (field === 'assigned_to' || field === 'created_by') {
            return item.get(field).id === criteria;
          } else {
            return item.get(field) === criteria;
          }
        }
      } else {
        return false;
      }
    });

    return [activeFilters, matchingFilters];
  },

  createSubscription(product) {
    product.items.on('change', function() {
      products.trigger('change');
    });

    product.items.on('change:status', function(model) {
      let status = model.get('status');
      let collection = product._filters[status];
      let config = collection.config.toJSON();
      // Prevent "jumpy" items
      model.set(internals.getUpdatedTimestamps(model, status), { silent: true });

      let [activeFilterCount, matchingFilters] = internals.matchesFilter(model, config);
      if (activeFilterCount === matchingFilters.length) {
        // Swap items between status collections.
        let previousStatus = model.previous('status');
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
    var socket = new window.Pusher('***REMOVED***', options);
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
      internals.initProducts(action.productId);
      break;

    case ProductConstants.CHANGE_SORT_CRITERIA:
      internals.changeSortCriteria(action.itemCollection, action.sortField, action.sortDirection);
      break;

    case ProductConstants.GET_ITEMS:
      internals.setComparator(action.itemCollection, action.sortField, action.sortDirection);
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
