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

  addTags(tags) {
    this.setState({
      activeTags: tags
    });

    FiltersActions.update('tags', tags);
  },

  tagsInput() {
    let tags = _.map(this.state.tags, function(tag){return tag.tag});

    return (
      <div className="form-group">
        <TagsInput tags={tags} onChange={this.addTags} value={this.state.activeTags}/>
      </div>
    )
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
        form = this.tagsInput();
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
            {filterControls}
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = SidebarFilters;
