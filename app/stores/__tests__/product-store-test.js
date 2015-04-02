var $ = require('jquery');
var _ = require('lodash');
var ProductStore = require('../product-store');
var Backbone = require('backdash');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('ProductStore', function() {

  describe('internals.initProducts', function() {
    beforeEach(function() {
      this.sinon = sinon.sandbox.create();
      this.products = ProductStore.__get__('products');
      this.user = ProductStore.__get__('user');
      this.FiltersAction = ProductStore.__get__('FiltersAction');
      this.productsTriggerStub = sinon.stub()
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
      this.sinon.restore();
    });

    it('should return a promise', function() {
      return ProductStore.internals.initProducts();
    });

    context('after successful fetch', function() {
      beforeEach(function() {
        this.createSubscriptionStub = this.sinon.stub(ProductStore.internals, 'createSubscription');
      });

      it('initializes filters data', function(done) {
        ProductStore.internals.initProducts(1).then(() => {
          assert.isTrue(this.filtersInitStub.called);
          done();
        })
      });

      it('subscribes to product events', function(done) {
        ProductStore.internals.initProducts(1).then(() => {
          assert.isTrue(this.createSubscriptionStub.called);
          done();
        })
      });

      it('triggers a change event', function(done) {
        ProductStore.internals.initProducts(1).then(() => {
          assert.isTrue(this.productsTriggerStub.called);
          done();
        });
      });

      context('no product id', function() {
        it('triggers a change event', function(done) {
          ProductStore.internals.initProducts(1).then(() => {
            assert.isTrue(this.productsTriggerStub.called);
            done();
          });
        });
      });
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

  describe('updateItemPriority', function() {
    beforeEach(function() {
      this.products = ProductStore.__get__('products');
      this.product = this.products.add({ id: 1 });
      this.backlog = this.product.getItemsByStatus('backlog');
      this.resortStub = sinon.stub(this.product.ItemModel.prototype, 'resort');
      this.backlog.reset([
        { number: 1, status: 'backlog', product: { id: 1 }, sort: 1 },
        { number: 2, status: 'backlog', product: { id: 1 }, sort: 2 },
        { number: 3, status: 'backlog', product: { id: 1 }, sort: 3 }
      ]);
    });

    afterEach(function() {
      this.resortStub.restore();
    });

    after(function() {
      this.backlog.reset();
    });

    it('throws when unexpected sort argument encountered', function() {
      assert.throws(() => ProductStore.internals.updateItemPriority(1,1,'sideways'), /Invalid priority direction/);
    });

    context('up', function() {
      it('calls resort with the expected before and after values when both exist', function() {
        ProductStore.internals.updateItemPriority(1, 3, 'up');
        sinon.assert.calledWith(this.resortStub, { before: 2, after: 1 });
      })

      it('call resort with the expected arguments when no "after" item is found', function() {
        ProductStore.internals.updateItemPriority(1, 2, 'up');
        sinon.assert.calledWith(this.resortStub, { after: 1 });
      })
    });

    context('down', function() {
      it('calls resort with the expected before and after values when both "before" and "after" items exist', function() {
        ProductStore.internals.updateItemPriority(1, 1, 'down');
        sinon.assert.calledWith(this.resortStub, { before: 3, after: 2 });
      })

      it('call resort with the expected arguments when no "before" item is found', function() {
        ProductStore.internals.updateItemPriority(1, 2, 'down');
        sinon.assert.calledWith(this.resortStub, { before: 3 });
      })
    });

    context('top', function() {
      it('calls resort with the correct values', function() {
        ProductStore.internals.updateItemPriority(1, 3, 'top');
        sinon.assert.calledWith(this.resortStub, { after: 1 });
      });
    });

    context('bottom', function() {
      it('calls resort with the correct values', function() {
        ProductStore.internals.updateItemPriority(1, 1, 'bottom');
        sinon.assert.calledWith(this.resortStub, { before: 3 });
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
