var Backbone = require('backdash')
var config = require('../lib/config')
var attachDeps = require('../lib/mixins').attachDeps

module.exports = Backbone.Collection.extend({

  url: function() {
    return config.BASE_URL + '/products/' + this.productId + '/people.json'
  },

  dependencies: {
    productId: 'Product ID'
  },

  initialize: function(models, options) {
    attachDeps.call(this, options)
    this.fetch()
  }

})
