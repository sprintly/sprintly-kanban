import _ from "lodash";
import React from "react";
import Loading from "react-loading"
import ItemColumn from "../components/item-column";
import Toolbar from "../components/toolbar";

export default React.createClass({
  getInitialState: function() {
    return {
      activeItem: false
    }
  },

  selectItem: function(activeItem, event) {
    this.setState({ activeItem });
  },

  handleKeyDown: function(e) {
    console.log(e);
  },

  render: function() {
    var product = this.props.products.get(this.props.params.id);

    if (product === undefined) {
      return (
        <div className="loading"><Loading type="spin" color="#ccc" /></div>
      );
    }

    var cols = _.map(product.ItemModel.ITEM_STATUSES, (label, status) => {
      return <ItemColumn selectItem={this.selectItem} activeItem={this.state.activeItem} product={product} status={status} key={(product.id + status)}/>;
    });

    return (
      <div className="container-tray">
        <div className="tray">{cols}</div>
        {this.state.activeItem ? <Toolbar item={this.state.activeItem} /> : ''}
      </div>
    );
  }

});
