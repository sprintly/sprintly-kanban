import React from 'react/addons'
import {Link, State} from 'react-router'

let DrawerStripe = React.createClass({

  mixins: [State],

  propTypes: {
    type: React.PropTypes.string,
    height: React.PropTypes.number
  },

  render: function() {
    let stripeClass = `stripe ${this.props.type}`
    let closeClass = `drawer__close ${this.props.type}`
    let stripeStyles = {height: `${this.props.height}px`}

    return (
      <div style={stripeStyles} className={stripeClass}>
        <Link to="product" params={{ id: this.getParams().id }} className={closeClass}>
          <span aria-hidden="true" className="glyphicon glyphicon-remove"/>
        </Link>
      </div>
    )
  }

})

export default DrawerStripe
