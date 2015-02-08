import $ from 'jquery';
import { createClient } from 'sprintly-data';
import router from './router'

// Enable React dev tools
var React = require('react');
window.React = React;

$(function() {
  window.manifold = router(createClient({ token: window.__token }));
});
