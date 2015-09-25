/* eslint-env mocha, node */
var assert = require('chai').assert
var React = require('react/addons')
var TestUtils = React.addons.TestUtils
var stubRouterContext = require('../../../lib/stub-router-context')
var sinon = require('sinon')
var SidebarIndex = require('./index')
var MenuSidebar = require('./menu')
var FiltersSidebar = require('./filters')
var SearchSidebar = require('./search')
var user = {
  user: { get: function() {} }
}

describe('Sidebars/Index', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
    this.ProductStore = SidebarIndex.__get__('ProductStore')

    this.stubs = {
      productGet: this.sinon.stub(this.ProductStore, 'getProduct'),
      getAll: this.sinon.stub(this.ProductStore, 'getAll')
    }
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('SidebarRendering', function() {
    describe('default configuration', function() {
      beforeEach(function() {
        var Component = stubRouterContext(SidebarIndex, user, {
          getCurrentParams: () => {
            return { id: 0 }
          },
          getCurrentPathname: () => {
            return '/'
          }
        })
        this.component = TestUtils.renderIntoDocument(<Component />)
      })

      it('renders the MenuSidebar', function() {
        var menuSidebarEl = TestUtils.findRenderedComponentWithType(this.component, MenuSidebar).getDOMNode()

        assert.isDefined(menuSidebarEl)
      })

      it('renders the Filters sidebar', function() {
        var filtersSidebarEl = TestUtils.findRenderedComponentWithType(this.component, FiltersSidebar).getDOMNode()

        assert.isDefined(filtersSidebarEl)
      })
    })

    describe('Search Menu ', function() {
      it('renders the search menu when search is in the \'path\'', function() {
        var Component = stubRouterContext(SidebarIndex, user, {
          getCurrentParams: () => {
            return { id: 0 }
          },
          getCurrentPathname: () => {
            return '/search'
          }
        })

        var component = TestUtils.renderIntoDocument(<Component />)

        var searchSidebarEl = TestUtils.findRenderedComponentWithType(component, SearchSidebar).getDOMNode()

        assert.isDefined(searchSidebarEl)
      })
    })
  })
})
