import _ from "lodash";
import React from "react/addons";
import {State,Link} from 'react-router';

// Components
import ItemColumn from "../components/item-column";
import FiltersToolbar from '../components/filters/filters-toolbar';
import Header from '../components/header';
import ob from 'oblique-strategies';

// Flux
import FiltersStore from '../../stores/filters-store';
import ProductStore from '../../stores/product-store';
import ProductActions from '../../actions/product-actions';
import VelocityActions from '../../actions/velocity-actions';

import helpers from './helpers';

const ITEM_STATUSES = {
  someday: 'Someday',
  backlog: 'Backlog',
  'in-progress': 'Current',
  completed: 'Done',
  accepted: 'Accepted'
};

let ItemsViewController = React.createClass({

  mixins: [State],

  getInitialState: function() {
    var product = ProductStore.getProduct(this.getParams().id) || {};
    return _.assign({
      allFilters: FiltersStore.all(),
      activeFilters: FiltersStore.getActiveOrDefault(),
      filtersObject: FiltersStore.getFlatObject(),
      allProducts: ProductStore.getAll(),
      activeItem: false,
      showMenu: false,
      translation: {
        position: 0,
        value: '0px'
      }
    }, product);
  },

  _onProductChange() {
    var product = ProductStore.getProduct(this.getParams().id) || {};
    this.setState(_.assign({
      allProducts: ProductStore.getAll(),
      itemsByStatus: ProductStore.getItemsByStatus(this.getParams().id)
    }, product));
  },

  _onFilterChange() {
    this.setState({
      allFilters: FiltersStore.all(),
      activeFilters: FiltersStore.getActiveOrDefault(),
      filtersObject: FiltersStore.getFlatObject(),
    })
  },

  componentDidMount: function() {
    FiltersStore.addChangeListener(this._onFilterChange);
    ProductStore.addChangeListener(this._onProductChange);
    ProductActions.init(this.getParams().id);
    VelocityActions.getVelocity(this.getParams().id);

    if (helpers.isMobile(window)) {
      this.setState({
        trayWidth: {'width': `${window.innerWidth * this.colCount()}px`},
        colWidth: {'width': `${window.innerWidth}px`}
      })
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.getParams().id != this.state.product.id) {
      ProductActions.init(this.getParams().id);
      VelocityActions.getVelocity(this.getParams().id);
    }
  },

  componentWillUnmount: function() {
    FiltersStore.removeChangeListener(this._onFilterChange);
    ProductStore.removeChangeListener(this._onProductChange);
  },

  selectItem: function(activeItem, event) {
    this.setState({ activeItem });
  },

  renderColumn: function(label, status) {
    // If we don't have items or velocity yet, there's nothing to do
    if (!this.state.itemsByStatus || !this.state.velocity) {
      return '';
    }
    let items = this.state.itemsByStatus[status];
    let props = _.assign({
      status,
      product: this.state.product,
      members: this.state.members,
      filters: this.state.filtersObject,
      key: `col-${this.state.product.id}-${status}`,
      velocity: this.state.velocity,
      colWidth: this.state.colWidth
    }, items);

    return <ItemColumn {...props} />;
  },

  translateColumns(direction) {
    var increment = direction === 'next';
    var newTranslation = helpers.generateTranslation(this.state.translation, this.colCount(), window.innerWidth, increment);
    this.setState({translation: newTranslation});
  },

  colCount() {
    return _.keys(ITEM_STATUSES).length;
  },

  colHeaders() {
    return _.map(ITEM_STATUSES, function(label, status) {
      let index = _.keys(ITEM_STATUSES).indexOf(status)

      let prevClasses = '';
      let nextClasses = '';
      if (index === 0) {
        prevClasses = ' inactive';
      } else if (index === this.colCount()-1) {
        nextClasses = ' inactive';
      }

      return (
          <nav style={this.state.colWidth} key={`header-nav-${status}`}>
            <button type="button" onClick={_.partial(this.translateColumns, 'previous')} className={`visible-xs btn previous${prevClasses}`}>
              <span className="glyphicon glyphicon-chevron-left"></span>
            </button>
            <h3>{label}</h3>
            <button type="button" onClick={_.partial(this.translateColumns, 'next')} className={`visible-xs btn previous${nextClasses}`}>
              <span className="glyphicon glyphicon-chevron-right"></span>
            </button>
          </nav>
      );
    }, this)
  },

  loadingColumn: function() {
    return (
      <div className="container-tray">
        <Header
          allProducts={this.state.allProducts}
          user={this.props.user}
        />
        <div className="loading">
          <small><i>{ob.draw()}</i></small>
        </div>
      </div>
    );
  },

  trayStyles() {
    var transform = helpers.browserPrefix('transform', `translateX(${this.state.translation.value})`)
    return _.merge(this.state.trayWidth, transform);
  },

  render: function() {
    if (_.isUndefined(this.state.product)) {
      return this.loadingColumn();
    }

    var velocity =  this.state.velocity && this.state.velocity.average ?
      this.state.velocity.average : '~';

    var colHeaders = this.colHeaders();
    var trayStyles = this.trayStyles();

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
        <div style={trayStyles} className="tray">
          <div className="column__nav">
            {colHeaders}
          </div>
          {_.map(ITEM_STATUSES, this.renderColumn)}
        </div>
      </div>
    );
  }
});

export default ItemsViewController;
