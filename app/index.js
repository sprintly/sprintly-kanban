var $ = require('jquery')
var React = require('react')
var Backbone = require('backdash')
Backbone.$ = $

var Products = require('./collections/products')
var AppView = require('./views/app')

// Enable React dev tools
window.React = React

$(function() {
  // wat up, sync DOM APIs?
  var email = window.localStorage.getItem('email') || window.prompt('sprintly email:');
  var key = window.localStorage.getItem('key') || window.prompt('sprintly API key:');

  window.localStorage.setItem('email', email);
  window.localStorage.setItem('key', key);

  var apiKey = new Backbone.Model({
    email: email,
    key: key
  })

  var authHeader = window.btoa(apiKey.get('email') + ":" + apiKey.get('key'))

  $.ajaxSetup({
    headers: {
      "Authorization": "Basic " + authHeader
    }
  })

  window.manifold = new AppView({
    products: new Products()
  })
})
