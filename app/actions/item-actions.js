import AppDispatcher from '../dispatchers/app-dispatcher';
import {products} from '../lib/sprintly-client';

let ItemActions = {
  addItem(productId, data) {
    let product = products.get(productId);

    if (!product) {
      throw new Error('Missing product: %s', productId);
    }

    data.product = product.toJSON();

    let item = product.createItem(data, { silent: true });
    return item.save().then(function() {
      let col = product.getItemsByStatus(item.status);
      if (col) {
        col.add(item);
      }
    });
  }
};

export default ItemActions;
