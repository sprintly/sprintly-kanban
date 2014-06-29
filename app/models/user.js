var Backbone = require('backdash')
var config = require('../lib/config')

module.exports = Backbone.Model.extend({
  url: function() {
    return config.BASE_URL + '/user/whoami.json'
  },

  initialize: function() {
    this.fetch()
  }
})
