import _ from 'lodash';
import Filter from './filters-toolbar-filter';
import FiltersMenu from './filters-menu';
import FilterAction from '../../../actions/filter-actions';
import VelocityActions from '../../../actions/velocity-actions';
import React from 'react/addons';

var FiltersToolbar = React.createClass({

  getInitialState: function() {
    return {
      showFiltersMenu: false,
      showVelocityInput: false
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

  changeVelocity(e) {
    e.preventDefault();
    let newVelocity = this.refs.velocity_input.getDOMNode().value;
    VelocityActions.setVelocity(this.props.productId, newVelocity);
    this.setState({ showVelocityInput: false });
  },

  toggleVelocityInput() {
    this.setState({
      showVelocityInput: !this.state.showVelocityInput
    }, function() {
      this.refs.velocity_input.getDOMNode().focus();
    });
  },

  escapeVelocityInput(e) {
    if (e.keyCode === 27) { // ESC
      this.setState({ showVelocityInput: false });
    }
  },

  render: function() {
    let velocityElement;
    if (this.state.showVelocityInput) {
      velocityElement = <form
        onSubmit={this.changeVelocity}
        className="velocity__form"
        ref="velocity_form">
        <input
          type="text"
          ref="velocity_input"
          defaultValue={Math.round(this.props.velocity)}
          onKeyDown={this.escapeVelocityInput}
        />
      </form>
    } else {
      velocityElement = <span
        onClick={this.toggleVelocityInput}>
        {Math.round(this.props.velocity)}
      </span>;
    }

    return (
      <div className="filters__toolbar container-fluid">
        <div className="col-sm-10">
        <span className="velocity">
          <i className="glyphicon glyphicon-dashboard"></i>
          {velocityElement}
        </span>
        {_.map(this.props.activeFilters, function(filter, i) {
          return (
            <Filter
              key={i}
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
