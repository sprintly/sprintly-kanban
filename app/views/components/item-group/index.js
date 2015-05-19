var _ = require('lodash');
var React = require('react/addons');
var Bootstrap = require('react-bootstrap');

var ItemGroup = React.createClass({
  getInitialState() {
    return {
      expanded: false
    };
  },

  onHandleToggle(e) {
    e.preventDefault();
    this.setState({expanded:!this.state.expanded});
  },

  render() {
    let text = this.state.expanded ? 'Hide' : 'Show';
    return (
      <div className="item__group">
        <Bootstrap.Button onClick={this.onHandleToggle}>{text} Content</Bootstrap.Button>
        { this.state.expanded ? <div>TEST</div> : '' }
      </div>
    );
  }
})

module.exports = ItemGroup;
