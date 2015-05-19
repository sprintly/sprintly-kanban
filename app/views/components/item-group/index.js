var _ = require('lodash');
var React = require('react/addons');
var Bootstrap = require('react-bootstrap');

var ItemGroup = React.createClass({
  render: function() {
    return (
      <div className="item__group">
        <div className="column__sort-options">
          <Bootstrap.SplitButton onSelect={this.onSelect} activeKey={this.props.sortField} bsSize="small" title={`Sort by: ${SORT_OPTIONS[this.props.sortField]}`} pullRight>
            {_.map(_.omit(SORT_OPTIONS, this.props.sortField), function(label, field) {
              return (
                <Bootstrap.MenuItem eventKey={field} key={field}>{label}</Bootstrap.MenuItem>
              );
            }, this)}
          </Bootstrap.SplitButton>
          <button className="reverse-sort" disabled={this.props.sortField === 'priority'} type="button" onClick={this.onReverseClick} aria-label="Change sort direction">
            <span aria-hidden="true" className={React.addons.classSet(directionClasses)}/>
          </button>
        </div>
      </header>
    )
  }
})

module.exports = ItemGroup;
