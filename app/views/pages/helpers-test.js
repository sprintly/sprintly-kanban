var assert = require('chai').assert;
var helpers = require('./helpers');

describe('Pages/helpers', function() {
  describe('#isMobile', function() {
    it.only('returns true for over 420px', function() {
      // 420 is iPhone 6+ size
      var window = {innerWidth: 419};

      assert.isTrue(helpers.isMobile(window));
    })
  })
})
