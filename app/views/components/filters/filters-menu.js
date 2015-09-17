import _ from 'lodash';
import React from 'react/addons';
import MembersFilter from './forms/members-filter';
import CheckboxFilter from './forms/checkbox-filter';
import TagsFilter from './forms/tags-filter';
import classNames from "classnames";
import onClickOutside from '@sprintly/react-onclickoutside';
import FilterActions from '../../../actions/filter-actions';

let MyItems = React.createClass({
  render() {
    let labelText = this.props.active ? 'Everything' : 'My Items';
    return (
      <a href="#" onClick={this.props.onClick} className="filters-menu__mine">{labelText}</a>
    );
  }
});

let FiltersMenu = React.createClass({

  getDefaultProps() {
    return {
      disableOnClickOutside: true
    };
  },

  getInitialState() {
    return {
      showPopup: false,
      visibleFilters: []
    };
  },

  mixins: [
    onClickOutside
  ],

  propTypes: {
    members: React.PropTypes.array.isRequired,
    allFilters: React.PropTypes.array.isRequired,
    activeFilters: React.PropTypes.array.isRequired
  },

  handleClickOutside() {
    this.setState({
      showPopup: false
    });
    this.disableOnClickOutside();
  },

  toggleFiltersMenu() {
    let showPopup = !this.state.showPopup;

    if (showPopup) {
      this.enableOnClickOutside();
    } else {
      this.disableOnClickOutside();
    }
    this.setState({ showPopup });
  },

  toggleVisible(filter) {
    let visibleFilters = _.clone(this.state.visibleFilters);
    if (_.contains(visibleFilters, filter)) {
      this.setState({ visibleFilters: _.without(visibleFilters, filter) })
    } else {
      visibleFilters.push(filter);
      this.setState({ visibleFilters });
    }
  },

  renderForm(filter) {
    var form;
    let formProps = {
      name: filter.field,
      updateFilters: FilterActions.update,
      options: filter.criteriaOptions,
      criteria: filter.criteria,
      visible: true
    };
    switch (filter.type) {
      case 'members':
        form = <MembersFilter {...formProps} members={this.props.members}/>;
        break;
      case 'checkbox':
        form = <CheckboxFilter {...formProps} />;
        break;
      case 'tags':
        form = <TagsFilter {...formProps} />;
        break;
      default:
        form = '';
        break;
    }
    return form;
  },

  buildFilters() {
    return (
      _.map(this.props.allFilters, function(filter, i) {
        var classes = classNames({
          'show-form': _.contains(this.state.visibleFilters, filter.field)
        });

        return (
          <li className={classes} key={i}>
            <h3 onClick={_.partial(this.toggleVisible, filter.field)}>{filter.label}</h3>
            {this.renderForm(filter)}
          </li>
        );
      }, this)
    );
  },

  mine(ev) {
    ev.preventDefault();
    let activeFilters = _.findWhere(this.props.activeFilters, { field: 'assigned_to' });

    if (activeFilters) {
      FilterActions.clear();
    } else {
      FilterActions.update('assigned_to', this.props.user.id);
    }
  },

  render() {
    let classes = classNames({
      'col-sm-2': true,
      'filters-menu': true,
      'show-popup': this.state.showPopup
    });
    let filters = this.buildFilters();
    let activeFiltersCount = _.where(this.props.activeFilters, { active: true }).length;

    return (
      <div className={classes}>
        <button className="btn filters-menu__button" onClick={this.toggleFiltersMenu}>
          <span className="glyphicon glyphicon-filter"/> Add Filter
        </button>
        <MyItems onClick={this.mine} active={activeFiltersCount > 0}/>
        <div className="col-sm-12 filters-menu__popup">
          <div className="filters-menu__scroll-wrapper">
            <ul className="filters-menu__list">
              {filters}
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

export default FiltersMenu;
