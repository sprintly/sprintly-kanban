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
import SidebarStore from '../../../stores/sidebar-store';

let Sidebars = React.createClass({

  getInitialState() {
    return SidebarStore.openState()
  },

  getLocation() {
    // Is there an interface to the React router which can be used?
    // SHIM: Make dynamic
    return SidebarConstants.FILTERS;
  },

  secondarySidebar() {
    var content;

    switch (this.getLocation()) {
      case SidebarConstants.FILTERS:
        content = <FiltersSidebar {...this.state} />
        break;
      case SidebarConstants.SEARCH:
        content = <SearchSidebar {...this.state}/>
        break;
      default:
        console.log('SIDEBARD CONTENT TYPE NOT HANDLED: ', this.props.type)
    }

    return content;
  },

  onChange() {
    this.setState(SidebarStore.openState())
  },

  componentDidMount(){
    SidebarStore.addChangeListener(this.onChange)
  },

  componentWillUnmount() {
    SidebarStore.removeChangeListener(this.onChange);
  },

  render() {
    var sidebar = this.secondarySidebar();

    return (
      <div className='sprintly__sidebars'>
        <MenuSidebar {...this.state} />
        {sidebar}
      </div>
    )
  }
})

export default Sidebars;
