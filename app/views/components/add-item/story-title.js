import _ from 'lodash';
import React from 'react/addons';

const TITLE_ATTRS = {
  who: {
    title: "As an",
    placeholder: "e.g. an accountant"
  },
  what: {
    title: "I want",
    placeholder: "e.g. Quickbooks integration"
  },
  why: {
    title: "so that",
    placeholder: "e.g. I don't have to import CSV's daily"
  }
};
const STORY_ATTRS = ['who', 'what', 'why'];

function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}

let AddItemStoryTitle = React.createClass({

  propTypes: {
    who: React.PropTypes.object.isRequired,
    what: React.PropTypes.object.isRequired,
    why: React.PropTypes.object.isRequired,
    validation: React.PropTypes.object.isRequired
  },

  titleNodes() {
    return _.map(STORY_ATTRS, (attr) => {
      var classes = React.addons.classSet({
        "form-control": true,
        'invalid': !this.props.validation.value[attr]
      });

      return (
        <div className={`add-item__field ${attr}`}>
          <span>{TITLE_ATTRS[attr].title}</span>
          <div className="input-group">
            <label>{toTitleCase(attr)}</label>
            <input className={classes}
                        type="text"
                        name={attr}
                 placeholder={attr.placeholder}
                 valueLink={this.props[attr]} />
          </div>
        </div>
      )
    })
  },

  render() {
    return (
      <div className="form-group story-title">
        {this.titleNodes()}
      </div>
    )
  }
});

export default AddItemStoryTitle;
