import _ from 'lodash';
import moment from 'moment';
import helpers from '../../components/helpers';
import Gravatar from '../../components/gravatar';
import OwnerAvatar from '../../components/item-card/owner';
import {MentionsInput, Mention} from '@sprintly/react-mentions';
import ProductActions from '../../../actions/product-actions';
import ScoreMap from '../../../lib/score-map';
import STATUS_MAP from '../../../lib/statuses-map';

var DetailMixin = {
  header(title) {
    var titleCased = helpers.toTitleCase(title);

    return (
      <div className="header">
        <div className="title">{titleCased}</div>
        <div className="sep"></div>
      </div>
    )
  },

  mentionsComponent(value, placeholder, changeFn) {
    let mentions = helpers.formatMentionMembers(this.props.members);

    return (
      <MentionsInput
        value={value}
        onChange={changeFn}
        placeholder={placeholder}>
          <Mention data={mentions} />
      </MentionsInput>
    )
  },

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
  },

  estimator(score, type, changeHandler) {
    var options = _.map(_.keys(ScoreMap), (key, i) => {
      let estimatorClasses = React.addons.classSet({
        "estimator-option": true,
        "selected": key === score
      })

      return (
        <li key={`${i}-${key}`}
            className={estimatorClasses}
            onClick={_.partial(changeHandler, 'score', key)}>
          {this.itemScoreButton(type, key)}
        </li>
      )
    })

    return (
      <ul className="estimator">
        {options}
      </ul>
    )
  },

  statusPicker(status, hoverHandler, hoverReset, changeHandler) {
    var options = _.map(_.keys(STATUS_MAP), (key, i) => {
      let estimatorClasses = React.addons.classSet({
        "estimator-option": true,
        "selected": STATUS_MAP[key] === status
      });
      let value = helpers.toTitleCase(key.charAt(0));

      return (
        <li key={`${i}-${key}`}
            className={estimatorClasses}
            onMouseEnter={_.partial(hoverHandler, key)}
            onClick={_.partial(changeHandler, 'status', key)}>
          {this.itemScoreButton('status', value)}
        </li>
      )
    });

    return (
      <ul onMouseLeave={hoverReset} className="estimator">
        {options}
      </ul>
    )
  },

  canBeReassigned(status) {
    return _.contains(['someday', 'backlog', 'in-progress'], status);
  },

  changeAttribute(attr, value) {
    let productId = this.getParams().id;
    let itemId = this.getParams().number;

    if (attr === 'status') {
      value = STATUS_MAP[value];
    }

    let newAttrs = {};
    newAttrs[attr] = value;

    ProductActions.updateItem(productId, itemId, newAttrs);
  },

  componentVisible(state, type) {
    return state[type] ? 'visible' : 'hidden';
  },

  currentAssignee(members, assignee) {
    let assigneeId = assignee ? assignee.id : '';
    let member = _.findWhere(members, {id: assigneeId});

    return member ? `${member.first_name} ${member.last_name}` : null;
  },

  controlToggle(state, type) {
    return _.reduce(state, (memo, val, key) => {
      if (key == type) {
        memo[key] = true;
      } else {
        memo[key] = false;
      }

      return memo;
    }, {});
  }
};

export default DetailMixin;
