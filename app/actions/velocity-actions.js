import request from 'superagent';
import AppDispatcher from '../dispatchers/app-dispatcher';
import VelocityConstants from '../constants/velocity-constants';
import {BASE_URL} from '../config';

const token = window.__token;

var internals = {
  request(id, metric, cb) {
    request
      .get(`${BASE_URL}/api/products/${id}/aggregate/${metric}.json`)
      .set('Authorization', `Bearer ${token}`)
      .end(cb);
  }
};

var VelocityActions = {
  getVelocity(productId) {
    internals.request(productId, 'velocity', function(err, res) {
      if (err) {
        AppDispatcher.dispatch({
          actionType: VelocityConstants.PRODUCT_VELOCITY_ERROR
        });
        return;
      }

      if (res.body) {
        AppDispatcher.dispatch({
          actionType: VelocityConstants.PRODUCT_VELOCITY,
          payload: res.body,
          productId,
          userOverride: false
        });
      }
    });
  },

  setVelocity(productId, velocity) {
    AppDispatcher.dispatch({
      actionType: VelocityConstants.PRODUCT_VELOCITY,
      payload: {
        average: velocity
      },
      productId,
      userOverride: true
    });
  },

  getItemCounts(productId) {
    internals.request(productId, 'focus', function(err, res) {
      if (err) {
        AppDispatcher.dispatch({
          actionType: VelocityConstants.STATUS_COUNTS_ERROR
        });
        return;
      }

      if (res.body) {
        AppDispatcher.dispatch({
          actionType: VelocityConstants.STATUS_COUNTS,
          payload: res.body,
          productId
        });
      }
    });
  }
};

export default VelocityActions;
