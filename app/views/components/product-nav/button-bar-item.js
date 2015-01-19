import React from "react";
import _ from "lodash";

var ITEM_TYPES = {
  'in-progress': 'Current',
  'completed': 'Done',
  'someday': 'Someday',
  'backlog': 'Backlog',
  'accepted': 'Accepted'
}

export default React.createClass({
  render: function() {
    var classList = ['topcoat-button-bar__button']
    var key = this.props.productId + '#' + this.props.status

    if (_.indexOf(this.props.columns, key) > -1) {
      classList.push('active')
    }

    return (
      <div className="topcoat-button-bar__item">
        <button className={classList.join(' ')} onClick={_.partial(this.props.addColumn, this.props.status)}>
          {ITEM_TYPES[this.props.status]}
        </button>
      </div>
    )
  }
});
