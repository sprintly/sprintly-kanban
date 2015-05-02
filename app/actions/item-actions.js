import AppDispatcher from '../dispatchers/app-dispatcher';
import {products} from '../lib/sprintly-client';
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
        let col = product.getItemsByStatus(item.status);
        if (col) {
          col.add(item);
        }
      });
    } else {
      return new Promise(function(resolve) {
        resolve(item)
      });
    }
  }
};

export default ItemActions;


