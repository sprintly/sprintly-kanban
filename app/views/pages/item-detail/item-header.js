var React = require('react');
import helpers from '../../components/helpers';

var ItemHeader = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    subheaderEl: React.PropTypes.node
  },

  render: function() {
    var titleCased = helpers.toTitleCase(this.props.title);

    return (
      <div className="header">
        <div className="title">{titleCased}</div>
        {this.props.subheaderEl}
        <div className="sep"></div>
      </div>
    )
  }

});

module.exports = ItemHeader;
