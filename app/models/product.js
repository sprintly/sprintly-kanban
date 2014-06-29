var Backbone = require('backdash')
var Items = require('../collections/items')
var People = require('../collections/people')
var Supermodel = require('supermodel')

module.exports = Backbone.Model.extend({

  constructor: function(attrs, options) {
    this.people = new People(null, { productId: attrs.id })

    this.itemModel = Supermodel.Model.extend();
    this.items = new Items(null, {
      productId: attrs.id,
      people: this.people,
      model: this.itemModel
    })

    this.filters = {};
    Backbone.Model.apply(this, arguments)
  },

  getItemsByStatus: function(status) {
    var items = this.filters[status]

    if (!items) {
      items = new Items(this.items.toJSON(), {
        productId: this.get('id'),
        people: this.people,
        model: this.itemModel
      });
      items.config.set('status', status);
      this.filters[status] = items;
    }

    return items;
  },

});
