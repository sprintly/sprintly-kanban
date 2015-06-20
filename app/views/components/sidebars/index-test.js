var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var stubRouterContext = require('../../../lib/stub-router-context');
var sinon = require('sinon')
var SidebarIndex = require('./index');
var MenuSidebar = require('./menu');
var FiltersSidebar = require('./filters');
var SearchSidebar = require('./search');
var user = {
  user: { get: function() {} }
}

describe.only('Sidebars/Index', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.VelocityActions = SidebarIndex.__get__('VelocityActions');
    this.stubs = {
      velocityGet: this.sinon.stub(this.VelocityActions, 'getVelocity')
    }
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('SidebarRendering', function() {
    describe('default', function() {
      beforeEach(function() {
        var Component = stubRouterContext(SidebarIndex, user, {
          getCurrentParams: () => {
            return { id: 0 }
          }
        })
        this.component = TestUtils.renderIntoDocument(<Component />);
      })

      describe('componentDidMount', function() {
        it('velocity is retrieved', function() {
          assert.isTrue(this.stubs.velocityGet.called)
        })
      })

      it('renders the MenuSidebar', function() {
        var menuSidebarEl = TestUtils.findRenderedComponentWithType(this.component, MenuSidebar).getDOMNode();

        assert.isDefined(menuSidebarEl);
      })

      it('renders the Filters sidebar', function() {
        var filtersSidebarEl = TestUtils.findRenderedComponentWithType(this.component, FiltersSidebar).getDOMNode();

        assert.isDefined(filtersSidebarEl);
      })
    })

    describe('Search Menu ', function() {
      beforeEach(function() {
        var currentParamsStub = { getCurrentParams: () => { return { id: 0 } } };
        var currentPathStub = { getCurrentPath: () => { return 'serach' } };

        var Component = stubRouterContext(SidebarIndex, user,
          currentParamsStub,
          currentPathStub
        )
        this.component = TestUtils.renderIntoDocument(<Component />);
      })

      it.only('renders the search menu when search is in the \'path\'', function() {
        var searchSidebarEl = TestUtils.findRenderedComponentWithType(this.component, SearchSidebar).getDOMNode();

        assert.isDefined(searchSidebarEl);
      })
    })
  })
})
