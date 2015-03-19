var ProductStore = require('../product-store');
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


  describe('getItemsForProduct', function() {
    it('returns an items collection', function() {

    });

    it('updates the items collection filter config', function() {
    
    });
  });
});
