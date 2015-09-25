/*eslint-env node */

var config
if (window && window.__manifold_config) {
  config = window.__manifold_config
} else {
  console.warn('__manifold_config is missing!') // eslint-disable-line no-console
  config = {}
}

export default config
export const BASE_URL = config.BASE_URL
export const PUSHER_KEY = config.PUSHER_KEY
export const CHANNEL_PREFIX = config.CHANNEL_PREFIX
