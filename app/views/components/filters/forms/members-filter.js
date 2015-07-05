import _ from 'lodash';
import React from 'react/addons';
import classNames from "classnames";
import {Input} from 'react-bootstrap';
import {SelectorMenu} from 'sprintly-ui';

var MembersFilter = React.createClass({

  propTypes: {
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

  onChange: function(member) {
    let value = member.value;
    this.props.updateFilters(this.props.name, value)
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

  renderMembers: function(option) {
    let active = _.findWhere(option.members, { id: this.props.criteria });
    let selection = active ? `${active.first_name} ${active.last_name.slice(0,1)}.` : 'All';

    let members = _.map(option.members, function(member) {
      let title = `${member.first_name} ${member.last_name.slice(0,1)}.`;
      return {
        title,
        value: member.id
      }
    }, this);

    return (
      <div className="form-group selector" key="members-dropdown">
        <SelectorMenu
          optionsList={_.sortBy(members, 'title')}
          selection={selection}
          onSelectionChange={(title) => {
            this.onChange(_.findWhere(members, { title }))
          }}
        />
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
