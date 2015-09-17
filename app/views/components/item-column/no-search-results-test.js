/* eslint-env mocha, node */
import sinon from 'sinon'
import {assert} from 'chai'
import React from 'react/addons'
import NoSearchResults from './no-search-results'
import FiltersActions from '../../../actions/filter-actions'
let TestUtils = React.addons.TestUtils

describe('NoSearchResults', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
    NoSearchResults.__set__('ProductStore', {
      getProduct: function() {
        return {
          members: ['sarah'],
          tags: ['mvp']
        }
      }
    })
    this.stubs = {
      clearFilters: this.sinon.stub(FiltersActions, 'clear')
    }
    let props = {
      product: {
        id: 0
      }
    }

    this.component = TestUtils.renderIntoDocument(<NoSearchResults {...props} />)
    this.clearButton = TestUtils.findRenderedDOMComponentWithClass(this.component, 'clear-filters')
  })

  afterEach(function() {
    this.sinon.restore()
  })

  it('renders a clear filter button', function() {
    assert.isDefined(this.clearButton)
  })

  it('clear filters is called when clear fitlers button clicked', function() {
    TestUtils.Simulate.click(this.clearButton)

    assert.isTrue(this.stubs.clearFilters.calledWith(['sarah'],['mvp']))
  })
})
