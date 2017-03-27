import React from 'react/addons'
import FilterActions from '../../../../actions/filter-actions';

let MyItems = React.createClass({

  propTypes: {
    active: React.PropTypes.bool
  },

  render() {
    let labelText = this.props.active ? 'Everything' : 'My Items';
    let clickHander = this.props.active ? FilterActions.clear : this.props.onClick;

    return (
      <a href="#" onClick={clickHander} className="filters-menu__mine">{labelText}</a>
    )
  }
})

export default MyItems
