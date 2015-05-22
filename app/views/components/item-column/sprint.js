import _ from 'lodash';
import React from 'react/addons';
import Bootstrap from 'react-bootstrap';
import ItemCard from '../item-card';

let Sprint = React.createClass({
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
        sortField={this.props.sortField}
        productId={this.props.productId}
        key={`item-${this.props.productId}${item.number}`}
      />
    );
    return card;
  },

  toggleItemCards() {
    this.setState({expanded: !this.state.expanded});
  },

  render() {
    let itemCards = _.map(this.props.items, this.renderItemCard);
    let chevronClass = 'sprint__chevron glyphicon glyphicon-chevron-';
    chevronClass += this.state.expanded ? 'up' : 'down';
    return (
      <div className="sprint">
        <Bootstrap.Panel onClick={this.toggleItemCards}>
          {this.props.startDate} ({this.props.points} points)
          <span className={chevronClass}></span>
        </Bootstrap.Panel>
        { this.state.expanded ? <div>{itemCards}</div> : <div></div> }
      </div>
    );
  }
})

export default Sprint;
