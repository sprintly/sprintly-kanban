import _ from 'lodash';
import React from 'react/addons';
import moment from 'moment';

import FilterActions from '../../../actions/filter-actions';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';

import SubItems from './subitems'
import {TagEditor, Tags} from 'sprintly-ui';
import {DropdownButton, MenuItem, OverlayTrigger, Tooltip, Button, Input} from 'react-bootstrap';

const STATUSES = {
  'someday': 'Someday',
  'backlog': 'Backlog',
  'in-progress': 'Current',
  'completed': 'Complete',
  'accepted': 'Accepted'
};

var ItemCardDetails = React.createClass({

  propTypes: {
    productId: React.PropTypes.number,
    item: React.PropTypes.object
  },

  updatePriority(direction) {
    ProductActions.updateItemPriority(
      this.props.productId,
      this.props.item.number,
      direction
    )
  },

  handleMenuSelection(status) {
    if (status === "destroy") {
      return this.deleteItem();
    } else {
      return this.updateStatus(status);
    }
  },

  deleteItem() {
    ItemActions.deleteItem(
      this.props.productId,
      this.props.item.number
    );
  },

  updateStatus(status) {
    ProductActions.updateItem(
      this.props.productId,
      this.props.item.number,
      { status }
    );
  },

  filterByTag(tag) {
    FilterActions.update('tags', [tag]);
  },

  filterByMember(ev) {
    FilterActions.update('created_by', this.props.item.created_by.id);
  },

  editTags(modelIds, tags, tag, action) {
    let [productId, itemNumber] = modelIds;
    if (action == 'add') {
      tags.push(tag);
    }
    if (action == 'remove') {
      _.pull(tags, tag);
    }
    tags = _.compact(tags).join(',')
    ProductActions.updateItem(productId, itemNumber, {tags});
    this.refs.tagEditor.setState({ showMenu: false })
  },

  renderCreatedBy(item) {
    return(
      <a href="javascript: void 0" onClick={this.filterByMember}>
        {item.created_by.first_name} {item.created_by.last_name.slice(0,1)}
      </a>
    )
  },

  renderMoveControls() {
    return this.props.sortField !== 'priority' ? (
      <OverlayTrigger placement='top' overlay={<Tooltip>Sort by <strong>Priority</strong> to reorder.</Tooltip>}>
        <Button bsStyle='default' bsSize="small">Reorder</Button>
      </OverlayTrigger>
    ) : (
      <DropdownButton onSelect={this.updatePriority} bsStyle="default" bsSize="small" title="Reorder" disabled={this.props.sortField !== 'priority'}>
        <MenuItem eventKey="up" key="up">Move Up</MenuItem>
        <MenuItem eventKey="down" key="down">Move Down</MenuItem>
        <MenuItem eventKey="top" key="top">Move to Top</MenuItem>
        <MenuItem eventKey="bottom" key="bottom">Move to Bottom</MenuItem>
      </DropdownButton>
    );
  },

  renderSubItems() {
    if (this.props.item.sub_items && this.props.item.sub_items.length > 0) {
      return (
        <SubItems subitems={this.props.item.sub_items} />
      );
    } else {
      return ''
    }
  },

  render() {
    let item = this.props.item;
    let hasTags = _.isString(item.tags) && !_.isEmpty(item.tags);
    let tags = hasTags ? item.tags.split(',') : item.tags || [];
    let statusOptions = _.omit(STATUSES, item.status);

    let menuItems = _.map(statusOptions, function(label, status) {
      return <MenuItem eventKey={status} key={status}>Move to {label}</MenuItem>
    });
    let deleteItem = <MenuItem eventKey="destroy" key="destroy">Delete</MenuItem>
    menuItems.push(deleteItem);
    return (
      <div className="item-card__details">
        <div className="col-sm-6 item-card__summary">
          Created by {this.renderCreatedBy(item)} {moment(item.created_at).fromNow()}.
        </div>
        <div className="col-sm-6 item-card__extra-controls">
          {this.renderMoveControls()}
          <DropdownButton onSelect={this.handleMenuSelection} bsStyle="default" bsSize="small" title={<span className="glyphicon glyphicon-cog"/>} noCaret>
            {menuItems}
          </DropdownButton>
        </div>
        {this.renderSubItems()}
        <div className="item-card__tags col-sm-12">
          <TagEditor
            modelId={[item.product.id, item.number]}
            tags={tags}
            tagChanger={{addOrRemove: this.editTags}}
            ref='tagEditor'
          />
          <Tags
            tags={tags}
            altOnTagClick={this.filterByTag}
          />
        </div>
      </div>
    );
  }

});

export default ItemCardDetails;
