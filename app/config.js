/*eslint-env node */

if (typeof __manifold_config !== "object") {
  throw new Error("__manifold_config is missing!");
}

export default __manifold_config;
export const BASE_URL = __manifold_config.BASE_URL;
export const PUSHER_KEY = __manifold_config.PUSHER_KEY;
export const CHANNEL_PREFIX = __manifold_config.CHANNEL_PREFIX;
