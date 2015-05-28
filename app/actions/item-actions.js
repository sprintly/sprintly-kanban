import _ from 'lodash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import {products, user} from '../lib/sprintly-client';
import Promise from 'bluebird';

let ItemActions = {
  addItem(productId, data) {
    let product = products.get(productId);

    if (!product) {
      throw new Error('Missing product: %s', productId);
    }

    data.product = product.toJSON();
    let item = product.createItem(data, { silent: true });
    let saved = item.save();

    if (saved) {
      return saved.then(function() {
        AppDispatcher.dispatch({
          actionType: 'ADD_ITEM',
          product,
          item
        });
      });
    } else {
      return new Promise(function(resolve) {
        resolve(item)
      });
    }
  },

  deleteItem(productId, itemId) {
    let product = products.get(productId);
    let item = product.items.get(itemId);
    let item_data = item.attributes;
    let destroyed = item.destroy();

    if (destroyed) {
      return destroyed.then(function() {
        console.log("Great Success!")
        AppDispatcher.dispatch({
        actionType: 'DELETE_ITEM',
        product,
        item_data
        });
      });
    } else {
      throw new Error('Missing item: %s', itemId);
    }
  }
};

export default ItemActions;
