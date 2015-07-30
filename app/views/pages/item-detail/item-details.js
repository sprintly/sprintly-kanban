import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import TagsInput from '../../components/tags-input';
import ItemDetailMixin from './detail-mixin';
import ItemTitle from './item-title';
import ProductActions from '../../../actions/product-actions';
import {State} from 'react-router';
import ScoreMap from '../../../lib/score-map';
import STATUS_MAP from '../../../lib/statuses-map';
import classNames from "classnames";

const INVERTED_STATUS_MAP = _.zipObject(_.values(STATUS_MAP), _.keys(STATUS_MAP))

var ItemDetails = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    productTags: React.PropTypes.array,
    members: React.PropTypes.array,
    type: React.PropTypes.string,
    title: React.PropTypes.string,
    who: React.PropTypes.string,
    what: React.PropTypes.string,
    why: React.PropTypes.string,
    number: React.PropTypes.string,
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
    }),
    setItem: React.PropTypes.func
  },

  getInitialState() {
    return {
      tagsEditable: false,
      actionControls: {
        status: false,
        assignee: false,
        score: false
      },
      hoverStatus: INVERTED_STATUS_MAP[this.props.status]
    }
  },

  toggleActionControl(type, ev) {
    let actionControls = this.controlToggle(this.state.actionControls, type);

    this.setState({actionControls: actionControls})
  },

  buildTitle() {
    return (
      <ItemTitle itemId={this.props.number}
                 type={this.props.type}
                 title={this.props.title}
                 who={this.props.who}
                 what={this.props.what}
                 why={this.props.why}
                 setItem={this.props.setItem} />
    )
  },

  toggleTagsEdit() {
    const TAGS_ATTR = 'tags';

    if (this.state.tagsEditable) {
      this.updateAttribute(this.props.number, TAGS_ATTR, this.props.tags)
    }

    this.setState({tagsEditable: !this.state.tagsEditable});
  },

  toggleButton() {
    let glyph = this.state.tagsEditable ? 'glyphicon-floppy-disk' : 'glyphicon-plus-sign';

    return (
      <div className="tags__edit">
        <button className={`glyphicon ${glyph}`} onClick={this.toggleTagsEdit}>
        </button>
      </div>
    )
  },

  updateTags(value) {
    let tags = value.join(',');

    this.props.setItem('tags', null, tags)
  },

  editTagsInput() {
    let tags = this.props.tags.split(',');
    if (tags.length === 1 && !tags[0]) {
      tags = ""
    }

    let tagOptions = _.pluck(this.props.productTags, 'tag');

    return (
      <TagsInput tags={tagOptions} onChange={this.updateTags} value={tags}/>
    )
  },

  tags() {
    if (this.state.tagsEditable) {
      return this.editTagsInput()
    } else {
      return this.buildTags(this.props.tags);
    }
  },

  infoSection() {
    let type = helpers.toTitleCase(this.props.type);
    let ticketId = `#${this.props.number}`
    let title = this.buildTitle();
    let tags = this.tags();
    let createdByTimestamp = this.createdByTimestamp(this.props.createdAt, this.props.createdBy);
    let toggleButton = this.toggleButton();

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
          {title}
          <div className="col-md-12 meta collapse-right">
            <div className="col-md-6 tags no-gutter">
              <ul className="tags__component">
                {toggleButton}
                {tags}
              </ul>
            </div>
            <div className="col-md-6 timestamp collapse-right">
              {createdByTimestamp}
            </div>
          </div>
        </div>
      </div>
    )
  },

  actionControl () {
    let members = helpers.formatSelectMembers(this.props.members);
    let productId = this.getParams().id;
    let itemId = this.getParams().number;
    let assigneeToId = (this.props.assignee && this.props.assignee.id) ? this.props.assignee.id : '';

    let itemParams = {
      score: this.props.score,
      number: this.props.number,
      type: this.props.type,
      status: this.props.status,
      assigned_to: assigneeToId
    }

    let estimator = this.estimator(itemParams);
    let statusPicker = this.statusPicker(itemParams, this.setHoverStatus, this.resetHoverStatus);
    let reassigner = this.reassigner(itemParams, members);

    return (
      <div className="col-md-12 control">
        <div className={this.componentVisible(this.state.actionControls, 'assignee')}>
          {reassigner}
        </div>
        <div className={this.componentVisible(this.state.actionControls, 'score')}>
          {estimator}
        </div>
        <div className={this.componentVisible(this.state.actionControls, 'status')}>
          {statusPicker}
        </div>
      </div>
    )
  },

  setHoverStatus(id, key, ev) {
    //  current
    this.setState({hoverStatus: key});
  },

  resetHoverStatus() {
    // in-progress --> current
    this.setState({hoverStatus: INVERTED_STATUS_MAP[this.props.status]});
  },

  actionsSection() {
    let itemStatus = this.state.hoverStatus || this.itemStatus(this.props.status);
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
              {helpers.toTitleCase(itemStatus)}
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
