import React from 'react/addons'
import Bootstrap from 'react-bootstrap'

let Summary = React.createClass({
  render() {
    return (
      <div className="panel-heading">
        {this.props.startDate}
        <Bootstrap.Label>{this.props.points} points</Bootstrap.Label>
      </div>
    )
  }
})

export default Summary
