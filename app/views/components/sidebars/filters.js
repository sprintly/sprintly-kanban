import React from 'react/addons';

let FiltersSidebar = React.createClass({
  buildFilterSideBar() {
    let sidebarClasses = React.addons.classSet({
      'right-off-canvas-menu': true,
      'hidden': this.props.open
    });

    return (
      <div className={sidebarClasses}>
        <div>Filters</div>
        <ul className="off-canvas-list">
          <li>
            <a className='drawer-subheader' href='#'>Filter Subheader</a>
          </li>
        </ul>
      </div>
    )
  },

  render() {
    let classes = React.addons.classSet({
      'sidebar__menu': true,
      'col-xs-6': true,
      'col-sm-3': true,
      'sidebar-offcanvas': true,
      'visible-xs': true
    })

    let sidebar = this.buildFilterSideBar();

    return (
      <div className={classes}>
        {sidebar}
      </div>
    )
  }
})

export default FiltersSidebar
