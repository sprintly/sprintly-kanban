import _ from 'lodash';
import Filter from './filters-toolbar-filter';
import FiltersMenu from './filters-menu';
import FilterAction from '../../../actions/filter-actions';
import VelocityActions from '../../../actions/velocity-actions';
import React from 'react/addons';
import {Popover} from 'react-bootstrap';

var FiltersToolbar = React.createClass({

  getInitialState() {
    return {
      showFiltersMenu: false,
      showVelocityInput: false,
      showVelocityPopover: false
    };
  },

  propTypes: {
    members: React.PropTypes.array.isRequired,
    user: React.PropTypes.object.isRequired,
    allFilters: React.PropTypes.array.isRequired,
    activeFilters: React.PropTypes.array.isRequired
  },

  updateFilters(field, criteria, options) {
    FilterAction.update(field, criteria, options);
  },

  toggleFiltersMenu() {
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
      showVelocityInput: !this.state.showVelocityInput,
      showVelocityPopover: false
    }, function() {
      this.refs.velocity_input.getDOMNode().focus();
    });
  },

  showVelocityPopover() {
    this.setState({ showVelocityPopover: true });
  },

  hideVelocityPopover() {
    this.setState({ showVelocityPopover: false });
  },

  escapeVelocityInput(e) {
    if (e.keyCode === 27) { // ESC
      this.setState({ showVelocityInput: false });
    }
  },

  render() {
    let velocityElement,
        velocityPopover;

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

    if (this.state.showVelocityPopover) {
      velocityPopover = <Popover
        placement='right'
        positionLeft={65}
        positionTop={43}
        className="velocity__popover">
          See and adjust the predicted weekly velocity of the project
        </Popover>;
    } else {
      velocityPopover = '';
    }

    return (
      <div>
        {velocityPopover}
        <div className="filters__toolbar container-fluid">
          <div className="col-sm-10">
          <span className="velocity" onMouseEnter={this.showVelocityPopover} onMouseLeave={this.hideVelocityPopover}>
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
      </div>
    )
  }
});

export default FiltersToolbar;
