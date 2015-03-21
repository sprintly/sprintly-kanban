import _ from 'lodash';
import React from 'react/addons';
import ProductActions from '../../../actions/product-actions';

var Controls = React.createClass({

  propTypes: {
    productId: React.PropTypes.number.isRequired,
    number: React.PropTypes.number.isRequired
  },

  updateItemStatus: function(status, closeReason) {
    let payload = {
      status
    };

    if(typeof closeReason === 'string') {
      payload.close_reason = closeReason;
    }

    ProductActions.updateItem(this.props.productId, this.props.number, payload);
  },

  render: function() {
    var status = this.props.status;
    var nextAction = '';
    var prevAction = '';

    switch(status) {
      case 'someday':
        nextAction = [
          <button className="btn btn-default" onClick={_.partial(this.updateItemStatus, 'backlog')}>Schedule</button>,
          <button className="btn btn-danger">Delete</button>,
        ]
        break;

      case 'backlog':
        nextAction = [
          <button className="btn btn-default" onClick={_.partial(this.updateItemStatus, 'in-progress')}>Start</button>,
          <button className="btn btn-primary" onClick={_.partial(this.updateItemStatus, 'someday')}>Reject</button>
        ]
        break;

      case 'in-progress':
        nextAction = [
          <button className="btn btn-default" onClick={_.partial(this.updateItemStatus, 'completed')}>Finish</button>,
          <button className="btn btn-info" onClick={_.partial(this.updateItemStatus, 'backlog')}>Stop</button>,
        ];
        break;

      case 'completed':
        nextAction = [
          <button className="btn btn-default" onClick={_.partial(this.updateItemStatus, 'accepted')}>Accept</button>,
          <button className="btn btn-warning" onClick={_.partial(this.updateItemStatus, 'in-progress', 'incomplete')}>Not Done</button>
        ]
        break;

      case 'accepted':
        nextAction = [
          <button className="btn btn-default" onClick={_.partial(this.updateItemStatus, 'in-progress')}>Reject</button>
        ]
        break;

      default:
        break;
    }

    return (
      <div className="item-card__controls">
        {nextAction}
      </div>
    );
  }
});

export default Controls;
