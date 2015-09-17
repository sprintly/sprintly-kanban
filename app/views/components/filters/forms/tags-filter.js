import _ from 'lodash'
import React from 'react/addons'
import classNames from 'classnames'
import TagsInput from '../../tags-input'

var TagsFilter = React.createClass({

  propTypes: {
    updateFilters: React.PropTypes.func,
    options: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      options: [],
      updateFilters: function() {}
    }
  },

  update: function(tags) {
    var options = {}
    if (tags.length === 0) {
      options.unset = true
    }
    this.props.updateFilters(this.props.name, _.clone(tags), options)
  },

  render: function() {
    var classes = classNames({
      'form-horizontal': true,
      'filter__criteria-selector': true,
      visible: this.props.visible
    })
    var tags = _.pluck(this.props.options, 'tag')
    var criteria
    if (this.props.criteria) {
      criteria = _.isArray(this.props.criteria) ?
        this.props.criteria : [this.props.criteria]
    } else {
      criteria = []
    }

    return (
      <form className={classes} onClick={(e) => e.stopPropagation() }>
        {tags.length === 0 ? '' :
          <TagsInput
            tags={tags}
            onChange={this.update}
            value={criteria}
            placeholder="Filter by Tags"
          />
        }
      </form>
    )
  }
})

export default TagsFilter
