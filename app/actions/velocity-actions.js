import request from 'superagent';
import AppDispatcher from '../dispatchers/app-dispatcher';

let BASE_URL = process.env.NODE_ENV === 'production' ? 'https://sprint.ly' : 'https://local.sprint.ly:9000';
let token = window.__token;

const DEFAULT_VELOCITY = 10;
const DEFAULT_ITERATION_LENGTH = 7;

var internals = {
  request(id, metric, cb) {
    request
      .get(`${BASE_URL}/api/products/${id}/aggregate/${metric}.json`)
      .set('Authorization', `Bearer ${token}`)
      .end(cb);
  },

  calculateAverageVelocity(velocity={}) {
    velocity.average = Math.round(velocity.average * DEFAULT_ITERATION_LENGTH);

    if (velocity.average < 1) {
      velocity.average = DEFAULT_VELOCITY;
    }

    return velocity;
  }
}

var VelocityActions = {
  getVelocity(productId) {
    internals.request(productId, 'velocity', function(err, res) {
      if (err) {
        AppDispatcher.dispatch({
          actionType: 'PRODUCT_VELOCITY_ERROR'
        });
        return;
      }

      if (res.body) {
        let velocity = internals.calculateAverageVelocity(res.body);
        AppDispatcher.dispatch({
          actionType: 'PRODUCT_VELOCITY',
          payload: velocity,
          productId
        });
      }
    });
  }
};

export default VelocityActions;
