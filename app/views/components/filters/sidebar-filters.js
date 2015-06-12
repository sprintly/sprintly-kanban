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

var SidebarFilters = React.createClass({

  propTypes: {
    user: React.PropTypes.object,
    members: React.PropTypes.array
  },

  getInitialState() {
    return {}
    // return {
    //   allFilters: FiltersStore.all(),
    //   activeFilters: FiltersStore.getActiveOrDefault()
    // }
  },

  // updateFilters(field, criteria, options) {
  //   FilterActions.update(field, criteria, options);
  // },
  //
  // buildActiveFilters() {
  //   return (
  //     _.map(this.state.activeFilters, function(filter, i) {
  //       return (
  //         <Filter
  //           key={i}
  //           user={this.props.user}
  //           members={this.props.members}
  //           updateFilters={this.updateFilters}
  //           {...filter} />
  //         )
  //     }, this)
  //   )
  // },
  //
  // renderForm(filter) {
  //   var form;
  //   var formProps = {
  //     name: filter.field,
  //     updateFilters: this.updateFilters,
  //     options: filter.criteriaOptions,
  //     criteria: filter.criteria,
  //     visible: true
  //   };
  //   switch (filter.type) {
  //     case 'members':
  //       form = <MembersFilter {...formProps}/>
  //       break;
  //     case 'checkbox':
  //       form = <CheckboxFilter {...formProps} />
  //       break;
  //     case 'tags':
  //       form = <TagsFilter {...formProps} />
  //       break;
  //     default:
  //       form = '';
  //       break;
  //   }
  //   return form;
  // },
  //
  // buildFilterControls() {
  //   return (
  //     _.map(this.state.allFilters, function(filter, i) {
  //       return (
  //         <li key={i} className="drawer-subheader">
  //           <a href="#" className="drawer-subheader">{filter.label}</a>
  //           {this.renderForm(filter)}
  //         </li>
  //       );
  //     }, this)
  //   )
  // },

  render() {
    // var activeFilters = this.buildActiveFilters();
    // var filterControls = this.buildFilterControls();

        // {activeFilters}
            // {filterControls}
    return (
      <div>
        <li className="drawer-header">
          <a className='drawer-header' href="#">Filters</a>
        </li>
        <div className="filters-menu__scroll-wrapper">
          <ul className="filters-menu__list"></ul>
        </div>
      </div>
    );
  }

});

module.exports = SidebarFilters;
