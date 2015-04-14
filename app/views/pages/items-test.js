var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Items = require('./items');
var sinon = require('sinon')
var stubRouterContext = require('../../lib/stub-router-context');

describe('Items ViewController', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.ProductActions = Items.__get__('ProductActions');
    this.productInitStub = this.sinon.stub(this.ProductActions, 'init');
  });

  afterEach(function() {
    this.sinon.restore();
  });

  it('initializes the current product on mount', function() {
    var ItemsStub = stubRouterContext(Items, { user: { get: function() {} } }, {
      getCurrentParams: ()=> {
        return { id: 1 }
      }
    });
    this.items = TestUtils.renderIntoDocument(<ItemsStub/>);
    assert.isTrue(this.productInitStub.called)
  });
});
