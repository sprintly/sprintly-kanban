import React from 'react/addons';
import ItemActions from '../../actions/item-actions';
import ProductStore from '../../stores/product-store';
import {State,Link} from 'react-router';

import ItemCard from '../components/item-card';
import marked from 'marked';

var ItemDetail = React.createClass({

  mixins: [State],

  getInitialState() {
    return {
      item: {}
    };
  },

  _onChange() {
    let item = ProductStore.getItem(this.getParams().id, this.getParams().number);
    if (item) {
      this.setState({
        item
      });
    }
  },

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange);
    ItemActions.fetchItem(this.getParams().id, this.getParams().number);
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this._onChange);
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.getParams().number != this.state.item.number) {
      this._onChange();
      // ItemActions.fetchItem(this.getParams().id, this.props.number);
    }
  },

  renderDescription() {
    if (this.state.item.description) {
      return (
        <div
          className="well"
          dangerouslySetInnerHTML={{
            __html: marked(this.state.item.description, {sanitize: true})
          }}
        />
      );
    } else {
      return '';
    }
  },

  render() {
    if (!this.state.item.number) {
      return <div/>;
    }

    return (
      <div className="drawer container-fluid item-detail">
        <Link to="product" params={{ id: this.getParams().id }} className="item-detail__close">
          <span aria-hidden="true" className="glyphicon glyphicon-menu-right"/>
        </Link>
        <ItemCard
          item={this.state.item}
          members={this.props.members}
          productId={this.props.product.id}
          sortField='priority'
          showDetails={true}
        />
        {this.renderDescription()}
      </div>
    )
  }
});

export default ItemDetail;
