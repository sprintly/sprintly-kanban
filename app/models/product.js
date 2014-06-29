var Backbone = require('backdash')
var Items = require('../collections/items')
var People = require('../collections/people')
var Supermodel = require('supermodel')

module.exports = Backbone.Model.extend({

  constructor: function(attrs, options) {
    this.people = new People(null, { productId: attrs.id })

    var ItemModel = this.itemModel = Supermodel.Model.extend({
      idAttribute: 'number'
    });

    this.items = new Items(null, {
      productId: attrs.id,
      people: this.people,
      model: function(attrs, options) {
        return ItemModel.create(attrs, options)
      }
    })

    this.filters = {};
    Backbone.Model.apply(this, arguments)
  },

  getItemsByStatus: function(status) {
    var items = this.filters[status]
    var ItemModel = this.itemModel

    if (!items) {
      items = new Items(this.items.toJSON(), {
        productId: this.get('id'),
        people: this.people,
        model: function(attrs, options) {
          return ItemModel.create(attrs, options)
        }
      });
      items.config.set('status', status);
      this.filters[status] = items;
    }

    return items;
  },

});
