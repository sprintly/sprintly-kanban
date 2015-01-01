var $ = require('jquery');
var sprintly = require('sprintly-data');
var router = require('./router');

// Enable React dev tools
var React = require('react');
window.React = React;

$(function() {
  // wat up, sync DOM APIs?
  var email = window.localStorage.getItem('email') || window.prompt('sprintly email:');
  var key = window.localStorage.getItem('key') || window.prompt('sprintly API key:');

  if (email && key) {
    window.localStorage.setItem('email', email);
    window.localStorage.setItem('key', key);

    window.manifold = router(sprintly.createClient(email, key));
  }

});
