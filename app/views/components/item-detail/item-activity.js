import React from 'react/addons'
import ItemDetailMixin from './detail-mixin'
import ActivityItem from './activity-item'
import Markdown from 'react-markdown'
import {State} from 'react-router'
import _ from 'lodash'
import helpers from '../../components/helpers'

const SCORE_TO_SHIRT_SIZES = {
  0: '~',
  1: 'S',
  3: 'M',
  5: 'L',
  8: 'XL'
}

const STATUS_MAP = {
  5: 'someday',
  10: 'backlog',
  20: 'current',
  30: 'complete',
  40: 'accepted'
}

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

  abbreviatedName(model) {
    if (!model) {
      return ''
    } else {
      return `${model.first_name} ${model.last_name.charAt(0)}.`
    }
  },

  activityTypeMap(action) {
    const ACTIVITY_TYPES = {
      'item created': 'created this',
      'item changed': 'updated',
      'attachment': 'attached',
      'assigned': 'reassigned',
      '': 'commented'
    }

    return ACTIVITY_TYPES[action] || `WARN: ${action} ACTIVITY`
  },

  itemChanged(meta) {
    let field = helpers.toTitleCase(meta.field)

    /*
      TODO: include this in a 'read more' sub-section
      from ${valueMap.oldVal} to ${valueMap.newVal}`;
    */
    return `the ${field}`
  },

  fieldToValueMap(meta) {
    let oldVal
    let newVal

    switch (meta.field) {
      case 'score':
        oldVal = SCORE_TO_SHIRT_SIZES[meta.old]
        newVal = SCORE_TO_SHIRT_SIZES[meta.new]

        break
      case 'status':
        oldVal = STATUS_MAP[meta.old]
        newVal = STATUS_MAP[meta.new]

        break
      default:
        oldVal = meta.old
        newVal = meta.new
        break
    }

    return {
      oldVal,
      newVal
    }
  },

  attachmentDescription(meta) {
    var pre = helpers.vowelSound(meta.type) ? 'An ' : 'A '
    let type = helpers.toTitleCase(meta.type)

    return `${pre} ${type}: ${meta.title}`
  },

  itemReassigned(meta) {
    let from
    let to = `to ${this.abbreviatedName(meta.new)}`

    if (meta.old) {
      from = `from ${this.abbreviatedName(meta.old)}`
    }

    return [from, to].join(' ')
  },

  activityDescription(model) {
    let meta = model.meta
    let description

    switch (model.action) {
      case 'item created':
        description = ''
        break
      case 'item changed':
        let changed = this.itemChanged(meta)
        let formatted = helpers.formatTextForMarkdown(changed)

        description = <Markdown source={formatted} />
        break
      case 'attachment':
        description = this.attachmentDescription(meta)
        break
      case 'assigned':
        description = this.itemReassigned(meta)
        break
      default:
        // This is a hack based on the api not returning an action for a comment
        if (model.cls === 'Comment') {
          let formatted = helpers.formatTextForMarkdown(model.meta.body)

          description = <Markdown source={formatted} />
        } else {
          description = `DESCRIPTION CASE NOT HANDLED: cls:${model.cls}, label:${model.label}`
        }
    }

    return description
  },

  showAllToggle() {
    this.setState({showAll: !this.state.showAll})
  },

  showAllActivityButton() {
    if (this.props.activity.activities.length > MIN_ACTIVITY_NUMBER) {
      let toggleActivityCopy = this.state.showAll ? 'Show Less Activity' : 'Show More Activity'

      return (
        <button ref='show-all' className="load-more" onClick={this.showAllToggle}>
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
      activityItems = _.map(this.itemsToShow(), _.bind(function(model , i) {
        let creator = _.findWhere(this.props.members, {id: model.user})
        let creatorEmail = creator.email
        let creatorName = this.abbreviatedName(creator)
        let activityType = this.activityTypeMap(model.action)
        let description = this.activityDescription(model)
        let timestamp = this.timeSinceNow(model.created)

        return (
          <ActivityItem key={i}
                        creatorEmail={creatorEmail}
                         creatorName={creatorName}
                        activityType={activityType}
                         description={description}
                           timestamp={timestamp} />
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
    let totalActivityCount = this.props.activity.total_count[0] || 0;
    let activityItems = this.activityItems(totalActivityCount);
    let activityCount = `${totalActivityCount} items`;

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
