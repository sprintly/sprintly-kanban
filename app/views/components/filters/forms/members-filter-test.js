/* eslint-env mocha, node */
var assert = require('chai').assert
var React = require('react/addons')
var TestUtils = React.addons.TestUtils
var MembersFilter = require('./members-filter')
var Select = require('react-select')

const FILTER = {
  type: 'members',
  label: 'Assigned to',
  active: false,
  alwaysVisible: false,
  defaultCriteriaLabel: 'None',
  field: 'assigned_to',
  criteria: '',
  criteriaOptions: [
    { members: [{ id: 1, first_name: 'Sam', last_name: 'Breed' }] },
    { field: 'unassigned', value: 'unassigned', label: 'Unassigned', default: false }
  ]
}

describe('MembersFilter component', function() {
  it('renders a list of members in a sprintly ui selector menu', function() {
    var filter = TestUtils.renderIntoDocument(<MembersFilter options={FILTER.criteriaOptions} criteria="" />)
    var selector = TestUtils.findRenderedComponentWithType(filter, Select)
    assert.isDefined(selector)
  })

  describe('unassigned', function() {
    it('does not check "unassigned" by default', function() {
      var filter = TestUtils.renderIntoDocument(<MembersFilter options={FILTER.criteriaOptions} criteria="" />)
      var input = filter.refs['filter-checkbox-unassigned']
      var checkbox = TestUtils.findRenderedDOMComponentWithTag(input, 'input')
      assert.isFalse(checkbox.getDOMNode().checked)
    })

    it('is checked when filter is active', function() {
      var filter = TestUtils.renderIntoDocument(<MembersFilter options={FILTER.criteriaOptions} criteria="unassigned" />)
      var input = filter.refs['filter-checkbox-unassigned']
      var checkbox = TestUtils.findRenderedDOMComponentWithTag(input, 'input')
      assert.isTrue(checkbox.getDOMNode().checked)
    })
  })

})
