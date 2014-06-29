var $ = require('jquery');
var Backbone = require('backdash')
var config = require('../lib/config')
var attachDeps = require('../lib/mixins').attachDeps

module.exports = Backbone.Collection.extend({

  url: function() {
    var qs = $.param(this.config.toJSON())
    return config.BASE_URL + '/products/' + this.productId + '/items.json?' + qs
  },

  dependencies: {
    productId: 'Product ID',
    people: 'People Collection'
  },

  initialize: function(models, options) {
    attachDeps.call(this, options)

    this.config = new Backbone.Model({
      offset: 0,
      limit: 100,
      status: 'backlog',
      order_by: 'newest'
    })

  }

})
