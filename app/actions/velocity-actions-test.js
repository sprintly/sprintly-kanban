var assert = require('chai').assert;
var sinon = require('sinon');
var VelocityActions = require('./velocity-actions');

describe('VelocityActions', function() {

  beforeEach(function() {
    this.appDispatcher = VelocityActions.__get__('AppDispatcher');
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('getVelocity', function() {
    beforeEach(function() {
      let internals = VelocityActions.__get__('internals');
      this.requestStub = this.sinon.stub(internals, 'request');
    });

    context('api success', function() {
      it('dispatches a PRODUCT_VELOCITY event', function() {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, null, { body: { average: 1 } });
        VelocityActions.getVelocity('id');
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'PRODUCT_VELOCITY',
          payload: { average: 7 },
          productId: 'id'
        });
      });

      it('overrides the velocity if less than 1', function() {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, null, {
          body: {
            average: 0.025
          }
        });

        VelocityActions.getVelocity('id');
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'PRODUCT_VELOCITY',
          payload: { average: 10 },
          productId: 'id'
        });
      });
    });

    context('api error', function() {
      it('dispatches a PRODUCT_VELOCITY_ERROR event', function() {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, 'ERROR');
        VelocityActions.getVelocity();
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'PRODUCT_VELOCITY_ERROR'
        });
      });
    });
  });

  describe('setVelocity', function() {
    it('dispatches the a PRODUCT_VELOCITY event', function(done) {
      var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
      VelocityActions.setVelocity('id', 100);
      sinon.assert.calledWith(dispatchStub, {
        actionType: 'PRODUCT_VELOCITY',
        payload: { average: 100 },
        productId: 'id'
      });
      done();
    });
  });

  describe('getItemCounts', function() {
    beforeEach(function() {
      let internals = VelocityActions.__get__('internals');
      this.requestStub = this.sinon.stub(internals, 'request');
    });

    context('api success', function() {
      it('dispatches an ITEM_COUNTS event', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, null, { body: { 10: { a: 1 } } });
        VelocityActions.getItemCounts('id');
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'ITEM_COUNTS',
          payload: { backlog: 1 },
          productId: 'id'
        });
        done();
      });

      it('totals the item counts for each status', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, null, {
          body: {
            5: { a: 10, b: 10 },
            30: { y: 20, z: 10 }
          }
        });

        VelocityActions.getItemCounts('id');
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'ITEM_COUNTS',
          payload: {
            someday: 20,
            completed: 30
          },
          productId: 'id'
        });
        done();
      });
    });

    context('api error', function() {
      it('dispatches an ITEM_COUNTS_ERROR event', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, 'ERROR');
        VelocityActions.getItemCounts();
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'ITEM_COUNTS_ERROR'
        });
        done();
      });
    });
  });
});

