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

  fetchItem(productId, number) {
    let product = products.get(productId);

    if (!product) {
      throw new Error('Missing product: %s', productId);
    }

    let item = product.items.get(item);

    if (!item) {
      item = product.createItem({
        number,
        product: {
          id: product.get('id')
        }
      })
    } else {
      AppDispatcher.dispatch({
        actionType: 'ITEM_UPDATED',
        product,
        item
      });
    }

    return item.fetch()
      .then(function() {
        AppDispatcher.dispatch({
          actionType: 'ITEM_UPDATED',
          product,
          item
        })
      });
  }

};

export default ItemActions;


