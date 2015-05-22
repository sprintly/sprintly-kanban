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
      it('dispatches the a PRODUCT_VELOCITY event', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, null, { body: 'results' });
        VelocityActions.getVelocity('id');
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'PRODUCT_VELOCITY',
          payload: 'results',
          productId: 'id'
        });
        done();
      });

      it('overrides the velocity if less than 1', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, null, {
          body: {
            average: 0.25
          }
        });

        VelocityActions.getVelocity('id');
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'PRODUCT_VELOCITY',
          payload: { average: 10 },
          productId: 'id'
        });
        done();
      });
    });

    context('api error', function() {
      it('dispatches a PRODUCT_VELOCITY_ERROR event', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, 'ERROR');
        VelocityActions.getVelocity();
        sinon.assert.calledWith(dispatchStub, {
          actionType: 'PRODUCT_VELOCITY_ERROR'
        });
        done();
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
});

