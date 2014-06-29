/**
 * @jsx React.DOM
 */

var React = require('react');

var Toggle = React.createClass({

  render: function() {
    return (
      <div className="control-group toggles">
        <span>{this.props.label}</span>
        <label className="topcoat-switch">
          <input type="checkbox" name="ignoreWeekend" checked={this.props.checked} onChange={this.props.onChange} className="topcoat-switch__input" />
          <div className="topcoat-switch__toggle"></div>
        </label>
      </div>
    )
  }
});

module.exports = Toggle;
