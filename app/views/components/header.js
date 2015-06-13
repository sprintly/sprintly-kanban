import _ from 'lodash';
import React from 'react/addons';
import Gravatar from './gravatar';
import AddItemModal from './add-item-modal';
import FiltersMenu from './filters/filters-menu';
import SidebarActions from  '../../actions/sidebar-actions';

import {ModalTrigger} from 'react-bootstrap';
import {Link, Navigation} from 'react-router';

// compose to confidence
const ACCOUNT_SETTINGS = [
  'Profile', 'Plan', 'Billing', 'Invoices', 'Products', 'Members', 'Notifications', 'Services'
];

var Header = React.createClass({

  mixins: [Navigation],

  propTypes: {
    product: React.PropTypes.object,
    allProducts: React.PropTypes.array,
    user: React.PropTypes.object,
    members: React.PropTypes.array,
    tags: React.PropTypes.array
  },

  getInitialState() {
    return {
      scoped: true,
      showMenu: true,
      drawerOpen: false
    }
  },

  getDefaultProps() {
    return {
      searchBar: true,
      product: {
        name: 'Choose a Product'
      }
    }
  },

  search(ev) {
    ev.preventDefault();
    let value = this.refs.search.getDOMNode().value;
    if (this.props.product.id && this.state.scoped) {
      value = `product:${this.props.product.id} ${value}`;
    }
    let url = `/search?q=${encodeURIComponent(value)}`;
    this.transitionTo(url);
  },

  onKeyDown(ev) {
    if (ev.keyCode === 8 && ev.target.value === '') {
      this.setState({ scoped: false });
    }
  },

  renderAddItem() {
    if (this.props.members && this.props.tags) {
      let modal = (
        <AddItemModal
          product={this.props.product}
          members={this.props.members}
          tags={this.props.tags}
        />
      );
      return (
        <ModalTrigger modal={modal}>
          <button className="btn btn-primary add-item"><span className="glyphicon glyphicon-plus-sign"/> Add Item</button>
        </ModalTrigger>
      );
    }

    return '';
  },

  renderSearch() {
    let scope = '';
    if (this.props.product.id && this.state.scoped) {
      scope = <span className="header-search__scope label label-info">{this.props.product.name}</span>
    }
    return (
      <form className="navbar-form navbar-right header-search" onSubmit={this.search} role="search">
        <div className="form-group">
          {scope}
          <input className="form-control" type="search" name="q" placeholder="Search" ref="search" onKeyDown={this.onKeyDown} />
        </div>
        <input type="submit" className="hidden" />
      </form>
    );
  },

  smallScreenHeader() {
    let navClasses = this.getClasses('small');
    let menuClasses = React.addons.classSet({
      '_burger': true,
      'open': this.state.drawerOpen === 'left'
    });
    let openRightSide = _.partial(SidebarActions.show, 'right');
    let openLeftSide = _.partial(SidebarActions.show, 'left');

    return (
      <header className={navClasses}>
        <div className="filter-icon" onClick={openRightSide}></div>
        <div className="mobile-search">
          <form className="navbar-right header-search" onSubmit={this.search} role="search">
            <div className="form-group">
                <input className="form-control" type="search" name="q" placeholder="Search" ref="search" onKeyDown={this.onKeyDown} />
            </div>
            <input type="submit" className="hidden" />
          </form>
        </div>
        <ul className="small-menu">
          <li className="menu-list-item">
            <a href="#" className="small-screen-menu burger-button">
              <div className={menuClasses} onClick={openLeftSide}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </a>
          </li>
        </ul>
      </header>
    );
  },

  getClasses: function(size) {
    var visibilityClasses = {
      'small': { 'visible-xs': true },
      'large': { 'hidden-xs': true }
    };

    var defaults = {
      'product__header': true,
      'container-fluid': true
    };

    return React.addons.classSet(
      _.extend(defaults, visibilityClasses[size])
    );
  },

  sprintlyFlask() {
    return (
      <svg className="labs-flask" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="37px" height="37px" viewBox="0 0 108 144" enable-background="new 0 0 108 144">
        <g>
          <g>
            <path className="labs-flask-svg__empty" d="M54,115.3c-19.3,0-25.3-4.3-27.1-6.9c-1.5-2.1-0.9-3.9-0.9-3.9l20.6-56.7V30.3h14.8v17.5L82,104.5c0.1,0.3,0.5,2.1-1,4C79.1,111.1,73,115.3,54,115.3z"/>
            <path className="labs-flask-svg__border" d="M58.9,32.8v14.6v0.9l0.3,0.8l20.4,56.2c0,0.1,0,0.8-0.6,1.7c-3.9,5.4-20.1,5.8-25,5.8c-18.4,0-23.5-3.9-24.9-5.6c-0.8-0.9-0.7-1.7-0.7-2l20.4-56.1l0.3-0.8v-0.9V32.8H58.9 M63.9,27.8H44.1v19.6l-20.5,56.3c0,0-4.9,14.1,30.4,14.1c35.1,0,30.4-14.1,30.4-14.1L63.9,47.4V27.8L63.9,27.8z"/>
          </g>
          <path className="labs-flask-svg__top" d="M63.3,32.2H44.7c-1.6,0-3-1.3-3-3v0c0-1.6,1.3-3,3-3h18.7c1.6,0,3,1.3,3,3v0C66.3,30.8,65,32.2,63.3,32.2z"/>
          <path className="labs-flask-svg__content" d="M76.7,82.6l7.7,21.1c0,0,4.8,14.1-30.4,14.1c-35.3,0-30.4-14.1-30.4-14.1l7.7-21.1L76.7,82.6z"/>
        </g>
      </svg>
    )
  },

  logoutLink() {
    return (
      <li className="logout">
        <a href="https://sprint.ly/logout" className="btn btn-danger btn-sm btn-block">Logout</a>
      </li>
    )
  },

  settingsDropdown() {
    let options = _.map(ACCOUNT_SETTINGS, function(setting, index) {
      return (
        <li key={index}>
          <a href={`https://sprint.ly/account/settings/${setting.toLowerCase()}`}>{setting}</a>
        </li>
      )
    }).concat([this.logoutLink()])

    return (
      <nav className="product__dropdown product__account">
        <button className="btn btn-default dropdown-toggle">
          <Gravatar email={this.props.user.get('email')} className="img-rounded" size={26} />
          <span className="product__account-name">{this.props.user.get('first_name')}</span>
          <span className="glyphicon glyphicon-menu-down"/>
        </button>
        <ul>
          {options}
        </ul>
      </nav>
    )
  },

  productsDropdown() {
    let productsList = _.map(this.props.allProducts, (product) => {
      return (
        <li key={`product-menu-${product.name}`}>
          <Link to="product" params={{ id: product.id }}>{product.name}</Link>
        </li>
      )
    });

    return (
      <nav className="product__dropdown">
        <h1>{this.props.product.name}<span className="glyphicon glyphicon-menu-down"/></h1>
        <ul>
          {productsList}
        </ul>
      </nav>
    )
  },

  largeScreenHeader() {
    let headerClasses = this.getClasses('large');
    let products = this.productsDropdown()
    let accountSettings = this.settingsDropdown();
    let searchBar = this.props.searchBar ? this.renderSearch() : '';

    return (
      <header className={headerClasses}>
        {this.sprintlyFlask()}
        <div className="product__header-menu">
          {products}
          {this.renderAddItem()}
          {accountSettings}
          {searchBar}
        </div>
      </header>
    )
  },

  render() {
    var smallScreenHeader = this.smallScreenHeader();
    var largeScreenHeader = this.largeScreenHeader();

    return (
      <div className="header-group">
        {smallScreenHeader}
        {largeScreenHeader}
      </div>
    );
  },
});

export default Header;
