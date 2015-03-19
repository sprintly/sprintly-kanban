import _ from 'lodash';
import Filter from './filters-toolbar-filter';
import FiltersMenu from './filters-menu';
import FilterAction from '../../../actions/filter-actions';
import React from 'react/addons';

var FiltersToolbar = React.createClass({

  getInitialState: function() {
    return {
      showFiltersMenu: false
    };
  },

  propTypes: {
    members: React.PropTypes.array.isRequired,
    user: React.PropTypes.object.isRequired,
    allFilters: React.PropTypes.array.isRequired,
    activeFilters: React.PropTypes.array.isRequired
  },

  updateFilters: function(field, criteria, options) {
    FilterAction.update(field, criteria, options);
  },

  toggleFiltersMenu: function() {
    this.setState({ showFiltersMenu: !!this.state.showFiltersMenu });
  },

  render: function() {
    return (
      <div className="filters__toolbar container-fluid">
        <div className="col-sm-10">
        {_.map(this.props.activeFilters, function(filter) {
          return (
            <Filter
              user={this.props.user}
              members={this.props.members}
              updateFilters={this.updateFilters}
              {...filter}
            />
          )
        }, this)}
        </div>
        <FiltersMenu
          updateFilters={this.updateFilters}
          allFilters={this.props.allFilters}
          members={this.props.members}
        />
      </div>
    )
  }
});

export default FiltersToolbar;
