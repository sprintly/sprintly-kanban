var _ = require('lodash');
var React = require('react/addons');
var Input = require('react-bootstrap').Input;
var CheckboxFilter = require('./checkbox-filter');
var DropdownFilter = require('./dropdown-filter');
var TagsFilter = require('./tags-filter');

var Filter = React.createClass({

  propTypes: {
    type: React.PropTypes.oneOf(['checkbox', 'dropdown', 'tags']).isRequired,
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    criteria: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.string,
    ]),
    updateFilters: React.PropTypes.func,
    options: React.PropTypes.array
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

  renderLabel: function() {
    let criteriaLabel = this.props.defaultCriteriaLabel;

    if (_.isArray(this.props.criteria)) {
      if(this.props.criteria.length > 0) {
        criteriaLabel = this.props.criteria.join(', ')
      }

      if (this.props.criteria.length === this.props.options.length) {
        criteriaLabel = this.props.defaultCriteriaLabel;
      }
    }

    if (_.isString(this.props.criteria)) {
      if (this.props.criteria === '') {
        criteriaLabel = this.props.defaultCriteriaLabel;
      } else {
        criteriaLabel = this.props.criteria;
      }
    }

    return (
      <div className="filter__criteria">{criteriaLabel}</div>
    );
  },

  renderForm: function() {
    var form;
    var formProps = {
      name: this.props.name,
      updateFilters: this.props.updateFilters,
      options: this.props.options,
      criteria: this.props.criteria,
      visible: this.state.selectorVisible
    };
    switch (this.props.type) {
      case 'dropdown':
        form = <DropdownFilter {...formProps} />
        break;
      case 'checkbox':
        form = <CheckboxFilter {...formProps} />
        break;
      case 'tags':
        form = <TagsFilter {...formProps} />
        break;
      default:
        form = '';
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

module.exports = Filter

