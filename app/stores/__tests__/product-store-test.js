jest.dontMock('../product-store');

describe('ProductStore', function() {


  describe('internals.initProducts', function() {
    it('should return a promise', function() {
      var internals = require('../product-store').internals;
      console.log(internals)
    });
  });


});
