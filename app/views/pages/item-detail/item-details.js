import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import ProductActions from '../../../actions/product-actions';
import Select from 'react-select';
import {State} from 'react-router';
import ScoreMap from '../../../lib/score-map';

var ItemDetails = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    members: React.PropTypes.array,
    type: React.PropTypes.string,
    title: React.PropTypes.string,
    who: React.PropTypes.string,
    what: React.PropTypes.string,
    why: React.PropTypes.string,
    number: React.PropTypes.number,
    tags: React.PropTypes.string,
    createdAt: React.PropTypes.string,
    createdBy: React.PropTypes.shape({
      first_name: React.PropTypes.string,
      last_name: React.PropTypes.string
    }),
    status: React.PropTypes.string,
    score: React.PropTypes.string,
    assignee: React.PropTypes.shape({
      email: React.PropTypes.string,
      id: React.PropTypes.number
    })
  },

  getInitialState() {
    return {
      actionControls: {
        status: false,
        assignee: false,
        score: false
      }
    }
  },

  toggleActionControl(type, ev) {
    let actionControls = _.reduce(this.state.actionControls, (memo, val, key) => {
      if (key == type) {
        memo[key] = true;
      } else {
        memo[key] = false;
      }

      return memo;
    }, {});


    this.setState({actionControls: actionControls})
  },

  buildTitle() {
    if (this.props.type === 'story') {
      var whoFirstWord = this.props.who.split(' ')[0];
      var whoPre = helpers.vowelSound(whoFirstWord) ? 'As an ' : 'As a ' ;

      return  [
        <span className="italicize">{whoPre}</span>,
        `${this.props.who}`,
        <span className="italicize"> I want </span>,
        `${this.props.what}`,
        <span className="italicize"> so that </span>,
        `${this.props.why}`
      ]
    } else {
      return this.props.title
    }
  },

  infoSection() {
    let type = helpers.toTitleCase(this.props.type);
    let ticketId = `#${this.props.number}`
    let titleClass = `title ${this.props.type}`
    let title = this.buildTitle();
    let tags = this.buildTags(this.props.tags);
    let createdByTimestamp = this.createdByTimestamp(this.props.createdAt, this.props.createdBy);

    return (
      <div className="col-md-9 info">
        <div className="ticket__type">
          <div className="col-md-12 type">
            {type}
          </div>
          <div className="col-md-12 id">
            {ticketId}
          </div>
        </div>
        <div className="ticket__description">
          <div className={titleClass}>
            {title}
          </div>
          <div className="col-md-12 meta collapse-right">
            <div className="col-md-6 tags no-gutter">
              {tags}
            </div>
            <div className="col-md-6 timestamp collapse-right">
              {createdByTimestamp}
            </div>
          </div>
        </div>
      </div>
    )
  },

  currentAssignee() {
    let assigneeId = this.props.assignee ? this.props.assignee.id : '';
    let member = _.findWhere(this.props.members, {id: assigneeId});

    return member ? `${member.first_name} ${member.last_name}` : null;
  },

  componentVisible(type) {
    return this.state.actionControls[type] ? 'visible' : 'hidden';
  },

  changeScore(score) {
    let productId = this.getParams().id;
    let itemId = this.getParams().number;

    ProductActions.updateItem(productId, itemId, { score: score });
  },

  actionControl () {
    let members = helpers.formatSelectMembers(this.props.members);
    let currentAssignee = this.currentAssignee();
    let productId = this.getParams().id;
    let itemId = this.getParams().number;
    let estimator = this.estimator(this.props.type);

    return (
      <div className="col-md-12 control">
        <div className={this.componentVisible('assignee')}>
          <Select placeholder={"Choose assignee"}
                name="form-field-name"
                className="assign-dropdown"
                disabled={false}
                value={currentAssignee}
                options={members}
                onChange={this.setAssignedTo}
                clearable={true} />
        </div>
        <div className={this.componentVisible('score')}>
          {estimator}
        </div>
      </div>
    )
  },

  estimator(type) {
    var options = _.map(_.keys(ScoreMap), (key) => {
      let estimatorClasses = React.addons.classSet({
        "estimator-option": true,
        "selected": key === this.props.score
      })

      return (
        <li className={estimatorClasses} onClick={_.partial(this.changeScore, key)}>
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

  actionsSection() {
    let itemStatus = this.itemStatus(this.props.status);
    let email = this.props.assignee ? this.props.assignee.email: '';
    let assigneeGravatar = this.assigneeGravatar(email);
    let itemSizeButton = this.itemScoreButton(this.props.type, this.props.score);

    let actionControl = this.actionControl()

    return (
      <div className="col-md-3 ticket-actions collapse-gutters">
        <div className="col-md-12 ticket-state">
          <div className="col-md-4">
            <div className="col-md-12 title">
              Progress
            </div>
            <div className="col-md-12 value action__toggle" onClick={_.partial(this.toggleActionControl, 'status')}>
              {itemStatus}
            </div>
          </div>
          <div className="col-md-5">
            <div className="col-md-12 title">
              Owner
            </div>
            <div className="col-md-12 value action__toggle" onClick={_.partial(this.toggleActionControl, 'assignee')}>
              {assigneeGravatar}
            </div>
          </div>
          <div className="col-md-3">
            <div className="col-md-12 title">
              Size
            </div>
            <div className="col-md-12 value action__toggle" onClick={_.partial(this.toggleActionControl, 'score')}>
              {itemSizeButton}
            </div>
          </div>
        </div>
        {actionControl}
      </div>
    )
  },

  setAssignedTo(value) {
    let productId = this.getParams().id;
    let itemId = this.getParams().number;

    ProductActions.updateItem(productId, itemId, { assigned_to: value });
  },

  render: function() {
    console.log('render details');
    let infoSection = this.infoSection();
    let actionsSection = this.actionsSection();

    return (
      <div className="col-md-12 section ticket__detail">
        {infoSection}
        {actionsSection}
      </div>
    )
  }
});

export default ItemDetails;
