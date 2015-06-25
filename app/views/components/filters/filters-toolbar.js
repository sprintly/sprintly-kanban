import _ from 'lodash';
import Filter from './filters-toolbar-filter';
import FiltersMenu from './filters-menu';
import FilterAction from '../../../actions/filter-actions';
import VelocityComponent from './velocity-component';
import React from 'react/addons';

var FiltersToolbar = React.createClass({
  getInitialState() {
    return {
      showFiltersMenu: false
    };
  },

  propTypes: {
    user: React.PropTypes.object.isRequired,
    members: React.PropTypes.array.isRequired,
    allFilters: React.PropTypes.array.isRequired,
    activeFilters: React.PropTypes.array.isRequired
  },

  updateFilters(field, criteria, options) {
    FilterAction.update(field, criteria, options);
  },

  toggleFiltersMenu() {
    this.setState({ showFiltersMenu: !!this.state.showFiltersMenu });
  },

  buildFilters() {
    return (
      _.map(this.props.activeFilters, function(filter, i) {
        return (
          <Filter
            key={i}
            user={this.props.user}
            members={this.props.members}
            updateFilters={this.updateFilters}
            {...filter}
          />
          )
      }, this)
    )
  },

  render() {
    var filters = this.buildFilters();

    return (
      <div className="hidden-xs">
        <div className="filters__toolbar container-fluid">
          <div className="col-sm-10">
            <VelocityComponent productId={this.props.productId}
                                velocity={this.props.velocity} />
            {filters}
          </div>
          <FiltersMenu
            user={this.props.user}
            updateFilters={this.updateFilters}
            allFilters={this.props.allFilters}
            members={this.props.members}
          />
        </div>
      </div>
    )
  }
});

export default FiltersToolbar;
