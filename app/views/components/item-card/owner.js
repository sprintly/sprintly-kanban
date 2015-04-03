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

  getName: function() {
    return this.props.person === 'unassigned' ?
      'Unassigned' : this.props.person.first_name + ' ' + this.props.person.last_name.substr(0,1)
  },

  render: function() {
    return (
      <div className="item-card__owner-avatar">
        {this.props.person != null ?
          <Gravatar email={this.props.person.email} size={this.props.size} /> :
          this.defaultImage() }
      </div>
    )
  }
});

module.exports = Owner;
