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
});

