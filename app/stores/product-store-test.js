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
      this.FilterActions = ProductStore.__get__('FilterActions');
      this.productsTriggerStub = sinon.stub();
      this.filtersInitStub = sinon.stub();
      ProductStore.__set__('FilterActions', {
        init: this.filtersInitStub
      });
      // {products, user} from sprintly-client mocking
      ProductStore.__set__('products', {
        fetch: () => true,
        trigger: this.productsTriggerStub,
        get: sinon.stub()
      });
      ProductStore.__set__('user', {
        fetch: () => true
      });
    });

    afterEach(function() {
      ProductStore.__set__('products', this.products);
      ProductStore.__set__('user', this.user);
      ProductStore.__set__('FilterActions', this.FilterActions);
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

  describe('#hasItems', function(){
    it('returns false when the product has no items', function() {
      let mockProduct  = {
        get: function(id) {
          return {items: []}
        }
      }
      ProductStore.__set__('products', mockProduct);
      let result = ProductStore.hasItems();

      assert.isFalse(result)
    })
    
    it('returns true when the product has items', function() {
      let mockProduct  = {
        get: function(id) {
          return {items: [1,2,3]}
        }
      }
      ProductStore.__set__('products', mockProduct);
      let result = ProductStore.hasItems();

      assert.isTrue(result)
    })
  })

  describe('#hasItemsToRender', function() {
    describe('returns true', function() {
      it('when product collection has items', function() {
        let mockCollection = {items: [1,2,3]};
        this.sinon.stub(ProductStore.internals, 'itemsForProduct').returns([mockCollection]);

        let result = ProductStore.hasItemsToRender(1);
        assert.isTrue(result);
      })
    })

    describe('returns false', function() {
      it('when product collection has no items', function() {
        it('when product collection has items', function() {
          let mockCollection = {items: []};
          this.sinon.stub(ProductStore.internals, 'itemsForProduct').returns([mockCollection]);

          let result = ProductStore.hasItemsToRender(1);
          assert.isFalse(result);
        })
      })
    })
  })

  xdescribe('getItemsForProduct', function() {
    it('returns an items collection', function() {

    });

    it('updates the items collection filter config', function() {

    });
  });
});
