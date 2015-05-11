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

  describe('loadMoreItems', function() {
    beforeEach(function() {
      this.collection = new Backbone.Collection();
      this.collection.config = new Backbone.Model({
        status: 'backlog',
        limit: 25
      });
    });

    it('dispatches an event', function(done) {
      var spy = sinon.spy(AppDispatcher, 'dispatch');

      this.collection.fetch = function() {
        return new Promise(function(resolve) {
          resolve({ length: 16 });
        });
      };

      ProductActions.loadMoreItems(this.collection);
      setTimeout(function() {
        sinon.assert.calledOnce(spy);
        spy.restore();
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
      this.product = this.products.add({ id: 1 });
      this.item = this.product.items.add(
        { id: 1, status: 'in-progress' }
      );
      this.item.save = sinon.stub().returns(Promise.resolve());
    });

    afterEach(function() {
      this.product.items.reset();
    });

    it('unsets the close reason if status is changing', function() {
      this.item.set({ close_reason: 'fixed' });
      ProductActions.updateItem(1, 1, { status: 'in-progress' });
      assert.isUndefined(this.item.get('close_reason'));
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

    it('calls item.save', function() {
      ProductActions.updateItem(1, 1, { status: 'completed' });
      sinon.assert.calledWith(this.item.save, { status: 'completed' });
    });
  });

});
