import React from 'react/addons';
import ItemActions from '../../../actions/item-actions';
import ItemDetailMixin from './detail-mixin';
import Markdown from 'react-markdown';
import {State} from 'react-router';
import _ from 'lodash';
import Gravatar from '../../components/gravatar';
import helpers from '../../components/helpers';
import classNames from "classnames";

// TODO - Extract to some key:val ./app level map
const ITEM_CLOSE_MAP = {
  10: 'invalid',
  20: 'fixed',
  30: 'duplicate',
  40: 'incomplete',
  50: 'wont fix',
  60: 'works for me'
}

const SCORE_TO_SHIRT_SIZES = {
  0: '~',
  1: 'S',
  3: 'M',
  5: 'L',
  8: 'XL',
}

const STATUS_MAP = {
  5: 'someday',
  10: 'backlog',
  20: 'current',
  30: 'complete',
  40: 'accepted'
}

var ItemActivity = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    members: React.PropTypes.array,
    activity: React.PropTypes.shape({
      total_count: React.PropTypes.array,
      activities: React.PropTypes.array,
    }),
    updateStripeHeight: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      activity: {
        total_count: [],
        activities: []
      }
    }
  },

  getInitialState() {
    return {
      showAll: false
    }
  },

  abbreviatedName(model) {
    if (!model) {
      return '';
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

    return ACTIVITY_TYPES[action] || `WARN: ${action} ACTIVITY`;
  },

  itemChanged(meta) {
    let valueMap = this.fieldToValueMap(meta)
    let field = helpers.toTitleCase(meta.field);

    /*
      TODO: include this in a 'read more' sub-section
      from ${valueMap.oldVal} to ${valueMap.newVal}`;
    */
    return `the ${field}`
  },

  fieldToValueMap(meta) {
    let oldVal;
    let newVal;

    switch (meta.field) {
      case 'score':
        oldVal = SCORE_TO_SHIRT_SIZES[meta.old];
        newVal = SCORE_TO_SHIRT_SIZES[meta.new];

        break;
      case 'status':
        oldVal = STATUS_MAP[meta.old];
        newVal = STATUS_MAP[meta.new];

        break;
      default:
        oldVal = meta.old;
        newVal = meta.new;
        break;
    }

    return {
      oldVal,
      newVal
    }
  },

  attachmentDescription(meta) {
    var pre = helpers.vowelSound(meta.type) ? 'An ' : 'A ';
    let type = helpers.toTitleCase(meta.type);

    return `${pre} ${type}: ${meta.title}`;
  },

  itemReassigned(meta) {
    let from;
    let to = `to ${this.abbreviatedName(meta.new)}`

    if (meta.old) {
      from = `from ${this.abbreviatedName(meta.old)}`
    }

    return [from, to].join(' ');
  },

  activityDescription(model) {
    let meta = model.meta;
    let description;

    switch (model.action) {
      case 'item created':
        description = ''
        break;
      case 'item changed':
        let changed = this.itemChanged(meta)
        let formatted = helpers.formatTextForMarkdown(changed);

        description = <Markdown source={formatted} />
        break;
      case 'attachment':
        description = this.attachmentDescription(meta);
        break;
      case 'assigned':
        description = this.itemReassigned(meta);
        break;
      default:
        // This is a hack based on the api not returning an action for a comment
        if (model.cls === "Comment") {
          let formatted = helpers.formatTextForMarkdown(model.meta.body);

          description = <Markdown source={formatted} />
        } else {
          description = `DESCRIPTION CASE NOT HANDLED: cls:${model.cls}, label:${model.label}`
        }
    }

    return description;
  },

  showAllToggle() {
    this.setState({showAll: !this.state.showAll});
  },

  showAllActivityButton() {
    let toggleActivityCopy = this.state.showAll ? 'Show Less Activity' : 'Show More Activity';

    return <button className="load-more" onClick={this.showAllToggle}>{toggleActivityCopy}</button>;
  },

  componentDidUpdate() {
    this.props.updateStripeHeight();
  },

  render: function() {
    const MIN_ACTIVITY_NUMBER = 15
    let activityItems;
    let showAllActivityButton;
    let activity = this.props.activity;
    let totalActivityCount = activity.total_count || 0;

    if (activity.activities && this.props.members.length) {
      /*
        Default to show 20 activity objects to prevent slow rendering
      */
      if (activity.activities.length > MIN_ACTIVITY_NUMBER) {
        showAllActivityButton = this.showAllActivityButton();
      }

      let displayList = activity.activities;
      if (!this.state.showAll) {
        displayList = displayList.slice(0, MIN_ACTIVITY_NUMBER)
      }


      activityItems = _.map(displayList, _.bind(function(model , i) {
        let creator = _.findWhere(this.props.members, {id: model.user});
        let creatorEmail = creator.email;
        let creatorName = this.abbreviatedName(creator);
        let activityType = this.activityTypeMap(model.action);
        let description = this.activityDescription(model);
        let timestamp = this.timeSinceNow(model.created);

        return (
          <li key={i} className="comment">
            <div className="avatar no-gutter">
              <Gravatar email={creatorEmail} size={30} />
            </div>
            <div className="col-md-2 creator no-wrap-truncate">{creatorName}</div>
            <div className="col-md-1 activity-type no-gutter">{activityType}</div>
            <div className="col-md-7 activity__description collapse-right">
              {description}
            </div>
            <div className="timestamp pull-right">
              {timestamp}
            </div>
          </li>
        )
      },this))
    } else {
      activityItems = <li className="comment">No Activity Yet</li>
    }

    return (
      <div className="col-md-12 section activity">
        <div className="col-md-12">
          <div className="header">
            <div className="title">{helpers.toTitleCase('activity')}</div>
            <div className="activity__counter">{totalActivityCount} items</div>
            <div className="sep"></div>
          </div>
          <ul>
            {activityItems}
          </ul>
          {showAllActivityButton}
        </div>
      </div>
    )
  }
});

export default ItemActivity;
