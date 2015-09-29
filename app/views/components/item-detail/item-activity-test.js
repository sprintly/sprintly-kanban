 /*eslint-env node, mocha */
import _ from 'lodash'
import {assert} from 'chai'
import React from 'react/addons'
let TestUtils = React.addons.TestUtils
import ActivityFixtures from './item-activity-fixtures'
import ItemActivity from './item-activity'
import ActivityItem from './activity-item'

const stubMember = {
  'first_name': 'Chris',
  'last_name': 'McAvoy',
  'revoked': false,
  'admin': true,
  'email': 'cmcavoy@quickleft.com',
  'id': 35507
}

describe('ItemActivityTest', function() {
  beforeEach(function() {
    this.componentProps = function(itemCount, activities, members) {
      return {
        members: members,
        activity: {
          total_count: [itemCount],
          activities: activities
        }
      }
    }
  })

  describe('#componentDidMount', function() {
    beforeEach(function() {
      this.component = TestUtils.renderIntoDocument(<ItemActivity />)
    })

    it('renders the a ItemActivity component', function() {
      let itemActivityComponent = TestUtils.findRenderedComponentWithType(this.component, ItemActivity)
      assert.isDefined(itemActivityComponent)
    })
  })

  describe('#activityCounter', function() {
    it('renders the number of activities in the header', function() {
      let componentProps = this.componentProps(6,[],[stubMember])
      let component = TestUtils.renderIntoDocument(<ItemActivity {...componentProps} />)
      let result = TestUtils.findRenderedDOMComponentWithClass(component, 'activity__counter').getDOMNode()
      let target = '6 items'
      assert.equal(result.textContent, target)
    })
  })

  describe('ActivityItems', function() {
    it('renders member activity item nodes for every activity', function() {
      let numberOfItems = 3
      let activities = _.map(_.times(numberOfItems), (i) => {return ActivityFixtures.actionType.updated })
      let componentProps = this.componentProps(numberOfItems, activities, [stubMember])

      let component = TestUtils.renderIntoDocument(<ItemActivity {...componentProps} />)
      let result = TestUtils.scryRenderedComponentsWithType(component, ActivityItem)

      assert.lengthOf(result, numberOfItems)
    })
    describe('loading', function() {
      it('has items to load but no activities yet', function() {
        let componentProps = this.componentProps(1, false, [stubMember])

        let component = TestUtils.renderIntoDocument(<ItemActivity {...componentProps} />)

        let result = TestUtils.findRenderedDOMComponentWithClass(component, 'activity__item_loading').getDOMNode()
        let target = 'Loading 1 Items'
        assert.equal(result.textContent, target)
      })
      it('has no items to load', function() {
        let componentProps = this.componentProps(0, false, [stubMember])

        let component = TestUtils.renderIntoDocument(<ItemActivity {...componentProps} />)

        let result = TestUtils.findRenderedDOMComponentWithClass(component, 'activity__item_loading').getDOMNode()
        let target = 'No Activity To Display'
        assert.equal(result.textContent, target)
      })
    })
    describe('#showAllActivityButton', function () {
      it('renders when there are more than the min number of items', function() {
        let numberOfItems = 16
        let activities = _.map(_.times(numberOfItems), (i) => {return ActivityFixtures.actionType.updated })
        let componentProps = this.componentProps(16, activities, [stubMember])

        let component = TestUtils.renderIntoDocument(<ItemActivity {...componentProps} />)
        let showAllButton = React.findDOMNode(component.refs['show-all'])
        assert.isNotNull(showAllButton)
      })

      it('is hidden when there are less than 15 to show', function() {
        let numberOfItems = 14
        let activities = _.map(_.times(numberOfItems), (i) => {return ActivityFixtures.actionType.updated })
        let componentProps = this.componentProps(numberOfItems, activities, [stubMember])

        let component = TestUtils.renderIntoDocument(<ItemActivity {...componentProps} />)
        let showAllButton = React.findDOMNode(component.refs['show-all'])
        assert.isNull(showAllButton)
      })
    })
  })
})
