import _ from 'lodash';
import React from 'react/addons';
import {Input} from 'react-bootstrap';
import {Tokenizer} from 'react-typeahead';

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
    var options = {};
    if (tags.length === 0) {
      options.unset = true;
    }
    this.props.updateFilters(this.props.name, _.clone(tags), options);
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

export default TagsFilter;
