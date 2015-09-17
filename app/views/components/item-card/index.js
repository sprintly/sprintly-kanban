import _ from 'lodash'
import React, { PropTypes } from 'react/addons'
import ProductActions from '../../../actions/product-actions'
import classNames from 'classnames'
import ScoreMap from '../../../lib/score-map'
import onClickOutside from '@sprintly/react-onclickoutside'
// Components
import { Estimator } from 'sprintly-ui'
import { OverlayTrigger, Popover} from 'react-bootstrap'
import { DragSource } from 'react-dnd'
import OwnerAvatar from './owner'
import Controls from './controls'
import ItemCardDetails from './details'
import Select from 'react-select'
import {Link} from 'react-router'

const REVERSE_SCORE_MAP = _.zipObject(_.values(ScoreMap), _.keys(ScoreMap))

const cardSpec = {
  beginDrag(props) {
    return props.item
  },

  isDragging(props, monitor) {
    return monitor.getItem().number === props.item.number
  }
}

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging()
  }
}

let ItemCard = React.createClass({

  propTypes: {
    productId: PropTypes.number.isRequired,
    item: PropTypes.object.isRequired,
    sortField: PropTypes.string.isRequired,
    members: PropTypes.array.isRequired,
    // For React DnD
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired
  },

  mixins: [
    onClickOutside
  ],

  getInitialState() {
    return {
      showDetails: false
    }
  },

  handleClickOutside() {
    this.closePopover()
  },

  closePopover() {
    if (this.refs.trigger) {
      this.refs.trigger.hide()
    }
  },

  toggleDetails(e) {
    e.preventDefault()
    this.setState({ showDetails: !this.state.showDetails })
  },

  changeScore: function([productId, itemId], score) {
    ProductActions.updateItem(productId, itemId, { score: REVERSE_SCORE_MAP[score] })
  },

  isCurrentOwner(otherId) {
    let currentOwner = this.props.item.assigned_to
    return !!currentOwner && currentOwner.id == otherId
  },

  setAssignedTo(value) {
    if (this.isCurrentOwner(value)) { return }
    let productId = this.props.productId
    let itemId = this.props.item.number
    ProductActions.updateItem(productId, itemId, { assigned_to: value })
    setTimeout(() => {
      this.closePopover()
    }, 0)
  },

  prepareMembersForSelect() {
    return _.chain(this.props.members)
            .map(function(member){
              if (!member.revoked && !this.isCurrentOwner(member.id)) {
                return { label: `${member.first_name} ${member.last_name}`, value: member.id }
              }
            }, this)
            .compact()
            .value()
  },

  assigneeName() {
    let owner = this.props.item.assigned_to
    return owner ? owner.first_name + ' ' + owner.last_name : 'Unassigned'
  },

  popoverMenu() {
    let members = this.prepareMembersForSelect()
    return (
      <Popover ref="popover" className="ignore-react-onclickoutside" enableOnClickOutside={true}>
        <div className="item_card__member-dropdown">
          <Select name="form-field-name"
                  value={this.assigneeName()}
                  options={members}
                  onChange={this.setAssignedTo}
                  clearable={true} />
        </div>
      </Popover>
    )
  },

  isAssignable() {
    return _.contains(['backlog', 'in-progress', 'someday'], this.props.item.status)
  },

  renderStoryTitle() {
    let article = this.props.item.title.split(this.props.item.who)[0]
    return [
      <span key="subject" className="item-card__title-subject">
        {article}
        <span className="item-card__title-who">{this.props.item.who}</span>
      </span>,
      <span key="verb" className="item-card__title-verb"> I want </span>,
      <span key="predicate" className="item-card__title-predicate">
        <span className="item-card__title-what">{this.props.item.what}</span>
        <span> so that </span>
        <span className="item-card__title-why">{this.props.item.why}</span>
      </span>
    ]
  },

  render() {
    let connectDragSource = this.props.connectDragSource
    let classes = {
      'item-card': true,
      'is-dragging': this.props.isDragging,
      'active': this.props.active || this.state.showDetails,
      [this.props.item.type]: true,
      'parent': this.props.item.sub_items && this.props.item.sub_items.length > 0
    }

    let owner = this.props.item.assigned_to
    var title = this.props.item.title
    if (this.props.item.type === 'story') {
      title = this.renderStoryTitle()
    }

    let controlsProps = {
      productId: this.props.productId,
      number: this.props.item.number,
      status: this.props.item.status,
      toggleDetails: this.changeStatus
    }

    let estimatorProps = {
      modelId: [this.props.productId, this.props.item.number],
      itemType: this.props.item.type,
      score: this.props.item.score,
      estimateChanger: {changeScore: this.changeScore}
    }

    return connectDragSource(
      <div className={classNames(classes)}>
        <div className="row">
          <div className="item-card__header col-sm-12">
            <Controls {...controlsProps}/>
            <div className="item-card__header-right">
              <div className="item-card__number">
                <a href={`https://sprint.ly/product/${this.props.productId}/item/${this.props.item.number}`} target="_blank">#{this.props.item.number}</a>
              </div>
              <Estimator {...estimatorProps}/>
              {this.isAssignable() ?
                <OverlayTrigger ref="trigger" trigger="click" placement="bottom" overlay={this.popoverMenu()}>
                  <span className="clickable-avatar"><OwnerAvatar person={owner} /></span>
                </OverlayTrigger> :
                <span><OwnerAvatar person={owner} /></span>}
            </div>
          </div>
          <div className="item-card__title col-sm-12">
            <h2 className="item-card__title-left">
              <Link to={`/product/${this.props.productId}/item/${this.props.item.number}`}>{title}</Link>
            </h2>
            <button className="item-card__show-details" onClick={this.toggleDetails}>
              <span className="glyphicon" />
            </button>
          </div>
        </div>
        <div className="row">
          {this.state.showDetails ? <ItemCardDetails {...this.props} /> : ''}
        </div>
      </div>
    )
  }

})

export default DragSource('ITEM_CARD', cardSpec, collect)(ItemCard)
