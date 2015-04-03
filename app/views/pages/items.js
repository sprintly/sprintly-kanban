import _ from "lodash";
import React from "react/addons";
import {State,Link} from 'react-router';

// Components
import Loading from "react-loading"
import ItemColumn from "../components/item-column";
import FiltersToolbar from '../components/filters/filters-toolbar';
import Header from '../components/header';

// Flux
import FiltersStore from '../../stores/filters-store';
import ProductStore from '../../stores/product-store';
import ProductActions from '../../actions/product-actions';

module.exports = React.createClass({

  mixins: [State],

  getInitialState: function() {
    var product = ProductStore.get(this.getParams().id);
    return {
      allFilters: FiltersStore.all(),
      activeFilters: FiltersStore.getActiveOrDefault(),
      filtersObject: FiltersStore.getFlatObject(),
      members: product && product.members.toJSON(),
      product,
      allProducts: ProductStore.getAll(),
      activeItem: false,
      showAccepted: false,
      showSomeday: false,
      showMenu: false
    }
  },

  _onChange: function() {
    var product = ProductStore.get(this.getParams().id);
    this.setState({
      allFilters: FiltersStore.all(),
      activeFilters: FiltersStore.getActiveOrDefault(),
      filtersObject: FiltersStore.getFlatObject(),
      members: product && product.members.toJSON(),
      product,
      allProducts: ProductStore.getAll(),
    });
  },

  componentDidMount: function() {
    FiltersStore.on('change', this._onChange);
    ProductStore.on('change', this._onChange);
    ProductActions.init(this.getParams().id);
  },

  componentWillUnmount: function() {
    ProductStore.off('change', this._onChange);
    FiltersStore.off('change', this._onChange);
  },

  selectItem: function(activeItem, event) {
    this.setState({ activeItem });
  },

  showHiddenColumn: function(status) {
    let someday = status === 'someday';
    let accepted = status === 'accepted';
    this.setState({
      showSomeday: someday,
      showAccepted: accepted
    });
  },

  renderColumn: function(label, status) {
    var props = {
      status,
      product: this.state.product,
      filters: this.state.filtersObject,
      key: `col-${this.state.product.id}-${status}`,
    };

    if (_.contains(['someday', 'accepted'], status)) {
      props.onMouseEnter = _.partial(this.showHiddenColumn, status);
      props.onMouseLeave = () => this.setState({
        showAccepted: false,
        showSomeday: false
      })
    }
    return <ItemColumn {...props}/>;
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.getParams().id !== this.state.product.id) {
      ProductActions.init(this.getParams().id)
    }
  },

  render: function() {
    var product = this.state.product;

    if (product === undefined) {
      return (
        <div className="loading"><Loading type="spin" color="#ccc" /></div>
      );
    }

    var cols = _.map(product.ItemModel.ITEM_STATUSES, this.renderColumn);

    var classes = {
      tray: true,
      'show-accepted': this.state.showAccepted,
      'show-someday': this.state.showSomeday
    };

    return (
      <div className="container-tray">
        <Header
          productName={this.state.product.get('name')}
          allProducts={this.state.allProducts}
          user={this.props.user}
        />
        <FiltersToolbar
          user={this.props.user}
          allFilters={this.state.allFilters}
          activeFilters={this.state.activeFilters}
          members={this.state.members}
        />
        <div className={React.addons.classSet(classes)}>
          <div className="column__nav">
            {_.map(product.ItemModel.ITEM_STATUSES, function(label, status) {
              return (
                <nav key={`header-nav-${status}`}>
                  <h3>{label}</h3>
                </nav>
              );
            })}
          </div>
          {cols}
        </div>
      </div>
    );
  }

});
