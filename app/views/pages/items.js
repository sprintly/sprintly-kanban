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

import helpers from './helpers';

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
      showMenu: false,
      translation: {
        position: 0,
        value: '0px'
      }
    }, product);
  },

  _onChange: function() {
    console.log()
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

    if (helpers.isMobile(window)) {
      this.setState({
        maxWidth: {'max-width': `${window.innerWidth * this.colCount()}px`}
      })
    }
  },

  componentWillUnmount: function() {
    FiltersStore.removeChangeListener(this._onChange);
    ProductStore.removeChangeListener(this._onChange);
  },

  selectItem: function(activeItem, event) {
    this.setState({ activeItem });
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

    if (this.state.maxWidth) {
      var maxColWidth = {'max-width': `${window.innerWidth}px`};
      _.assign(props, maxColWidth);
    }

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
      return (
          <nav style={this.state.maxWidth} key={`header-nav-${status}`}>
            <button type="button" onClick={_.partial(this.translateColumns, 'previous')} className='btn previous'>
              <span className="glyphicon glyphicon-chevron-left"></span>
            </button>
            <h3>{label}</h3>
            <button type="button" onClick={_.partial(this.translateColumns, 'next')} className='btn next'>
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
          <Loading type="spin" color="#ccc" />
          <br/>
          <small><i>{ob.draw()}</i></small>
        </div>
      </div>
    );
  },

  trayStyles() {
    var transform = helpers.browserPrefix('transform', `translateX(${this.state.translation.value})`)
    var maxCopy = _.cloneDeep(this.state.maxWidth);
    return _.merge(maxCopy, transform);
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.getParams().id !== this.state.product.id) {
      ProductActions.init(this.getParams().id);
      VelocityActions.getVelocity(this.getParams().id);
    }
  },

  render: function() {
    if (_.isUndefined(this.state.product)) {
      return this.loadingColumn();
    }

    var cols = _.map(ITEM_STATUSES, this.renderColumn);

    var trayClasses = React.addons.classSet({
      tray: true
    });

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
        <div style={trayStyles} className={trayClasses}>
          <div className="column__nav">
            {colHeaders}
          </div>
          {cols}
        </div>
      </div>
    );
  }
});
