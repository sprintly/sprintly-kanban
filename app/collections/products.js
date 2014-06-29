var Backbone = require('backdash')
var Product = require('../models/product')
var config = require('../lib/config')

module.exports = Backbone.Collection.extend({

  model: Product,

  url: config.BASE_URL + '/products.json',

  parse: function(resp) {
    console.log(resp)
    return resp;
  }

})
