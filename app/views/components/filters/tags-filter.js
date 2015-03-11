var _ = require('lodash');
var React = require('react/addons');
var Input = require('react-bootstrap').Input;
var Tokenizer = require('react-typeahead').Tokenizer;

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
    this.props.updateFilters(this.props.name, _.clone(tags));
  },

  render: function() {
    var classes = React.addons.classSet({
      'form-horizontal': true,
      'filter__criteria-selector': true,
      visible: this.props.visible
    });
    var tags = _.pluck(this.props.options, 'tag');
    var input;
    if (tags.length === 0) {
      input = '';
    } else {
      input = (<Tokenizer options={tags} onTokenAdd={this.update} onTokenRemove={this.update} />);
    }
    return (
      <form className={classes} onClick={(e) => e.stopPropagation() }>
        {input}
      </form>
    )
  }
})

module.exports = TagsFilter;

