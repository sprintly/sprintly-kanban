import AppDispatcher from '../dispatchers/app-dispatcher';
import ProductConstants from '../constants/product-constants';

var ProductActions = {

  init: function() {
    AppDispatcher.dispatch({
      actionType: ProductConstants.INIT_PRODUCTS
    });
  },

  getItems: function(itemCollection) {
    AppDispatcher.dispatch({
      actionType: ProductConstants.GET_ITEMS,
      itemCollection
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
  }

};

export default ProductActions;
