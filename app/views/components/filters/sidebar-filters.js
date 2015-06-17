import _ from 'lodash';
import React from 'react/addons';

// Components
import MembersFilter from './forms/members-filter';
import CheckboxFilter from './forms/checkbox-filter';
import TagsFilter from './forms/tags-filter';
import Filter from './filters-toolbar-filter';
import TagsInput from '../tags-input.js';
import Select from 'react-select';

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

    return ([
      <li className="drawer-header">
        <a className='drawer-header' href="#">Tags</a>
      </li>,
      <li className="drawer-subheader">
        <div className="form-group">
          <TagsInput tags={tags} onChange={this.addTags} value={activeTags}/>
        </div>
      </li>
    ])
  },

  filterProps(filter) {
    return {
      name: filter.field,
      updateFilters: this.updateFilters,
      options: filter.criteriaOptions,
      criteria: filter.criteria,
      visible: true
    }
  },

  prepareMembersForSelect(members) {
    return _.chain(members)
            .map(function(member){
              if (!member.revoked) {
                return {label: `${member.first_name} ${member.last_name}`, value: member.id}
              }
            })
            .compact()
            .value()
  },

  selectedPerson(members, filter) {
    let person = _.find(this.props.members, {id: parseInt(filter.criteria)})

    if (person) {
      return `${person.first_name} ${person.last_name}`;
    } else {
      return 'Unassigned';
    }
  },

  buildAssignFilter(field) {
    let filter = _.find(this.props.allFilters, {field: field});
    let filterProps = this.filterProps(filter);
    let activeAssignee = this.selectedPerson(this.props.members, filter);

    // Extract to util component data formatter
    let members = this.prepareMembersForSelect(this.props.members);
    return ([
      <li className="drawer-header">
        <a className='drawer-header' href="#">{filter.label}</a>
      </li>,
      <li className="drawer-subheader">
        <Select placeholder='Unassigned'
                name={filter.field}
                className="assign-dropdown"
                value={activeAssignee}
                options={members}
                onChange={_.partial(this.updateFilters, filter.field)}
                clearable={true} />
      </li>
    ])
  },

  render() {
    var tagsInput = this.tagsInput();
    let assignmentFields = _.map(['assigned_to', 'created_by'], (field) => {
      return this.buildAssignFilter(field);
    }, this);

    return (
      <div className="filters-menu__scroll-wrapper">
        <ul className="filters-menu__list">
          {tagsInput}
          {assignmentFields}
        </ul>
      </div>
    );
  }

});

module.exports = SidebarFilters;
