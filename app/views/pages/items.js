import _ from "lodash";
import React from "react";
import Loading from "react-loading"
import ItemColumn from "../components/item-column";
import Toolbar from "../components/toolbar";

function getColumnsState() {
  return {
    activeItem: false,
    'show-accepted': false,
    'show-someday': false,
  }
}

export default React.createClass({
  getInitialState: getColumnsState,

  selectItem: function(activeItem, event) {
    this.setState({ activeItem });
  },

  handleKeyDown: function(e) {
    console.log(e);
  },

  showHiddenColumn: function(status) {
    var state = getColumnsState();
    state[`show-${status}`] = true;
    this.setState(state);
  },

  render: function() {
    var product = this.props.products.get(this.props.params.id);

    if (product === undefined) {
      return (
        <div className="loading"><Loading type="spin" color="#ccc" /></div>
      );
    }

    var cols = _.map(product.ItemModel.ITEM_STATUSES, (label, status) => {
      var props = {
        status,
        product,
        key: product.id + status,
      }

      if (_.contains(['someday', 'accepted'], status)) {
        props.onMouseEnter = _.partial(this.showHiddenColumn, status);
        props.onMouseLeave = () => this.setState(getColumnsState())
      }
      return <ItemColumn {...props} key={(product.id + status)}/>;
    });

    var classes = {
      tray: true,
      'show-accepted': this.state['show-accepted'],
      'show-someday': this.state['show-someday']
    }

    return (
      <div className="container-tray">
        <div className={React.addons.classSet(classes)}>{cols}</div>
      </div>
    );
  }

});
