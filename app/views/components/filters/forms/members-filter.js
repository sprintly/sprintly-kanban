import _ from 'lodash';
import React from 'react/addons';
import {Input} from 'react-bootstrap';
import {SelectorMenu} from 'sprintly-ui';

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

  onChange: function(member) {
    let value = member.value;
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

  renderMembers: function(option) {
    let defaultSelection = '';
    let members = _.map(option.members, function(member) {
      let title = `${member.first_name} ${member.last_name.slice(0,1)}.`;
      if (this.props.criteria === member.id) {
        defaultSelection = title;
      }
      return {
        title,
        value: member.id
      }
    }, this);
    return (
      <div className="form-group selector" key="members-dropdown">
        <SelectorMenu
          optionsList={_.sortBy(members, 'title')}
          defaultSelection={defaultSelection}
          onSelectionChange={(title) => {
            this.onChange(_.findWhere(members, { title }))
          }}
        />
      </div>
    );
  },

  renderCriteriaFormField: function(option) {
    if (option.members) {
      return this.renderMembers(option);
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
