import _ from 'lodash';
import React from 'react/addons';
import classNames from "classnames";
import {Input} from 'react-bootstrap';
import {SelectorMenu} from 'sprintly-ui';
import Select from 'react-select';

var MembersFilter = React.createClass({

  propTypes: {
    members: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
    updateFilters: React.PropTypes.func,
    criteria: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    options: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      options: [],
      updateFilters: function() {}
    }
  },

  onChange: function(value) {
    let options = {}
    if (value === '') {
      options.unset = true;
    }
    this.props.updateFilters(this.props.name, value, options)
  },

  update: function(field, value, ev) {
    let checked = ev.target.checked;
    let criteria = '';
    let options = {};

    if (checked) {
      criteria = value;
    } else {
      options.unset = true;
    }

    this.props.updateFilters(this.props.name, criteria, options);
  },

  prepareMembersForSelect(members) {
    return _.chain(members)
            .map(function(member){
              if (!member.revoked) {
                return {
                  label: `${member.first_name} ${member.last_name}`,
                  value: member.id
                };
              }
            })
            .compact()
            .value();
  },

  selectedPerson(members, criteria) {
    let person = _.find(members, { id: criteria })

    if (person) {
      return `${person.first_name} ${person.last_name}`;
    } else {
      return 'Unassigned';
    }
  },

  renderMembers: function(option) {
    let activeAssignee = this.selectedPerson(this.props.members, this.props.criteria);
    let members = this.prepareMembersForSelect(this.props.members);
    var props = {
      placeholder: 'All',
      name: option.field,
      className: 'assign-dropdown',
      options: members,
      onChange: this.onChange,
      clearable: true,
      value: null
    };
    if (this.props.criteria) {
      props.value = activeAssignee;
    }

    return (
      <div className="form-group selector" key="members-dropdown">
        <Select {...props}/>
      </div>
    );
  },

  renderCriteriaFormField: function(option, index) {
    if (option.members) {
      return this.renderMembers(option);
    }

    let props = {
      type: 'checkbox',
      label: option.label,
      wrapperClassName: 'col-xs-offset-1',
      key: index,
      ref: `filter-checkbox-${option.field}`,
      checked: this.props.criteria === option.value,
      onChange: _.partial(this.update, option.field, option.value)
    }

    return (
      <Input {...props}/>
    );
  },

  render: function() {
    var classes = classNames({
      'form-horizontal': true,
      'filter__criteria-selector': true,
      visible: this.props.visible
    });
    return (
      <form className={classes} onClick={(e) => e.stopPropagation() }>
        {_.map(this.props.options, this.renderCriteriaFormField)}
      </form>
    )
  }
})

export default MembersFilter;
