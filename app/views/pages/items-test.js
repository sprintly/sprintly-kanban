var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Items = require('./items');
var sinon = require('sinon')
var _ = require('lodash');

var stubRouterContext = (Component, props, stubs) => {
  return React.createClass({
    childContextTypes: {
      getCurrentPath: React.PropTypes.func,
      getCurrentRoutes: React.PropTypes.func,
      getCurrentPathname: React.PropTypes.func,
      getCurrentParams: React.PropTypes.func,
      getCurrentQuery: React.PropTypes.func
    },

    getChildContext: function() {
      return _.extend({
        getCurrentPath () {},
        getCurrentRoutes () {},
        getCurrentPathname () {},
        getCurrentParams () {},
        getCurrentQuery () {}
      }, stubs);
    },

    render: function() {
      return <Component {...props} />;
    }
  });
};

describe('Items View Controller', function() {

  beforeEach(function() {
    this.ProductActions = Items.__get__('ProductActions');
    this.productInitStub = sinon.stub();
    Items.__set__('ProductActions', {
      init: this.productInitStub
    })
  });

  afterEach(function() {
    Items.__set__('ProductActions', this.ProductActions);
  });

  it('initializes the current product on mount', function() {
    var ItemsStub = stubRouterContext(Items, { user: {} }, {
      getCurrentParams: ()=> {
        return { id: 1 }
      }
    });
    this.items = TestUtils.renderIntoDocument(<ItemsStub/>);
    assert.isTrue(this.productInitStub.called)
  });
});
