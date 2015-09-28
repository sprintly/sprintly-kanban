import React from 'react/addons';
import ItemActions from '../../../actions/item-actions';
import ItemDetailMixin from './detail-mixin';
import Markdown from 'react-markdown';
import _ from 'lodash';
import helpers from '../../components/helpers';
import activityHelpers from './activity-item-helpers';
import classNames from "classnames";
import Gravatar from '../../components/gravatar';
const ActivityTypes = {
  CREATED: 'item created',
  CHANGED: 'item changed',
  ATTACHMENT: 'attachment',
  ASSIGNED: 'assigned'
}

const GRAVATAR_SIZE = 30

let ActivityItem = React.createClass({

  mixins: [ItemDetailMixin],

  propTypes: {
    author: React.PropTypes.shape({
      first_name: React.PropTypes.string,
      last_name: React.PropTypes.string,
      email: React.PropTypes.string
    }),
    activity: React.PropTypes.shape({
      item: React.PropTypes.array,
      product: React.PropTypes.number,
      meta: React.PropTypes.shape({
        field: React.PropTypes.string,
        close_reason: React.PropTypes.number,
        old: React.PropTypes.oneOfType([
          React.PropTypes.object,
          React.PropTypes.number
        ]),
        new: React.PropTypes.oneOfType([
          React.PropTypes.object,
          React.PropTypes.number
        ]),
        status: React.PropTypes.string,
        accepted_by: React.PropTypes.object,
        total_comments: React.PropTypes.number,
        number: React.PropTypes.number,
        last_activity: React.PropTypes.string,
        meta: React.PropTypes.object,
        closed_at: React.PropTypes.string,
        started_at: React.PropTypes.string,
        duplicate_of: React.PropTypes.object,
        read_only: React.PropTypes.bool,
        what: React.PropTypes.string,
        teamPks: React.PropTypes.array,
        descriptionFormatted: React.PropTypes.string,
        title: React.PropTypes.string,
        created_by: React.PropTypes.number,
        score: React.PropTypes.number,
        pk: React.PropTypes.number,
        favoritedBy: React.PropTypes.array,
        sort: React.PropTypes.number,
        product: React.PropTypes.number,
        description: React.PropTypes.string,
        parent: React.PropTypes.object,
        tags: React.PropTypes.string,
        who: React.PropTypes.string,
        total_blockers: React.PropTypes.number,
        why: React.PropTypes.string,
        mentioning: React.PropTypes.array,
        accepted_at: React.PropTypes.string,
        created: React.PropTypes.string,
        total_blocking: React.PropTypes.number,
        type: React.PropTypes.number,
        total_favorites: React.PropTypes.number,
        assigned_to: React.PropTypes.object``
      }),
      user: React.PropTypes.number,
      identifier: React.PropTypes.number,
      created: React.PropTypes.string,
      action: React.PropTypes.string,
      label: React.PropTypes.string,
      id: React.PropTypes.number,
      cls: React.PropTypes.string
    })
  },

  description() {
    let activity = this.props.activity
    let description;

    switch (activity.action) {
      case ActivityTypes.CREATED:
        description = ''
        break;
      case ActivityTypes.CHANGED:
        description = `the ${activity.meta.field}`;
        break;
      case ActivityTypes.ATTACHMENT:
        description = activityHelpers.attachmentDesc(activity.meta);
        break;
      case ActivityTypes.ASSIGNED:
        description = activityHelpers.itemReassigned(activity.meta);
        break;
      default:
        console.log(`DESCRIPTION CASE NOT HANDLED: cls:${activity.cls}, label:${this.props.activity.label}`)
    }

    return description;
  },

  render: function() {
    let type = activityHelpers.activityTypeMap(this.props.activity.action);
    let description;

    if (this.props.activity.cls === "Comment") {
      let formatted = helpers.formatTextForMarkdown(this.props.activity.meta.body, this.props.activity.product);
      description = <Markdown source={`${type} ${formatted}`} />
    } else {
      description = `${type} ${this.description()}`;
    }

    return (
      <li className="activity__item">
        <div className="avatar no-gutter">
          <Gravatar email={this.props.author.email} size={GRAVATAR_SIZE} />
        </div>
        <div className="creator no-wrap-truncate">
          {activityHelpers.authorName(this.props.author)}
        </div>
        <div className="type no-gutter no-wrap-truncate">
          {description}
        </div>
        <div className="col-xs-12 timestamp pull-right">
          {this.timeSinceNow(this.props.activity.created)}
        </div>
      </li>
    )
  }
})

export default ActivityItem
