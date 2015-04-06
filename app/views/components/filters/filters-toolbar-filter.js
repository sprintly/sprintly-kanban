import _ from 'lodash';
import React from 'react/addons';
import {Input} from 'react-bootstrap';
import CheckboxFilter from './forms/checkbox-filter';
import MembersFilter from './forms/members-filter';
import TagsFilter from './forms/tags-filter';

var Filter = React.createClass({

  propTypes: {
    members: React.PropTypes.array.isRequired,
    user: React.PropTypes.object.isRequired,
    type: React.PropTypes.oneOf(['checkbox', 'members', 'tags']).isRequired,
    field: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    criteria: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    updateFilters: React.PropTypes.func,
    criteriaOptions: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      criteria: [],
      options: [],
      defaultCriteriaLabel: 'All',
      updateFilters: function() {}
    }
  },

  getInitialState: function() {
    return {
      selectorVisible: false
    }
  },

  toggleSelector: function() {
    this.setState({ selectorVisible: !this.state.selectorVisible });
  },

  clearFilter: function(ev) {
    ev.preventDefault();
    this.props.updateFilters(
      this.props.field,
      _.isArray(this.props.criteria) ? [] : '',
      { unset: true }
    );
  },

  renderLabel: function() {
    let criteriaLabel = this.props.defaultCriteriaLabel;

    if (_.isArray(this.props.criteria)) {
      if(this.props.criteria.length > 0 &&
         this.props.criteria.length !== this.props.criteriaOptions.length) {
        criteriaLabel = this.props.criteria.join(', ')
      }
    }

    if (_.isString(this.props.criteria)) {
      if (this.props.criteria !== '') {
        criteriaLabel = this.props.criteria;
      }
    }

    if (this.props.type === 'members') {
      if (this.props.user.id == this.props.criteria) {
        criteriaLabel = 'Me';
      } else if (this.props.criteria == 'unassigned' || this.props.criteria === '') {
        criteriaLabel = 'Unassigned';
      } else {
        let member = _.findWhere(this.props.members, { id: parseInt(this.props.criteria, 10) });
        criteriaLabel = `${member.first_name} ${member.last_name.slice(0,1)}.`;
      }
    }

    return (
      <div className="filter__criteria">
        <span className="filter__criteria-label">{criteriaLabel}</span>
        {this.props.alwaysVisible ? '' :
          <button type="button" className="close" onClick={this.clearFilter} aria-label="Remove"><span aria-hidden="true">&times;</span></button>
        }
      </div>
    );
  },

  renderForm: function() {
    var form;
    var formProps = {
      name: this.props.field,
      updateFilters: this.props.updateFilters,
      options: this.props.criteriaOptions,
      criteria: this.props.criteria,
      visible: this.state.selectorVisible
    };
    switch (this.props.type) {
      case 'members':
        form = <MembersFilter {...formProps}/>
        break;
      case 'checkbox':
        form = <CheckboxFilter {...formProps} />
        break;
      case 'tags':
        form = <TagsFilter {...formProps} />
        break;
      default:
        form = <span/>;
        break;
    }
    return form;
  },

  render: function() {
    var criteriaFormClasses = React.addons.classSet({
      'form-horizontal': true,
      'filter__criteria-selector': true,
      visible: this.state.selectorVisible
    });

    return (
      <div className="filter" onClick={this.toggleSelector}>
        <button className="btn filter__label">{this.props.label}</button>
        {this.renderLabel()}
        {this.renderForm()}
      </div>
    )
  }
});

export default Filter;
