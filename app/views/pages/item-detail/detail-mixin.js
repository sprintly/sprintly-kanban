import _ from 'lodash';
import moment from 'moment';
import helpers from '../../components/helpers';
import Gravatar from '../../components/gravatar';
import OwnerAvatar from '../../components/item-card/owner';

var DetailMixin = {
  buildTags(tags) {
    if (tags) {
      var tagIcon = <li><span className="glyphicon glyphicon-tag"></span></li>
      var tags = _.map(tags.split(','), function(tag, i) {
        return (
          <li key={i}>{tag}</li>
        )
      })
      tags.unshift(tagIcon)

      return (
        <ul>
          {tags}
        </ul>
      )
    }
  },

  timeSinceNow(time) {
    return moment(time).fromNow();
  },

  createdByTimestamp(createdAt, createdBy) {
    if (createdBy) {
      let timestamp = this.timeSinceNow(createdAt);
      let creator = `${createdBy.first_name} ${createdBy.last_name}`;

      return `Created by ${creator} ${timestamp}`;
    }
  },

  itemStatus(status) {
    let status = helpers.itemStatusMap(status);

    return helpers.toTitleCase(status);
  },

  assigneeGravatar(email) {
    if (!email) {
      return <OwnerAvatar person="placeholder-dark" />
    } else {
      return <Gravatar email={email} size={36} />
    }
  },

  itemScoreButton(type, score) {
    // TODO: let the user toggle state between t-shirt and fibonnaci sizes
    let buttonClass = `estimator__button ${type}`;
    return (
      <button className={buttonClass}>{score}</button>
    )
  }
};

export default DetailMixin;
