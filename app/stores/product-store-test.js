var $ = require('jquery');
var _ = require('lodash');
var ProductStore = require('./product-store');
var Backbone = require('backdash');
var assert = require('chai').assert;
var sinon = require('sinon');
var Promise = require('bluebird');

describe('ProductStore', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('internals.initProduct', function() {
    beforeEach(function() {
      this.products = ProductStore.__get__('products');
      this.user = ProductStore.__get__('user');
      this.FiltersAction = ProductStore.__get__('FiltersAction');
      this.productsTriggerStub = sinon.stub();
      ProductStore.__set__('products', {
        fetch: () => true,
        trigger: this.productsTriggerStub,
        get: sinon.stub()
      });
      ProductStore.__set__('user', {
        fetch: () => true
      });
      this.filtersInitStub = sinon.stub();
      ProductStore.__set__('FiltersAction', {
        init: this.filtersInitStub
      });
    });

    afterEach(function() {
      ProductStore.__set__('products', this.products);
      ProductStore.__set__('user', this.user);
      ProductStore.__set__('FiltersAction', this.FiltersAction);
    });

    it('creates subscriptions on items collection', function() {
      let createSubscriptionStub = this.sinon.stub(ProductStore.internals, 'createSubscription');
      let itemsOnStub = sinon.stub();
      ProductStore.internals.initProduct({
        items: {
          on: itemsOnStub
        }
      });
      assert.ok(itemsOnStub.called);
      assert.ok(createSubscriptionStub.called);
    });
  });

  describe('internals.ingestItem', function() {
    beforeEach(function() {
      this.products = ProductStore.__get__('products');
      this.product = this.products.add({ id: 1 });
      this.backlog = this.product.getItemsByStatus('backlog');
      this.backlog.reset([
        { number: 1234, status: 'backlog', last_modified: Date.now() }
      ]);
      this.setStub = this.sinon.spy(this.product.ItemModel.prototype, 'set');
      this.createItemStub = this.sinon.spy(ProductStore.internals, 'createItem');
      this.triggerStub = this.sinon.stub(this.product.items, 'trigger');
    });

    context('item already exists', function() {
      it('should respect more recent last_modified timestamps', function() {
        ProductStore.internals.ingestItem(this.product, { number: 1234, last_modified: 0, status: 'someday' });
        let payload = this.setStub.getCall(0).args[0];
        assert.isDefined(payload);
        assert.notEqual(payload.last_modified, 0);
      });

      it('should trigger a change event', function() {
        ProductStore.internals.ingestItem(this.product, { number: 1234, status: 'someday' });
        sinon.assert.called(this.triggerStub);
      });
    });

    context('item does not exist', function() {
      it('should call internals.createItem', function() {
        ProductStore.internals.ingestItem(this.product, { number: 4321, status: 'backlog' });
        sinon.assert.calledWith(this.createItemStub, this.product, { number: 4321, status: 'backlog'});
      });

      it('should trigger a "change" event', function() {
        ProductStore.internals.ingestItem(this.product, { number: 4321, status: 'someday' });
        sinon.assert.called(this.triggerStub);
      });
    });
  });

  describe('getAll', function() {
    it('only returns active products', function() {
      let products = ProductStore.__get__('products');
      products.reset([{ name: 'sprintly', archived: false, id: 1 }, { name: 'old project', archived: true, id: 2 }]);
      let activeProducts = ProductStore.getAll();
      assert.lengthOf(activeProducts, 1);
      products.reset([]);
    });
  });

  xdescribe('getItemsForProduct', function() {
    it('returns an items collection', function() {

    });

    it('updates the items collection filter config', function() {

    });
  });
});
