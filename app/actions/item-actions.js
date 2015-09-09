import AppDispatcher from '../dispatchers/app-dispatcher';
import {products} from '../lib/sprintly-client';
import request from 'superagent';
import Promise from 'bluebird';
import _ from 'lodash';
import {BASE_URL} from '../config';

const token = window.__token;
const SUBITEMS = 'subitems';
const ATTACHMENTS = 'attachments';

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
      return saved.then(function(item) {
        AppDispatcher.dispatch({
          actionType: 'ADD_ITEM',
          product,
          item
        })
      });
    } else {
      return Promise.reject(item);
    }
  },

  itemForType(type, data, parentId) {
    if (type === SUBITEMS) {
      return {
        title: data.title,
        type: 'task',
        parent: parentId
      }
    }
  },

  bulkAdd(type, productId, parent, data) {
    let product = products.get(productId);

    Promise.map(data, (newItem) => {
      let newItemData = this.itemForType(type, newItem, parent.number);
      let item = product.createItem(newItemData, { silent: true });

      item.save();

      return item;
    }).then(function(items) {
      AppDispatcher.dispatch({
        actionType: 'ADD_ITEMS',
        product,
        items
      });
    }).catch( (e) => {
       return Promise.reject();
    });
  },

  createComment(productId, itemId, comment) {
    var commentsEndpoint = `${BASE_URL}/api/products/${productId}/items/${itemId}/comments.json`;

    request
      .post(commentsEndpoint)
      .set('Authorization', `Bearer ${token}`)
      .type('form')
      .send({body: comment})
      .end((err, res) => {
        if (err) {
          AppDispatcher.dispatch({
            actionType: 'ITEM_COMMENT_ERROR',
            err
          });
          return;
        }

        if (res.body) {
          /*
            TODO: Should activity be its own BB collection?
          */
          this.fetchActivity(productId, itemId);

          AppDispatcher.dispatch({
            actionType: 'ITEM_COMMENTED',
            payload: res.body,
            productId,
            itemId
          });
        }
      });
  },

  fetchActivity(productId, itemId) {
    var activityEndpoint = `${BASE_URL}/api/products/${productId}/items/${itemId}/activities.json`;

    request
      .get(activityEndpoint)
      .set('Authorization', `Bearer ${token}`)
      .end(function(err, res) {
        if (err) {
          AppDispatcher.dispatch({
            actionType: 'ITEM_ACTIVITY_ERROR',
            err
          });
          return;
        }

        if (res.body) {
          AppDispatcher.dispatch({
            actionType: 'ITEM_ACTIVITY',
            payload: res.body,
            productId,
            itemId
          });
        }
      });
  },

  fetchAttachments(productId, itemId) {
    let attachmentsEndpoint = `${BASE_URL}/api/products/${productId}/items/${itemId}/attachments.json`;

    request
      .get(attachmentsEndpoint)
      .set('Authorization', `Bearer ${token}`)
      .end(function(err, res) {
        if (err) {
          AppDispatcher.dispatch({
            actionType: 'ITEM_ATTACHMENTS_ERROR',
            err
          });
          return;
        }

        if (res.body) {
          AppDispatcher.dispatch({
            actionType: 'ITEM_ATTACHMENTS',
            payload: res.body,
            productId,
            itemId
          });
        }
      });
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
  },

  deleteItem(productId, itemId) {
    let product = products.get(productId);
    let item = product.items.get(itemId);
    let itemData = item.attributes;
    let destroyed = item.destroy();

    if (destroyed) {
      return destroyed.then(function() {
        AppDispatcher.dispatch({
        actionType: 'DELETE_ITEM',
        product,
        itemData
        });
      });
    } else {
      return new Promise(function(resolve) {
        AppDispatcher.dispatch({
          actionType: 'DELETE_ITEM_ERROR',
          product,
          itemData
        });
        resolve();
      });
    }
  }
};

export default ItemActions;
