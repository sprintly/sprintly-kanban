import _ from 'lodash';
import Promise from 'bluebird';
import { products, user } from '../lib/sprintly-client';
import {PUSHER_KEY, CHANNEL_PREFIX} from '../config';
import {EventEmitter} from 'events';

// Flux
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import VelocityConstants from '../constants/velocity-constants';
import FilterActions from '../actions/filter-actions';

import {ITEM_STATUS_MAP, STATUS_CODE_MAP} from '../lib/status-map';
import SCORES from '../lib/score-map';

const ITEM_STATUSES = _.keys(ITEM_STATUS_MAP);
const DEFAULT_VELOCITY = 10;
const DEFAULT_ITERATION_LENGTH = 7;

let productVelocity = {};
let itemCounts = {}

let columnCollections = {};
let columnsLoading = {
  'someday': true,
  'backlog': true,
  'in-progress': true,
  'completed': true,
  'accepted': true
};

var ProductStore = module.exports = _.assign({}, EventEmitter.prototype, {
  emitChange(type, record) {
    this.emit('change', type, record);
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
      velocity: productVelocity[id] || null,
      itemCounts: itemCounts[id] || null
    };
  },

  getItemsByStatus(productId) {
    return _.transform(ITEM_STATUSES, (result, status) => {
      result[status] = this.getItems(productId, status);
    });
  },

  getItem(productId, number) {
    let product = products.get(productId);
    if (!product) {
      return;
    }

    let item = product.items.get(number);
    if (!item) {
      return;
    }

    return item.toJSON();
  },

  getItems(productId, status) {
    let items = ProductStore.getItemsCollection(productId, status);
    if (!items) {
      return {
        items: [],
        limit: 0,
        offset: 0,
        sortDirection: 'desc',
        sortField: 'last_modified',
        loading: columnsLoading[status]
      }
    }

    let [sortField, sortDirection] = ProductStore.getSortCriteria(items);

    if (sortField === 'priority') {
      items.comparator = 'sort'
    }

    let itemsJSON = _.compact(_.map(items.sort().toJSON(), function(model) {
      if (model.parent) {
        return;
      } else {
        return model;
      }
    }));


    return {
      items: itemsJSON,
      limit: items.config.get('limit'),
      offset: items.config.get('offset'),
      loading: columnsLoading[status],
      sortDirection,
      sortField
    };
  },

  hasItems(productId) {
    return products.get(productId).items.length > 0
  },

  hasItemsToRender(productId) {
    let collections = internals.itemsForProduct(productId)
    if (collections.length > 0) {
      let hasItems = false;

      _.each(collections, (col) => {
        if(col.items.length > 0) {
          hasItems = true;
        }
      })

      return hasItems;
    } else {
      return false;
    }
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
    _.each(columnsLoading, function(val, status) {
      columnsLoading[status] = true;
    });
    FilterActions.init(product);
    product.items.on('change:status', function(model) {
      let status = model.get('status');
      let collection = product.getItemsByStatus(status);
      let config = collection.config.toJSON();
      // Prevent "jumpy" items
      model.set(internals.getUpdatedTimestamps(model, status), { silent: true });

      /*
        let [activeFilterCount, matchingFilters] = internals.matchesFilter(model, config);
        if (activeFilterCount === 0 || activeFilterCount === matchingFilters.length) {
        Swap items between status collections.
      */
      let previousStatus = model.previous('status');
      let previousCollection = product.getItemsByStatus(previousStatus);
      if (previousCollection) {
        let oldItem = previousCollection.remove(model.id);
        if (oldItem === undefined) {
          previousCollection.models = previousCollection.filter(function(m) {
            return m.id !== model.id;
          });
        }

        if (collection) {
          collection.add(model);
        }
        internals.updateCounts(product.id, SCORES[model.get('score')], status, previousStatus);
        ProductStore.emitChange();
      }
    });

    internals.createSubscription(product);
  },

  updateCounts(productId, score, newStatus, previousStatus) {
    let itemCountNew = itemCounts[productId][newStatus];
    itemCountNew.items += 1;
    itemCountNew.points += score;

    let itemCountOld = itemCounts[productId][previousStatus];
    itemCountOld.items -= 1;
    itemCountOld.points -= score;
  },

  ingestItem(product, item_data) {
    var item = product.items.get(item_data.number);
    if (item) {
      /*
        Ignore stale timestamps. By using optimistic timestamps, items stay in
        the correct positions relative to one another.
      */
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
    /*
      Set the timestamp affected by the status change. This is happening
      "noting this optimistically to the current timestamp makes
      items stay in the correct relative positions. This will get reset by
      any filter change that triggers a reset.
    */
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

    return item;
  },

  addItems(productId, items) {
    let product = products.get(productId);

    _.each(items, (item) => {
      let col = product.getItemsByStatus(item.status);

      if (col) {
        col.add(item)
      }
    });
  },

  itemsForProduct(productId) {
    return _.chain(ITEM_STATUSES)
            .map((status) => {
              return ProductStore.getItems(productId, status);
            })
            .compact()
            .value()
  },

  extendItem(productId, itemId, key, payload) {
    let product = products.get(productId);
    let item = product.items.get(itemId);
    let newAttr = {};
    newAttr[key] = payload;

    item.set(newAttr, { silent: true })
  },

  calculateAverageVelocity(velocity={}) {
    velocity.average = Math.round(velocity.average * DEFAULT_ITERATION_LENGTH);

    if (velocity.average < 1) {
      velocity.average = DEFAULT_VELOCITY;
    }

    return velocity;
  },

  countsByStatus(totals={}) {
    let result = {};
    _.each(STATUS_CODE_MAP, (v, k) => {
      let items = _.omit(totals[k], 'points');
      let points = totals[k].points;
      result[v] = {
        items: _.reduce(items, (p, c) => { return p + c; }),
        points: _.reduce(points, (p, c) => { return p + c; })
      };
    });

    return result;
  }
};

ProductStore.dispatchToken = AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case ProductConstants.INIT_PRODUCTS:
      if (action.product) {
        internals.initProduct(action.product);
      } else {
        ProductStore.emitChange();
      }
      break;

    case ProductConstants.GET_ITEMS:
      columnCollections[`${action.product.id}-${action.status}`] = action.itemsCollection;
      columnsLoading[action.status] = false;
      ProductStore.emitChange();
      break;

    case ProductConstants.ADD_ITEM:
      let item = internals.addItem(action.product.id, action.item);
      ProductStore.emitChange('afterCreate', item);
      break;

    case ProductConstants.ADD_ITEMS:
      internals.addItems(action.product.id, action.items);
      ProductStore.emitChange();
      break;

    case ProductConstants.DELETE_ITEM:
      internals.deleteItem(action.product, action.itemData);
      ProductStore.emitChange();
      break;

    case ProductConstants.UPDATE_ITEM:
    case ProductConstants.UPDATE_ITEM_PRIORITY:
    case ProductConstants.CHANGE_SORT_CRITERIA:
    case ProductConstants.LOAD_MORE:
    case ProductConstants.ITEM_UPDATED:
      ProductStore.emitChange();
      break;

    case VelocityConstants.PRODUCT_VELOCITY:
      productVelocity[action.productId] = action.userOverride ? action.payload :
        internals.calculateAverageVelocity(action.payload);
      ProductStore.emitChange();
      break;

    case VelocityConstants.STATUS_COUNTS:
      itemCounts[action.productId] = internals.countsByStatus(action.payload);
      ProductStore.emitChange();
      break;

    case ProductConstants.ITEM_ACTIVITY:
      internals.extendItem(action.productId, action.itemId, 'activity', action.payload);
      ProductStore.emitChange();
      break;

    case ProductConstants.ITEM_ATTACHMENTS:
      internals.extendItem(action.productId, action.itemId, 'attachments', action.payload);
      ProductStore.emitChange();
      break;

    case ProductConstants.ITEM_COMMENTED:
      ProductStore.emitChange();
      break

    case 'ITEM_ATTACHMENTS_ERROR':
      console.log('ITEM_ATTACHMENTS_ERROR: ', action.err)
      ProductStore.emitChange();
      break
    case 'ITEM_ACTIVITY_ERROR':
      console.log('ITEM_ACTIVITY_ERROR: ', action.err)
      ProductStore.emitChange();
      break;
    case 'ITEM_COMMENT_ERROR':
      console.log('ITEM_ACTIVITY_ERROR: ', action.err)
      ProductStore.emitChange();
      break

    default:
      break;
  }
});
