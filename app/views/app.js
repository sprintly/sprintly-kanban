var _ = require('lodash');
var $ = require('jquery')
var React = require('react')
var Backbone = require('backdash')
Backbone.$ = $;

var User = require('../models/user')
var Router = require('../router')
var attachDeps = require('../lib/mixins').attachDeps
var ProductNav = require('./components/product-nav')
var ItemsView = require('./pages/items')

module.exports = Backbone.View.extend({
  el: $('body'),

  dependencies: {
    products: 'Products Collection'
  },

  initialize: function(options) {
    attachDeps.call(this, options);

    this.router = new Router({
      controllers: {
        app: this
      }
    })

    this.user = new User()
    this.setupColumns()

    Backbone.history.start()
  },

  store: {
    get: window.localStorage.getItem.bind(window.localStorage),
    set: window.localStorage.setItem.bind(window.localStorage),
    clear: window.localStorage.clear.bind(window.localStorage)
  },

  setupColumns: function() {
    var cols = this.store.get('cols');

    console.log(cols)

    this.config = new Backbone.Model({
      columns: (cols ? cols.split(',') : [])
    })

    this.toggleSmallNav()
    this.listenTo(this.config, 'update', this.update);
  },

  update: function() {
    this.toggleSmallNav()
    this.store.set('cols', this.config.get('columns').join(','));
  },

  toggleSmallNav: function() {
    if (this.config.get('columns').length > 3) {
      this.$el.addClass('hide-nav')
    } else {
      this.$el.removeClass('hide-nav')
    }
  },

  render: function() {
    this.nav = React.renderComponent(
      ProductNav({
        products: _.invoke(this.products.where({ archived: 0 }), 'toJSON'),
        config: this.config
      }),
      this.$('#product-nav').get(0)
    )

    this.columns = React.renderComponent(
      ItemsView({
        products: this.products,
        config: this.config
      }),
      this.$('.main').get(0)
    )
  },

  /*
   * Controller Actions
   */

  index: function() {
    this.products.fetch().then(this.render.bind(this))
  }

})
