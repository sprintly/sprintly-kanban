/*eslint camelcase: 0, eqeqeq: 0 */
import _ from 'lodash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import { products, user } from '../lib/sprintly-client';

const STATUS_MAPPINGS = {
  last_modified: 'recent',
  created_at: 'newest',
  priority: 'priority'
};

function mergeFilters(configModel, filters) {
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
}

function getItemsCollection(product, options) {
  var items = product.getItemsByStatus(options.status);

  if (items.config.get('order_by')) {
    let previousSortField = window.localStorage.getItem(`itemColumn-${options.status}-sortField`);
    let sort = previousSortField || STATUS_MAPPINGS[options.sortField] || 'recent';
    items.config.set('order_by', sort);
  }
  var updatedFilters = mergeFilters(items.config, options.filters);

  // Set additional defaults for fetching products
  updatedFilters.limit = 30;
  updatedFilters.children = false;
  updatedFilters.expand_sub_items = true;
  updatedFilters.offset = 0;

  if(options.status === 'accepted') {
    updatedFilters.limit = 5;
  }

  items.config.set(updatedFilters);
  return items;
}

function setComparator(collection, field, direction) {
  var presenter = (o) => +new Date(o);

  collection.comparator = (model) => {
    let criteria = model.get(field);
    if (field === 'priority') {
      return model.get('sort');
    }
    let value = presenter(criteria);
    return direction === 'desc' ? -value : value;
  };
}

var ProductActions = {

  init(productId) {
    var fetchDependencies;
    if (products.length > 0 && user.id) {
      fetchDependencies = Promise.resolve();
    } else {
      fetchDependencies = Promise.all([
        user.fetch(),
        products.fetch({ silent: true })
      ]);
    }

    fetchDependencies
      .then(function() {
        let action = {
          actionType: ProductConstants.INIT_PRODUCTS,
          payload: products
        };
        if (productId) {
          action.product = products.get(productId);
        }
        AppDispatcher.dispatch(action);
      })
      .catch(function(err) {
        // console.error(err)
        AppDispatcher.dispatch({
          actionType: ProductConstants.INIT_PRODUCTS_ERROR,
          payload: err
        });
      });
  },

  changeSortCriteria(itemCollection, options) {
    let field = options.field;
    let direction = options.direction;
    setComparator(itemCollection, field, direction);

    if (field === 'last_modified') {
      field = direction === 'asc' ? 'stale' : 'recent';
    }

    if (field === 'created_at') {
      field = direction === 'asc' ? 'oldest' : 'newest';
    }

    itemCollection.config.set({
      order_by: field,
      offset: 0
    });

    window.localStorage.setItem(`itemColumn-${options.status}-sortField`, field);

    itemCollection.fetch({ reset: true, silent: true }).then(function() {
      AppDispatcher.dispatch({
        actionType: ProductConstants.CHANGE_SORT_CRITERIA
      });
    });
  },

  getItemsForStatus(product, options) {
    let productModel = products.get(product);
    let itemsCollection = getItemsCollection(productModel, options);

    setComparator(itemsCollection, options.sortField, options.sortDirection);

    itemsCollection.fetch({ reset: true, silent: true })
      .then(function() {
        AppDispatcher.dispatch({
          actionType: ProductConstants.GET_ITEMS,
          itemsCollection: itemsCollection,
          status: options.status,
          product
        });
      });
  },

  loadMoreItems(itemCollection) {
    let limit = itemCollection.config.get('limit');
    let newLimit = itemCollection.config.get('status') === 'accepted' ? limit + 5 :
      limit + 25;

    itemCollection.config.set({ limit: newLimit });

    itemCollection.fetch({ silent: true }).then(function() {
      AppDispatcher.dispatch({
        actionType: ProductConstants.LOAD_MORE
      });
    });
  },

  updateItem(productId, itemId, payload, options={ wait: true }) {
    let product = products.get(productId);
    let item = product.items.get(itemId);

    if (!item) {
      item = product.createItem(payload);
    }

    if (payload.status) {
      item.unset('close_reason', { silent: true });

      if (_.contains(['backlog', 'someday'], item.get('status')) &&
          _.contains(['in-progress', 'completed'], payload.status) ) {
        payload.assigned_to = user.id;
      }
    }

    // Save request errors with invalid close_reason if item is in done column.
    // Remove if api is changed to convert close_reason string to int.
    if (_.has(payload, 'score') || _.has(payload, 'tags') && item.get('status') == 'completed') {
      item.unset('close_reason', { silent: true });
    }

    if (options.wait === false) {
      item.save(payload);
      AppDispatcher.dispatch({
        actionType: ProductConstants.UPDATE_ITEM
      });
    } else {
      item.save(payload).then(function() {
        AppDispatcher.dispatch({
          actionType: ProductConstants.UPDATE_ITEM
        });
      });
    }
  },

  updateItemPriority(productId, itemId, priority) {
    let product = products.get(productId);
    let item = product.items.get(itemId);
    let status = item.get('status');
    let payload = {};
    let col = product.getItemsByStatus(status).sortBy('sort');
    let index = _.findIndex(col, function(model) {
      return model.get('number') === itemId;
    });

    let previousItems = {
      after: col[index - 2],
      before: col[index - 1]
    };
    let nextItems = {
      after: col[index + 1],
      before: col[index + 2]
    };

    switch(priority) {
      case 'up':
        if (previousItems.before) {
          payload[!previousItems.after ? 'after' : 'before'] = previousItems.before.get('number');
        }
        if (previousItems.after) {
          payload.after = previousItems.after.get('number');
        }
        break;
      case 'down':
        if (nextItems.before) {
          payload.before = nextItems.before.get('number');
        }
        if (nextItems.after) {
          payload[!nextItems.before ? 'before' : 'after'] = nextItems.after.get('number');
        }
        break;
      case 'top':
        let topItem = _.first(col);
        payload.after = topItem.get('number');
        break;
      case 'bottom':
        let bottomItem = _.last(col);
        payload.before = bottomItem.get('number');
        break;
      default:
        throw new Error(`Invalid priority direction: ${priority}`);
    }

    item.resort(payload).then(function() {
      AppDispatcher.dispatch({
        actionType: ProductConstants.UPDATE_ITEM_PRIORITY,
        productId,
        itemId,
        priority
      });
    });
  }
};

export default ProductActions;
