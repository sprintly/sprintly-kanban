var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var stubRouterContext = require('../../../lib/stub-router-context');
var sinon = require('sinon')
var SidebarIndex = require('./index');
var MenuSidebar = require('./menu');
var FiltersSidebar = require('./filters');
var user = {
  user: { get: function() {} }
}

describe('Sidebars/Index', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.VelocityActions = SidebarIndex.__get__('VelocityActions');
    this.stubs = {
      velocityGet: this.sinon.stub(this.VelocityActions, 'getVelocity')
    }

    var Component = stubRouterContext(SidebarIndex, user, {
      getCurrentParams: () => {
        return { id: 0 }
      },
      getCurrentQuery: () => { return { q: 'foo' } }
    })
    this.component = TestUtils.renderIntoDocument(<Component />);
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('componentDidMount', function() {
    it('velocity is retrieved', function() {
      assert.isTrue(this.stubs.velocityGet.called)
    })
  })

  describe('SidebarRendering', function() {
    describe('default', function() {
      it('renders the MenuSidebar', function() {
        var menuSidebarEl = TestUtils.findRenderedComponentWithType(this.component, MenuSidebar).getDOMNode();

        assert.isDefined(menuSidebarEl);
      })
      it('renders the Filters sidebar', function() {
        var filtersSidebarEl = TestUtils.findRenderedComponentWithType(this.component, FiltersSidebar).getDOMNode();

        assert.isDefined(filtersSidebarEl);
      })
    })
  })
})
