import _ from "lodash";
import React from "react/addons";
import {State,Link} from 'react-router';

// Components
import Loading from "react-loading"
import ItemColumn from "../components/item-column";
import FiltersToolbar from '../components/filters/filters-toolbar';
import Header from '../components/header';
import ob from 'oblique-strategies';

// Flux
import FiltersStore from '../../stores/filters-store';
import ProductStore from '../../stores/product-store';
import ProductActions from '../../actions/product-actions';
import VelocityActions from '../../actions/velocity-actions';

const ITEM_STATUSES = {
  someday: 'Someday',
  backlog: 'Backlog',
  'in-progress': 'Current',
  completed: 'Done',
  accepted: 'Accepted'
};

module.exports = React.createClass({

  mixins: [State],

  getInitialState: function() {
    var product = ProductStore.getProduct(this.getParams().id) || {};
    return _.assign({
      allFilters: FiltersStore.all(),
      activeFilters: FiltersStore.getActiveOrDefault(),
      filtersObject: FiltersStore.getFlatObject(),
      allProducts: ProductStore.getAll(),
      activeItem: false,
      showAccepted: false,
      showSomeday: false,
      showMenu: false
    }, product);
  },

  _onChange: function() {
    var product = ProductStore.getProduct(this.getParams().id) || {};
    this.setState(_.assign({
      allFilters: FiltersStore.all(),
      activeFilters: FiltersStore.getActiveOrDefault(),
      filtersObject: FiltersStore.getFlatObject(),
      allProducts: ProductStore.getAll(),
    }, product));
  },

  componentDidMount: function() {
    FiltersStore.addChangeListener(this._onChange);
    ProductStore.addChangeListener(this._onChange);
    ProductActions.init(this.getParams().id);
    VelocityActions.getVelocity(this.getParams().id);
    VelocityActions.getItemCounts(this.getParams().id);
  },

  componentWillUnmount: function() {
    FiltersStore.removeChangeListener(this._onChange);
    ProductStore.removeChangeListener(this._onChange);
  },

  getItemCount: function(status) {
    let counts = this.state.itemCounts
    return (
      counts && counts[status] ? counts[status] : 0
    );
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
      members: this.state.members,
      filters: this.state.filtersObject,
      key: `col-${this.state.product.id}-${status}`,
      velocity: this.state.velocity
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
      ProductActions.init(this.getParams().id);
      VelocityActions.getVelocity(this.getParams().id);
      VelocityActions.getItemCounts(this.getParams().id);
    }
  },

  render: function() {
    var product = this.state.product;

    if (product === undefined) {
      return (
        <div className="container-tray">
          <Header
            allProducts={this.state.allProducts}
            user={this.props.user}
          />
          <div className="loading">
            <Loading type="spin" color="#ccc" />
            <br/>
            <small><i>{ob.draw()}</i></small>
          </div>
        </div>
      );
    }

    var cols = _.map(ITEM_STATUSES, this.renderColumn);

    var trayClasses = {
      tray: true,
      'show-accepted': this.state.showAccepted,
      'show-someday': this.state.showSomeday
    };

    var velocity =  this.state.velocity && this.state.velocity.average ?
      this.state.velocity.average : '~';

    return (
      <div className="container-tray">
        <Header
          product={this.state.product}
          allProducts={this.state.allProducts}
          user={this.props.user}
          members={this.state.members}
          tags={this.state.tags}
        />
        <FiltersToolbar
          user={this.props.user}
          allFilters={this.state.allFilters}
          activeFilters={this.state.activeFilters}
          members={this.state.members}
          velocity={velocity}
          productId={this.state.product.id}
        />
        <div className={React.addons.classSet(trayClasses)}>
          <div className="column__nav">
            {_.map(ITEM_STATUSES, function(label, status) {
              return (
                <nav key={`header-nav-${status}`}>
                  <h3>{label}</h3>
                  <span className="item-count">
                    {this.getItemCount(status)} items
                  </span>
                </nav>
              );
            }, this)}
          </div>
          {cols}
        </div>
      </div>
    );
  }

});
