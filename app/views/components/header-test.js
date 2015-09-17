/* eslint-env mocha, node */
var _ = require('lodash')
var assert = require('chai').assert
var React = require('react/addons')
var TestUtils = React.addons.TestUtils
var Header = require('./header')
var stubRouterContext = require('../../lib/stub-router-context')
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
    })

    this.component = TestUtils.renderIntoDocument(<HeaderStub />)
  })

  context('componentDidMount', function() {
    it('renders the header component', function () {
      assert.isTrue(TestUtils.isCompositeComponentWithType(this.component.refs.stub, Header))
    })

    describe('header bar components', function() {
      beforeEach(function() {
        this.headers = TestUtils.scryRenderedDOMComponentsWithTag(this.component.refs.stub, 'header')
      })

      it('renders two', function() {
        assert.lengthOf(this.headers, 2)
      })

      it('one header is visible for small screens', function() {
        let mobileHeader = this.headers[0].getDOMNode()
        assert.isTrue(mobileHeader.classList.contains('visible-xs'))
      })

      it('one header is visible for larger screens', function() {
        let mobileHeader = this.headers[1].getDOMNode()
        assert.isTrue(mobileHeader.classList.contains('hidden-xs'))
      })
    })
  })

  describe('\'Add Item\'', function () {
    it('links to the add-item route', function () {
      let addItemButton = TestUtils.findRenderedDOMComponentWithClass(this.component.refs.stub, 'add-item')
      TestUtils.Simulate.click(addItemButton)

      assert.equal(addItemButton.props.to, '/product/1/add-item')
    })
  })
})
