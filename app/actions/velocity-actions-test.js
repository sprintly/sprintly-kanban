/*eslint-env node, mocha */
var sinon = require('sinon');
var VelocityActions = require('./velocity-actions');
var VelocityConstants = require('../constants/velocity-constants');

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
        var responseBody = { body: { average: 1 } };
        this.requestStub.callsArgWith(2, null, responseBody);

        VelocityActions.getVelocity('id');

        sinon.assert.calledWith(dispatchStub, {
          actionType: VelocityConstants.PRODUCT_VELOCITY,
          payload: responseBody.body,
          productId: 'id',
          userOverride: false
        });
      });
    });

    context('api error', function() {
      it('dispatches a PRODUCT_VELOCITY_ERROR event', function() {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.requestStub.callsArgWith(2, 'ERROR');

        VelocityActions.getVelocity();

        sinon.assert.calledWith(dispatchStub, {
          actionType: VelocityConstants.PRODUCT_VELOCITY_ERROR
        });
      });
    });
  });

  describe('setVelocity', function() {
    it('dispatches the a PRODUCT_VELOCITY event', function(done) {
      var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
      VelocityActions.setVelocity('id', 100);

      sinon.assert.calledWith(dispatchStub, {
        actionType: VelocityConstants.PRODUCT_VELOCITY,
        payload: { average: 100 },
        productId: 'id',
        userOverride: true
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
        var responseBody = { body: {10: {a: {items: 2, points: 5} } } };
        this.requestStub.callsArgWith(
          2,
          null,
          responseBody
        );

        VelocityActions.getItemCounts('id');

        sinon.assert.calledWith(dispatchStub, {
          actionType: VelocityConstants.STATUS_COUNTS,
          payload: responseBody.body,
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
          actionType: VelocityConstants.STATUS_COUNTS_ERROR
        });
        done();
      });
    });
  });
});

