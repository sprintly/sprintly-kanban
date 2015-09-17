import _ from 'lodash';
import React from 'react/addons';
import classNames from "classnames";
import {SplitButton, ButtonGroup, MenuItem} from 'react-bootstrap';

const SORT_OPTIONS = {
  created_at: 'Created At',
  priority: 'Priority',
  last_modified: 'Recent'
};

let ColumnHeader = React.createClass({

  getDefaultProps: function() {
    return {
      sortField: 'last_modified'
    }
  },

  onSelect: function(field) {
    this.props.setSortCriteria(field);
  },

  onReverseClick: function() {
    if (this.props.sortField !== 'priority') {
      this.props.reverse();
    }
  },

  getItemCount: function(status) {
    let counts = this.props.itemCounts;
    debugger;
    return (
      counts && counts[status] ? { items: counts[status], points: counts.points[counts[status]] } :
        { items: 0, points: 0 }
    );
  },

  onCondensedClick() {
    this.props.toggleCondensed()
  },

  render: function() {
    let directionClasses = {
      'glyphicon': true,
      'glyphicon-sort-by-attributes': this.props.sortDirection === 'desc',
      'glyphicon-sort-by-attributes-alt': this.props.sortDirection === 'asc',
    };
    let itemCounts = this.getItemCount(this.props.status);

    let condensedClasses = {
      'glyphicon': true,
      'glyphicon-list': !this.props.condensed,
      'glyphicon-th-list': this.props.condensed
    }

    return (
      <header>
        <div className="column__sort-options">
          <SplitButton onSelect={this.onSelect} activeKey={this.props.sortField} bsSize="small" title={`Sort by: ${SORT_OPTIONS[this.props.sortField]}`}>
            {_.map(_.omit(SORT_OPTIONS, this.props.sortField), function(label, field) {
              return (
                <MenuItem eventKey={field} key={field}>{label}</MenuItem>
              );
            }, this)}
          </SplitButton>
          <button className="reverse-sort" disabled={this.props.sortField === 'priority'} type="button" onClick={this.onReverseClick} aria-label="Change sort direction">
            <span aria-hidden="true" className={classNames(directionClasses)}/>
          </button>
          <button className="toggle-condensed" type="button" onClick={this.onCondensedClick}>
            <span aria-hidden="true" className={classNames(condensedClasses)}/>
          </button>
        </div>

        <div className="column__summary">
          <ButtonGroup>
            <button className="btn btn-sm btn-default">
              {itemCounts.points} points
            </button>
            <button className="btn btn-sm btn-default">
              {itemCounts.items} items
            </button>
          </ButtonGroup>
        </div>
      </header>
    )
  }
})

export default ColumnHeader
