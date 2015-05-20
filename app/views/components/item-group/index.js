import _ from 'lodash';
import React from 'react/addons';
import Bootstrap from 'react-bootstrap';
import ItemCard from '../item-card';

var ItemGroup = React.createClass({
  getInitialState() {
    return {
      expanded: this.props.startOpen
    };
  },

  renderItemCard(item, index) {
    if (!item) { return; }
    let card = (
      <ItemCard
        item={item}
        sortField={this.state.sortField}
        productId={this.props.productId}
        key={`item-${this.props.productId}${item.number}`}
      />
    );
    return card;
  },

  onHandleToggle(e) {
    e.preventDefault();
    this.setState({expanded:!this.state.expanded});
  },

  render() {
    let itemCards = _.map(this.props.items, this.renderItemCard);
    return (
      <div className="item__group">
        <Bootstrap.Panel onClick={this.onHandleToggle}>
          {this.props.startDate} ({this.props.points} points)
          <span className="glyphicon glyphicon-chevron-down"></span>
        </Bootstrap.Panel>
        { this.state.expanded ? <div>{itemCards}</div> : <div></div> }
      </div>
    );
  }
})

module.exports = ItemGroup;
