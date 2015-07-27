import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import ProductActions from '../../../actions/product-actions';
import Select from 'react-select';
import {State} from 'react-router'

var ItemDetails = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    members: React.PropTypes.array,
    type: React.PropTypes.string,
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
    let member = _.findWhere(this.props.members, {id: this.props.assignee.id})

    return member ? `${member.first_name} ${member.last_name}` : null;
  },

  actionsSection() {
    let members = helpers.formatSelectMembers(this.props.members);
    let itemStatus = this.itemStatus(this.props.status);
    let assigneeGravatar = this.assigneeGravatar(this.props.assignee.email);
    let itemSizeButton = this.itemScoreButton(this.props.type, this.props.score);
    let currentAssignee = this.currentAssignee();

    return (
      <div className="col-md-3 ticket-actions collapse-gutters">
        <div className="col-md-12 ticket-state">
          <div className="col-md-4">
            <div className="col-md-12 title">
              Progress
            </div>
            <div className="col-md-12 value">
              {itemStatus}
            </div>
          </div>
          <div className="col-md-5">
            <div className="col-md-12 title">
              Owner
            </div>
            <div className="col-md-12 value">
              {assigneeGravatar}
            </div>
          </div>
          <div className="col-md-3">
            <div className="col-md-12 title">
              Size
            </div>
            <div className="col-md-12 value">
              {itemSizeButton}
            </div>
          </div>
        </div>
        <div className="col-md-12 control">
          <Select placeholder={"Choose assignee"}
                  name="form-field-name"
                  className="assign-dropdown"
                  disabled={false}
                  value={currentAssignee}
                  options={members}
                  onChange={this.setAssignedTo}
                  clearable={true} />
        </div>
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
