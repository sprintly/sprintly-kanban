var $ = require('jquery');
var sprintly = require('sprintly-data');
var router = require('./router');

// Enable React dev tools
var React = require('react');
window.React = React;

$(function() {
  window.manifold = router(sprintly.createClient({ token: window.__token }));
});
