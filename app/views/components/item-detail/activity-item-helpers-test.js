import _ from 'lodash';
import {assert} from 'chai';
import React from 'react/addons';
let TestUtils = React.addons.TestUtils;
import ActivityFixtures from './item-activity-fixtures';
import ActivityItemHelpers from './activity-item-helpers';

describe('ActivityItemHelpers', function() {
  describe('#fieldChanged', function() {
    it('renders an ActivityItem component', function() {
      let activityItemComponent = TestUtils.findRenderedComponentWithType(this.component, ActivityItem);
      assert.isDefined(activityItemComponent)
    })
  })
})
