var _ = require('lodash');
var ProductActions = require('./product-actions');
var sinon = require('sinon');
var assert = require('chai').assert;
var Promise = require('bluebird');
var Backbone = require('backdash');
var AppDispatcher = require('../dispatchers/app-dispatcher');


describe('Product Actions', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('changeSortCriteria', function() {
    beforeEach(function() {
      this.itemsCollection = new Backbone.Collection();
      this.itemsCollection.config = new Backbone.Model({
        status: 'backlog',
        limit: 25
      });
      window.localStorage.removeItem('itemColumn-backlog-sortField');
    });

    it('saves the sort field to localStorage', function() {
      ProductActions.changeSortCriteria(this.itemsCollection, {
        status: 'backlog',
        field: 'priority'
      });
      assert.equal('priority', window.localStorage.getItem('itemColumn-backlog-sortField'));
    });
  });

  describe('getItemsForProduct', function() {
    beforeEach(function() {
      this.products = ProductActions.__get__('products');
      this.product = this.products.add({ id: 1 });
      this.itemsCollection = new Backbone.Collection();
      this.getItemsByStatusStub = this.sinon.stub(this.product, 'getItemsByStatus').returns(this.itemsCollection);
      this.itemsCollection.config = new Backbone.Model({
        status: 'backlog',
        limit: 25,
        order_by: 'recent'
      });
    });

    it('sets a default limit for the collection', function() {
      ProductActions.getItemsForProduct(1, {});
      assert.equal(40, this.itemsCollection.config.get('limit'));
    });

    it('fetches subitems with the expand_sub_items flag', function() {
      ProductActions.getItemsForProduct(1, {});
      assert.isTrue(this.itemsCollection.config.get('expand_sub_items'));
      assert.isFalse(this.itemsCollection.config.get('children'));
    });

    it('sets the collection config order by', function() {
      ProductActions.getItemsForProduct(1, {
        sortField: 'priority'
      });
      assert.equal('priority', this.itemsCollection.config.get('order_by'));
    });

    it('sets higher limits for priority sort backlog requests', function() {
      ProductActions.getItemsForProduct(1, {
        status: 'backlog',
        sortField: 'priority'
      });
      assert.equal(100, this.itemsCollection.config.get('limit'));
    });

    it('sets lower limits for the accepted column', function() {
      ProductActions.getItemsForProduct(1, {
        status: 'accepted'
      });
      assert.equal(5, this.itemsCollection.config.get('limit'));
    });

    describe('internals.mergeFilters', function() {
      it('sets an empty value for "unassigned" filters', function() {
        let mergedFilters = ProductActions.internals.mergeFilters(this.itemsCollection.config, {
          filters: {
            assigned_to: 'unassigned'
          }
        });
        assert.equal('', mergedFilters.assigned_to);
      });

      it('unsets globabl filters if they were set previously, but missing from the ', function() {
        let defaultFilters = this.itemsCollection.config;
        defaultFilters.set('tags', 'bar');

        let mergedFilters = ProductActions.internals.mergeFilters(defaultFilters, {
          filters: {}
        });

        assert.isUndefined(mergedFilters.tags);
      });
    });
  });

  describe('loadMoreItems', function() {
    beforeEach(function() {
      this.collection = new Backbone.Collection();
      this.collection.config = new Backbone.Model({
        status: 'backlog',
        limit: 25
      });
    });

    it('dispatches an event', function(done) {
      this.spy = this.sinon.spy(AppDispatcher, 'dispatch');

      this.collection.fetch = function() {
        return new Promise(function(resolve) {
          resolve({ length: 16 });
        });
      };

      ProductActions.loadMoreItems(this.collection);
      setTimeout(()=> {
        sinon.assert.calledOnce(this.spy);
        done();
      }, 0)
    });
  });

  describe('updateItemPriority', function() {
    beforeEach(function() {
      this.products = ProductActions.__get__('products');
      this.product = this.products.add({ id: 1 });
      this.backlog = this.product.getItemsByStatus('backlog');
      this.resortStub = this.sinon.stub(this.product.ItemModel.prototype, 'resort')
        .returns(Promise.resolve());

      this.backlog.reset([
        { number: 1, status: 'backlog', product: { id: 1 }, sort: 1 },
        { number: 2, status: 'backlog', product: { id: 1 }, sort: 2 },
        { number: 3, status: 'backlog', product: { id: 1 }, sort: 3 }
      ]);
    });

    after(function() {
      this.backlog.reset();
    });

    it('throws when unexpected sort argument encountered', function() {
      assert.throws(() => ProductActions.updateItemPriority(1,1,'sideways'), /Invalid priority direction/);
    });

    context('up', function() {
      it('calls resort with the expected before and after values when both exist', function() {
        ProductActions.updateItemPriority(1, 3, 'up');
        sinon.assert.calledWith(this.resortStub, { before: 2, after: 1 });
      })

      it('call resort with the expected arguments when no "after" item is found', function() {
        ProductActions.updateItemPriority(1, 2, 'up');
        sinon.assert.calledWith(this.resortStub, { after: 1 });
      })
    });

    context('down', function() {
      it('calls resort with the expected before and after values when both "before" and "after" items exist', function() {
        ProductActions.updateItemPriority(1, 1, 'down');
        sinon.assert.calledWith(this.resortStub, { before: 3, after: 2 });
      })

      it('call resort with the expected arguments when no "before" item is found', function() {
        ProductActions.updateItemPriority(1, 2, 'down');
        sinon.assert.calledWith(this.resortStub, { before: 3 });
      })
    });

    context('top', function() {
      it('calls resort with the correct values', function() {
        ProductActions.updateItemPriority(1, 3, 'top');
        sinon.assert.calledWith(this.resortStub, { after: 1 });
      });
    });

    context('bottom', function() {
      it('calls resort with the correct values', function() {
        ProductActions.updateItemPriority(1, 1, 'bottom');
        sinon.assert.calledWith(this.resortStub, { before: 3 });
      });
    });
  });


  describe('updateItem', function() {
    beforeEach(function() {
      this.user = ProductActions.__get__('user');
      this.products = ProductActions.__get__('products');
      this.products.reset([{ id: 1 }]);
      this.product = this.products.get(1);
      this.item = this.product.createItem(
        { number: 1, status: 'in-progress', type: 'task', title: 'foo' }
      );
      this.sinon.spy(this.item, 'save');
      this.sinon.stub(this.product.ItemModel.prototype, 'sync').returns(Promise.resolve());
    });

    afterEach(function() {
      this.products.reset();
    });

    it('unsets the close reason if status is changing', function() {
      this.item.set({ close_reason: 'fixed' });
      ProductActions.updateItem(1, 1, { status: 'in-progress' });
      assert.isUndefined(this.item.get('close_reason'));
    });

    it('updates any instances in attached parent items', function() {
      this.parent = this.product.createItem({
        number: 2,
        status: 'in-progress',
        sub_items: [
          { number: 3, status: 'backlog', type: 'defect', title: 'a bug' }
        ]
      })
      let payload = { number: 3, parent: 2, status: 'accepted', type: 'defect', title: 'a bug' };
      ProductActions.updateItem(1, 3, payload);

      assert.equal(payload.status, this.parent.sub_items().first().get('status'));
    });

    it('calls item.save', function() {
      ProductActions.updateItem(1, 1, { status: 'completed' });
      sinon.assert.calledWith(this.item.save, { status: 'completed' });
    });

    it('dispatches an action', function(done) {
      let stub = this.sinon.stub(AppDispatcher, 'dispatch');
      ProductActions.updateItem(1, 1, { status: 'completed' });
      sinon.assert.notCalled(stub)
      setTimeout(function() {
        sinon.assert.called(stub)
        done();
      }, 0);
    });

    it('creates an item if it needs to', function(done) {
      let stub = this.sinon.stub(AppDispatcher, 'dispatch');
      ProductActions.updateItem(1, 999, { status: 'backlog', title: 'foo', type: 'task' });
      setTimeout(function() {
        sinon.assert.called(stub);
        done();
      }, 0);
    });

    describe('assigns the issue to the user when upgrading backlog or someday items to in-progress or completed', function() {
      beforeEach(function() {
        this.user.set({ id: 2 });
      })

      _.each(['backlog', 'someday'], (status) => {
        _.each(['in-progress', 'completed'], (newStatus) => {
          it(`Moving item from ${status} to ${newStatus}`, function() {
            this.item.set({ status: status, assigned_to: 1 });
            ProductActions.updateItem(1, 1, { status: newStatus });
            sinon.assert.calledWith(this.item.save, { assigned_to: 2, status: newStatus });
          });
        });
      });
    });

    describe('options.wait', function() {
      it('dispatches the event immediately, without waiting on the promise', function() {
        let stub = this.sinon.stub(AppDispatcher, 'dispatch');
        ProductActions.updateItem(1, 1, { status: 'completed' }, { wait: false });
        sinon.assert.called(stub)
      });
    });
  });
});
