import _ from 'lodash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';
import { products, user } from '../lib/sprintly-client';

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

function getItemsCollection(product, status, filters) {
  var items = product.getItemsByStatus(status);
  // Set "Recent" as the default sort
  if (items.config.get('order_by')) {
    items.config.set('order_by', 'recent');
  }
  var updatedFilters = mergeFilters(items.config, filters);

  // Set additional defaults for fetching products
  updatedFilters.limit = 30;
  updatedFilters.children = true;
  updatedFilters.offset = 0;

  if(status === 'accepted') {
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
    let value = presenter(criteria)
    return direction === 'desc' ? -value : value;
  };
}

var ProductActions = {
  init(productId) {
    var dependencies;
    if (products.length > 0 && user.id) {
      products.each(function(product) {
        product.items.off();
      });
      dependencies = [true];
    } else {
      dependencies = [
        user.fetch(),
        products.fetch({ silent: true })
      ]
    }

    Promise.all(dependencies)
      .then(function() {
        let action = {
          actionType: 'INIT_PRODUCTS',
          payload: products
        };
        if (productId) {
          action.product = products.get(productId);
        }
        AppDispatcher.dispatch(action);
      })
      .catch(function(err) {
        AppDispatcher.dispatch({
          actionType: 'INIT_PRODUCTS_ERROR',
          payload: err
        });
      });
  },

  changeSortCriteria(itemCollection, field, direction) {
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

    itemCollection.fetch({ reset: true, silent: true }).then(function() {
      AppDispatcher.dispatch({
        actionType: ProductConstants.CHANGE_SORT_CRITERIA
      });
    })
  },

  getItemsForProduct(product, options) {
    let productModel = products.get(product);
    let itemsCollection = getItemsCollection(productModel, options.status, options.filters);

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

    itemCollection.fetch({ silent:true }).then(function() {
      AppDispatcher.dispatch({
        actionType: ProductConstants.LOAD_MORE
      });
    });
  },

  updateItem(productId, itemId, payload) {
    let product = products.get(productId);
    let item = product.items.get(itemId);

    if (payload.status) {
      item.unset('close_reason', { silent: true });

      if (_.contains(['backlog', 'someday'], item.get('status')) &&
          _.contains(['in-progress', 'completed'], payload.status) ) {
        payload.assigned_to = user.id;
      }
    }

    item.save(payload).then(function() {
      AppDispatcher.dispatch({
        actionType: ProductConstants.UPDATE_ITEM
      });
    });
  },

  updateItemPriority(productId, itemId, priority) {
    let product = products.get(productId);
    let item = product.items.get(itemId);
    let status = item.get('status');
    let sort = item.get('sort');
    let payload = {};
    let col = product._filters[status].sortBy('sort');
    let index = _.findIndex(col, function(item) {
      return item.get('number') === itemId;
    });

    let previousItems = {
      after: col[index - 2],
      before: col[index - 1]
    };
    let nextItems = {
      after: col[index + 1],
      before: col[index + 2],
    }

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
        throw new Error('Invalid priority direction: '+ priority);
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
