var _ = require('lodash');
var React = require('react/addons');
var Input = require('react-bootstrap').Input;

var Filter = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    criteria: React.PropTypes.array,
    updateFilters: React.PropTypes.func,
    options: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      criteria: [],
      criteriaOptions: [],
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

  update: function(field, ev) {
    // TODO needs to handle other input types
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

    let filter = {}
    filter[this.props.name] = { $set: criteria };
    this.props.updateFilters(filter);
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
    var criteriaFormClasses = React.addons.classSet({
      'form-horizontal': true,
      'filter__criteria-selector': true,
      visible: this.state.selectorVisible
    });
    var criteriaLabels = this.props.criteria.join(', ') || this.props.defaultCriteriaLabel;

    if (this.props.criteria.length === this.props.options.length) {
      criteriaLabels = this.props.defaultCriteriaLabel;
    }

    return (
      <div className="filter" onClick={this.toggleSelector}>
        <button className="btn filter__label">{this.props.label}</button>
        <div className="filter__criteria">{criteriaLabels}</div>
        <form className={criteriaFormClasses} onClick={(e) => e.stopPropagation() }>
          {_.map(this.props.options, this.renderCriteriaFormField)}
        </form>
      </div>
    )
  }
})

module.exports = Filter

