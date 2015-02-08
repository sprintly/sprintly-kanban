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
  }

};

export default ProductActions;
