import _ from 'lodash';
import React from 'react/addons';
import {State} from 'react-router';
import SidebarFilters from '../filters/sidebar-filters'
import FiltersActions from '../../../actions/filter-actions';
import ProductStore from '../../../stores/product-store';
import FiltersStore from '../../../stores/filters-store';
import VelocityActions from '../../../actions/velocity-actions';

let FiltersSidebar = React.createClass({

  mixins: [State],

  propTypes: {
    user: React.PropTypes.object.isRequired,
    side: React.PropTypes.string.isRequired,
    allFilters: React.PropTypes.array.isRequired,
    activeFilters: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      mine: { active: false }
    };
  },

  toggleControlState(controls, value) {
    controls[value] = (controls[value]) ? false : true;
    this.setState(controls);
  },

  updateItemTypes(type) {
    console.log('TYPE: ', type);

    let types = _.find(this.props.activeFilters, {field: 'type'}).criteria;
    let activeTypes;

    if (type === 'all') {
      activeTypes = ['story', 'task', 'test', 'defect'];
    } else if (types.length > 1 && _.contains(types, type)) {
      activeTypes = _.pull(types,type);
    } else {
      activeTypes = _.union(types, [type]);
    }

    FiltersActions.update('type', activeTypes);
  },


  issueTypesControl() {
    let issueTypes = ['story', 'task', 'test', 'defect'];
    let activeTypes = _.find(this.props.activeFilters, {field: 'type'}).criteria;

    let issueTypeButtons = _.map(issueTypes, (type) => {
      let typeClass = {}
      typeClass[type] = true;

      let active = _.contains(activeTypes, type)
      let linkClasses = React.addons.classSet(_.extend({
        "active": active
      }, typeClass));

      let colorIndicator = React.addons.classSet({
        'type-color-indicator': true,
        "active": active
      })
      console.log('LINK TYPE CLASSES: ', linkClasses);
      return (
        <div className='issue-control' onClick={_.partial(this.updateItemTypes, type)}>
          <a ref={`issue-link-${type}`} href="#" className={linkClasses}>{type}</a>
          <div className={`${colorIndicator} ${type}`}></div>
        </div>
      )
    })

    let sameMembers = _.isEmpty(_.xor(activeTypes, issueTypes));
    let allClasses = React.addons.classSet({
      'active': sameMembers
    });

    return ([
      <li className="drawer-header">
        <a className='drawer-header' href="#">Issue Types</a>
      </li>,
      <li className="drawer-subheader">
        <div className="issue-types-control">
          {issueTypeButtons}
        </div>
        <div className="all-types-control">
          <a ref='all-types' href="#" onClick={_.partial(this.updateItemTypes, 'all')} className={allClasses}>All</a>
        </div>
      </li>
    ])
  },

  changeVelocity(e) {
    e.preventDefault();
    let val = this.refs.velocity_input.getDOMNode().value;
    if (val === '') {
      val = '~';
    }

    VelocityActions.setVelocity(this.props.product.id, val);
  },

  placeCursor() {
    this.refs.velocity_input.getDOMNode().value = this.refs.velocity_input.getDOMNode().value;
  },

  velocityValue() {
    let velocity = this.props.velocity;

    if (velocity && velocity.average) {
      if (velocity.average === '~') {
        return '';
      } else {
        return velocity.average;
      }
    } else {
      return '';
    }
  },

  velocityControl() {
    return ([
      <li className="drawer-header">
        <a className='drawer-header' href="#">Velocity</a>
      </li>,
      <div className="form-group">
        <input
          className="form-control"
          ref="velocity_input"
          value={this.velocityValue()}
          onChange={this.changeVelocity}
          onFocus={this.placeCursor}
        />
      </div>
    ])
  },

  mine() {
    this.toggleControlState(this.state.mine, 'active');

    let options = {}
    if (!this.state.mine.active) {
      options = {unset: true};
    }
    FiltersActions.update('assigned_to', this.props.user.id, options);
  },

  mineButton() {
    let classes = React.addons.classSet({
      "btn btn-primary mine-button": true,
      "active": this.state.mine.active
    })

    return (
      <li>
        <a href="#" onClick={this.mine} className={classes}>My Items</a>
      </li>
    )
  },

  clearFilters() {
    this.mine();
    FiltersActions.clear(this.props.members, this.props.tags);
    this.updateItemTypes('all');
  },

  clearFiltersButton() {
    let classes = React.addons.classSet({
      "btn btn-primary": true,
    })

    return (
      <li className="clear-button">
        <a href="#" onClick={this.clearFilters} className={classes}>Clear Filters</a>
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
      <div className={classes}>
        <ul style={minHeight} className="off-canvas-list">
          {this.mineButton()}
          {this.velocityControl()}
          {this.issueTypesControl()}
          <SidebarFilters {...this.props} />
          {this.clearFiltersButton()}
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
      <div ref='filters-sidebar' className={classes}>
        {sidebar}
      </div>
    )
  }
})

export default FiltersSidebar
