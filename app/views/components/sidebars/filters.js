import React from 'react/addons';
import SidebarFilters from '../filters/sidebar-filters'

let FiltersSidebar = React.createClass({
  
  issueTypesControl() {
    return ([
      <li className="drawer-header">
        <a className='drawer-header' href="#">Issue Types</a>
      </li>
    ])
  },

  velocityControl() {
    return ([
      <li className="drawer-header">
        <a className='drawer-header' href="#">Velocity</a>
      </li>
    ])
  },

  myItems() {
    console.log('MY ITEMS CONTROL');
  },

  myItemsControl() {
    return <a className="btn btn-primary" href="#" onClick={this.myItems}></a>
  },

  buildFilterSideBar() {
    let classes = React.addons.classSet({
      'sidebar__menu': true,
      'col-xs-6': true,
      'col-sm-3': true,
      'sidebar-offcanvas': true,
      'visible-xs': true
    })

    let minHeight = { 'min-height': `${window.innerHeight}px` };

    return (
      <div style={minHeight} className={classes}>
        <div>Filters</div>
        <ul className="off-canvas-list">
          {this.myItemsControl()}
          {this.velocityControl()}
          {this.issueTypesControl()}
          <SidebarFilters />
        </ul>
      </div>
    )
  },

  render() {
    let classes = React.addons.classSet({
      'right-off-canvas-menu': true,
      'hidden': this.props.side !== 'right'
    });
    let sidebar = this.buildFilterSideBar();

    return (
      <div className={classes}>
        {sidebar}
      </div>
    )
  }
})

export default FiltersSidebar
