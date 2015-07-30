import _ from 'lodash';
import moment from 'moment';
import helpers from '../../components/helpers';
import Gravatar from '../../components/gravatar';
import OwnerAvatar from '../../components/item-card/owner';
import Select from 'react-select';
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

  caretDirection(open) {
    return open ? 'down' : 'right';
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

  estimator(item) {
    const SCORE_ATTR = 'score';

    var options = _.map(_.keys(ScoreMap), (key, i) => {
      let estimatorClasses = React.addons.classSet({
        "estimator-option": true,
        "selected": key === item.score
      })

      return (
        <li key={`${i}-${key}`}
            className={estimatorClasses}
            onClick={_.partial(this.updateAttribute, item.number, SCORE_ATTR, key)}>
          {this.itemScoreButton(item.type, key)}
        </li>
      )
    })

    return (
      <ul className="estimator">
        {options}
      </ul>
    )
  },

  statusPicker(item, hoverHandler, hoverReset) {
    const STATUS_ATTR = 'status';

    var options = _.map(_.keys(STATUS_MAP), (key, i) => {
      let estimatorClasses = React.addons.classSet({
        "estimator-option": true,
        "selected": STATUS_MAP[key] === item.status
      });
      let value = helpers.toTitleCase(key.charAt(0));

      return (
        <li key={`${i}-${key}`}
            className={estimatorClasses}
            onMouseEnter={_.partial(hoverHandler, item.number, key)}
            onClick={_.partial(this.updateAttribute, item.number, STATUS_ATTR, key)}>
          {this.itemScoreButton(STATUS_ATTR, value)}
        </li>
      )
    });

    return (
      <ul onMouseLeave={_.partial(hoverReset, item.number)} className="estimator">
        {options}
      </ul>
    )
  },

  reassigner(item, members) {
    let currentAssignee = this.currentAssignee(members, item.assigned_to);

    if (!this.canBeReassigned(item.status)) {
      let currentStatus = helpers.toTitleCase(item.status)
      return <div>{`Cannot reassign tickets which are ${currentStatus}`}</div>
    } else {
      return <Select placeholder={"Choose assignee"}
                            name="form-field-name"
                       className="assign-dropdown"
                        disabled={false}
                           value={currentAssignee}
                         options={members}
                        onChange={_.partial(this.updateAttribute, item.number, 'assigned_to')}
                       clearable={true} />
    }
  },

  canBeReassigned(status) {
    return _.contains(['someday', 'backlog', 'in-progress'], status);
  },

  updateAttribute(itemId, attr, value) {
    let productId = this.getParams().id;

    if (attr === 'status') {
      value = STATUS_MAP[value];
    }

    let newAttrs = {};
    newAttrs[attr] = value;

    ProductActions.updateItem(productId, itemId, newAttrs);
  },

  componentVisible(state, type) {
    return (state && state[type]) ? 'visible' : 'hidden';
  },

  currentAssignee(members, assigneeId) {
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
