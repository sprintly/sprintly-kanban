import _ from 'lodash';
import React from 'react';
import OwnerAvatar from '../item-card/owner';

// Flux
// import HeaderActions from '../../../actions/header-actions'

const CURRENT_COL_STATUS = 'in-progress';

var PlaceholderCards = React.createClass({

  propTypes: {
    status: React.PropTypes.string.isRequired
  },

  ipsumBlocks() {
    var length = _.sample([1, 2, 3]);

    return _.times(length, (n) => {
      var width = (n === length-1) ? Math.floor((Math.random() * (100 - 50) + 50)) : 100;

      return <div style={ {width: `${width}%`} } className="ipsum-block"></div>
    })
  },

  greyscaleContent() {
    return (
      <div className="row">
        <div className="item-card__header col-sm-12">
          <div className="item-card__header-right">
            <span><OwnerAvatar /></span>
          </div>
        </div>
        <div className="item-card__title col-sm-12">
          {this.ipsumBlocks()}
        </div>
      </div>
    )
  },

  actionContent() {

    return <a onClick={this.triggerModal}>Add an Item</a>
  },

  triggerModal() {
    // Future: navigation.transitionTo('add-item');
    // HeaderActions.openAddModal();
  },

  placeholderCards() {
    return _.times(8, (n) => {
      var content;
      if (n === 3 && this.props.status === CURRENT_COL_STATUS) {
        content = this.actionContent();
      } else {
        content = this.greyscaleContent();
      }

      return (
        <div className="placeholder item-card">
          {content}
        </div>
      )
    })
  },

  render() {
    return (
      <div className='placeholder-cards'>
        {this.placeholderCards()}
      </div>
    );
  }
});

module.exports = PlaceholderCards;
