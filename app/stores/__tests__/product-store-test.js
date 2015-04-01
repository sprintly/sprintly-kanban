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
