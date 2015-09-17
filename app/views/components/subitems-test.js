/* eslint-env mocha, node */
var _ = require('lodash')
var assert = require('chai').assert
var React = require('react/addons')
var TestUtils = React.addons.TestUtils
var sinon = require('sinon')
var Subitems = require('./subitems')
var Subitem = require('./subitem')

describe('Subitems', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
    this.createSpy = this.sinon.spy()
    this.deleteSpy = this.sinon.spy()
    this.updateSpy = this.sinon.spy()

    this.props = {
      subitems: [],
      createItem: this.createSpy,
      deleteItem: this.deleteSpy,
      updateItem: this.updateSpy
    }

    this.component = TestUtils.renderIntoDocument(<Subitems {...this.props} />)
  })

  afterEach(function() {
    this.sinon.restore()
  })

  it('renders the a subitems component', function(){
    let subitemsComponent = TestUtils.findRenderedComponentWithType(this.component, Subitems)
    assert.isDefined(subitemsComponent)
  })

  describe('adding subitems', function () {
    beforeEach(function() {
      this.subitemTitle = 'first-subitem'
      let subitemInput = React.findDOMNode(this.component.refs['addItemInput'])
      subitemInput.value = this.subitemTitle
      let createSubitemForm = TestUtils.findRenderedDOMComponentWithTag(this.component, 'form').getDOMNode()
      TestUtils.Simulate.submit(createSubitemForm)
    })

    it('calls the create spy with the subitem title', function() {
      assert.isTrue(this.createSpy.calledWith(this.subitemTitle))
    })
  })

  describe('rendering subitems', function() {
    it('renders a subitem for each item passed in props', function() {
      let newPropsWithSubitems = _.assign(this.props, {subitems: ['one', 'two']})
      let Component = TestUtils.renderIntoDocument(<Subitems {...newPropsWithSubitems} />)
      let subitems = TestUtils.scryRenderedComponentsWithType(Component, Subitem)

      assert.lengthOf(subitems, 2)
    })
  })
})
