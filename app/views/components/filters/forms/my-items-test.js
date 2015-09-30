/* eslint-env mocha, node */
var assert = require('chai').assert
var React = require('react/addons')
var TestUtils = React.addons.TestUtils
var MyItems = require('./my-items')
var sinon = require('sinon')

let FilterActions = MyItems.__get__('FilterActions')

describe('MyItems', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('is Active', function() {
    beforeEach(function() {
      this.clearHandler = this.sinon.stub(FilterActions, 'clear')

      let props = {
        active: true
      }

      let component = TestUtils.renderIntoDocument(<MyItems {...props} />)
      this.mineLink = TestUtils.findRenderedDOMComponentWithClass(component, 'filters-menu__mine').getDOMNode()
    })

    it('is labeled \'Everything\'', function() {
      let target = 'Everything'
      let result = this.mineLink.text

      assert.equal(result, target)
    })

    it('triggers a filter clear', function() {
      TestUtils.Simulate.click(this.mineLink)

      assert.isTrue(this.clearHandler.calledOnce)
    })
  })

  describe('is inactive', function() {
    beforeEach(function() {
      this.clickHandler = this.sinon.stub()

      let props = {
        active: false,
        onClick: this.clickHandler
      }

      let component = TestUtils.renderIntoDocument(<MyItems {...props} />)
      this.mineLink = TestUtils.findRenderedDOMComponentWithClass(component, 'filters-menu__mine').getDOMNode()
    })

    it('is labeled \'My Items\'', function() {
      let target = 'My Items'
      let result = this.mineLink.text

      assert.equal(result, target)
    })

    it('triggers the click handler prop', function() {
      TestUtils.Simulate.click(this.mineLink)

      assert.isTrue(this.clickHandler.calledOnce)
    })
  })
})
