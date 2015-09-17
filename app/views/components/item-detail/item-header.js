import React from 'react/addons';
import helpers from '../../components/helpers';

var ItemHeader = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    subheaderEl: React.PropTypes.node,
    headerClasses: React.PropTypes.string,
    sep: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      sep: true
    }
  },

  render: function() {
    let titleCased = helpers.toTitleCase(this.props.title);
    let headerClasses =  this.props.headerClasses ? `header-${this.props.headerClasses}` : "header";
    let sep = this.props.sep ? <div className="sep"></div> : null;

    return (
      <div className={headerClasses}>
        <div className="title">{titleCased}</div>
        {this.props.subheaderEl}
        {sep}
      </div>
    )
  }
});

module.exports = ItemHeader;
