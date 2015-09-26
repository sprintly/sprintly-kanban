import _ from 'lodash';
import sinon from 'sinon';
import {assert} from 'chai';
import React from 'react/addons';
let TestUtils = React.addons.TestUtils;
import ActivityFixtures from './item-activity-fixtures';
import ActivityItem from './activity-item';

const stubMember = {
  "first_name": "Chris",
  "last_name": "McAvoy",
  "revoked": false,
  "admin": true,
  "email": "cmcavoy@quickleft.com",
  "id": 35507
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

  afterEach(function() {
  })

  describe('#componentDidMount', function() {
    beforeEach(function() {
      this.component = TestUtils.renderIntoDocument(<ActivityItem />)
    })

    it('renders an ActivityItem component', function() {
      let activityItemComponent = TestUtils.findRenderedComponentWithType(this.component, ActivityItem);
      assert.isDefined(activityItemComponent)
    })
  })
})
