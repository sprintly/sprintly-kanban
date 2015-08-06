import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import {State} from 'react-router';
import ProductActions from '../../../actions/product-actions';
import Markdown from 'react-markdown';
import classNames from 'classnames';

const placeholder = "Use '@' to mention another Sprintly user.  Use #[item number] (e.g. #1234) to reference another Sprintly item.";
const readOnlyPlaceholder = "View full ticket to edit it's description";

var ItemDescription = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    itemId: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    description: React.PropTypes.string,
    members: React.PropTypes.array,
    setItem: React.PropTypes.func,
    alternateLayout: React.PropTypes.bool,
    readOnly: React.PropTypes.bool
  },

  getInitialState() {
    return {
      descriptionEditable: false
    }
  },

  saveItemDescription() {
    const DESCRIPTION_ATTR = 'description';
    this.toggleDescriptionEdit();
    this.updateAttribute(this.props.itemId, DESCRIPTION_ATTR, this.props.description)
  },

  descriptionMention() {
    let mentionsComponent = this.mentionsComponent(this.props.description, placeholder, this.props.members, _.partial(this.props.setItem, 'description'));

    return ([
        mentionsComponent,
        this.toggleButton(null, this.saveItemDescription)
      ]
    )
  },

  descriptionMarkdown() {
    let description = this.props.description;

    if (!description) {
      description = this.props.readOnly ? `_${readOnlyPlaceholder}_` : `_${placeholder}_`;
    } else {
      description = helpers.formatTextForMarkdown(description);
    }
    let markdown = <Markdown key="description" source={description} />
    let toggle = this.props.readOnly ? null : this.toggleButton("min-button-alignment", this.toggleDescriptionEdit);

    return ([
        markdown,
        toggle
      ]
    )
  },

  toggleButton(alignmentClass, clickHandler) {
    let buttonSide = this.props.alternateLayout ? 'left': 'right';
    let classes = `description__control pull-${buttonSide} ${alignmentClass}`;
    let buttonCopy = this.state.descriptionEditable ? 'Save' : 'Edit';

    return (
      <div key="toggle" className={classes}>
        <button className="detail-button kanban-button-secondary" onClick={clickHandler}>
          {buttonCopy}
        </button>
      </div>
    )
  },

  toggleDescriptionEdit() {
    this.setState({descriptionEditable: !this.state.descriptionEditable});
  },

  render: function() {
    let descriptionEl;
    if (!this.props.readOnly && this.state.descriptionEditable) {
      descriptionEl = this.descriptionMention();
    } else {
      descriptionEl = this.descriptionMarkdown();
    }

    let descriptionClasses = classNames({
      "col-md-12 col-lg-12": true,
      "item__description": true,
      "collapse-left": !this.props.alternateLayout
    })

    return (
      <div className={descriptionClasses}>
        {descriptionEl}
      </div>
    )
  }

});

export default ItemDescription;
