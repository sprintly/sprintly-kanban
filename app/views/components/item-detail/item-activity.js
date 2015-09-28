import React from 'react/addons'
import ItemDetailMixin from './detail-mixin'
import ActivityItem from './activity-item'
import {State} from 'react-router'
import _ from 'lodash'
import helpers from '../../components/helpers'

const MIN_ACTIVITY_NUMBER = 15

var ItemActivity = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    members: React.PropTypes.array,
    activity: React.PropTypes.shape({
      total_count: React.PropTypes.array,
      activities: React.PropTypes.array
    }),
    updateStripeHeight: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      activity: {
        total_count: [],
        activities: []
      },
      members: []
    }
  },

  getInitialState() {
    return {
      showAll: false
    }
  },

  showAllToggle() {
    this.setState({showAll: !this.state.showAll})
  },

  showAllActivityButton() {
    if (this.props.activity.activities.length > MIN_ACTIVITY_NUMBER) {
      let toggleActivityCopy = this.state.showAll ? 'Show Less Activity' : 'Show More Activity'

      return (
        <button ref="show-all" className="load-more" onClick={this.showAllToggle}>
          {toggleActivityCopy}
        </button>
      )
    }
  },

  itemsToShow() {
    /*
      Default to show 20 activity objects to prevent slow rendering
    */
    let itemsToShow = this.props.activity.activities
    if (!this.state.showAll) {
      itemsToShow = itemsToShow.slice(0, MIN_ACTIVITY_NUMBER)
    }

    return itemsToShow
  },

  activityItems(activityCount) {
    let activityItems
    if (this.props.activity.activities && this.props.members.length) {
      activityItems = _.map(this.itemsToShow(), _.bind(function(activity , i) {
        let author = _.findWhere(this.props.members, {id: activity.user})

        return (
          <ActivityItem key={i}
                        author={author}
                        activity={activity} />
        )
      },this))
    } else {
      let activityCopy = activityCount > 0 ? `Loading ${activityCount} Items` : 'No Activity To Display'

      activityItems = <li className="activity__item_loading">{activityCopy}</li>
    }

    return (
      <ul>
        {activityItems}
      </ul>
    )
  },

  componentDidUpdate() {
    this.props.updateStripeHeight()
  },

  render: function() {
    let totalActivityCount = this.props.activity.total_count[0] || 0
    let activityItems = this.activityItems(totalActivityCount)
    let activityCount = `${totalActivityCount} items`

    return (
      <div className="col-xs-12 section activity">
        <div className="col-xs-12">
          <div className="header">
            <div className="title">{helpers.toTitleCase('activity')}</div>
            <div className="activity__counter">{activityCount}</div>
            <div className="sep"></div>
          </div>
          {activityItems}
          {this.showAllActivityButton()}
        </div>
      </div>
    )
  }
})

export default ItemActivity
