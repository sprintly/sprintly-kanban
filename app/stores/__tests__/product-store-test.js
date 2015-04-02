var $ = require('jquery');
var _ = require('lodash');
var ProductStore = require('../product-store');
var Backbone = require('backdash');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('ProductStore', function() {

  describe('internals.initProducts', function() {
    before(function() {
      this.products = ProductStore.__get__('products');
      this.user = ProductStore.__get__('user');
      ProductStore.__set__('products', {
        fetch: () => true,
        trigger: sinon.stub()
      });
      ProductStore.__set__('user', {
        fetch: () => true
      })
    });

    after(function() {
      ProductStore.__set__('products', this.products);
      ProductStore.__set__('user', this.user);
    });

    it('should return a promise', function() {
      var internals = ProductStore.internals;
      return internals.initProducts();
    });
  });

  describe('internals.updateItem', function() {
    beforeEach(function() {
      this.products = ProductStore.__get__('products');
      this.product = this.products.add({ id: 1 });
      this.item = this.product.items.add(
        { id: 1, status: 'in-progress' }
      );
      this.item.save = sinon.stub();
    });

    afterEach(function() {
      this.product.items.reset();
    });

    it('unsets the close reason if status is changing', function() {
      this.item.set({ close_reason: 'fixed' });
      ProductStore.internals.updateItem(1, 1, { status: 'current' });
      assert.isUndefined(this.item.get('close_reason'));
    });

    it('calls item.save', function() {
      ProductStore.internals.updateItem(1, 1, { status: 'current' });
      sinon.assert.calledWith(this.item.save, { status: 'current' });
    });
  });

  describe('internals.loadMoreItems', function() {
    beforeEach(function() {
      this.collection = new Backbone.Collection();
      this.collection.config = new Backbone.Model({
        status: 'backlog',
        offset: 0
      });
    });

    it('should return a promise', function() {
      var spy = sinon.spy(this.collection, 'trigger');

      this.collection.fetch = () => {
        return $.Deferred().resolve({length: 0});
      };

      ProductStore.internals.loadMoreItems(this.collection);
      sinon.assert.calledOnce(spy);
    });

    it('should emit a change event and pass an object containing the response item count', function() {
      var spy = sinon.spy(this.collection, 'trigger');

      this.collection.fetch = () => {
        return $.Deferred().resolve({length: 16});
      };

      ProductStore.internals.loadMoreItems(this.collection);
      sinon.assert.calledWith(spy, 'change', {count: 16});
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
