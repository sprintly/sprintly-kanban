import _ from 'lodash';
import React from 'react/addons';
import moment from 'moment';
import FilterActions from '../../../actions/filter-actions';
import ProductActions from '../../../actions/product-actions';
import {TagEditor, Tags} from 'sprintly-ui';
import {DropdownButton, MenuItem, OverlayTrigger, Tooltip, Button} from 'react-bootstrap';

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

  render() {
    let tags = this.props.item.tags ? this.props.item.tags.split(',') : [];
    let statusOptions = _.omit(STATUSES, this.props.item.status);
    return (
      <div className="item-card__details">
        <div className="col-sm-6 item-card__summary">
          Created by <a href="javascript: void 0" onClick={this.filterByMember}>{this.props.item.created_by.first_name} {this.props.item.created_by.last_name.slice(0,1)}</a> {moment(this.props.item.created_at).fromNow()} ago.
        </div>
        <div className="col-sm-6 item-card__extra-controls">
          {this.renderMoveControls()}
          <DropdownButton onSelect={this.updateStatus} bsStyle="default" bsSize="small" title={<span className="glyphicon glyphicon-cog"/>} noCaret>
            {_.map(statusOptions, function(label, status) {
              return <MenuItem eventKey={status} key={status}>Move to {label}</MenuItem>
            })}
          </DropdownButton>
        </div>
        <div className="item-card__tags col-sm-12">
          <TagEditor
            modelId={[this.props.item.product.id, this.props.item.pk]}
            tags={tags}
            tagChanger={{addOrRemove: this.editTags}}
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
