import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';

var ProductActions = {

  init: function(productId) {
    AppDispatcher.dispatch({
      actionType: ProductConstants.INIT_PRODUCTS,
      productId
    });
  },

  changeSortCriteria: function(itemCollection, sortField, sortDirection) {
    AppDispatcher.dispatch({
      actionType: ProductConstants.CHANGE_SORT_CRITERIA,
      itemCollection,
      sortField,
      sortDirection
    });
  },

  getItems: function(itemCollection, sortField, sortDirection) {
    AppDispatcher.dispatch({
      actionType: ProductConstants.GET_ITEMS,
      itemCollection,
      sortField,
      sortDirection
    });
  },

  loadMoreItems: function(itemCollection) {
    AppDispatcher.dispatch({
      actionType: ProductConstants.LOAD_MORE,
      itemCollection
    });
  },

  subscribe: function(id) {
    AppDispatcher.dispatch({
      actionType: ProductConstants.SUBSCRIBE,
      id
    });
  },

  updateItem: function(productId, itemId, payload) {
    AppDispatcher.dispatch({
      actionType: ProductConstants.UPDATE_ITEM,
      productId,
      itemId,
      payload
    });
  },

  updateItemPriority: function(productId, itemId, priority) {
    AppDispatcher.dispatch({
      actionType: ProductConstants.UPDATE_ITEM_PRIORITY,
      productId,
      itemId,
      priority
    })
  }

};

export default ProductActions;
