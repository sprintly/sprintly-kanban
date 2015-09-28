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

describe('ActivityItemTest', function() {
  beforeEach(function() {
    this.componentProps = function(itemCount, activities, members) {
      return {
        author: stubMember,
        members: members,
        activity: {
          action: 'item created',
          total_count: [itemCount],
          activities: activities
        }
      }
    }
  })

  describe('#componentDidMount', function() {
    beforeEach(function() {
      let componentProps = this.componentProps(6,[],[stubMember])
      this.component = TestUtils.renderIntoDocument(<ActivityItem {...componentProps}/>)
    })

    it('renders an ActivityItem component', function() {
      let activityItemComponent = TestUtils.findRenderedComponentWithType(this.component, ActivityItem);
      assert.isDefined(activityItemComponent)
    })
  })
})
