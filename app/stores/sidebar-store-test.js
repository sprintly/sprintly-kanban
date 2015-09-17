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

  describe('internals.show', function() {
    describe('offcanvas row is active', function() {
      beforeEach(function() {
        var mockELClass = [{className: 'something active'}]
        this.sinon.stub(document, 'getElementsByClassName').returns(mockELClass);
        this.canvasWrapClass = SidebarStore.internals.show('irrelevant');
      })

      it('resets the canvas wrap class to \'row-offcanvas\'', function() {
        var target = 'row-offcanvas';

        assert.equal(this.canvasWrapClass, target);
      });

      it('sets the open side to empty string', function() {
        var openState = SidebarStore.openState();

        assert.equal(openState.side, '');
      })
    })

    describe('offcanvas row is not active', function() {
      beforeEach(function() {
        var mockELClass = [{className: 'inactive'}]
        this.sinon.stub(document, 'getElementsByClassName').returns(mockELClass);
        this.canvasWrapClass = SidebarStore.internals.show('right');
      })

      it('adds the side && active to the canvas wrap class', function() {
        var target = 'row-offcanvas row-offcanvas-right active';

        assert.equal(this.canvasWrapClass, target);
      });

      it('sets the open side to empty string', function() {
        var openState = SidebarStore.openState();

        assert.equal(openState.side, 'right');
      })
    })
  })
})
