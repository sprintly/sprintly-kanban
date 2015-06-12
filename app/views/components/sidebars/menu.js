import _ from 'lodash';
import React from 'react/addons'
import {State,Link} from 'react-router';

// Flux
import ProductStore from '../../../stores/product-store';

const ACCOUNT_SETTINGS = [
  'Profile', 'Plan', 'Billing', 'Invoices', 'Products', 'Members', 'Notifications', 'Services'
];

let MenuSidebar = React.createClass({

  propTypes: {
    side: React.PropTypes.string.isRequired
  },

  mixins: [State],

  // React functions
  _onChange() {
    this.setState({
      allProducts: ProductStore.getAll()
    })
  },

  getInitialState() {
    return {
      allProducts: ProductStore.getAll(),
    }
  },

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this._onChange);
  },

  buildMenuSide() {
    let classes = React.addons.classSet({
      'sidebar__menu': true,
      'col-xs-6': true,
      'col-sm-3': true,
      'sidebar-offcanvas': true,
      'visible-xs': true
    });

    let productLinks = this.productLinks();
    let settingsLinks = this.settingsLinks();
    var minHeight = { 'min-height': `${window.innerHeight}px` };

    return (
      <div style={minHeight} className={classes}>
        <div className="logos__sprintly"></div>
        <ul className="off-canvas-list">
          {productLinks}
          {settingsLinks}
        </ul>
      </div>
    )
  },

  settingsLinks() {
    let settingsLinks = _.map(ACCOUNT_SETTINGS, function(setting, i) {
      let subheaderKey = `drawer-subheader-${i} ${setting}`;
      let settingsURI = `https://sprint.ly/account/settings/${setting.toLowerCase()}`

      return (
        <li key={subheaderKey}>
          <a className='drawer-subheader' href={settingsURI}>{setting}</a>
        </li>
      )
    })

    return ([
        <li className="drawer-header">
          <a className='drawer-header' href="#">Settings</a>
        </li>
      ].concat(settingsLinks).concat([
        <li className="logout">
          <a href="/logout" className="btn btn-danger btn-sm btn-block">Logout</a>
        </li>
      ])
    )

  },

  productLinks() {
    let productLinks = _.map(this.state.allProducts, (product, i) => {
      let subheaderKey = `drawer-subheader-${i} product-${product.id}`;
      let productURI = `/${product.id}`;

      return (
        <li key={subheaderKey}>
          <Link className='drawer-subheader' to="product" params={{ id: product.id }}>{product.name}</Link>
        </li>
      )
    })

    return ([
      <li className="drawer-header">
        <a className={'drawer-header'} href="#">Products</a>
      </li>
    ].concat(productLinks))
  },

  render() {
    let classes = React.addons.classSet({
      'left-off-canvas-menu': true,
      'hidden': this.props.side !== 'left'
    });
    var sidebar = this.buildMenuSide();

    return (
      <div className={classes}>
        {sidebar}
      </div>
    )
  }
})

export default MenuSidebar
