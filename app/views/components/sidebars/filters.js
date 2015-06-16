import _ from 'lodash';
import React from 'react/addons';
import {State} from 'react-router';
import SidebarFilters from '../filters/sidebar-filters'
import FiltersActions from '../../../actions/filter-actions';
import ProductStore from '../../../stores/product-store';
import VelocityActions from '../../../actions/velocity-actions';

let FiltersSidebar = React.createClass({

  mixins: [State],

  propTypes: {
    user: React.PropTypes.object.isRequired,
    side: React.PropTypes.string.isRequired,
    product: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      issueControls: {},
      mine: {active: false}
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
      _.each(["defect", "test", "task", "story"], (type) =>{
        this.toggleControlState(this.state.issueControls, type);
      }, this);
    } else {
      this.toggleControlState(this.state.issueControls, type);
    }

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

  changeVelocity(e) {
    e.preventDefault();
    let val = this.refs.velocity_input.getDOMNode().value;
    if (val === '') {
      val = '~';
    }

    VelocityActions.setVelocity(this.props.product.product.id, val);
  },

  placeCursor() {
    this.refs.velocity_input.getDOMNode().value = this.refs.velocity_input.getDOMNode().value;
  },

  velocityValue() {
    let velocity = this.props.product.velocity;

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

  mine(ev) {
    ev.preventDefault();
    this.toggleControlState(this.state.mine, 'active');

    let options = {}
    if (this.state.mine.active) {
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
