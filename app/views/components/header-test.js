var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var sinon = require('sinon');
var Header = require('./header');
var stubRouterContext = require('../../lib/stub-router-context');
var user = {
  user: { get: function() {} }
}

describe('Header', function() {
  beforeEach(function() {
    let props = _.assign(user, {
      members: ['memberA'],
      tags: ['tagA']
    })

    var HeaderStub = stubRouterContext(Header, props, {
      getCurrentParams: () => {
        return { id: 1 }
      },
      getCurrentPathname: () => {
        return '/product'
      }
    });

    this.component = TestUtils.renderIntoDocument(<HeaderStub />);
  });

  context('componentDidMount', function() {
    it('renders the header component', function () {
      assert.isTrue(TestUtils.isCompositeComponentWithType(this.component.refs.stub, Header));
    });
  });

  describe('click on \'Add Item\'', function () {
    it('reveals an add item modal', function () {
      let addItemButton = TestUtils.findRenderedDOMComponentWithClass(this.component.refs.stub, 'add-item');
      TestUtils.Simulate.click(addItemButton);

      assert.isTrue(document.body.classList.contains('modal-open'));
    });
  });
});
