var _ = require('lodash');
var React = require('react/addons');
var Input = require('react-bootstrap').Input;

var Filter = React.createClass({

  propTypes: {
    label: React.PropTypes.string.isRequired,
    criteria: React.PropTypes.array,
    updateFilters: React.PropTypes.func,
    criteriaOptions: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      criteria: ['All'],
      criteriaOptions: [],
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

  render: function() {
    var selectorClasses = React.addons.classSet({
      'form-horizontal': true,
      'filter__criteria-selector': true,
      visible: this.state.selectorVisible
    });
    return (
      <div className="filter col-sm-2" onClick={this.toggleSelector}>
        <button className="btn filter__label">{this.props.label}</button>
        <div className="filter__criteria">
          {this.props.criteria.join(', ')}
        </div>
        <form className={selectorClasses} onClick={(e) => e.stopPropagation() }>
          {_.map(this.props.criteriaOptions, function(option) {
            return (
              <Input type="checkbox" label={option} wrapperClassName="col-xs-offset-1" checked="true"/>
            );
          })}
        </form>
      </div>
    )
  }
})

module.exports = Filter

