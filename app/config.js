/*eslint-env node */

if (typeof window.__manifold_config !== "object") {
  console.warn("__manifold_config is missing!");
  var __manifold_config = {};
}

export default window.__manifold_config;
export const BASE_URL = window.__manifold_config.BASE_URL;
export const PUSHER_KEY = window.__manifold_config.PUSHER_KEY;
export const CHANNEL_PREFIX = window.__manifold_config.CHANNEL_PREFIX;
