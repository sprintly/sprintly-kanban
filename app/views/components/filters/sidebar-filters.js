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
    activeFilters: React.PropTypes.array,
    allFilters: React.PropTypes.array,
    filtersObject: React.PropTypes.object,
    members: React.PropTypes.array,
    product: React.PropTypes.object,
    // tags: React.PropTypes.Array,
    user: React.PropTypes.object
  },

  updateFilters(field, criteria, options) {
    FiltersActions.update(field, criteria, options);
  },

  addTags(tags) {
    FiltersActions.update('tags', tags);
  },

  tagsInput() {
    let tags = _.map(this.props.tags, (tag) => {
      return tag.tag;
    });

    let activeTags = _.find(this.props.activeFilters, {field: 'tags'})
    if (!activeTags) {
      activeTags = [];
    } else {
      activeTags = activeTags.criteria
    }

    return (
      <div className="form-group">
        <TagsInput tags={tags} onChange={this.addTags} value={activeTags}/>
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
      _.map(this.props.allFilters, function(filter, i) {
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

  render() {
    var filterControls = this.buildFilterControls();

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
