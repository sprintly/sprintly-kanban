import React from 'react/addons';
import Bootstrap from 'react-bootstrap';

let Summary = React.createClass({
  render() {
    return (
      <div className="item__summary">
        <Bootstrap.Panel>
          {this.props.startDate} ({this.props.points} points)
        </Bootstrap.Panel>
      </div>
    );
  }
})

export default Summary;
