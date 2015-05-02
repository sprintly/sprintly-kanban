var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var sinon = require('sinon');
var Header = require('./header');
var stubRouterContext = require('../../lib/stub-router-context');

describe('Header', function() {
  beforeEach(function() {
    var HeaderStub = stubRouterContext(Header);

    let props = {
      members: [],
      tags: [],
      user: {
        get: function() {}
      }
    }
    this.component = TestUtils.renderIntoDocument(<Header {...props} />);
  });

  context('componentDidMount', function() {
    it('renders the header component', function () {
      assert.isTrue(TestUtils.isCompositeComponentWithType(this.component, Header));
    });
  });

  describe('click on \'Add Item\'', function () {
    it('reveals an add item modal', function () {
      let addItemButton = TestUtils.findRenderedDOMComponentWithClass(this.component, 'add-item');
      TestUtils.Simulate.click(addItemButton);

      assert.isTrue(document.body.classList.contains('modal-open'));
    });
  });
});