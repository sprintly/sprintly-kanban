import React from 'react/addons';
import _ from 'lodash';
import Gravatar from '../../components/gravatar';

const GRAVATAR_SIZE = 30;

let ActivityItem = React.createClass({

  propTypes: {
    index: React.PropTypes.number,
    creatorEmail: React.PropTypes.string,
    creatorName: React.PropTypes.string,
    activityType: React.PropTypes.string,
    description: React.PropTypes.string,
    timestamp: React.PropTypes.string
  },

  render: function() {
    return (
      <li key={this.props.index} className="activity__item">
        <div className="avatar no-gutter">
          <Gravatar email={this.props.creatorEmail} size={GRAVATAR_SIZE} />
        </div>
        <div className="col-xs-6 col-sm-2 creator no-wrap-truncate">
          {this.props.creatorName}
        </div>
        <div className="col-xs-4 col-sm-1 type no-gutter no-wrap-truncate">
          {this.props.activityType}
        </div>
        <div className="col-xs-10 col-sm-7 description collapse-right">
          {this.props.description}
        </div>
        <div className="col-xs-12 timestamp pull-right">
          {this.props.timestamp}
        </div>
      </li>
    )
  }
});

module.exports = ActivityItem;
