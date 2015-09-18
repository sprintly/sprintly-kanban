exports.sprintly_api_root = 'https://local.sprint.ly:9000';
exports.client_id = process.env.SPRINTLY_CLIENT_ID || '';
exports.client_secret = process.env.SPRINTLY_CLIENT_SECRET || '';
exports.cookie_password = process.env.COOKIE_PASSWORD || 'shhh';
exports.forceHttps = process.env.FORCE_HTTPS || true;
exports.redirect_uri = 'http://local.sprint.ly:3600'
exports.pusher_key = process.env.PUSHER_KEY || '';
exports.channel_prefix = process.env.CHANNEL_PREFIX || '';
