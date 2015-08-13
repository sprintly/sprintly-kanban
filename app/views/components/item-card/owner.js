import React from 'react/addons';
import Gravatar from '../gravatar';

var Owner = React.createClass({

  getDefaultProps: function() {
    return {
      size: 36
    };
  },

  personaImage() {
    let person = this.props.person;

    if (person) {
      if (person === 'placeholder-light') {
        return <div className="item-card__owner-placeholder-light"></div>
      } else if (person === 'placeholder-dark') {
        return <div className="item-card__owner-placeholder-dark"></div>
      } else {
        return <Gravatar email={this.props.person.email} size={this.props.size} />;
      }
    } else {
      return <span className="item-card__owner-unassigned">+</span>
    }
  },

  render: function() {
    return (
      <div className="item-card__owner-avatar">
        {this.personaImage()}
      </div>
    )
  }
});

module.exports = Owner;
