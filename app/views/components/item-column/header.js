var _ = require('lodash');
var React = require('react/addons');

var defaultSortOptions = {
  'Created': 'created_at',
  'Recent': 'last_modified',
};

const SORT_OPTIONS = {
  someday: _.extend({
    'Priority': 'priority',
  }, defaultSortOptions),
  backlog: _.extend({
    'Priority': 'priority',
  }, defaultSortOptions),
  'in-progress': _.extend({
    'Priority': 'priority',
  }, defaultSortOptions),
  completed: _.extend({
    // 'Complete': 'progress.closed_at'
  }, defaultSortOptions),
  accepted: _.extend({
    // 'Accepted': 'progress.accepted_at'
  }, defaultSortOptions)
};


var Header = React.createClass({
  render: function() {

    var directionClasses = {
      'glyphicon': true,
      'glyphicon-sort-by-attributes': this.props.sortDirection === 'desc',
      'glyphicon-sort-by-attributes-alt': this.props.sortDirection === 'asc',
      'hidden': this.props.sortField === 'priority'
    };

    return (
      <header>
        <div className="column__sort-options">
          {_.map(SORT_OPTIONS[this.props.status], function(field, label) {
            let handler = (ev) => this.props.setSortCriteria(field);
            let active = field === this.props.sortField ? 'js-active' : '';
            var classes = `btn btn-default ${active}`;
            return (
              <button className={classes} onClick={handler} key={`sort-options-${this.props.status}-${field}`}>
                {label}
              </button>
            );
          }, this)}
          <span onClick={this.props.reverse} className={React.addons.classSet(directionClasses)}/>
        </div>
      </header>
    )
  }
})

module.exports = Header
