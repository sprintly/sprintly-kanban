/* eslint-env mocha, node */
import _ from 'lodash'
import {assert} from 'chai'
import React from 'react/addons'
import sinon from 'sinon'
import stubRouterContext from '../../../lib/stub-router-context'

import SprintGroup from './sprint-group'

let TestUtils = React.addons.TestUtils

import { DragDropContext } from 'react-dnd'
import TestBackend from 'react-dnd/modules/backends/Test'

function renderComponent(props) {
  let Component = DragDropContext(TestBackend)(stubRouterContext(SprintGroup, props))
  return TestUtils.renderIntoDocument(<Component {...props} />)
}

describe('SprintGroup', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
    this.props = {
      filters: {},
      product: {},
      status: 'backlog',
      items: [],
      velocity: {
        average: 10
      }
    }
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('chunkItems', function() {
    context('no items', function() {
      beforeEach(function() {
        this.component = renderComponent(this.props)
        this.group = this.component.refs.child.refs.stub
      })

      it('returns an empty array', function() {
        let chunks = this.group.chunkItems()
        assert.isTrue(Array.isArray(chunks))
        assert.lengthOf(chunks, 0)
      })
    })

    context('items without a score', function() {
      beforeEach(function() {
        this.unscoredItem = { score: '~' }

        _.times(5, (i) => {
          this.props.items.push({ score: 'S' })
        })
        this.props.items.push(this.unscoredItem)
        _.times(5, (i) => {
          this.props.items.push({ score: 'S' })
        })
        this.component = renderComponent(this.props)
        this.group = this.component.refs.child.refs.stub
      })

      it('are not counted toward the total', function() {
        let chunks = this.group.chunkItems()
        assert.lengthOf(chunks, 1)
        assert.equal(chunks[0].points, 10)
        assert.include(chunks[0].items, this.unscoredItem)
      })
    })

    context('with single point items', function() {
      beforeEach(function() {
        _.times(22, (i) => {
          this.props.items.push({ score: 'S' })
        })
        this.component = renderComponent(this.props)
        this.group = this.component.refs.child.refs.stub
      })

      it('chunks the items by 10', function() {
        let chunks = this.group.chunkItems()
        assert.lengthOf(chunks, 3)
        assert.equal(chunks[0].points, 10)
        assert.equal(chunks[1].points, 10)
        assert.equal(chunks[2].points, 2)
      })
    })

    context('with a shorter item followed by a longer item', function() {
      beforeEach(function() {
        this.props.items.push({ score: 'L' })
        // velocity - total underage (10 - 5 = 5) would be more than the overage
        // caused by adding the next item (13 - 10 = 3)
        this.props.items.push({ score: 'XL' })
        this.component = renderComponent(this.props)
      })

      it('allows the chunk to go over the velocity', function() {
        let group = this.component.refs.child.refs.stub
        let chunks = group.chunkItems()
        assert.lengthOf(chunks, 1)
        assert.equal(chunks[0].points, 13)
      })
    })

    context('with a longer item followed by a shorter item', function() {
      beforeEach(function() {
        this.props.items.push({ score: 'XL' })
        // velocity - total underage (10 - 8 = 2) would less than the overage
        // caused by adding the next item (13 - 10 = 3)
        this.props.items.push({ score: 'L' })
        this.component = renderComponent(this.props)
      })

      it('does not allow the chunk to go over the velocity', function() {
        let group = this.component.refs.child.refs.stub
        let chunks = group.chunkItems()
        assert.lengthOf(chunks, 2)
        assert.equal(chunks[0].points, 8)
        assert.equal(chunks[1].points, 5)
      })
    })
  })
})

