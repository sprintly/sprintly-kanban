var _ = require('lodash');
var React = require('react/addons');
var Input = require('react-bootstrap').Input;

var CheckboxFilter = React.createClass({

  propTypes: {
    updateFilters: React.PropTypes.func,
    options: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      options: [],
      updateFilters: function() {}
    }
  },

  update: function(field, ev) {
    let value = ev.target.checked;
    let criteria = this.props.criteria.length === 0 ?
        _.pluck(this.props.options, 'field') : _.clone(this.props.criteria);

    if (value && _.contains(criteria, field) === false) {
      criteria.push(field);
    } else if (value === false) {
      criteria = _.without(criteria, field);
    }

    if (criteria && criteria.length < 1) {
      ev.preventDefault();
      return false;
    }
    this.props.updateFilters(this.props.name, criteria);
  },

  renderCriteriaFormField: function(option) {
    let checked = this.props.criteria.length === 0 ? option.default :
      _.contains(this.props.criteria, option.field);

    return (
      <Input
        key={`filter-checkbox-${option.field}`}
        type="checkbox"
        label={option.label}
        wrapperClassName="col-xs-offset-1"
        onChange={_.partial(this.update, option.field)}
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

module.exports = CheckboxFilter;
