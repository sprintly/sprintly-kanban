import _ from 'lodash';
import Promise from 'bluebird';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import { products, user } from '../lib/sprintly-client';
import FiltersAction from '../actions/filter-actions';
import {PUSHER_KEY, CHANNEL_PREFIX} from '../config';
import {EventEmitter} from 'events';

let columnCollections = {};

let productVelocity = {};

var ProductStore = module.exports = _.assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit('change');
  },

  addChangeListener(callback) {
    this.on('change', callback);
  },

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  },

  getAll() {
    let activeProducts = products.where({ archived: false });
    return _.sortBy(_.invoke(activeProducts, 'toJSON'), 'name');
  },

  getProduct(id) {
    let product = products.get(id);
    if (!product) {
      return false;
    }
    return {
      members: product.members.toJSON(),
      product: product.toJSON(),
      tags: product.tags.toJSON(),
      velocity: productVelocity[id] || null
    };
  },

  getItems(productId, status) {
    let items = ProductStore.getItemsCollection(productId, status);
    if (!items) {
      return;
    }

    let itemsJSON = _.compact(_.map(items.sort().toJSON(), function(model) {
      if (model.parent) {
        return;
      } else {
        return model;
      }
    }));

    let [sortField, sortDirection] = ProductStore.getSortCriteria(items);

    return {
      items: itemsJSON,
      limit: items.config.get('limit'),
      offset: items.config.get('offset'),
      sortDirection,
      sortField
    };
  },

  getItemsCollection(productId, status) {
    let collection = columnCollections[`${productId}-${status}`];
    return collection;
  },

  getSortCriteria(collection) {
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

  refreshColumns() {
    Promise.all(_.map(columnCollections, function(column) {
      column.fetch();
    })).then(function() {
      ProductStore.emitChange();
    });
  }
});


var internals = ProductStore.internals = {
  initProduct(product) {
    product.items.on('change:status', function(model) {
      let status = model.get('status');
      let collection = product.getItemsByStatus(status);
      let config = collection.config.toJSON();
      // Prevent "jumpy" items
      model.set(internals.getUpdatedTimestamps(model, status), { silent: true });

      let [activeFilterCount, matchingFilters] = internals.matchesFilter(model, config);
      if (activeFilterCount === 0 || activeFilterCount === matchingFilters.length) {
        // Swap items between status collections.
        let previousStatus = model.previous('status');
        let previousCollection = product._filters[previousStatus];
        previousCollection && previousCollection.remove(model);
        collection.add(model);
      }
    });

    internals.createSubscription(product);
  },

  ingestItem(product, item_data) {
    var item = product.items.get(item_data.number);
    if (item) {
      // Ignore stale timestamps. By using optimistic timestamps, items stay in
      // the correct positions relative to one another.
      if (item_data.last_modified < item.get('last_modified')) {
        item_data.last_modified = item.get('last_modified');
      }

      item.set(_.omit(item_data, 'number'));
    } else {
      internals.createItem(product, item_data);
    }

    ProductStore.emitChange();
  },

  createItem(product, item_data) {
    let item = product.createItem(item_data);
    let collection = product.getItemsByStatus(item.get('status'))
    if (collection) {
      collection.add(item);
    }
    return item;
  },

  getUpdatedTimestamps(model, status) {
    // Set the timestamp affected by the status change. This is happening
    // "noting this optimistically to the current timestamp makes
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

  deleteItem(product, item_data) {
    product.items.remove(item_data.number);
    let col = product._filters[item_data.status];
    if (col) {
      col.remove(item_data.number);
    }
    ProductStore.emitChange();
  },

  createSubscription(product) {
    var channelName = `${CHANNEL_PREFIX}_${product.id}`;
    var options = {
      encrypted: false,
      auth: {
        params: {
          product: product.id
        }
      }
    };

    var socket = new window.Pusher(PUSHER_KEY, options);
    var productChannel = socket.subscribe(channelName);

    productChannel.bind('changed', function(msg) {
      let model = msg['class'];

      switch(model) {
        case 'Item':
          internals.ingestItem(product, msg.data);
          break;
        default:
          break;
      }
    });

    productChannel.bind('deleted', function(msg) {
      let model = msg['class'];

      switch(model) {
        case 'Item':
          internals.deleteItem(product, msg.data)
          break;
        default:
          break;
      }
    });

    var refresh = _.debounce(ProductStore.refreshColumns, 500);
    var pusherStates = ['connecting', 'connected', 'unavailable', 'failed', 'disconnected']
    _.forEach(pusherStates, function(state) {
      socket.connection.bind(state, function() {
        refresh();
      });
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

    if (updatedFilters.assigned_to === 'unassigned') {
      updatedFilters.assigned_to = '';
    }
    return updatedFilters;
  },

  addItem(productId, item) {
    let product = products.get(productId);
    let col = product.getItemsByStatus(item.status);
    if (col) {
      col.add(item);
    }
  }
};

ProductStore.dispatchToken = AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case 'INIT_PRODUCTS':
      if (action.product) {
        internals.initProduct(action.product);
      } else {
        ProductStore.emitChange();
      }
      break;

    case ProductConstants.GET_ITEMS:
      columnCollections[`${action.product.id}-${action.status}`] = action.itemsCollection;
      ProductStore.emitChange();
      break;

    case 'ADD_ITEM':
      internals.addItem(action.product.id, action.item);
      ProductStore.emitChange();
      break;

    case ProductConstants.UPDATE_ITEM:
    case ProductConstants.UPDATE_ITEM_PRIORITY:
    case ProductConstants.CHANGE_SORT_CRITERIA:
    case ProductConstants.LOAD_MORE:
      ProductStore.emitChange();
      break;

    case 'PRODUCT_VELOCITY':
      productVelocity[action.productId] = action.payload;
      ProductStore.emitChange();
      break;

    default:
      break;
  }
});
