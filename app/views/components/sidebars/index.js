import _ from 'lodash';
import React from 'react/addons'
import {State,Link} from 'react-router';

// Components
import MenuSidebar from './menu';
import FiltersSidebar from './filters';
import SearchSidebar from './search';

// Flux
import SidebarConstants from '../../../constants/sidebar-constants'
import ProductStore from '../../../stores/product-store';
import FiltersStore from '../../../stores/filters-store';

let Sidebars = React.createClass({

  getLocation() {
    // Is there an interface to the React router which can be used?
    // SHIM: Make dynamic
    return SidebarConstants.FILTERS;
  },

  secondarySidebar() {
    var content;

    switch (this.getLocation()) {
      case SidebarConstants.FILTERS:
        content = <FiltersSidebar />
        break;
      case SidebarConstants.SEARCH:
        content = <SearchSidebar />
        break;
      default:
        console.log('SIDEBARD CONTENT TYPE NOT HANDLED: ', this.props.type)
    }

    return content;
  },

  render() {
    var sidebar = this.secondarySidebar();

    return (
      <div className='sprintly__sidebars'>
        <MenuSidebar />
        {sidebar}
      </div>
    )
  }
})

export default Sidebars;
