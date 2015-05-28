var React = require('react');
var Gravatar = require('../gravatar');

var Owner = React.createClass({

  getDefaultProps: function() {
    return {
      size: 36
    };
  },

  defaultImage: function() {
    return <span className="item-card__owner-unassigned">+</span>
  },

  render: function() {
    return (
      <div className="item-card__owner-avatar">
        {!!this.props.person ?
          <Gravatar email={this.props.person.email} size={this.props.size} /> :
          this.defaultImage() }
      </div>
    )
  }
});

module.exports = Owner;
