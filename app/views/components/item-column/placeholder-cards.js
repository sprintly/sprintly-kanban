import _ from 'lodash'
import React from 'react/addons'
import OwnerAvatar from '../item-card/owner'

// Flux
import HeaderActions from '../../../actions/header-actions'

const CURRENT_COL_STATUS = 'in-progress'

var PlaceholderCards = React.createClass({

  propTypes: {
    status: React.PropTypes.string.isRequired
  },

  ipsumBlocks() {
    var length = _.sample([1, 2, 3])

    return _.times(length, (n) => {
      var width = (n === length-1) ? Math.floor((Math.random() * (100 - 50) + 50)) : 100

      return <div style={ {width: `${width}%`} } className="ipsum-block" key={n}></div>
    })
  },

  actionContent() {
    return ([
      <div className="prompt__create-item" key="add-item-label">Add an Item to get started!</div>,
      <button style={ {width: '100%'} }  key="add-item-button" className="btn btn-primary" onClick={this.triggerModal}>Add an Item</button>
    ])
  },

  triggerModal() {
    HeaderActions.openAddModal()
  },

  placeholderCards() {
    return _.times(8, (n) => {
      var content
      if (n === 2 && this.props.status === CURRENT_COL_STATUS) {
        content = this.actionContent()
      } else {
        content = this.ipsumBlocks()
      }

      return (
        <div className="item-card placeholder" key={n}>
          <div className="row">
            <div className="item-card__header col-sm-12">
              <div className="item-card__header-right">
                <span><OwnerAvatar person="placeholder-light" /></span>
              </div>
            </div>
            <div className="item-card__title col-sm-12">
              {content}
            </div>
          </div>
        </div>
      )
    })
  },

  render() {
    return (
      <div className="placeholder-cards">
        {this.placeholderCards()}
      </div>
    )
  }
})

export default PlaceholderCards
