import _ from 'lodash';
import React from 'react/addons';
import {Input} from 'react-bootstrap';

var DropdownFilter = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    updateFilters: React.PropTypes.func,
    options: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      options: [],
      updateFilters: function() {}
    }
  },

  onChange: function(ev) {
    let value = ev.target.value;
    this.props.updateFilters(this.props.name, value)
  },

  update: function(field, value, ev) {
    let checked = ev.target.checked;
    let criteria = '';
    let options = {};

    if (!checked) {
      options.unset = true;
    }

    if (checked && field === 'me') {
      criteria = value;
    }
    this.props.updateFilters(this.props.name, criteria, options);
  },

  renderCriteriaFormField: function(option) {
    if (option.members) {
      return (
        <select onChange={this.onChange} value={this.props.criteria}>
          <option></option>
          {_.map(option.members, function(member) {
            return (
              <option value={member.id}>
                {member.first_name} {member.last_name.slice(0,1)}.
              </option>
            );
          })}
        </select>
      );
    }

    let checked = this.props.criteria.length === 0 ? option.default :
      _.contains(this.props.criteria, option.field);

    return (
      <Input
        key={`filter-checkbox-${option.field}`}
        type="checkbox"
        label={option.label}
        wrapperClassName="col-xs-offset-1"
        onChange={_.partial(this.update, option.field, option.value)}
        defaultChecked={checked} />
    );
  },

  render: function() {
    var classes = React.addons.classSet({
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

export default DropdownFilter;
