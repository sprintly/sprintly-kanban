/*eslint-env node */
export const CHANNEL_PREFIX = process.env.NODE_ENV === 'production' ?
  'api-product_sprintly-aws' : 'api-product_sprintly-development-justinlilly';

export const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://sprint.ly' : 'https://local.sprint.ly:9000';

export const PUSHER_KEY = process.env.PUSHER_KEY || '';
