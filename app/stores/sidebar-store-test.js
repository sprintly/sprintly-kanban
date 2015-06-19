var sinon = require('sinon');
var SidebarStore = require('./sidebar-store.js');
var assert = require('chai').assert

describe('SidebarStore', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('#openState', function() {
    before(function() {
      SidebarStore.__set__('_openState', {side: 'right'});
    })

    it('returns the current open state', function() {
      var target = {side: 'right'};
      var result = SidebarStore.openState();

      assert.deepEqual(result, target);
    })
  })
})
