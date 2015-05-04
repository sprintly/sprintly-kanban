var assert = require('chai').assert;
var sinon = require('sinon');
var ItemActions = require('./item-actions');
var Promise = require('bluebird');
var products = require('../lib/sprintly-client').products;

describe('ItemActions', function() {

  beforeEach(function () {
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('#addItem', function () {
    it('throws an error with no product', function () {
      this.sinon.stub(products, 'get').returns(false);

      assert.throws(() => ItemActions.addItem(1, {}), /Missing product: %s/);
    });
  });
})