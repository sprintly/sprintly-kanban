import request from 'superagent';
import AppDispatcher from '../dispatchers/app-dispatcher';

let BASE_URL = process.env.NODE_ENV === 'production' ? 'https://sprint.ly' : 'https://local.sprint.ly:9000';
let token = window.__token;

var internals = {
  request(id, metric, cb) {
    request
      .get(`${BASE_URL}/api/products/${id}/aggregate/${metric}.json`)
      .set('Authorization', `Bearer ${token}`)
      .end(cb);
  }
}

var VelocityActions = {
  getVelocity(productId) {
    internals.request(productId, 'velocity', function(err, res) {
      if (err) {
        AppDispatcher.dispatch({
          actionName: 'PRODUCT_VELOCITY_ERROR'
        });
        return;
      }

      if (res.body) {
        AppDispatcher.dispatch({
          actionName: 'PRODUCT_VELOCITY',
          payload: res.body,
          productId
        });
      }
    });
  }
};

export default VelocityActions;
