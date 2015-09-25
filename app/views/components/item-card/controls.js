import _ from 'lodash'
import React from 'react/addons'
import ProductActions from '../../../actions/product-actions'

const CONTROL_BUTTONS = {
  'someday': [
    {
      status: 'backlog',
      style: 'default',
      label: 'Schedule'
    },
    {
      label: 'Delete',
      style: 'danger'
    }
  ],
  'backlog': [
    {
      status: 'in-progress',
      style: 'default',
      label: 'Start'
    },
    {
      status: 'someday',
      style: 'primary',
      label: 'Reject'
    }
  ],
  'in-progress': [
    {
      status: 'completed',
      style: 'default',
      label: 'Finish'
    },
    {
      status: 'backlog',
      style: 'info',
      label: 'Stop'
    }
  ],
  'completed': [
    {
      status: 'accepted',
      style: 'default',
      label: 'Accept'
    },
    {
      status: 'in-progress',
      style: 'warning',
      label: 'Not Done'
    }
  ],
  'accepted': [
    {
      status: 'in-progress',
      style: 'default',
      label: 'Reject'
    }
  ]

}

var Controls = React.createClass({

  propTypes: {
    productId: React.PropTypes.number.isRequired,
    number: React.PropTypes.number.isRequired
  },

  updateItemStatus: function(status, closeReason) {
    let payload = {
      status
    }

    if (typeof closeReason === 'string') {
      payload.close_reason = closeReason
    }

    ProductActions.updateItem(this.props.productId, this.props.number, payload)
  },

  renderButtons: function(action, i) {
    var props = {
      className: `btn btn-${action.style} btn-sm`
    }
    if (action.status) {
      props.onClick = _.partial(this.updateItemStatus, action.status)
    }
    return <button key={i} {...props}>{action.label}</button>
  },

  render: function() {

    return (
      <div className="item-card__controls">
        {_.map(CONTROL_BUTTONS[this.props.status], this.renderButtons)}
      </div>
    )
  }
})

export default Controls
