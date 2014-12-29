var _ = require('lodash');
var $ = require('jquery')
var React = require('react')

var Backbone = require('backdash')
Backbone.$ = $;

var attachDeps = require('../lib/mixins').attachDeps
var ProductNav = require('./components/product-nav')
var ItemsView = require('./pages/items')

module.exports = Backbone.View.extend({
  el: $('body'),

  dependencies: {
    products: 'Products Collection',
    user: 'User Model'
  },

  initialize: function(options) {
    attachDeps.call(this, options);
    this.user.fetch()
      .then(() => {
        return this.products.fetch();
      })
      .then(() => {
        this.render();
      });
  },

  store: {
    get: window.localStorage.getItem.bind(window.localStorage),
    set: window.localStorage.setItem.bind(window.localStorage),
    clear: window.localStorage.clear.bind(window.localStorage)
  },

  render: function() {
    // this.nav = React.renderComponent(
    //   ProductNav({
    //     products: _.invoke(this.products.where({ archived: false }), 'toJSON'),
    //     config: this.config
    //   }),
    //   this.$('#product-nav').get(0)
    // )

    this.columns = React.render(
      <ItemsView products={this.products} config={this.config} />,
      this.$('.main').get(0)
    );
  },

  /*
   * Controller Actions
   */

  showColumns: function() {
    this.products.fetch().then(this.render.bind(this))
  }

})
