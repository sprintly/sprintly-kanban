import _ from 'lodash';
import React from 'react/addons';

// Components
import MembersFilter from './forms/members-filter';
import CheckboxFilter from './forms/checkbox-filter';
import TagsFilter from './forms/tags-filter';
import Filter from './filters-toolbar-filter';

// Flux
import FiltersStore from '../../../stores/filters-store';
import FiltersActions from '../../../actions/filter-actions';

let getStateFromStore = function() {
  return {
    allFilters: FiltersStore.all(),
    activeFilters: FiltersStore.getActiveOrDefault(),
    issueControls: {}
  }
}

var SidebarFilters = React.createClass({

  propTypes: {
    user: React.PropTypes.object,
    members: React.PropTypes.array
  },

  getInitialState() {
    return getStateFromStore();
  },


  buildActiveFilters() {
    return (
      _.map(this.state.activeFilters, function(filter, i) {
        return (
          <Filter
            key={i}
            user={this.props.user}
            members={this.props.members}
            updateFilters={this.updateFilters}
            {...filter} />
          )
      }, this)
    )
  },

  updateFilters(field, criteria, options) {
    FiltersActions.update(field, criteria, options);

  },

  toggleControlState(controls, value) {
    controls[value] = (controls[value]) ? false : true;
    this.setState(controls);
  },

  addItemType(type) {
    // FiltersActions.update(field, criteria, options);

    this.toggleControlState(this.state.issueControls, type);
  },

  issueTypeButtons() {
    let issueTypes = ['story', 'defect', 'task', 'test', 'all'];

    return _.map(issueTypes, (type) => {
      let typeClass = {}
      typeClass[type] = true;

      var classes = React.addons.classSet(_.extend({
        "btn btn-default issue-control": true,
        "active": this.state.issueControls[type]
      }, typeClass));

      return <a href="#" onClick={_.partial(this.addItemType, type)} className={classes}>{type}</a>;
    })
  },

  renderForm(filter) {
    var form;
    var formProps = {
      name: filter.field,
      updateFilters: this.updateFilters,
      options: filter.criteriaOptions,
      criteria: filter.criteria,
      visible: true
    };

    switch (filter.type) {
      case 'members':
        form = <MembersFilter {...formProps}/>
        break;
      case 'checkbox':
        form = <CheckboxFilter {...formProps} />
        break;
      case 'tags':
        form = <TagsFilter {...formProps} />
        break;
      default:
        form = '';
        break;
    }
    return form;
  },

  buildFilterControls() {
    return (
      _.map(this.state.allFilters, function(filter, i) {
        return (
          <li key={i} className="drawer-subheader">
            <a href="#" className="drawer-subheader">{filter.label}</a>
            {this.renderForm(filter)}
          </li>
        );
      }, this)
    )
  },

  onChange() {
    return getStateFromStore();
  },

  componentDidMount() {
    FiltersStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    FiltersStore.removeChangeListener(this.onChange);
  },

  render() {
    var issueTypeButtons = this.issueTypeButtons();
    // var activeFilters = this.buildActiveFilters();
    // var filterControls = this.buildFilterControls();

    // {filterControls}
    return (
      <div>
        <li className="drawer-header">
          <a className='drawer-header' href="#">Filters</a>
        </li>
        <div className="filters-menu__scroll-wrapper">
          <ul className="filters-menu__list">
            {issueTypeButtons}
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = SidebarFilters;
