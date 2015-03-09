var _ = require('lodash')
var React = require('react')

var defaultSortOptions = {
  'Recent': 'last_modified',
  'Priority': 'sort'
};

const SORT_OPTIONS = {
  someday: _.extend({
    'Created': 'created_at'
  }, defaultSortOptions),
  backlog: _.extend({
    'Created': 'created_at'
  }, defaultSortOptions),
  'in-progress': _.extend({
    'Started': 'progress.started_at'
  }, defaultSortOptions),
  completed: _.extend({
    'Complete': 'progress.closed_at'
  }, defaultSortOptions),
  accepted: _.extend({
    'Accepted': 'progress.accepted_at'
  }, defaultSortOptions)
};


var Header = React.createClass({
  render: function() {
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
          <button
            className="btn btn-default sort-direction"
            onClick={this.props.reverse}>
              {this.props.sortDirection === 'desc' ? '∴' : '∵'}
          </button>
        </div>
      </header>
    )
  }
})

module.exports = Header
