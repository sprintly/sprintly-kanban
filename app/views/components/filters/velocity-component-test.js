/* eslint-env mocha */
import React from 'react/addons'
import sinon from 'sinon'
import stubRouterContext from '../../../lib/stub-router-context'

import VelocityComponent from './velocity-component'

let TestUtils = React.addons.TestUtils

describe('VelocityComponent', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
    let props = {
      productId: 1,
      velocity: 10
    }
    let Component = stubRouterContext(VelocityComponent, props)
    this.component = TestUtils.renderIntoDocument(<Component {...props}/>)
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('setVelocity', function() {
    beforeEach(function() {
      this.VelocityActions = VelocityComponent.__get__('VelocityActions')
      this.setVelocityStub = this.sinon.stub(this.VelocityActions, 'setVelocity')
    })

    it('triggers the setVelocity action', function() {
      this.component.refs.stub.setState({ showVelocityPopover: true })
      let form = TestUtils.findRenderedDOMComponentWithTag(this.component.refs.stub, 'form')
      let input = TestUtils.findRenderedDOMComponentWithTag(this.component.refs.stub, 'input')
      let node = input.getDOMNode()
      node.value = '12'
      TestUtils.Simulate.change(node)
      TestUtils.Simulate.submit(form)
      sinon.assert.calledWith(this.setVelocityStub, 1, '12')
    })
  })
})

