/* eslint-env mocha, node */
import _ from 'lodash'
import {assert} from 'chai'
import React from 'react/addons'
import sinon from 'sinon'
import stubRouterContext from '../../../lib/stub-router-context'
import ItemColumn from './index'

let TestUtils = React.addons.TestUtils

import { DragDropContext } from 'react-dnd'
import TestBackend from 'react-dnd/modules/backends/Test'

function renderComponent(props, ctx) {
  let Component = DragDropContext(TestBackend)(stubRouterContext(ItemColumn, props))
  return TestUtils.renderIntoDocument(<Component {...props} />)
}

describe('Item Column', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
    this.ProductStore = ItemColumn.__get__('ProductStore')
    this.getItemsStub = this.sinon.stub(this.ProductStore, 'getItems')
    this.ProductActions = ItemColumn.__get__('ProductActions')
    this.getItemsForStatusStub = this.sinon.stub(this.ProductActions, 'getItemsForStatus')
    this.props = {
      filters: {},
      product: {},
      items: [],
      status: 'backlog',
      velocity: {
        average: 10
      }
    }
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('renderSprints', function() {
    beforeEach(function() {
      this.hasItems = this.sinon.stub(this.ProductStore, 'hasItems')
    })

    context('not in-progress', function() {
      beforeEach(function() {
        this.props.status = 'backlog'
        this.component = renderComponent(this.props, this)
        this.column = this.component.refs.child.refs.stub
      })

      it('does not show the item summary', function() {
        this.column.setState({
          sortField: 'priority',
          isLoading: false
        })

        let itemSummary = TestUtils.scryRenderedDOMComponentsWithClass(
          this.component,
          'item__summary'
        )
        assert.lengthOf(itemSummary, 0)
      })
    })

    context('not sorted by priority', function() {
      beforeEach(function() {
        this.props.status = 'in-progress'
        this.component = renderComponent(this.props, this)
        this.column = this.component.refs.child.refs.stub
      })

      it('shows the item summary', function() {
        this.column.setState({
          sortField: 'last_updated',
          isLoading: false
        })

        let itemSummary = TestUtils.scryRenderedDOMComponentsWithClass(
          this.column,
          'item__summary'
        )
        assert.lengthOf(itemSummary, 0)
      })
    })
  })

  describe('#renderItemCards', function() {
    beforeEach(function() {
      this.props.status = 'backlog'
      this.component = renderComponent(this.props, this)
      this.column = this.component.refs.child.refs.stub
    })

    it('renders item cards', function() {
      this.sinon.stub(this.ProductStore, 'hasItems').returns(true)
      this.sinon.stub(this.ProductStore, 'hasItemsToRender').returns(true)

      this.component = renderComponent(_.assign({}, this.props, {
        items: [{ number:1, product: { id: 1 } }]
      }), this)

      let itemCards = TestUtils.scryRenderedDOMComponentsWithClass(
        this.component,
        'item-card'
      )

      assert.lengthOf(itemCards, 1)
    })

    describe('NoSearchResults', function() {
      beforeEach(function() {
        this.sinon.stub(this.ProductStore, 'hasItems').returns(true)
        this.sinon.stub(this.ProductStore, 'hasItemsToRender').returns(false)
      })

      it('renders NoSearchResults for \'in-progress\' status', function() {
        let props = { status: 'in-progress', product: { id: 0 } }
        let component = renderComponent(props, this)
        let column = component.refs.child.refs.stub

        column.setState({
          items: [],
          isLoading: false
        })

        let noSearchResults = TestUtils.scryRenderedDOMComponentsWithClass(
          component,
          'no-search-results'
        )

        assert.lengthOf(noSearchResults, 1)
      })

      it('renders nothing for non \'in-progress\'', function() {
        this.column.setState({
          status: 'backlog',
          items: [{}],
          isLoading: false
        })

        let noSearchResults = TestUtils.scryRenderedDOMComponentsWithClass(
          this.column,
          'no-search-results'
        )

        assert.lengthOf(noSearchResults, 0)
      })
    })

    it('renders PlaceholderCards', function() {
      this.sinon.stub(this.ProductStore, 'hasItems').returns(false)
      this.sinon.stub(this.ProductStore, 'hasItemsToRender').returns(false)

      let props = { status: 'in-progress', product: { id: 0 } }
      let component = renderComponent(props, this)
      let column = component.refs.child.refs.stub

      column.setState({
        status: 'backlog',
        items: [{}],
        isLoading: false
      })

      let placeholderCards = TestUtils.scryRenderedDOMComponentsWithClass(
        column,
        'placeholder-cards'
      )

      assert.lengthOf(placeholderCards, 1)
    })
  })
})
