import _ from 'lodash'
import React from 'react/addons'
import classNames from 'classnames'
import {State} from 'react-router'
import SidebarFilters from '../filters/sidebar-filters'
import FiltersActions from '../../../actions/filter-actions'

let FiltersSidebar = React.createClass({

  mixins: [State],

  propTypes: {
    user: React.PropTypes.object.isRequired,
    side: React.PropTypes.string.isRequired,
    allFilters: React.PropTypes.array.isRequired,
    activeFilters: React.PropTypes.array.isRequired
  },

  toggleControlState(controls, value) {
    controls[value] = (controls[value]) ? false : true
    this.setState(controls)
  },

  updateItemTypes(type) {
    let types = _.find(this.props.activeFilters, {field: 'type'}).criteria
    let activeTypes

    if (type === 'all') {
      activeTypes = ['story', 'task', 'test', 'defect']
    } else if (types.length > 1 && _.contains(types, type)) {
      activeTypes = _.pull(types,type)
    } else {
      activeTypes = _.union(types, [type])
    }

    FiltersActions.update('type', activeTypes)
  },


  issueTypesControl() {
    let issueTypes = ['story', 'task', 'test', 'defect']
    let activeTypes = _.find(this.props.activeFilters, {field: 'type'}).criteria

    let issueTypeButtons = _.map(issueTypes, (type, i) => {
      let typeClass = {}
      typeClass[type] = true

      let active = _.contains(activeTypes, type)
      let linkClasses = classNames(_.extend({
        'active': active
      }, typeClass))

      let colorIndicator = classNames({
        'type-color-indicator': true,
        'active': active
      })

      return (
        <div className="issue-control" onClick={_.partial(this.updateItemTypes, type)} key={i}>
          <a ref={`issue-link-${type}`} href="#" className={linkClasses}>{type}</a>
          <div className={`${colorIndicator} ${type}`}></div>
        </div>
      )
    })

    let sameMembers = _.isEmpty(_.xor(activeTypes, issueTypes))
    let allClasses = classNames({
      'active': sameMembers
    })

    return ([
      <li className="drawer-header" key="drawer-header">
        <a className="drawer-header" href="#">Issue Types</a>
      </li>,
      <li className="drawer-subheader" key="drawer-subheader">
        <div className="issue-types-control">
          {issueTypeButtons}
        </div>
        <div className="all-types-control">
          <a ref="all-types" href="#" onClick={_.partial(this.updateItemTypes, 'all')} className={allClasses}>All</a>
        </div>
      </li>
    ])
  },

  assignedToUser() {
    let assignee = _.find(this.props.activeFilters, {field: 'assigned_to'})
    return assignee && assignee.criteria === this.props.user.id
  },

  mine() {
    if (this.assignedToUser()) {
      this.clearFilters()
    } else {
      FiltersActions.update('assigned_to', this.props.user.id, {})
    }
  },

  mineButton() {
    let classes = classNames({
      'btn btn-primary mine-button': true,
      'active': this.assignedToUser()
    })

    return (
      <li>
        <a ref="sidebar-filter-mine" href="#" onClick={this.mine} className={classes}>My Items</a>
      </li>
    )
  },

  clearFilters() {
    FiltersActions.clear(this.props.members, this.props.tags)
    this.updateItemTypes('all')
  },

  clearFiltersButton() {
    let classes = classNames({
      'btn btn-primary': true
    })

    return (
      <li className="clear-button">
        <a href="#" ref="sidebar-clear-button" onClick={this.clearFilters} className={classes}>Clear Filters</a>
      </li>
    )
  },

  buildFilterSideBar() {
    let classes = classNames({
      'sidebar__menu': true,
      'col-xs-6': true,
      'col-sm-3': true,
      'sidebar-offcanvas': true,
      'visible-xs': true
    })
    var maxHeight = { maxHeight: `${window.innerHeight}px` }

    return (
      <div style={maxHeight} className={classes}>
        <ul className="off-canvas-list">
          {this.mineButton()}
          {this.issueTypesControl()}
          <SidebarFilters {...this.props} />
          {this.clearFiltersButton()}
        </ul>
      </div>
    )
  },

  render() {
    let classes = classNames({
      'right-off-canvas-menu': true,
      'hidden': this.props.side !== 'right'
    })
    let sidebar = this.buildFilterSideBar()

    return (
      <div ref="filters-sidebar" className={classes}>
        {sidebar}
      </div>
    )
  }
})

export default FiltersSidebar
