var _ = require('lodash');
var React = require('react/addons');
var Bootstrap = require('react-bootstrap');


const SORT_OPTIONS = {
  created_at: 'Created At',
  priority: 'Priority',
  last_modified: 'Recent'
};

var Header = React.createClass({

  getDefaultProps: function() {
    return {
      sortField: 'last_modified'
    }
  },

  onSelect: function(field) {
    this.props.setSortCriteria(field);
  },

  onReverseClick: function() {
    if (this.props.sortField !== 'priority') {
      this.props.reverse();
    }
  },

  render: function() {
    let directionClasses = {
      'glyphicon': true,
      'glyphicon-sort-by-attributes': this.props.sortDirection === 'desc',
      'glyphicon-sort-by-attributes-alt': this.props.sortDirection === 'asc',
    };

    return (
      <header>
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

module.exports = Header
