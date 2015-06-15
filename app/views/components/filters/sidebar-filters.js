import _ from 'lodash';
import React from 'react/addons';

// Components
import MembersFilter from './forms/members-filter';
import CheckboxFilter from './forms/checkbox-filter';
import TagsFilter from './forms/tags-filter';
import Filter from './filters-toolbar-filter';
import TagsInput from '../tags-input.js';

// Flux
import FiltersStore from '../../../stores/filters-store';
import ProductStore from '../../../stores/product-store';
import FiltersActions from '../../../actions/filter-actions';
import {State} from 'react-router';

var SidebarFilters = React.createClass({

  mixins: [State],

  propTypes: {
    user: React.PropTypes.object,
    members: React.PropTypes.array
  },

  getInitialState: function() {
    var product = ProductStore.getProduct(this.getParams().id) || {};

    return _.assign({
      allFilters: FiltersStore.all(),
      activeFilters: FiltersStore.getActiveOrDefault(),
      issueControls: {},
      activeTags: []
    }, product);
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

  /*
    FIELD: 'type'
    CRITERIA:  ["defect", "test", "task", "story"]
  */
  addItemType(type) {
    this.toggleControlState(this.state.issueControls, type);

    FiltersActions.update('type', this.activeTypes());
  },

  addTags(tags) {
    FiltersActions.update('tags', tags);
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
        let tags = _.pluck(this.props.tags, 'tag');
        form = <TagsInput tags={tags} onChange={this.addTags} value={this.state.tags}/>
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

  mine(ev) {
    ev.preventDefault();
    this.updateFilters('assigned_to', this.props.user.id)
  },

  mineButton() {
    return (
      <li>
        <a href="#" onClick={this.mine} className="btn tbn-primary">My Items</a>
      </li>
    )
  },

  onChange() {
    var product = ProductStore.getProduct(this.getParams().id) || {};
    this.setState(_.assign({
      allFilters: FiltersStore.all(),
      activeFilters: FiltersStore.getActiveOrDefault()
    }, product));
  },

  componentDidMount() {
    FiltersStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    FiltersStore.removeChangeListener(this.onChange);
  },

  render() {
    var mineButton = this.mineButton();
    var issueTypeButtons = this.issueTypeButtons();
    // var activeFilters = this.buildActiveFilters();
    var filterControls = this.buildFilterControls();

    // {filterControls}
    return (
      <div>
        <li className="drawer-header">
          <a className='drawer-header' href="#">Filters</a>
        </li>
        <div className="filters-menu__scroll-wrapper">
          <ul className="filters-menu__list">
            {mineButton}
            {issueTypeButtons}
            {filterControls}
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = SidebarFilters;
