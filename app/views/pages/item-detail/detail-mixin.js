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

  mentionsComponent(value, placeholder, members, changeFn) {
    let mentions = helpers.formatMentionMembers(members);

    return (
      <MentionsInput
        value={value}
        onChange={changeFn}
        placeholder={placeholder}>
          <Mention data={mentions} />
      </MentionsInput>
    )
  },

  parseTags(tags) {
    return _.reject(tags.split(','), (text) => { return text === ','});
  },

  buildTags(tags) {
    if (tags) {
      let tagIcon = <li><span className="glyphicon glyphicon-tag"></span></li>
      let parsedTags = this.parseTags(tags);
      let commas = _.map(_.times(parsedTags.length-1), function() {return ','});

      let tagListEls = _.map(parsedTags, (tag, i) => {
        return (
          <li key={i}>{tag}</li>
        )
      })

      let tagsList = _.chain([tagListEls,commas])
                      .zip()
                      .flatten()
                      .compact()
                      .value()
      tagsList.unshift(tagIcon)

      return (
        <ul className="tags__list">
          {tagsList}
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
      return (
        <div className="action__restricted">
          {`Cannot reassign tickets which are `}
          <span className="status">{currentStatus}</span>
        </div>
      )
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
    let member = _.findWhere(members, {value: assigneeId});

    return member ? member.label : null;
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
