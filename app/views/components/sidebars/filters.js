import _ from 'lodash';
import React from 'react/addons';
import SidebarFilters from '../filters/sidebar-filters'
import FiltersActions from '../../../actions/filter-actions';

let FiltersSidebar = React.createClass({

  propTypes: {
    user: React.PropTypes.object.isRequired,
    side: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      issueControls: {}
    }
  },

  toggleControlState(controls, value) {
    controls[value] = (controls[value]) ? false : true;
    this.setState(controls);
  },

  activeTypes() {
    return _.chain(this.state.issueControls).map((val, key) => {
      if(val) {
        return key
        }
      })
      .compact()
      .value();
  },

  /*
    FIELD: 'type'
    CRITERIA:  ["defect", "test", "task", "story"]
  */
  addItemType(type) {
    if (type === 'all') {
      type = ["defect", "test", "task", "story"];
    }
    this.toggleControlState(this.state.issueControls, type);

    FiltersActions.update('type', this.activeTypes());
  },

  issueTypesControl() {
    let issueTypes = ['story', 'task', 'test', 'defect'];

    let issueTypeButtons = _.map(issueTypes, (type) => {
      let typeClass = {}
      typeClass[type] = true;

      let linkClasses = React.addons.classSet(_.extend({
        "active": this.state.issueControls[type]
      }, typeClass));

      let colorIndicator = React.addons.classSet({
        'type-color-indicator': true,
        "active": this.state.issueControls[type]
      })

      return (
        <div className='issue-control'>
          <a href="#" onClick={_.partial(this.addItemType, type)} className={linkClasses}>{type}</a>
          <div className={`${colorIndicator} ${type}`}></div>
        </div>
      )
    })

    return ([
      <li className="drawer-header">
        <a className='drawer-header' href="#">Issue Types</a>
      </li>,
      <li className="drawer-subheader">
        <div className="issue-types-control">
          {issueTypeButtons}
        </div>
        <a href="#" onClick={_.partial(this.addItemType, 'all')} className='all'>All</a>
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

  mine(ev) {
    ev.preventDefault();

    FiltersActions.update('assigned_to', this.props.user.id);
  },

  mineButton() {
    return (
      <li>
        <a href="#" onClick={this.mine} className="btn tbn-primary">My Items</a>
      </li>
    )
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
    var mineButton = this.mineButton();

    return (
      <div style={minHeight} className={classes}>
        <div>Filters</div>
        <ul className="off-canvas-list">
          {this.mineButton()}
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
